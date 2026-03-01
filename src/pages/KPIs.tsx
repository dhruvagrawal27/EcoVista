import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Activity, Info, Pencil, X, Save } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useAuth } from "@/context/AuthContext";
import type { RoleName } from "@/context/AuthContext";
import { useSustainabilityScore, useSdgScores, useKpiRiskIndicators, useUpdateKpiRiskIndicator, useKpiIndicators } from "@/hooks/useKPIs";
import type { KpiRiskIndicator } from "@/lib/types";

const CHART_TICK = "hsl(215 16% 55%)";

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  "on-track": { color: "text-[hsl(var(--chart-2))]", icon: CheckCircle2 },
  "at-risk": { color: "text-[hsl(var(--chart-4))]", icon: AlertTriangle },
  "critical": { color: "text-destructive", icon: XCircle },
  "achieved": { color: "text-primary", icon: CheckCircle2 },
};

const ROLE_INFO: Partial<Record<NonNullable<RoleName>, { color: string; msg: string }>> = {
  "Admin": {
    color: "text-violet-400 border-violet-500/20",
    msg: "Full access — you can inline-edit KPI risk indicators (current value, target, status). Overall scores are updated via data pipelines.",
  },
  "Facility Manager": {
    color: "text-blue-400 border-blue-500/20",
    msg: "You can inline-edit KPI risk indicator values and status to keep targets current.",
  },
  "Finance": {
    color: "text-emerald-400 border-emerald-500/20",
    msg: "Read-only view of all sustainability KPIs and SDG scores. Contact Facility Manager or Admin to update indicator values.",
  },
  "Faculty": {
    color: "text-yellow-400 border-yellow-500/20",
    msg: "Read-only view of sustainability KPI scores and SDG alignment for research and reporting purposes.",
  },
};

const KPIs = () => {
  const { campusId } = useCampusContext();
  const { user } = useAuth();
  const role = user?.role_name as RoleName | undefined;
  const canEdit = role === "Admin" || role === "Facility Manager";

  const { data: sustainabilityScore, isLoading: loadingScore } = useSustainabilityScore(campusId);
  const { data: sdgScores = [], isLoading: loadingSdg } = useSdgScores(campusId);
  const { data: kpiRiskIndicators = [], isLoading: loadingRisk } = useKpiRiskIndicators(campusId);
  const { data: kpiIndicators = [], isLoading: loadingIndicators } = useKpiIndicators(campusId);
  const updateKpi = useUpdateKpiRiskIndicator(campusId);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ current_value: string; target_value: string; status: KpiRiskIndicator["status"] }>({
    current_value: "", target_value: "", status: "on-track",
  });

  const startEdit = (k: KpiRiskIndicator) => {
    setEditingId(k.id);
    setEditForm({ current_value: String(k.current_value), target_value: String(k.target_value), status: k.status });
  };

  const saveEdit = (k: KpiRiskIndicator) => {
    updateKpi.mutate({
      id: k.id,
      current_value: parseFloat(editForm.current_value) || k.current_value,
      target_value: parseFloat(editForm.target_value) || k.target_value,
      status: editForm.status,
    }, {
      onSuccess: () => setEditingId(null),
    });
  };

  const overallScore = sustainabilityScore?.overall_score ?? 0;
  const categories = sustainabilityScore ? [
    { name: "Energy Efficiency", score: sustainabilityScore.energy_efficiency ?? 0, trend: sustainabilityScore.energy_trend ?? 0 },
    { name: "Carbon Reduction", score: sustainabilityScore.carbon_reduction ?? 0, trend: sustainabilityScore.carbon_trend ?? 0 },
    { name: "Renewables", score: sustainabilityScore.renewable_share ?? 0, trend: sustainabilityScore.renewable_trend ?? 0 },
    { name: "Water", score: sustainabilityScore.water_conservation ?? 0, trend: sustainabilityScore.water_trend ?? 0 },
    { name: "Waste", score: sustainabilityScore.waste_management ?? 0, trend: sustainabilityScore.waste_trend ?? 0 },
    { name: "Biodiversity", score: sustainabilityScore.biodiversity ?? 0, trend: sustainabilityScore.biodiversity_trend ?? 0 },
  ] : [];

  const radarData = sdgScores.map(s => ({ subject: `SDG ${s.sdg_number}`, score: s.score ?? 0 }));

  const leadingIndicators = kpiIndicators.filter(k => k.indicator_type === "leading");
  const laggingIndicators = kpiIndicators.filter(k => k.indicator_type === "lagging");

  const ri = role ? (ROLE_INFO[role] ?? null) : null;

  return (
    <DashboardLayout title="Sustainability KPIs" breadcrumb="KPIs Health Score">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><Target className="w-3 h-3" /> KPIs</Badge>
          <span>Last Updated: Today</span>
          <Badge variant="outline" className="gap-1 ml-auto">Confidence: 93%</Badge>
        </div>

        {ri && (
          <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${ri.color}`}>
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{ri.msg}</span>
          </div>
        )}

        <Card className="glass-card grain-overlay border-primary/20">
          <CardContent className="pt-6">
            {loadingScore ? <Skeleton className="h-32 w-full" /> : (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--chart-1))" strokeWidth="6" strokeDasharray={`${overallScore * 2.64} 264`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground">{overallScore}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Sustainability Health Score</p>
                  {sustainabilityScore?.score_date && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {new Date(sustainabilityScore.score_date).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
                  {categories.map(c => (
                    <div key={c.name} className="bg-accent/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{c.name}</span>
                        <Badge variant="outline" className="text-[10px] h-4 text-primary">+{c.trend}%</Badge>
                      </div>
                      <p className="text-lg font-bold text-foreground">{c.score}</p>
                      <Progress value={c.score} className="h-1 mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2"><CardTitle className="text-sm">SDG Alignment Radar</CardTitle></CardHeader>
            <CardContent>
              {loadingSdg ? <Skeleton className="h-[280px] w-full" /> : (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: CHART_TICK }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar dataKey="score" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1) / 0.2)" strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="space-y-1 mt-2">
                    {sdgScores.map(s => (
                      <div key={s.sdg_number} className="flex items-center gap-2 text-xs">
                        <span className="w-12 font-mono text-muted-foreground">SDG {s.sdg_number}</span>
                        <span className="flex-1 text-foreground">{s.sdg_name}</span>
                        <span className="font-medium text-foreground">{s.score ?? "--"}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />KPI Risk Indicators
                {canEdit && <span className="ml-auto text-[10px] text-muted-foreground font-normal">Click ✎ to edit</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingRisk ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />) : kpiRiskIndicators.map(k => {
                const config = statusConfig[k.status] ?? statusConfig["on-track"];
                const Icon = config.icon;
                const isEditing = editingId === k.id;
                const current = k.current_value ?? 0;
                const target = k.target_value ?? 1;
                return (
                  <motion.div key={k.id} whileHover={{ x: canEdit ? 2 : 0 }} className="border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className="text-xs font-medium text-foreground flex-1">{k.kpi_name}</span>
                      {!isEditing && <Badge variant="outline" className={`text-[10px] h-4 capitalize ${config.color}`}>{k.status}</Badge>}
                      {canEdit && !isEditing && (
                        <button onClick={() => startEdit(k)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1">Current Value</p>
                            <Input
                              value={editForm.current_value}
                              onChange={e => setEditForm(f => ({ ...f, current_value: e.target.value }))}
                              className="h-7 text-xs"
                              type="number"
                              step="any"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1">Target Value</p>
                            <Input
                              value={editForm.target_value}
                              onChange={e => setEditForm(f => ({ ...f, target_value: e.target.value }))}
                              className="h-7 text-xs"
                              type="number"
                              step="any"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">Status</p>
                          <Select value={editForm.status} onValueChange={(v) => setEditForm(f => ({ ...f, status: v as KpiRiskIndicator["status"] }))}>
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="on-track">On Track</SelectItem>
                              <SelectItem value="at-risk">At Risk</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                              <SelectItem value="achieved">Achieved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setEditingId(null)}>
                            <X className="w-3 h-3 mr-1" />Cancel
                          </Button>
                          <Button size="sm" className="h-6 text-xs" onClick={() => saveEdit(k)} disabled={updateKpi.isPending}>
                            <Save className="w-3 h-3 mr-1" />{updateKpi.isPending ? "Saving…" : "Save"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Current: <span className="font-medium text-foreground">{current}{k.unit}</span></span>
                          <span>Target: <span className="font-medium text-foreground">{target}{k.unit}</span></span>
                          <span className="ml-auto">Deadline: {k.deadline_label ?? k.deadline_date ?? "N/A"}</span>
                        </div>
                        <Progress value={target > 0 ? (current / target) * 100 : 0} className="h-1 mt-2" />
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                          Updated: {new Date(k.updated_at).toLocaleDateString("en-IN")}
                        </p>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Leading vs Lagging Indicators</CardTitle></CardHeader>
          <CardContent>
            {loadingIndicators ? (
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Leading (Predictive)</p>
                  <div className="space-y-2">
                    {leadingIndicators.length > 0 ? leadingIndicators.map(k => (
                      <div key={k.id} className="flex items-start gap-2 text-xs">
                        <TrendingUp className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        <div>
                          <span className="text-foreground">{k.name}</span>
                          {k.description && <p className="text-[10px] text-muted-foreground">{k.description}</p>}
                        </div>
                      </div>
                    )) : (
                      ["Solar Capacity Growth", "Smart Meter Coverage", "Green Procurement %", "Employee Engagement Score"].map(name => (
                        <div key={name} className="flex items-center gap-2 text-xs"><TrendingUp className="w-3 h-3 text-primary" /><span className="text-foreground">{name}</span></div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Lagging (Outcome)</p>
                  <div className="space-y-2">
                    {laggingIndicators.length > 0 ? laggingIndicators.map(k => (
                      <div key={k.id} className="flex items-start gap-2 text-xs">
                        <Activity className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <span className="text-foreground">{k.name}</span>
                          {k.description && <p className="text-[10px] text-muted-foreground">{k.description}</p>}
                        </div>
                      </div>
                    )) : (
                      ["Carbon Emissions (tCO2e)", "Energy Cost (per kWh)", "Waste to Landfill (%)", "Water Consumption (ML)"].map(name => (
                        <div key={name} className="flex items-center gap-2 text-xs"><Activity className="w-3 h-3 text-muted-foreground" /><span className="text-foreground">{name}</span></div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KPIs;