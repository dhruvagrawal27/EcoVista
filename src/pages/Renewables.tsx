import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Sun, Wind, Battery, Zap, TrendingUp, CloudSun, Gauge } from "lucide-react";

const solarHourly = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  generation: Math.round(i >= 6 && i <= 18 ? Math.sin(((i - 6) / 12) * Math.PI) * 1200 + Math.random() * 100 : 0),
  consumption: Math.round(1800 + Math.sin((i - 8) / 4) * 600),
}));

const monthlyGeneration = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  solar: Math.round(14000 + Math.sin((i - 3) / 3) * 5000 + Math.random() * 1000),
  wind: Math.round(1200 + Math.cos(i / 2) * 600 + Math.random() * 200),
}));

const panelHealth = [
  { name: "Array A (Main)", panels: 480, efficiency: 94, status: "optimal" as const },
  { name: "Array B (Library)", panels: 320, efficiency: 91, status: "optimal" as const },
  { name: "Array C (Engineering)", panels: 280, efficiency: 72, status: "degraded" as const },
  { name: "Array D (Hostel)", panels: 200, efficiency: 88, status: "optimal" as const },
  { name: "Array E (Sports)", panels: 120, efficiency: 95, status: "optimal" as const },
];

const energyMix = [
  { name: "Solar", value: 38, color: "hsl(var(--chart-4))" },
  { name: "Wind", value: 5, color: "hsl(var(--chart-5))" },
  { name: "Grid", value: 57, color: "hsl(var(--chart-1))" },
];

const Renewables = () => (
  <DashboardLayout title="Renewable Energy" breadcrumb="Renewables · Solar & Wind">
    <div className="max-w-[1400px] mx-auto space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Badge variant="outline" className="gap-1"><Sun className="w-3 h-3" /> Renewables</Badge>
        <span>Last Updated: Just now</span>
        <Badge variant="outline" className="gap-1 ml-auto">43% Renewable Share</Badge>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Solar Today", value: "18.4 MWh", icon: Sun, trend: 8.2, color: "chart-4" },
          { label: "Wind Today", value: "1.2 MWh", icon: Wind, trend: -2.1, color: "chart-5" },
          { label: "Battery SOC", value: "72%", icon: Battery, trend: null, color: "chart-2" },
          { label: "Grid Offset", value: "43%", icon: Zap, trend: 5.4, color: "chart-1" },
        ].map(item => (
          <motion.div key={item.label} whileHover={{ y: -2 }}>
            <Card className="glass-card grain-overlay">
              <CardContent className="pt-4 pb-3 text-center">
                <item.icon className={`w-5 h-5 mx-auto mb-1 text-[hsl(var(--${item.color}))]`} />
                <p className="text-xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                {item.trend && <Badge variant="outline" className={`text-[10px] h-4 mt-1 ${item.trend > 0 ? "text-[hsl(var(--chart-2))]" : "text-destructive"}`}>{item.trend > 0 ? "+" : ""}{item.trend}%</Badge>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Solar Generation vs Consumption */}
      <Card className="glass-card grain-overlay">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Solar Generation vs Campus Consumption — Today</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={solarHourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area dataKey="generation" fill="hsl(var(--chart-4) / 0.2)" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Solar Generation (kW)" />
              <Area dataKey="consumption" fill="hsl(var(--chart-1) / 0.1)" stroke="hsl(var(--chart-1))" strokeWidth={1.5} strokeDasharray="5 3" name="Consumption (kW)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Energy Mix */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Energy Source Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={energyMix} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                  {energyMix.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-1">
              {energyMix.map(e => (
                <div key={e.name} className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                  <span className="text-muted-foreground">{e.name}: {e.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Generation */}
        <Card className="glass-card grain-overlay md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Renewable Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyGeneration}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="solar" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name="Solar (kWh)" />
                <Bar dataKey="wind" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} name="Wind (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Panel Health */}
      <Card className="glass-card grain-overlay">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Gauge className="w-4 h-4 text-primary" />Solar Array Health Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {panelHealth.map(p => (
              <div key={p.name} className="flex items-center gap-4 border border-border rounded-lg p-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.panels} panels</p>
                </div>
                <div className="w-32">
                  <Progress value={p.efficiency} className="h-2" />
                </div>
                <span className="text-xs font-bold text-foreground w-10 text-right">{p.efficiency}%</span>
                <Badge variant="outline" className={`text-[10px] h-4 ${p.status === "optimal" ? "text-[hsl(var(--chart-2))]" : "text-destructive"}`}>
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default Renewables;
