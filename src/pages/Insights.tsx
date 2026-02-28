import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Brain, TrendingUp, Shield, CheckCircle2, Clock, Lightbulb, BarChart3, Zap } from "lucide-react";
import { aiRecommendations, modelPerformance, aiTrustScore } from "@/lib/module-data";

const sortOptions = ["ROI", "Carbon Impact", "Ease"] as const;

const Insights = () => {
  const [sortBy, setSortBy] = useState<typeof sortOptions[number]>("ROI");

  const sorted = [...aiRecommendations].sort((a, b) => {
    if (sortBy === "ROI") return b.roi - a.roi;
    if (sortBy === "Carbon Impact") return b.carbonImpact - a.carbonImpact;
    return b.ease - a.ease;
  });

  const adopted = aiRecommendations.filter(r => r.status === "implemented").length;
  const adoptionRate = Math.round((adopted / aiRecommendations.length) * 100);

  return (
    <DashboardLayout title="AI Insights" breadcrumb="AI · Recommendations">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><Brain className="w-3 h-3" /> AI Engine</Badge>
          <span>Model v3.2.1</span>
          <Badge variant="outline" className="gap-1 ml-auto">Trust Score: {aiTrustScore.overall}%</Badge>
        </div>

        {/* Trust + Adoption Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {aiTrustScore.components.map(c => (
            <motion.div key={c.name} whileHover={{ y: -2 }}>
              <Card className="glass-card grain-overlay">
                <CardContent className="pt-4 pb-3 text-center">
                  <p className="text-xl font-bold text-foreground">{c.score}%</p>
                  <p className="text-xs text-muted-foreground">{c.name}</p>
                  <Progress value={c.score} className="h-1 mt-2" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-4">
          {/* Recommendations */}
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" />Recommendation Engine</CardTitle>
                <div className="flex gap-1">
                  {sortOptions.map(o => (
                    <Button key={o} size="sm" variant={sortBy === o ? "default" : "outline"} className="rounded-full text-[10px] h-6 px-2"
                      onClick={() => setSortBy(o)}>{o}</Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sorted.map(r => {
                const statusIcon = r.status === "implemented" ? CheckCircle2 : r.status === "in-review" ? Clock : Lightbulb;
                const StatusIcon = statusIcon;
                return (
                  <motion.div key={r.id} whileHover={{ x: 4 }} className="border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusIcon className={`w-4 h-4 ${r.status === "implemented" ? "text-[hsl(var(--chart-2))]" : "text-primary"}`} />
                      <span className="text-xs font-medium text-foreground flex-1">{r.title}</span>
                      <Badge variant="outline" className="text-[10px] h-4">{r.category}</Badge>
                      <Badge variant="outline" className="text-[10px] h-4 capitalize">{r.status}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div><p className="text-sm font-bold text-foreground">{r.roi}%</p><p className="text-[10px] text-muted-foreground">ROI</p></div>
                      <div><p className="text-sm font-bold text-foreground">-{r.carbonImpact}</p><p className="text-[10px] text-muted-foreground">tCO₂e</p></div>
                      <div><p className="text-sm font-bold text-foreground">{r.ease}%</p><p className="text-[10px] text-muted-foreground">Ease</p></div>
                      <div><p className="text-sm font-bold text-foreground">{r.confidence}%</p><p className="text-[10px] text-muted-foreground">Confidence</p></div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Model Performance + Adoption */}
          <div className="space-y-4">
            <Card className="glass-card grain-overlay">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">AI Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={modelPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line dataKey="accuracy" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Model Accuracy %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card grain-overlay">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Adoption Rate</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-20 h-20 mx-auto">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--chart-2))" strokeWidth="8" strokeDasharray={`${adoptionRate * 2.51} 251`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">{adoptionRate}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{adopted} of {aiRecommendations.length} recommendations adopted</p>
              </CardContent>
            </Card>

            {/* Impact Quadrant Summary */}
            <Card className="glass-card grain-overlay">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Impact vs Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <p className="font-bold text-foreground">Quick Wins</p>
                    <p className="text-muted-foreground">High Impact · Easy</p>
                    <p className="text-lg font-bold text-primary mt-1">{aiRecommendations.filter(r => r.roi > 20 && r.ease > 70).length}</p>
                  </div>
                  <div className="bg-accent/30 rounded-lg p-3">
                    <p className="font-bold text-foreground">Strategic</p>
                    <p className="text-muted-foreground">High Impact · Hard</p>
                    <p className="text-lg font-bold text-foreground mt-1">{aiRecommendations.filter(r => r.roi > 20 && r.ease <= 70).length}</p>
                  </div>
                  <div className="bg-accent/30 rounded-lg p-3">
                    <p className="font-bold text-foreground">Easy Fixes</p>
                    <p className="text-muted-foreground">Low Impact · Easy</p>
                    <p className="text-lg font-bold text-foreground mt-1">{aiRecommendations.filter(r => r.roi <= 20 && r.ease > 70).length}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="font-bold text-foreground">Deprioritize</p>
                    <p className="text-muted-foreground">Low Impact · Hard</p>
                    <p className="text-lg font-bold text-foreground mt-1">{aiRecommendations.filter(r => r.roi <= 20 && r.ease <= 70).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Insights;
