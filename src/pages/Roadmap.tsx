import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Map, CheckCircle2, Clock, AlertTriangle, Flag, Shield } from "lucide-react";
import { roadmapPhases, riskRegister } from "@/lib/module-data";

const riskColors: Record<string, string> = { low: "text-[hsl(var(--chart-2))]", medium: "text-[hsl(var(--chart-4))]", high: "text-destructive", critical: "text-destructive" };
const impactColors: Record<string, string> = { low: "text-muted-foreground", medium: "text-[hsl(var(--chart-4))]", high: "text-destructive", critical: "text-destructive" };

const Roadmap = () => {
  const budgetData = roadmapPhases.map(p => ({
    name: p.name,
    budget: p.budget / 1000000,
    spent: p.spent / 1000000,
  }));

  return (
    <DashboardLayout title="Net-Zero Roadmap" breadcrumb="Planning · Roadmap">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><Map className="w-3 h-3" /> Roadmap</Badge>
          <span>Target: Net-Zero by 2035</span>
          <Badge variant="outline" className="gap-1 ml-auto">Confidence: 88%</Badge>
        </div>

        {/* Timeline Gantt */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Interactive Roadmap Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roadmapPhases.map((phase, pi) => (
                <motion.div key={phase.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: pi * 0.1 }}>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-32">
                      <p className="text-sm font-semibold text-foreground">{phase.name}</p>
                      <p className="text-[10px] text-muted-foreground">{phase.start} → {phase.end}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Progress value={phase.progress} className="flex-1 h-3" />
                        <span className="text-xs font-medium text-foreground w-10 text-right">{phase.progress}%</span>
                        <Badge variant="outline" className={`text-[10px] h-4 ${riskColors[phase.risk]}`}>
                          {phase.risk} risk
                        </Badge>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {phase.milestones.map(m => (
                          <div key={m.name} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${m.done ? "border-primary/40 bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                            {m.done ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {m.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Budget Burn */}
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Budget vs Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `₹${v}M`} />
                  <Bar dataKey="budget" fill="hsl(var(--chart-5) / 0.4)" name="Budget (₹M)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" fill="hsl(var(--chart-1))" name="Spent (₹M)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Strategic Impact */}
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Flag className="w-4 h-4 text-primary" />Strategic Impact Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {roadmapPhases.map(p => {
                const impactScore = Math.round(p.progress * 0.4 + (1 - p.spent / p.budget) * 30 + (p.risk === "low" ? 30 : p.risk === "medium" ? 20 : 10));
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs text-foreground w-28">{p.name}</span>
                    <Progress value={impactScore} className="flex-1 h-2" />
                    <span className="text-xs font-bold text-foreground w-8 text-right">{impactScore}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Risk Register */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Risk Register</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 pr-4">Risk</th>
                    <th className="text-left py-2 px-2">Impact</th>
                    <th className="text-left py-2 px-2">Probability</th>
                    <th className="text-left py-2 px-2">Owner</th>
                    <th className="text-left py-2 px-2">Mitigation</th>
                  </tr>
                </thead>
                <tbody>
                  {riskRegister.map(r => (
                    <tr key={r.id} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-foreground font-medium">{r.risk}</td>
                      <td className={`py-2 px-2 capitalize font-medium ${impactColors[r.impact]}`}>{r.impact}</td>
                      <td className="py-2 px-2 capitalize text-muted-foreground">{r.probability}</td>
                      <td className="py-2 px-2 text-muted-foreground">{r.owner}</td>
                      <td className="py-2 px-2 text-muted-foreground">{r.mitigation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Roadmap;
