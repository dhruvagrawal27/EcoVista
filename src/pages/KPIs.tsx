import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Activity } from "lucide-react";
import { sustainabilityScore, sdgAlignment, kpiRiskIndicators } from "@/lib/module-data";

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  "on-track": { color: "text-[hsl(var(--chart-2))]", icon: CheckCircle2 },
  "at-risk": { color: "text-[hsl(var(--chart-4))]", icon: AlertTriangle },
  "critical": { color: "text-destructive", icon: XCircle },
};

const KPIs = () => (
  <DashboardLayout title="Sustainability KPIs" breadcrumb="KPIs · Health Score">
    <div className="max-w-[1400px] mx-auto space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Badge variant="outline" className="gap-1"><Target className="w-3 h-3" /> KPIs</Badge>
        <span>Last Updated: Today</span>
        <Badge variant="outline" className="gap-1 ml-auto">Confidence: 93%</Badge>
      </div>

      {/* Health Score */}
      <Card className="glass-card grain-overlay border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--chart-1))" strokeWidth="6" strokeDasharray={`${sustainabilityScore.overall * 2.64} 264`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground">{sustainabilityScore.overall}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Sustainability Health Score</p>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
              {sustainabilityScore.categories.map(c => (
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SDG Radar */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">SDG Alignment Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={sdgAlignment.map(s => ({ subject: `SDG ${s.sdg}`, score: s.score }))}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1) / 0.2)" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {sdgAlignment.map(s => (
                <div key={s.sdg} className="flex items-center gap-2 text-xs">
                  <span className="w-12 font-mono text-muted-foreground">SDG {s.sdg}</span>
                  <span className="flex-1 text-foreground">{s.name}</span>
                  <span className="font-medium text-foreground">{s.score}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Indicators */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />KPI Risk Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {kpiRiskIndicators.map(k => {
              const config = statusConfig[k.status];
              const Icon = config.icon;
              return (
                <motion.div key={k.kpi} whileHover={{ x: 4 }} className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-xs font-medium text-foreground flex-1">{k.kpi}</span>
                    <Badge variant="outline" className={`text-[10px] h-4 capitalize ${config.color}`}>{k.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Current: <span className="font-medium text-foreground">{k.current}</span></span>
                    <span>Target: <span className="font-medium text-foreground">{k.target}</span></span>
                    <span className="ml-auto">Deadline: {k.deadline}</span>
                  </div>
                  <Progress value={(k.current / k.target) * 100} className="h-1 mt-2" />
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* KPI Correlation */}
      <Card className="glass-card grain-overlay">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Leading vs Lagging Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Leading (Predictive)</p>
              <div className="space-y-2">
                {["Solar Capacity Growth", "Smart Meter Coverage", "Green Procurement %", "Employee Engagement Score"].map(name => (
                  <div key={name} className="flex items-center gap-2 text-xs">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-foreground">{name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Lagging (Outcome)</p>
              <div className="space-y-2">
                {["Carbon Emissions (tCO₂e)", "Energy Cost (₹/kWh)", "Waste to Landfill (%)", "Water Consumption (ML)"].map(name => (
                  <div key={name} className="flex items-center gap-2 text-xs">
                    <Activity className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default KPIs;
