import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Map, AlertTriangle, CheckCircle2, Clock, Info, Edit2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Label as RechartsLabel,
} from "recharts";
import { useCampusContext } from "@/context/CampusContext";
import { useAuth } from "@/context/AuthContext";
import {
  useRoadmapPhases, useRiskRegister,
  useUpdatePhase, useUpdateRisk,
} from "@/hooks/useRoadmap";
import { useToast } from "@/hooks/use-toast";
import type { RoleName } from "@/context/AuthContext";

const riskBadge: Record<string, string> = {
  low: "text-emerald-400 border-emerald-500/30",
  medium: "text-yellow-400 border-yellow-500/30",
  high: "text-orange-400 border-orange-500/30",
  critical: "text-red-400 border-red-500/30",
};

// Consistent muted colour for recharts axis ticks & labels on dark theme
const CHART_TICK = "hsl(215 16% 55%)";

const ROLE_INFO: Partial<Record<NonNullable<RoleName>, { color: string; msg: string }>> = {
  "Admin": {
    color: "text-violet-400 border-violet-500/20",
    msg: "Full access — edit phase progress & spend, update risk status inline here. Add/delete phases, risks, and projects in Admin → Planning.",
  },
  "Facility Manager": {
    color: "text-blue-400 border-blue-500/20",
    msg: "You can inline-edit phase progress & actual spend, and update risk status. To add or delete phases/risks go to Admin → Planning.",
  },
  "Finance": {
    color: "text-emerald-400 border-emerald-500/20",
    msg: "Read-only view. You can see all phase budgets, spending breakdown, and the risk register. Contact Facility Manager or Admin for changes.",
  },
  "Faculty": {
    color: "text-yellow-400 border-yellow-500/20",
    msg: "Read-only view of the Net-Zero roadmap, budget tracking, and risk register.",
  },
};

const Roadmap = () => {
  const { campusId } = useCampusContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const role = user?.role_name ?? null;
  const canEdit = role === "Admin" || role === "Facility Manager";

  const { data: phases = [], isLoading: loadingPhases } = useRoadmapPhases(campusId);
  const { data: risks = [], isLoading: loadingRisks } = useRiskRegister(campusId);
  const updatePhase = useUpdatePhase(campusId);
  const updateRisk = useUpdateRisk(campusId);

  // Inline-edit state
  const [editingPhase, setEditingPhase] = useState<{ id: number; progress_pct: string; spent_inr: string } | null>(null);
  const [editingRisk, setEditingRisk] = useState<{ id: number; status: string } | null>(null);

  const budgetData = phases.map(p => ({
    name: `Ph ${p.phase_number}`,
    Budget: parseFloat(((p.budget_inr ?? 0) / 1_000_000).toFixed(2)),
    Spent: parseFloat(((p.spent_inr ?? 0) / 1_000_000).toFixed(2)),
  }));

  const openRisks = risks.filter(r => r.status === "open").length;
  const mitigatedRisks = risks.filter(r => r.status === "mitigated").length;

  const handleSavePhase = (id: number) => {
    if (!editingPhase) return;
    updatePhase.mutate(
      { id, progress_pct: Number(editingPhase.progress_pct), spent_inr: Number(editingPhase.spent_inr) },
      {
        onSuccess: () => { toast({ title: "Phase updated ✓" }); setEditingPhase(null); },
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleSaveRisk = (id: number) => {
    if (!editingRisk) return;
    updateRisk.mutate(
      { id, status: editingRisk.status as "open" | "mitigated" | "closed" },
      {
        onSuccess: () => { toast({ title: "Risk status updated ✓" }); setEditingRisk(null); },
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const ri = role ? (ROLE_INFO[role] ?? null) : null;

  return (
    <DashboardLayout title="Roadmap" breadcrumb="Sustainability Roadmap">
      <div className="max-w-[1400px] mx-auto space-y-4">

        {/* Role info banner */}
        {ri && (
          <Card className={`glass-card grain-overlay border ${ri.color.split(" ")[1]}`}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start gap-2 text-xs">
                <Info className={`w-4 h-4 shrink-0 mt-0.5 ${ri.color.split(" ")[0]}`} />
                <div>
                  <span className={`font-semibold ${ri.color.split(" ")[0]}`}>{role}</span>
                  <span className="text-muted-foreground ml-2">{ri.msg}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary badges */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <Badge variant="outline" className="gap-1"><Map className="w-3 h-3" /> Roadmap</Badge>
          <span>{phases.length} Phases</span>
          <Badge variant="outline" className="gap-1 text-red-400 border-red-500/30">
            <AlertTriangle className="w-3 h-3" />{openRisks} Open Risks
          </Badge>
          <Badge variant="outline" className="gap-1 text-emerald-400 border-emerald-500/30 ml-auto">
            <CheckCircle2 className="w-3 h-3" />{mitigatedRisks} Mitigated
          </Badge>
          {canEdit && (
            <Badge variant="outline" className="gap-1 text-violet-400 border-violet-500/30">
              <Edit2 className="w-3 h-3" />Inline editing enabled
            </Badge>
          )}
        </div>

        <Tabs defaultValue="phases">
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="phases" className="gap-1.5"><Map className="w-3.5 h-3.5" />Phases</TabsTrigger>
            <TabsTrigger value="budget" className="gap-1.5">Budget vs Spent</TabsTrigger>
            <TabsTrigger value="risks" className="gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />Risk Register</TabsTrigger>
          </TabsList>

          {/* ── Phases tab ─────────────────────────────────────────────── */}
          <TabsContent value="phases" className="space-y-4 mt-4">
            {loadingPhases ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              phases.map((p, idx) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="glass-card grain-overlay">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <CardTitle className="text-sm">Phase {p.phase_number}: {p.name}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">{p.start_date} — {p.end_date}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] ${riskBadge[p.risk_level ?? "low"]}`}>
                            {p.risk_level ?? "low"} risk
                          </Badge>
                          {canEdit && (
                            editingPhase?.id === p.id ? (
                              <div className="flex items-center gap-1">
                                <Button size="sm" className="h-7 text-xs premium-button" onClick={() => handleSavePhase(p.id)} disabled={updatePhase.isPending}>Save</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingPhase(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                                onClick={() => setEditingPhase({ id: p.id, progress_pct: String(p.progress_pct ?? 0), spent_inr: String(p.spent_inr ?? 0) })}>
                                <Edit2 className="w-3 h-3" />Edit
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          {editingPhase?.id === p.id
                            ? <Input type="number" className="h-6 w-20 text-xs text-right py-0"
                                value={editingPhase.progress_pct}
                                onChange={e => setEditingPhase(ep => ep ? { ...ep, progress_pct: e.target.value } : ep)}
                                min={0} max={100} />
                            : <span>{p.progress_pct ?? 0}%</span>
                          }
                        </div>
                        <Progress value={editingPhase?.id === p.id ? Number(editingPhase.progress_pct) : (p.progress_pct ?? 0)} className="h-2" />
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground flex-wrap items-center">
                        <span>Budget: Rs.{((p.budget_inr ?? 0) / 1_000_000).toFixed(1)}M</span>
                        <span className="flex items-center gap-1">
                          Spent:{" "}
                          {editingPhase?.id === p.id
                            ? <Input type="number" className="h-6 w-28 text-xs py-0"
                                value={editingPhase.spent_inr}
                                onChange={e => setEditingPhase(ep => ep ? { ...ep, spent_inr: e.target.value } : ep)} />
                            : <span>Rs.{((p.spent_inr ?? 0) / 1_000_000).toFixed(1)}M</span>
                          }
                        </span>
                        {p.updated_at && (
                          <span className="ml-auto text-[10px] opacity-60">
                            Last updated: {new Date(p.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      {p.milestones.length > 0 && (
                        <div className="border-t border-border pt-2 space-y-1">
                          {p.milestones.map(m => (
                            <div key={m.id} className="flex items-center gap-2 text-xs">
                              {m.is_done
                                ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                : <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                              }
                              <span className={m.is_done ? "line-through text-muted-foreground" : "text-foreground"}>{m.name}</span>
                              <span className="ml-auto text-muted-foreground">{m.target_date}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
            {canEdit && (
              <p className="text-xs text-muted-foreground text-center py-1">
                To <strong>add or delete phases</strong>, go to <strong>Admin → Planning</strong> tab.
              </p>
            )}
          </TabsContent>

          {/* ── Budget vs Spent tab ─────────────────────────────────────── */}
          <TabsContent value="budget" className="mt-4">
            {loadingPhases ? <Skeleton className="h-64 w-full" /> : (
              <Card className="glass-card grain-overlay">
                <CardHeader>
                  <CardTitle className="text-sm">Budget vs Spent (Rs. Millions)</CardTitle>
                  <CardDescription className="text-xs">
                    Each bar pair represents one roadmap phase. Budget = approved allocation · Spent = actual expenditure to date.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={budgetData} margin={{ top: 10, right: 20, left: 20, bottom: 45 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: CHART_TICK }}
                        tickLine={{ stroke: CHART_TICK }}
                        axisLine={{ stroke: CHART_TICK }}
                      >
                        <RechartsLabel value="Roadmap Phase" offset={-14} position="insideBottom" fill={CHART_TICK} fontSize={11} />
                      </XAxis>
                      <YAxis
                        tick={{ fontSize: 11, fill: CHART_TICK }}
                        tickLine={{ stroke: CHART_TICK }}
                        axisLine={{ stroke: CHART_TICK }}
                        width={56}
                      >
                        <RechartsLabel value="Rs. Millions" angle={-90} position="insideLeft" fill={CHART_TICK} fontSize={11} dx={-4} />
                      </YAxis>
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(10,10,20,0.92)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", fontSize: 12 }}
                        formatter={(v: number) => [`Rs.${v}M`]}
                        labelStyle={{ color: "#e2e8f0", fontWeight: 600 }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "10px", fontSize: 12, color: CHART_TICK }} />
                      <Bar dataKey="Budget" fill="rgba(99,102,241,0.75)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Spent" fill="rgba(239,68,68,0.7)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Risk Register tab ──────────────────────────────────────── */}
          <TabsContent value="risks" className="mt-4">
            {loadingRisks ? <Skeleton className="h-64 w-full" /> : (
              <div className="space-y-3">
                {risks.map(r => (
                  <motion.div key={r.id} whileHover={{ x: 4 }}>
                    <Card className="glass-card grain-overlay">
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{r.risk_description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{r.mitigation}</p>
                            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                              <p className="text-[10px] text-muted-foreground">
                                Owner: <span className="text-foreground">{r.owner_label ?? "Unassigned"}</span>
                              </p>
                              {r.updated_at && (
                                <p className="text-[10px] text-muted-foreground opacity-60">
                                  Updated: {new Date(r.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </p>
                              )}
                              {r.created_at && (
                                <p className="text-[10px] text-muted-foreground opacity-50">
                                  Created: {new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge variant="outline" className={`text-[10px] ${riskBadge[r.impact ?? "low"]}`}>{r.impact} impact</Badge>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">{r.probability} prob.</Badge>
                            {canEdit && editingRisk?.id === r.id ? (
                              <div className="flex items-center gap-1 mt-1">
                                <Select value={editingRisk.status} onValueChange={v => setEditingRisk(er => er ? { ...er, status: v } : er)}>
                                  <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">open</SelectItem>
                                    <SelectItem value="mitigated">mitigated</SelectItem>
                                    <SelectItem value="closed">closed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button size="sm" className="h-7 text-xs premium-button" onClick={() => handleSaveRisk(r.id)} disabled={updateRisk.isPending}>Save</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingRisk(null)}>✕</Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className={`text-[10px] capitalize ${r.status === "open" ? "text-red-400 border-red-500/30" : r.status === "mitigated" ? "text-yellow-400 border-yellow-500/30" : "text-emerald-400 border-emerald-500/30"}`}>
                                  {r.status}
                                </Badge>
                                {canEdit && (
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => setEditingRisk({ id: r.id, status: r.status })}>
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {canEdit && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    To <strong>add or delete risks</strong>, go to <strong>Admin → Planning</strong> tab.
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Roadmap;
