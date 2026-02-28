import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Activity } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useSustainabilityScore, useSdgScores, useKpiRiskIndicators } from "@/hooks/useKPIs";

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  "on-track": { color: "text-[hsl(var(--chart-2))]", icon: CheckCircle2 },
  "at-risk": { color: "text-[hsl(var(--chart-4))]", icon: AlertTriangle },
  "critical": { color: "text-destructive", icon: XCircle },
};

const KPIs = () => {
  const { campusId } = useCampusContext();
  const { data: sustainabilityScore, isLoading: loadingScore } = useSustainabilityScore(campusId);
  const { data: sdgScores = [], isLoading: loadingSdg } = useSdgScores(campusId);
  const { data: kpiRiskIndicators = [], isLoading: loadingRisk } = useKpiRiskIndicators(campusId);

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

  return (
    <DashboardLayout title="Sustainability KPIs" breadcrumb="KPIs Health Score">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><Target className="w-3 h-3" /> KPIs</Badge>
          <span>Last Updated: Today</span>
          <Badge variant="outline" className="gap-1 ml-auto">Confidence: 93%</Badge>
        </div>
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
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
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
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />KPI Risk Indicators</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {loadingRisk ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />) : kpiRiskIndicators.map(k => {
                const config = statusConfig[k.status] ?? statusConfig["on-track"];
                const Icon = config.icon;
                const current = k.current_value ?? 0;
                const target = k.target_value ?? 1;
                return (
                  <motion.div key={k.id} whileHover={{ x: 4 }} className="border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className="text-xs font-medium text-foreground flex-1">{k.kpi_name}</span>
                      <Badge variant="outline" className={`text-[10px] h-4 capitalize ${config.color}`}>{k.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Current: <span className="font-medium text-foreground">{current}{k.unit}</span></span>
                      <span>Target: <span className="font-medium text-foreground">{target}{k.unit}</span></span>
                      <span className="ml-auto">Deadline: {k.deadline_label ?? k.deadline_date ?? "N/A"}</span>
                    </div>
                    <Progress value={target > 0 ? (current / target) * 100 : 0} className="h-1 mt-2" />
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </div>
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Leading vs Lagging Indicators</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Leading (Predictive)</p>
                <div className="space-y-2">
                  {["Solar Capacity Growth", "Smart Meter Coverage", "Green Procurement %", "Employee Engagement Score"].map(name => (
                    <div key={name} className="flex items-center gap-2 text-xs"><TrendingUp className="w-3 h-3 text-primary" /><span className="text-foreground">{name}</span></div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Lagging (Outcome)</p>
                <div className="space-y-2">
                  {["Carbon Emissions (tCO2e)", "Energy Cost (per kWh)", "Waste to Landfill (%)", "Water Consumption (ML)"].map(name => (
                    <div key={name} className="flex items-center gap-2 text-xs"><Activity className="w-3 h-3 text-muted-foreground" /><span className="text-foreground">{name}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KPIs;