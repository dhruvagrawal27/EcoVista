import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Rocket, Brain, Zap, Leaf, TrendingDown, TrendingUp, Play, Pause,
  RotateCcw, Target, Clock, Lightbulb,
} from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useAIRecommendations } from "@/hooks/useAI";
import { useMissionDecisions, useMissionInsights } from "@/hooks/useMission";

// ── Animated number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const diff = value - prev.current;
    const steps = 20;
    let step = 0;
    const id = setInterval(() => {
      step++;
      setDisplay(prev.current + (diff * step) / steps);
      if (step >= steps) { clearInterval(id); prev.current = value; }
    }, 20);
    return () => clearInterval(id);
  }, [value]);
  return <>{display.toFixed(decimals)}</>;
}

// ── Trajectory simulator ─────────────────────────────────────────────────────
const BASE_NET_ZERO_YEAR = 2042;
const CURRENT_YEAR = new Date().getFullYear();

// icon map keyed by icon_name stored in mission_decisions DB row
const DECISION_ICONS: Record<string, React.ElementType> = {
  Zap, Rocket, Leaf, Brain, TrendingDown, TrendingUp, Target,
};

function generateTrajectory(
  selectedKeys: string[],
  allDecisions: Array<{ decision_key: string; years_accelerated: number | null; cost_saving_lakhs_yr: number | null; emission_reduction_pct: number | null }>,
  intensity: number,
): { year: number; emissions: number; baseline: number }[] {
  const selected = allDecisions.filter(d => selectedKeys.includes(d.decision_key));
  const totalYearsSaved = selected.reduce((s, d) => s + (d.years_accelerated ?? 0), 0) * (intensity / 100);
  const netZeroYear = Math.round(BASE_NET_ZERO_YEAR - totalYearsSaved);

  return Array.from({ length: 21 }, (_, i) => {
    const year = CURRENT_YEAR + i;
    const t = i / 20;
    const baseline = Math.max(0, 100 - t * 30);
    const targetT = netZeroYear > CURRENT_YEAR ? (year - CURRENT_YEAR) / (netZeroYear - CURRENT_YEAR) : 1;
    const emissions = year >= netZeroYear ? 0 : Math.max(0, 100 * (1 - Math.pow(targetT, 1.4)));
    return { year, emissions: Math.round(emissions), baseline: Math.round(baseline) };
  });
}

// ── Page ─────────────────────────────────────────────────────────────────────
const MissionControl = () => {
  const { campusId } = useCampusContext();
  const { data: aiRecs = [] } = useAIRecommendations(campusId, "roi_pct");
  const { data: dbDecisions = [] } = useMissionDecisions(campusId);
  const { data: dbInsights = [] } = useMissionInsights(campusId);

  // Fallback decisions when DB is empty
  const fallbackDecisions = [
    { decision_key: "solar", label: "100% Solar by 2028", icon_name: "Zap", years_accelerated: 4, cost_saving_lakhs_yr: 450, emission_reduction_pct: 12 },
    { decision_key: "ev", label: "Full EV Fleet", icon_name: "Rocket", years_accelerated: 2, cost_saving_lakhs_yr: 280, emission_reduction_pct: 6 },
    { decision_key: "retrofit", label: "Deep Building Retrofit", icon_name: "Leaf", years_accelerated: 3, cost_saving_lakhs_yr: 620, emission_reduction_pct: 9 },
    { decision_key: "demand", label: "AI Demand Response", icon_name: "Brain", years_accelerated: 1, cost_saving_lakhs_yr: 120, emission_reduction_pct: 4 },
    { decision_key: "biomass", label: "Biomass Energy", icon_name: "TrendingDown", years_accelerated: 2, cost_saving_lakhs_yr: 350, emission_reduction_pct: 7 },
  ];
  const decisions = dbDecisions.length > 0 ? dbDecisions : fallbackDecisions;

  const [selected, setSelected] = useState<string[]>([decisions[0]?.decision_key ?? "solar"]);
  const [intensity, setIntensity] = useState(70);
  const [running, setRunning] = useState(false);
  const [insightIdx, setInsightIdx] = useState(0);

  const trajectory = generateTrajectory(selected, decisions, intensity);
  const netZeroYear = trajectory.find(d => d.emissions === 0)?.year ?? BASE_NET_ZERO_YEAR;
  const yearsRemaining = netZeroYear - CURRENT_YEAR;

  const selectedDecisions = decisions.filter(d => selected.includes(d.decision_key));
  const totalCostLakhs = selectedDecisions.reduce((s, d) => s + (d.cost_saving_lakhs_yr ?? 0), 0) * (intensity / 100);
  const totalCarbon = selectedDecisions.reduce((s, d) => s + (d.emission_reduction_pct ?? 0), 0) * (intensity / 100);

  // Rotating insights: DB mission_insights → fallback: AI recs → static
  const insightTexts: string[] =
    dbInsights.length > 0
      ? dbInsights.map(i => i.insight)
      : aiRecs.length > 0
      ? aiRecs.slice(0, 6).map(r => r.title + (r.description ? ": " + r.description : ""))
      : [
          "Shift 40% load to off-peak solar window (9am–1pm) — saves ₹18L/yr",
          "Retrocommissioning HVAC in Block C could cut cooling load by 22%",
          "Battery storage arbitrage opportunity: buy grid at ₹4.2, sell peak at ₹9.1",
          "Rooftop expansion in Hostel Zone D — 420 kWp feasible, 8yr payback",
          "Waste heat recovery in central kitchen — 60 kW thermal potential",
          "Occupancy-based lighting across 48 classrooms — ₹6L annual saving",
        ];

  useEffect(() => {
    const id = setInterval(() => setInsightIdx(i => (i + 1) % insightTexts.length), 5000);
    return () => clearInterval(id);
  }, [insightTexts.length]);

  // Simulation step ticker
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setIntensity(v => Math.min(100, v + 1)), 80);
    return () => clearInterval(id);
  }, [running]);

  const toggleDecision = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <DashboardLayout title="Mission Control" breadcrumb="Strategy · Mission Control">
      <div className="max-w-[1400px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Net-Zero Trajectory Simulator</h2>
              <p className="text-xs text-muted-foreground">Model your campus decarbonisation roadmap</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1 text-xs">
            <Clock className="w-3 h-3" />Target: {netZeroYear}
          </Badge>
        </div>

        {/* Rotating AI insight */}
        <Card className="glass-card grain-overlay border-primary/20">
          <CardContent className="py-3 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={insightIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="text-xs text-foreground leading-relaxed"
              >
                {insightTexts[insightIdx]}
              </motion.p>
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left — decisions + intensity */}
          <div className="space-y-4">
            <Card className="glass-card grain-overlay">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Decarbonisation Levers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {decisions.map(d => {
                  const active = selected.includes(d.decision_key);
                  const Icon = DECISION_ICONS[d.icon_name ?? ""] ?? Leaf;
                  return (
                    <button
                      key={d.decision_key}
                      onClick={() => toggleDecision(d.decision_key)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${active ? "border-primary/50 bg-primary/10" : "border-border bg-transparent hover:bg-muted/20"}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{d.label}</p>
                        <p className="text-[10px] text-muted-foreground">₹{((d.cost_saving_lakhs_yr ?? 0) / 100).toFixed(1)}Cr · {d.emission_reduction_pct ?? 0}% CO₂</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${active ? "bg-primary border-primary" : "border-muted-foreground"}`} />
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="glass-card grain-overlay">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Implementation Intensity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Slider
                  value={[intensity]}
                  onValueChange={([v]) => setIntensity(v)}
                  min={10} max={100} step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Conservative (10%)</span>
                  <span className="font-bold text-foreground">{intensity}%</span>
                  <span>Aggressive (100%)</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-7 text-xs gap-1"
                    onClick={() => setRunning(r => !r)}>
                    {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {running ? "Pause" : "Simulate"}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0"
                    onClick={() => { setRunning(false); setIntensity(70); setSelected([decisions[0]?.decision_key ?? "solar"]); }}>
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right — trajectory chart + KPIs */}
          <div className="xl:col-span-2 space-y-4">
            <Card className="glass-card grain-overlay">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-primary" />Emission Trajectory to Net-Zero
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`${v}%`, undefined]}
                    />
                    <ReferenceLine x={netZeroYear} stroke="hsl(var(--chart-2))" strokeDasharray="4 2" label={{ value: `Net-Zero ${netZeroYear}`, fill: "hsl(var(--chart-2))", fontSize: 10 }} />
                    <Line dataKey="baseline" stroke="hsl(var(--chart-1))" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="BAU Baseline" />
                    <Line dataKey="emissions" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} name="Your Trajectory" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Net-Zero Year", value: <AnimatedNumber value={netZeroYear} />, sub: `${yearsRemaining} years`, icon: Target, up: true },
                { label: "Yrs Saved vs BAU", value: <AnimatedNumber value={Math.max(0, BASE_NET_ZERO_YEAR - netZeroYear)} />, sub: "vs baseline", icon: TrendingDown, up: false },
                { label: "Total Investment", value: <>₹<AnimatedNumber value={totalCostLakhs / 100} decimals={1} />Cr</>, sub: "selected levers", icon: TrendingUp, up: null },
                { label: "CO₂ Reduction", value: <><AnimatedNumber value={totalCarbon} decimals={1} /> Mt</>, sub: "per year", icon: Leaf, up: null },
              ].map((k, i) => (
                <Card key={i} className="glass-card grain-overlay">
                  <CardContent className="pt-3 pb-2 text-center">
                    <k.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <p className="text-base font-bold text-foreground">{k.value}</p>
                    <p className="text-[10px] text-muted-foreground">{k.label}</p>
                    <p className="text-[9px] text-muted-foreground/70">{k.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected decisions summary */}
            {selected.length > 0 && (
              <Card className="glass-card grain-overlay">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Selected Strategy Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {decisions.filter(d => selected.includes(d.decision_key)).map(d => {
                    const Icon = DECISION_ICONS[d.icon_name ?? ""] ?? Leaf;
                    const maxYrs = Math.max(...decisions.map(x => x.years_accelerated ?? 0), 1);
                    return (
                    <div key={d.decision_key} className="flex items-center gap-3">
                      <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-xs flex-1">{d.label}</span>
                      <span className="text-[10px] text-muted-foreground">−{((d.years_accelerated ?? 0) * intensity / 100).toFixed(1)} yrs</span>
                      <div className="w-24">
                        <Progress value={((d.years_accelerated ?? 0) / maxYrs) * 100} className="h-1" />
                      </div>
                    </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MissionControl;
