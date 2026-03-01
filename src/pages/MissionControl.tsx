import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Rocket, Brain, Zap, Leaf, TrendingDown, TrendingUp, Play, Pause,
  RotateCcw, Target, Clock, Lightbulb, Info, Plus, Pencil, Trash2,
} from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useAuth } from "@/context/AuthContext";
import type { RoleName } from "@/context/AuthContext";
import { useAIRecommendations } from "@/hooks/useAI";
import {
  useMissionDecisions, useMissionInsights,
  useCreateMissionDecision, useUpdateMissionDecision, useDeleteMissionDecision,
} from "@/hooks/useMission";
import type { MissionDecision } from "@/lib/types";

const ROLE_INFO: Partial<Record<NonNullable<RoleName>, { color: string; msg: string }>> = {
  Admin: { color: "text-violet-400 border-violet-500/20", msg: "Full access \u2014 simulate trajectory, add/edit/delete decarbonisation levers." },
  "Facility Manager": { color: "text-blue-400 border-blue-500/20", msg: "You can run simulations and adjust implementation intensity." },
  Finance: { color: "text-emerald-400 border-emerald-500/20", msg: "View-only \u2014 explore net-zero trajectory scenarios." },
  Faculty: { color: "text-yellow-400 border-yellow-500/20", msg: "View-only \u2014 browse decarbonisation scenarios and trajectory." },
};

// â”€â”€ Animated number â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Trajectory simulator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BASE_NET_ZERO_YEAR = 2042;
const CURRENT_YEAR = new Date().getFullYear();

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

/* â”€â”€â”€ Lever dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ICON_OPTIONS = ["Zap", "Rocket", "Leaf", "Brain", "TrendingDown", "TrendingUp", "Target"];

interface LeverDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: MissionDecision | null;
  onSave: (data: Omit<MissionDecision, "id" | "campus_id">) => void;
  isPending: boolean;
}

function LeverDialog({ open, onClose, initial, onSave, isPending }: LeverDialogProps) {
  const [form, setForm] = useState({
    decision_key: initial?.decision_key ?? "",
    label: initial?.label ?? "",
    icon_name: initial?.icon_name ?? "Leaf",
    years_accelerated: initial?.years_accelerated ?? 2,
    cost_saving_lakhs_yr: initial?.cost_saving_lakhs_yr ?? 100,
    emission_reduction_pct: initial?.emission_reduction_pct ?? 5,
    sort_order: initial?.sort_order ?? 99,
  });

  useEffect(() => {
    if (initial) {
      setForm({
        decision_key: initial.decision_key,
        label: initial.label,
        icon_name: initial.icon_name ?? "Leaf",
        years_accelerated: initial.years_accelerated ?? 2,
        cost_saving_lakhs_yr: initial.cost_saving_lakhs_yr ?? 100,
        emission_reduction_pct: initial.emission_reduction_pct ?? 5,
        sort_order: initial.sort_order ?? 99,
      });
    } else {
      setForm({ decision_key: "", label: "", icon_name: "Leaf", years_accelerated: 2, cost_saving_lakhs_yr: 100, emission_reduction_pct: 5, sort_order: 99 });
    }
  }, [initial, open]);

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.type === "number" ? +e.target.value : e.target.value }));

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">{initial ? "Edit Lever" : "Add Decarbonisation Lever"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-xs">
          <div>
            <p className="text-muted-foreground mb-1">Decision Key (unique slug)</p>
            <Input value={form.decision_key} onChange={f("decision_key")} placeholder="e.g. solar_expansion" className="h-8 text-xs" />
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Label</p>
            <Input value={form.label} onChange={f("label")} placeholder="e.g. 100% Solar by 2028" className="h-8 text-xs" />
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Icon</p>
            <select value={form.icon_name} onChange={f("icon_name")} className="w-full h-8 text-xs rounded-md border border-border bg-background px-2">
              {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-muted-foreground mb-1">Years saved</p>
              <Input type="number" value={form.years_accelerated} onChange={f("years_accelerated")} className="h-8 text-xs" />
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Savings (Lakhs/yr)</p>
              <Input type="number" value={form.cost_saving_lakhs_yr} onChange={f("cost_saving_lakhs_yr")} className="h-8 text-xs" />
            </div>
            <div>
              <p className="text-muted-foreground mb-1">CO\u2082 reduction %</p>
              <Input type="number" value={form.emission_reduction_pct} onChange={f("emission_reduction_pct")} className="h-8 text-xs" />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="h-7 text-xs premium-button" disabled={isPending || !form.label || !form.decision_key} onClick={() => onSave(form)}>
            {isPending ? "Saving\u2026" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MissionControl = () => {
  const { campusId } = useCampusContext();
  const { user } = useAuth();
  const role = user?.role_name as RoleName | undefined;
  const canSimulate = role === "Admin" || role === "Facility Manager";
  const canManageLevers = role === "Admin";

  const { data: aiRecs = [] } = useAIRecommendations(campusId, "roi_pct");
  const { data: dbDecisions = [] } = useMissionDecisions(campusId);
  const { data: dbInsights = [] } = useMissionInsights(campusId);

  const createDecision = useCreateMissionDecision(campusId);
  const updateDecision = useUpdateMissionDecision(campusId);
  const deleteDecision = useDeleteMissionDecision(campusId);

  // Fallback decisions when DB is empty
  const fallbackDecisions: MissionDecision[] = [
    { id: -1, campus_id: campusId, decision_key: "solar", label: "100% Solar by 2028", icon_name: "Zap", years_accelerated: 4, cost_saving_lakhs_yr: 450, emission_reduction_pct: 12, sort_order: 1 },
    { id: -2, campus_id: campusId, decision_key: "ev", label: "Full EV Fleet", icon_name: "Rocket", years_accelerated: 2, cost_saving_lakhs_yr: 280, emission_reduction_pct: 6, sort_order: 2 },
    { id: -3, campus_id: campusId, decision_key: "retrofit", label: "Deep Building Retrofit", icon_name: "Leaf", years_accelerated: 3, cost_saving_lakhs_yr: 620, emission_reduction_pct: 9, sort_order: 3 },
    { id: -4, campus_id: campusId, decision_key: "demand", label: "AI Demand Response", icon_name: "Brain", years_accelerated: 1, cost_saving_lakhs_yr: 120, emission_reduction_pct: 4, sort_order: 4 },
    { id: -5, campus_id: campusId, decision_key: "biomass", label: "Biomass Energy", icon_name: "TrendingDown", years_accelerated: 2, cost_saving_lakhs_yr: 350, emission_reduction_pct: 7, sort_order: 5 },
  ];
  const decisions = dbDecisions.length > 0 ? dbDecisions : fallbackDecisions;
  const isUsingFallback = dbDecisions.length === 0;

  const [selected, setSelected] = useState<string[]>([decisions[0]?.decision_key ?? "solar"]);
  const [intensity, setIntensity] = useState(70);
  const [running, setRunning] = useState(false);
  const [insightIdx, setInsightIdx] = useState(0);
  const [leverDialog, setLeverDialog] = useState<{ open: boolean; editing: MissionDecision | null }>({ open: false, editing: null });

  const trajectory = generateTrajectory(selected, decisions, intensity);
  const netZeroYear = trajectory.find(d => d.emissions === 0)?.year ?? BASE_NET_ZERO_YEAR;
  const yearsRemaining = netZeroYear - CURRENT_YEAR;

  const selectedDecisions = decisions.filter(d => selected.includes(d.decision_key));
  const totalCostLakhs = selectedDecisions.reduce((s, d) => s + (d.cost_saving_lakhs_yr ?? 0), 0) * (intensity / 100);
  const totalCarbon = selectedDecisions.reduce((s, d) => s + (d.emission_reduction_pct ?? 0), 0) * (intensity / 100);

  const insightTexts: string[] =
    dbInsights.length > 0
      ? dbInsights.map(i => i.insight)
      : aiRecs.length > 0
      ? aiRecs.slice(0, 6).map(r => r.title + (r.description ? ": " + r.description : ""))
      : [
          "Shift 40% load to off-peak solar window (9am\u20131pm) \u2014 saves \u20b918L/yr",
          "Retrocommissioning HVAC in Block C could cut cooling load by 22%",
          "Battery storage arbitrage opportunity: buy grid at \u20b94.2, sell peak at \u20b99.1",
          "Rooftop expansion in Hostel Zone D \u2014 420 kWp feasible, 8yr payback",
          "Waste heat recovery in central kitchen \u2014 60 kW thermal potential",
          "Occupancy-based lighting across 48 classrooms \u2014 \u20b96L annual saving",
        ];

  useEffect(() => {
    const id = setInterval(() => setInsightIdx(i => (i + 1) % insightTexts.length), 5000);
    return () => clearInterval(id);
  }, [insightTexts.length]);

  useEffect(() => {
    if (!running || !canSimulate) return;
    const id = setInterval(() => setIntensity(v => Math.min(100, v + 1)), 80);
    return () => clearInterval(id);
  }, [running, canSimulate]);

  const toggleDecision = (key: string) => {
    if (!canSimulate) return;
    setSelected(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
  };

  const handleSaveLever = (data: Omit<MissionDecision, "id" | "campus_id">) => {
    if (leverDialog.editing && leverDialog.editing.id > 0) {
      updateDecision.mutate({ id: leverDialog.editing.id, ...data }, { onSuccess: () => setLeverDialog({ open: false, editing: null }) });
    } else {
      createDecision.mutate(data, { onSuccess: () => setLeverDialog({ open: false, editing: null }) });
    }
  };

  const ri = role ? (ROLE_INFO[role] ?? null) : null;

  return (
    <DashboardLayout title="Mission Control" breadcrumb="Strategy \u00b7 Mission Control">
      <div className="max-w-[1400px] mx-auto space-y-4">
        {/* Role banner */}
        {ri && (
          <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${ri.color}`}>
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span><strong>{role}</strong> \u2014 {ri.msg}</span>
          </div>
        )}

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
          {/* Left â€” decisions + intensity */}
          <div className="space-y-4">
            <Card className="glass-card grain-overlay">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Decarbonisation Levers</CardTitle>
                  {canManageLevers && !isUsingFallback && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] gap-1"
                      onClick={() => setLeverDialog({ open: true, editing: null })}
                    >
                      <Plus className="w-3 h-3" />Add
                    </Button>
                  )}
                </div>
                {isUsingFallback && canManageLevers && (
                  <p className="text-[10px] text-amber-400 mt-1">Using demo data &#8212; seed mission_decisions table to persist levers.</p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {decisions.map(d => {
                  const active = selected.includes(d.decision_key);
                  const Icon = DECISION_ICONS[d.icon_name ?? ""] ?? Leaf;
                  return (
                    <div key={d.decision_key} className="flex items-center gap-1">
                      <button
                        onClick={() => toggleDecision(d.decision_key)}
                        className={`flex-1 flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${active ? "border-primary/50 bg-primary/10" : "border-border bg-transparent hover:bg-muted/20"} ${!canSimulate ? "cursor-default opacity-80" : ""}`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{d.label}</p>
                          <p className="text-[10px] text-muted-foreground">\u20b9{((d.cost_saving_lakhs_yr ?? 0) / 100).toFixed(1)}Cr \u00b7 {d.emission_reduction_pct ?? 0}% CO\u2082</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${active ? "bg-primary border-primary" : "border-muted-foreground"}`} />
                      </button>
                      {canManageLevers && d.id > 0 && (
                        <>
                          <button
                            onClick={() => setLeverDialog({ open: true, editing: d })}
                            className="text-muted-foreground hover:text-foreground p-1"
                            title="Edit"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteDecision.mutate(d.id)}
                            className="text-muted-foreground hover:text-destructive p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
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
                  onValueChange={([v]) => canSimulate && setIntensity(v)}
                  min={10} max={100} step={5}
                  className="w-full"
                  disabled={!canSimulate}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Conservative (10%)</span>
                  <span className="font-bold text-foreground">{intensity}%</span>
                  <span>Aggressive (100%)</span>
                </div>
                {canSimulate ? (
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
                ) : (
                  <p className="text-[10px] text-muted-foreground text-center">Simulation controls available to Admin and Facility Manager.</p>
                )}
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
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(215 16% 55%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(215 16% 55%)" }} unit="%" />
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
                { label: "Net-Zero Year", value: <AnimatedNumber value={netZeroYear} />, sub: `${yearsRemaining} years`, icon: Target },
                { label: "Yrs Saved vs BAU", value: <AnimatedNumber value={Math.max(0, BASE_NET_ZERO_YEAR - netZeroYear)} />, sub: "vs baseline", icon: TrendingDown },
                { label: "Total Investment", value: <>\u20b9<AnimatedNumber value={totalCostLakhs / 100} decimals={1} />Cr</>, sub: "selected levers", icon: TrendingUp },
                { label: "CO\u2082 Reduction", value: <><AnimatedNumber value={totalCarbon} decimals={1} /> Mt</>, sub: "per year", icon: Leaf },
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
                        <span className="text-[10px] text-muted-foreground">\u2212{((d.years_accelerated ?? 0) * intensity / 100).toFixed(1)} yrs</span>
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

      {/* Lever management dialog */}
      <LeverDialog
        open={leverDialog.open}
        onClose={() => setLeverDialog({ open: false, editing: null })}
        initial={leverDialog.editing}
        onSave={handleSaveLever}
        isPending={createDecision.isPending || updateDecision.isPending}
      />
    </DashboardLayout>
  );
};


export default MissionControl;
