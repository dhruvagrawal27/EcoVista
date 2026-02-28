import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import {
  Rocket, TrendingDown, TrendingUp, AlertTriangle, ShieldCheck,
  Zap, Sun, Building2, Battery, Users, FlaskConical, Brain,
  Timer, Target, ArrowRight, Sparkles, ChevronDown,
} from "lucide-react";

// --- Data & Logic ---

interface Decision {
  id: string;
  label: string;
  icon: React.ReactNode;
  emissionReduction: number; // % points
  costSaving: number; // lakhs/year
  yearsAccelerated: number;
  enabled: boolean;
}

const baseDecisions: Omit<Decision, "enabled">[] = [
  { id: "solar", label: "Increase solar capacity to 8 MW", icon: <Sun className="w-4 h-4" />, emissionReduction: 8.5, costSaving: 42, yearsAccelerated: 1.8 },
  { id: "retrofit", label: "Retrofit 20 inefficient buildings", icon: <Building2 className="w-4 h-4" />, emissionReduction: 12, costSaving: 38, yearsAccelerated: 2.4 },
  { id: "hvac", label: "Enable AI HVAC automation", icon: <Zap className="w-4 h-4" />, emissionReduction: 9.2, costSaving: 31, yearsAccelerated: 1.6 },
  { id: "battery", label: "Install 2 MWh battery storage", icon: <Battery className="w-4 h-4" />, emissionReduction: 5.8, costSaving: 18, yearsAccelerated: 0.9 },
  { id: "student", label: "Launch student sustainability program", icon: <Users className="w-4 h-4" />, emissionReduction: 3.2, costSaving: 8, yearsAccelerated: 0.5 },
  { id: "labs", label: "Optimize lab energy usage", icon: <FlaskConical className="w-4 h-4" />, emissionReduction: 6.4, costSaving: 22, yearsAccelerated: 1.1 },
];

const BASE_NET_ZERO_YEAR = 2042;
const AI_OPTIMIZED_YEAR = 2034;
const BASE_EMISSIONS_10Y = 48500; // tons CO2
const BASE_COST_10Y = 2840; // lakhs
const BASE_GRID_DEPENDENCY = 62;
const BASE_CARBON_PENALTY = 185; // lakhs

function generateTrajectory(baseYear: number, optimizedYear: number, range: number) {
  const data = [];
  const currentYear = 2025;
  for (let i = 0; i <= range; i++) {
    const year = currentYear + i;
    const baseProgress = Math.min(100, (i / (baseYear - currentYear)) * 100);
    const optProgress = Math.min(100, (i / (optimizedYear - currentYear)) * 100);
    const baseEmissions = Math.max(0, 4850 - (4850 * baseProgress) / 100);
    const optEmissions = Math.max(0, 4850 - (4850 * optProgress) / 100);
    data.push({
      year: year.toString(),
      currentPath: Math.round(baseEmissions),
      optimizedPath: Math.round(optEmissions),
    });
  }
  return data;
}

const rotatingInsights = [
  "Enabling HVAC automation across top 20 buildings can accelerate net-zero by 2.4 years and save ₹3.2Cr annually.",
  "Solar capacity expansion to 8 MW combined with battery storage would eliminate 14.3% of grid dependency within 18 months.",
  "Student engagement programs show 3.2% emission reduction at minimal cost — highest ROI per rupee invested.",
  "Lab energy optimization during non-academic hours could save ₹22L/year with zero impact on research output.",
  "Retrofitting Science Block A and Engineering Lab alone accounts for 28% of total achievable emission reduction.",
];

// --- Components ---

const AnimatedNumber = ({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) => {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const duration = 800;
    const start = displayed;
    const diff = value - start;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span>{prefix}{displayed.toLocaleString()}{suffix}</span>;
};

const MissionControl = () => {
  const [decisions, setDecisions] = useState<Decision[]>(
    baseDecisions.map((d) => ({ ...d, enabled: false }))
  );
  const [timeRange, setTimeRange] = useState(20);
  const [insightIndex, setInsightIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setInsightIndex((i) => (i + 1) % rotatingInsights.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const toggleDecision = (id: string) => {
    setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)));
  };

  const impact = useMemo(() => {
    const active = decisions.filter((d) => d.enabled);
    const totalEmissionReduction = active.reduce((s, d) => s + d.emissionReduction, 0);
    const totalCostSaving = active.reduce((s, d) => s + d.costSaving, 0);
    const totalYearsAccelerated = Math.min(active.reduce((s, d) => s + d.yearsAccelerated, 0), BASE_NET_ZERO_YEAR - 2028);
    const optimizedYear = Math.round(BASE_NET_ZERO_YEAR - totalYearsAccelerated);
    const emissionsReduced = Math.round(BASE_EMISSIONS_10Y * (totalEmissionReduction / 100));
    const costSaved = totalCostSaving * 10; // 10 years
    return {
      totalEmissionReduction: Math.min(totalEmissionReduction, 45),
      totalCostSaving,
      totalYearsAccelerated,
      optimizedYear,
      emissionsReduced,
      costSaved10Y: costSaved,
      gridReduction: Math.min(totalEmissionReduction * 0.8, 35),
      roi: active.length > 0 ? Math.round(180 + totalCostSaving * 1.2) : 0,
      confidence: active.length === 0 ? 0 : Math.min(92, 60 + active.length * 5.5),
      acceleration: totalYearsAccelerated >= 6 ? "HIGH" : totalYearsAccelerated >= 3 ? "MEDIUM" : totalYearsAccelerated > 0 ? "LOW" : "NONE",
    };
  }, [decisions]);

  const trajectoryData = useMemo(
    () => generateTrajectory(BASE_NET_ZERO_YEAR, impact.optimizedYear, timeRange),
    [impact.optimizedYear, timeRange]
  );

  const comparisonData = [
    { metric: "Emissions (tons)", without: BASE_EMISSIONS_10Y, withAI: BASE_EMISSIONS_10Y - impact.emissionsReduced },
    { metric: "Cost (₹L)", without: BASE_COST_10Y, withAI: Math.max(BASE_COST_10Y - impact.costSaved10Y, 800) },
    { metric: "Grid %", without: BASE_GRID_DEPENDENCY, withAI: Math.max(BASE_GRID_DEPENDENCY - impact.gridReduction, 20) },
  ];

  return (
    <DashboardLayout title="Mission Control" breadcrumb="AI · Net-Zero Intelligence">
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-2/5 pointer-events-none" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl premium-button flex items-center justify-center">
                <Rocket className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Net-Zero Mission Control</h2>
                <p className="text-sm text-muted-foreground">AI-Driven Decision Intelligence for Campus Sustainability</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs"><Brain className="w-3 h-3 mr-1" />AI Model v3.2</Badge>
              <Badge variant="outline" className="text-xs">Live Data · 2s ago</Badge>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Confidence: 94%</Badge>
            </div>
          </div>
        </motion.div>

        {/* Section 5 — Net-Zero Countdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="glass-card h-full">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                <Timer className="w-8 h-8 text-primary mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated Net-Zero Year</p>
                <p className="text-5xl font-black text-foreground">
                  <AnimatedNumber value={impact.optimizedYear > 2028 ? impact.optimizedYear : BASE_NET_ZERO_YEAR} />
                </p>
                {impact.totalYearsAccelerated > 0 && (
                  <p className="text-sm text-chart-2 font-medium mt-1">
                    {impact.totalYearsAccelerated.toFixed(1)} years faster than baseline
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card h-full">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                <Target className="w-8 h-8 text-chart-2 mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Acceleration Potential</p>
                <p className={`text-4xl font-black ${impact.acceleration === "HIGH" ? "text-chart-2" : impact.acceleration === "MEDIUM" ? "text-chart-4" : "text-muted-foreground"}`}>
                  {impact.acceleration}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="glass-card h-full">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                <ShieldCheck className="w-8 h-8 text-chart-3 mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">AI Confidence Score</p>
                <p className="text-5xl font-black text-foreground">
                  <AnimatedNumber value={impact.confidence || 94} suffix="%" />
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Section 1 — Net-Zero Trajectory Engine */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-lg">Net-Zero Trajectory Engine</CardTitle>
                <CardDescription>Current path vs AI-optimized path to net-zero</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {[5, 10, 20].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      timeRange === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {r}yr
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData}>
                  <defs>
                    <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradOptimized" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} label={{ value: "tons CO₂/yr", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" } }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend />
                  <Area type="monotone" dataKey="currentPath" name="Current Path" stroke="hsl(var(--destructive))" fill="url(#gradCurrent)" strokeWidth={2} />
                  <Area type="monotone" dataKey="optimizedPath" name={`AI-Optimized (${impact.optimizedYear})`} stroke="hsl(var(--chart-2))" fill="url(#gradOptimized)" strokeWidth={2.5} strokeDasharray={impact.totalYearsAccelerated > 0 ? "" : "6 4"} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 & 3 — If We Do Nothing + AI Intervention Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* If We Do Nothing */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card border-destructive/20 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <CardTitle className="text-lg text-destructive">If We Do Nothing</CardTitle>
                </div>
                <CardDescription>Projected outcomes without intervention (10-year horizon)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Total Energy Cost", value: `₹${BASE_COST_10Y}L`, icon: <TrendingUp className="w-4 h-4 text-destructive" /> },
                  { label: "Total Carbon Emissions", value: `${BASE_EMISSIONS_10Y.toLocaleString()} tons`, icon: <TrendingUp className="w-4 h-4 text-destructive" /> },
                  { label: "Net-Zero Delay", value: `${BASE_NET_ZERO_YEAR - 2035} years past target`, icon: <Timer className="w-4 h-4 text-destructive" /> },
                  { label: "Carbon Penalty Exposure", value: `₹${BASE_CARBON_PENALTY}L`, icon: <AlertTriangle className="w-4 h-4 text-destructive" /> },
                  { label: "Grid Dependency Risk", value: `${BASE_GRID_DEPENDENCY}%`, icon: <Zap className="w-4 h-4 text-destructive" /> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-destructive">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Intervention Impact */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <Card className="glass-card border-chart-2/20 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-chart-2" />
                  <CardTitle className="text-lg text-chart-2">With EcoVista AI</CardTitle>
                </div>
                <CardDescription>Impact when selected interventions are active</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Energy Reduction", value: `${impact.totalEmissionReduction.toFixed(1)}%`, delta: true },
                  { label: "Emission Reduction", value: `${impact.emissionsReduced.toLocaleString()} tons saved`, delta: true },
                  { label: "Cost Savings (10yr)", value: `₹${impact.costSaved10Y}L`, delta: true },
                  { label: "Years Accelerated", value: `${impact.totalYearsAccelerated.toFixed(1)} years`, delta: true },
                  { label: "ROI Improvement", value: impact.roi > 0 ? `${impact.roi}%` : "—", delta: impact.roi > 0 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-chart-2/5 border border-chart-2/10">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-chart-2" />
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${item.delta ? "text-chart-2" : "text-muted-foreground"}`}>{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Section 4 — Executive Decision Simulator */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Executive Decision Simulator</CardTitle>
            </div>
            <CardDescription>Toggle strategic decisions to see live impact on trajectory, cost, and emissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {decisions.map((decision) => (
                <motion.div
                  key={decision.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    decision.enabled
                      ? "border-primary/40 bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                  onClick={() => toggleDecision(decision.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={decision.enabled} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {decision.icon}
                        <span className="text-sm font-medium text-foreground">{decision.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">-{decision.emissionReduction}% emissions</Badge>
                        <Badge variant="outline" className="text-[10px]">₹{decision.costSaving}L/yr</Badge>
                        <Badge variant="outline" className="text-[10px]">-{decision.yearsAccelerated}yr</Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Bar Chart */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Before vs After AI — 10 Year Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="metric" type="category" width={120} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="without" name="Without AI" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} barSize={18} />
                  <Bar dataKey="withAI" name="With EcoVista AI" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Section 6 — AI Strategic Insight */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl premium-button flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold text-foreground">AI Strategic Insight</p>
                    <Badge variant="outline" className="text-[10px]">Auto-rotating</Badge>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={insightIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4 }}
                      className="text-sm text-muted-foreground leading-relaxed"
                    >
                      "{rotatingInsights[insightIndex]}"
                    </motion.p>
                  </AnimatePresence>
                  <div className="flex gap-1 mt-3">
                    {rotatingInsights.map((_, i) => (
                      <button key={i} onClick={() => setInsightIndex(i)} className={`w-2 h-2 rounded-full transition-colors ${i === insightIndex ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data confidence footer */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pb-4">
          <span>Data Confidence: 94%</span>
          <span>·</span>
          <span>AI Model v3.2</span>
          <span>·</span>
          <span>Last Updated: 2s ago</span>
          <span>·</span>
          <span>Latency: 12ms</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MissionControl;
