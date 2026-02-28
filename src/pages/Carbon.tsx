import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Leaf, Target, Clock, TrendingDown, AlertTriangle, Globe, Factory, Car, ShoppingBag, Trash2, Plane, Zap } from "lucide-react";
import { carbonScopes, carbonTrend, carbonScenarios, netZeroCountdown } from "@/lib/module-data";

const SCOPE_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-4))"];

const scopePieData = [
  { name: "Scope 1", value: carbonScopes.scope1.total },
  { name: "Scope 2", value: carbonScopes.scope2.total },
  { name: "Scope 3", value: carbonScopes.scope3.total },
];

const Carbon = () => {
  const yearsLeft = netZeroCountdown.targetYear - 2025;
  const reductionPercent = Math.round((1 - netZeroCountdown.currentEmissions / netZeroCountdown.baselineEmissions) * 100);

  return (
    <DashboardLayout title="Carbon Tracking" breadcrumb="Carbon · Intelligence">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><Leaf className="w-3 h-3" /> Scope 1-3</Badge>
          <span>AI Model v2.8</span>
          <span>Last Updated: 5 min ago</span>
          <Badge variant="outline" className="gap-1 ml-auto">Confidence: 91%</Badge>
        </div>

        {/* Net-Zero Countdown */}
        <Card className="glass-card grain-overlay border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Net-Zero Countdown</p>
                <p className="text-4xl font-bold text-foreground mt-1">{yearsLeft} years</p>
                <p className="text-sm text-muted-foreground">Target: {netZeroCountdown.targetYear}</p>
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Baseline: {netZeroCountdown.baselineEmissions.toLocaleString()} tCO₂e</span>
                  <span>Current: {netZeroCountdown.currentEmissions.toLocaleString()} tCO₂e</span>
                </div>
                <Progress value={reductionPercent} className="h-3" />
                <p className="text-xs text-primary font-medium mt-1">{reductionPercent}% reduction achieved • {netZeroCountdown.reductionRate}% annual rate</p>
              </div>
              <div className="flex gap-2">
                {netZeroCountdown.milestones.slice(0, 3).map(m => (
                  <div key={m.year} className={`text-center px-3 py-2 rounded-lg border text-xs ${m.status === "achieved" ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                    <p className="font-bold text-foreground">{m.year}</p>
                    <p className="text-muted-foreground">{m.target.toLocaleString()}</p>
                    {m.status === "achieved" && <Badge className="mt-1 text-[9px] h-4">✓</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scope Breakdown + Trend */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Emissions by Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={scopePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                    {scopePieData.map((_, i) => <Cell key={i} fill={SCOPE_COLORS[i]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {[
                  { scope: "Scope 1", data: carbonScopes.scope1, icon: Factory },
                  { scope: "Scope 2", data: carbonScopes.scope2, icon: Leaf },
                  { scope: "Scope 3", data: carbonScopes.scope3, icon: Globe },
                ].map(({ scope, data, icon: Icon }, i) => (
                  <div key={scope} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SCOPE_COLORS[i] }} />
                    <Icon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground font-medium flex-1">{scope}</span>
                    <span className="text-foreground">{data.total.toLocaleString()} tCO₂e</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Emission Trend & Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={carbonTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Area dataKey="actual" fill="hsl(var(--chart-1) / 0.15)" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Actual" />
                  <Line dataKey="target" stroke="hsl(var(--chart-4))" strokeDasharray="5 3" strokeWidth={1.5} dot={false} name="Target" />
                  <Line dataKey="forecast" stroke="hsl(var(--chart-3))" strokeDasharray="3 3" strokeWidth={2} dot={false} name="AI Forecast" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Source Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Scope 1 — Direct", sources: carbonScopes.scope1.sources, icons: [Factory, Zap, Car] },
            { title: "Scope 2 — Energy", sources: carbonScopes.scope2.sources, icons: [Leaf, Factory, Factory] },
            { title: "Scope 3 — Indirect", sources: carbonScopes.scope3.sources, icons: [Car, ShoppingBag, Trash2, Plane] },
          ].map(({ title, sources, icons }) => (
            <Card key={title} className="glass-card grain-overlay">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sources.map((s, i) => {
                  const Icon = icons[i] || Globe;
                  return (
                    <div key={s.name} className="flex items-center gap-2 text-xs">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="flex-1 text-foreground">{s.name}</span>
                      <span className="font-medium text-foreground">{s.value}</span>
                      <Badge variant="outline" className="text-[10px] h-4 text-primary">{s.trend}%</Badge>
                    </div>
                  );
                })}
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
            <div className="space-y-3">
              {carbonScenarios.map((s) => (
                <motion.div key={s.name} whileHover={{ x: 4 }} className="border border-border rounded-lg p-3 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.timeline} · ₹{(s.cost / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">-{s.impact}</p>
                    <p className="text-[10px] text-muted-foreground">tCO₂e/yr</p>
                  </div>
                  <Progress value={s.feasibility} className="w-20 h-1.5" />
                  <span className="text-xs text-muted-foreground w-10 text-right">{s.feasibility}%</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-accent/30 rounded-lg p-4 mt-4 text-center">
              <p className="text-xs text-muted-foreground">If all scenarios implemented</p>
              <p className="text-2xl font-bold text-primary">-{carbonScenarios.reduce((a, s) => a + s.impact, 0).toLocaleString()} tCO₂e/yr</p>
              <p className="text-xs text-muted-foreground">Could accelerate Net-Zero by ~3.2 years</p>
            </div>
          </CardContent>
        </Card>

        {/* Carbon Liability */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" />Carbon Liability Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { price: "₹500/tCO₂", cost: Math.round(netZeroCountdown.currentEmissions * 500) },
                { price: "₹2,000/tCO₂", cost: Math.round(netZeroCountdown.currentEmissions * 2000) },
                { price: "₹5,000/tCO₂", cost: Math.round(netZeroCountdown.currentEmissions * 5000) },
              ].map(item => (
                <div key={item.price} className="bg-accent/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">If carbon price = {item.price}</p>
                  <p className="text-xl font-bold text-foreground mt-1">₹{(item.cost / 10000000).toFixed(1)} Cr</p>
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
