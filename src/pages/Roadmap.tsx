import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Map, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useCampusContext } from "@/context/CampusContext";
import { useRoadmapPhases, useRiskRegister } from "@/hooks/useRoadmap";

const riskBadge: Record<string, string> = {
  low: "text-emerald-400 border-emerald-500/30",
  medium: "text-yellow-400 border-yellow-500/30",
  high: "text-orange-400 border-orange-500/30",
  critical: "text-red-400 border-red-500/30",
};

const Roadmap = () => {
  const { campusId } = useCampusContext();
  const { data: phases = [], isLoading: loadingPhases } = useRoadmapPhases(campusId);
  const { data: risks = [], isLoading: loadingRisks } = useRiskRegister(campusId);

  const budgetData = phases.map(p => ({
    name: p.name,
    Budget: parseFloat(((p.budget_inr ?? 0) / 1_000_000).toFixed(2)),
    Spent: parseFloat(((p.spent_inr ?? 0) / 1_000_000).toFixed(2)),
  }));

  const openRisks = risks.filter(r => r.status === "open").length;
  const mitigatedRisks = risks.filter(r => r.status === "mitigated").length;

  return (
    <DashboardLayout title="Roadmap" breadcrumb="Sustainability Roadmap">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><Map className="w-3 h-3" /> Roadmap</Badge>
          <span>{phases.length} Phases</span>
          <Badge variant="outline" className="gap-1 text-red-400 border-red-500/30">
            <AlertTriangle className="w-3 h-3" />{openRisks} Open Risks
          </Badge>
          <Badge variant="outline" className="gap-1 text-emerald-400 border-emerald-500/30 ml-auto">
            <CheckCircle2 className="w-3 h-3" />{mitigatedRisks} Mitigated
          </Badge>
        </div>

        <Tabs defaultValue="phases">
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="phases" className="gap-1.5"><Map className="w-3.5 h-3.5" />Phases</TabsTrigger>
            <TabsTrigger value="budget" className="gap-1.5">Budget vs Spent</TabsTrigger>
            <TabsTrigger value="risks" className="gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />Risk Register</TabsTrigger>
          </TabsList>

          <TabsContent value="phases" className="space-y-4 mt-4">
            {loadingPhases ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              phases.map((p, idx) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="glass-card grain-overlay">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Phase {p.phase_number}: {p.name}</CardTitle>
                        <Badge variant="outline" className={`text-[10px] ${riskBadge[p.risk_level ?? "low"]}`}>
                          {p.risk_level ?? "low"} risk
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">{p.start_date} — {p.end_date}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span><span>{p.progress_pct ?? 0}%</span>
                        </div>
                        <Progress value={p.progress_pct ?? 0} className="h-2" />
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Budget: Rs.{((p.budget_inr ?? 0) / 1_000_000).toFixed(1)}M</span>
                        <span>Spent: Rs.{((p.spent_inr ?? 0) / 1_000_000).toFixed(1)}M</span>
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
          </TabsContent>

          <TabsContent value="budget" className="mt-4">
            {loadingPhases ? <Skeleton className="h-64 w-full" /> : (
              <Card className="glass-card grain-overlay">
                <CardHeader><CardTitle className="text-sm">Budget vs Spent (Rs. Millions)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={budgetData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
                      <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} formatter={(v: number) => [`Rs.${v}M`]} />
                      <Legend />
                      <Bar dataKey="Budget" fill="rgba(99,102,241,0.6)" radius={[4,4,0,0]} />
                      <Bar dataKey="Spent" fill="rgba(239,68,68,0.6)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="risks" className="mt-4">
            {loadingRisks ? <Skeleton className="h-64 w-full" /> : (
              <div className="space-y-3">
                {risks.map(r => (
                  <motion.div key={r.id} whileHover={{ x: 4 }}>
                    <Card className="glass-card grain-overlay">
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{r.risk_description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{r.mitigation}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Owner: {r.owner_label ?? "Unassigned"}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge variant="outline" className={`text-[10px] ${riskBadge[r.impact ?? "low"]}`}>{r.impact} impact</Badge>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">{r.probability} prob.</Badge>
                            <Badge variant="outline" className={`text-[10px] capitalize ${r.status === "open" ? "text-red-400 border-red-500/30" : r.status === "mitigated" ? "text-yellow-400 border-yellow-500/30" : "text-emerald-400 border-emerald-500/30"}`}>{r.status}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Roadmap;
