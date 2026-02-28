import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Leaf, Target, TrendingDown, AlertTriangle, Globe, Factory, Car, ShoppingBag, Trash2, Plane, Zap } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useCarbonScopes, useCarbonTrend, useCarbonScenarios, useNetZeroCountdown } from "@/hooks/useCarbon";
import { Skeleton } from "@/components/ui/skeleton";

const SCOPE_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-4))"];
const SCOPE_ICONS = [Factory, Leaf, Globe];
const SOURCE_ICONS = [Factory, Zap, Car, ShoppingBag, Trash2, Plane];

const Carbon = () => {
  const { campusId } = useCampusContext();
  const { data: countdown, isLoading: countdownLoading } = useNetZeroCountdown(campusId);
  const { data: scopeReadings, isLoading: scopesLoading } = useCarbonScopes(campusId);
  const { data: trend, isLoading: trendLoading } = useCarbonTrend(campusId, 12);
  const { data: scenarios, isLoading: scenariosLoading } = useCarbonScenarios(campusId);

  const campus = countdown?.campus;
  const milestones = countdown?.milestones ?? [];
  const yearsLeft = (campus?.target_year ?? 2050) - new Date().getFullYear();
  const baseline = campus?.baseline_emissions ?? 0;
  const current = campus?.current_emissions ?? 0;
  const reductionPercent = baseline > 0 ? Math.round((1 - current / baseline) * 100) : 0;

  // Group scope readings by scope number (latest month)
  const latestMonth = (scopeReadings ?? [])[0]?.recorded_month;
  const latestScopeReadings = (scopeReadings ?? []).filter(
    (r) => r.recorded_month === latestMonth
  );
  const scopeTotals = [1, 2, 3].map((scope) => {
    const rows = latestScopeReadings.filter((r) => r.scope === scope);
    const total = rows.reduce((a, r) => a + r.value_tco2e, 0);
    return { scope, total, sources: rows };
  });

  const scopePieData = scopeTotals.map((s) => ({
    name: `Scope ${s.scope}`,
    value: Math.round(s.total),
  }));

  const trendChartData = (trend ?? []).map((t) => ({
    month: new Date(t.trend_month).toLocaleDateString("en-IN", { month: "short" }),
    actual: t.actual_tco2e ?? 0,
    target: t.target_tco2e ?? 0,
    forecast: t.forecast_tco2e ?? 0,
  }));

  const totalScenarioImpact = (scenarios ?? []).reduce(
    (a, s) => a + (s.impact_tco2e_yr ?? 0),
    0
  );

  return (
    <DashboardLayout title="Carbon Tracking" breadcrumb="Carbon · Intelligence">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><Leaf className="w-3 h-3" /> Scope 1-3</Badge>
          <span>AI Model v2.8</span>
          <span>Last Updated: live</span>
          <Badge variant="outline" className="gap-1 ml-auto">Confidence: 91%</Badge>
        </div>

        {/* Net-Zero Countdown */}
        <Card className="glass-card grain-overlay border-primary/20">
          <CardContent className="pt-6">
            {countdownLoading ? (
              <Skeleton className="h-24 w-full rounded-xl" />
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-center md:text-left">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Net-Zero Countdown</p>
                  <p className="text-4xl font-bold text-foreground mt-1">{yearsLeft} years</p>
                  <p className="text-sm text-muted-foreground">Target: {campus?.target_year ?? "—"}</p>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Baseline: {baseline.toLocaleString()} tCO₂e</span>
                    <span>Current: {current.toLocaleString()} tCO₂e</span>
                  </div>
                  <Progress value={reductionPercent} className="h-3" />
                  <p className="text-xs text-primary font-medium mt-1">
                    {reductionPercent}% reduction achieved • {campus?.reduction_rate ?? 0}% annual rate
                  </p>
                </div>
                <div className="flex gap-2">
                  {milestones.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className={`text-center px-3 py-2 rounded-lg border text-xs ${
                        m.status === "achieved" ? "border-primary/40 bg-primary/5" : "border-border"
                      }`}
                    >
                      <p className="font-bold text-foreground">{m.milestone_year}</p>
                      <p className="text-muted-foreground">{(m.target_tco2e ?? 0).toLocaleString()}</p>
                      {m.status === "achieved" && <Badge className="mt-1 text-[9px] h-4">✓</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scope Breakdown + Trend */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Emissions by Scope</CardTitle>
            </CardHeader>
            <CardContent>
              {scopesLoading ? (
                <Skeleton className="h-[220px] w-full rounded-xl" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={scopePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="hsl(var(--card))"
                      >
                        {scopePieData.map((_, i) => <Cell key={i} fill={SCOPE_COLORS[i]} />)}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {scopeTotals.map(({ scope, total }, i) => {
                      const Icon = SCOPE_ICONS[i];
                      return (
                        <div key={scope} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SCOPE_COLORS[i] }} />
                          <Icon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-foreground font-medium flex-1">Scope {scope}</span>
                          <span className="text-foreground">{total.toLocaleString()} tCO₂e</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Emission Trend & Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <Skeleton className="h-[280px] w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Area dataKey="actual" fill="hsl(var(--chart-1) / 0.15)" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Actual" />
                    <Line dataKey="target" stroke="hsl(var(--chart-4))" strokeDasharray="5 3" strokeWidth={1.5} dot={false} name="Target" />
                    <Line dataKey="forecast" stroke="hsl(var(--chart-3))" strokeDasharray="3 3" strokeWidth={2} dot={false} name="AI Forecast" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Source Details per scope */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scopeTotals.map(({ scope, sources }, si) => (
            <Card key={scope} className="glass-card grain-overlay">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Scope {scope} — Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {scopesLoading ? (
                  <Skeleton className="h-24 w-full rounded-xl" />
                ) : (
                  sources.map((s, i) => {
                    const Icon = SOURCE_ICONS[i % SOURCE_ICONS.length];
                    return (
                      <div key={s.id} className="flex items-center gap-2 text-xs">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="flex-1 text-foreground">{s.source_name}</span>
                        <span className="font-medium text-foreground">{s.value_tco2e.toFixed(0)}</span>
                        {s.trend_pct != null && (
                          <Badge variant="outline" className="text-[10px] h-4 text-primary">
                            {s.trend_pct > 0 ? "+" : ""}{s.trend_pct}%
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Scenario Planner */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Target className="w-4 h-4 text-primary" />Carbon Scenario Planner</CardTitle>
            <CardDescription className="text-xs">Model the impact of interventions on net-zero timeline</CardDescription>
          </CardHeader>
          <CardContent>
            {scenariosLoading ? (
              <Skeleton className="h-40 w-full rounded-xl" />
            ) : (
              <>
                <div className="space-y-3">
                  {(scenarios ?? []).map((s) => (
                    <motion.div key={s.id} whileHover={{ x: 4 }} className="border border-border rounded-lg p-3 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.timeline_months ? `${s.timeline_months} months` : "—"} · ₹{((s.cost_inr ?? 0) / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary">-{s.impact_tco2e_yr}</p>
                        <p className="text-[10px] text-muted-foreground">tCO₂e/yr</p>
                      </div>
                      <Progress value={s.feasibility_pct ?? 0} className="w-20 h-1.5" />
                      <span className="text-xs text-muted-foreground w-10 text-right">{s.feasibility_pct ?? 0}%</span>
                    </motion.div>
                  ))}
                </div>
                <div className="bg-accent/30 rounded-lg p-4 mt-4 text-center">
                  <p className="text-xs text-muted-foreground">If all scenarios implemented</p>
                  <p className="text-2xl font-bold text-primary">-{totalScenarioImpact.toLocaleString()} tCO₂e/yr</p>
                  <p className="text-xs text-muted-foreground">Could accelerate Net-Zero by ~3.2 years</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Carbon Liability */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />Carbon Liability Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { price: "₹500/tCO₂", rate: 500 },
                { price: "₹2,000/tCO₂", rate: 2000 },
                { price: "₹5,000/tCO₂", rate: 5000 },
              ].map((item) => (
                <div key={item.price} className="bg-accent/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">If carbon price = {item.price}</p>
                  <p className="text-xl font-bold text-foreground mt-1">
                    ₹{((current * item.rate) / 10000000).toFixed(1)} Cr
                  </p>
                  <p className="text-[10px] text-muted-foreground">Annual liability</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Carbon;
