import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Sun, Wind, Battery, Zap, Gauge } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useSolarArrays, useRenewableMonthlyGeneration, useLatestGridState } from "@/hooks/useRenewables";
import { useEnergyForecasts } from "@/hooks/useEnergy";

const Renewables = () => {
  const { campusId } = useCampusContext();
  const { data: arrays = [], isLoading: loadingArrays } = useSolarArrays(campusId);
  const { data: monthly = [], isLoading: loadingMonthly } = useRenewableMonthlyGeneration(campusId, 12);
  const { data: grid, isLoading: loadingGrid } = useLatestGridState(campusId);
  const { data: forecasts = [], isLoading: loadingForecasts } = useEnergyForecasts(campusId, 24);

  const solarKw = grid?.solar_current_kw ?? 0;
  const solarCap = grid?.solar_capacity_kw ?? 1;
  const windKw = grid?.wind_current_kw ?? 0;
  const batteryPct = grid?.battery_charge_pct ?? 0;
  const totalDemand = grid?.total_demand_kw ?? 1;
  const renewableShare = totalDemand > 0 ? Math.round(((solarKw + windKw) / totalDemand) * 100) : 0;

  const solarHourly = forecasts.map(f => ({
    hour: new Date(f.forecast_at).getHours() + "h",
    generation: f.predicted_kw ?? 0,
    consumption: (f.actual_kw ?? f.predicted_kw ?? 0) * 1.4,
  }));

  const monthlyData = monthly.map(m => ({
    month: new Date(m.gen_month + "-01").toLocaleString("default", { month: "short" }),
    solar: m.solar_kwh ?? 0,
    wind: m.wind_kwh ?? 0,
  }));

  const latestMonthly = monthly[monthly.length - 1];
  const gridOffsetPct = latestMonthly?.grid_offset_pct ?? renewableShare;

  const energyMix = [
    { name: "Solar", value: Math.round(solarKw), color: "hsl(var(--chart-4))" },
    { name: "Wind", value: Math.round(windKw), color: "hsl(var(--chart-5))" },
    { name: "Grid", value: Math.max(0, Math.round((grid?.grid_import_kw ?? 0))), color: "hsl(var(--chart-1))" },
  ].filter(e => e.value > 0);

  return (
    <DashboardLayout title="Renewable Energy" breadcrumb="Renewables · Solar & Wind">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><Sun className="w-3 h-3" /> Renewables</Badge>
          <span>Live Grid Data</span>
          <Badge variant="outline" className="gap-1 ml-auto">{renewableShare}% Renewable Share</Badge>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loadingGrid ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />) : [
            { label: "Solar Now", value: `${solarKw.toFixed(1)} kW`, icon: Sun, color: "chart-4" },
            { label: "Wind Now", value: `${windKw.toFixed(1)} kW`, icon: Wind, color: "chart-5" },
            { label: "Battery SOC", value: `${batteryPct.toFixed(0)}%`, icon: Battery, color: "chart-2" },
            { label: "Grid Offset", value: `${renewableShare}%`, icon: Zap, color: "chart-1" },
          ].map(item => (
            <motion.div key={item.label} whileHover={{ y: -2 }}>
              <Card className="glass-card grain-overlay">
                <CardContent className="pt-4 pb-3 text-center">
                  <item.icon className={`w-5 h-5 mx-auto mb-1 text-[hsl(var(--${item.color}))]`} />
                  <p className="text-xl font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Solar Generation vs Consumption Forecast */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Solar Generation Forecast vs Consumption — Next 24h</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingForecasts ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={solarHourly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Area dataKey="generation" fill="hsl(var(--chart-4) / 0.2)" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Generation (kW)" />
                  <Area dataKey="consumption" fill="hsl(var(--chart-1) / 0.1)" stroke="hsl(var(--chart-1))" strokeWidth={1.5} strokeDasharray="5 3" name="Consumption (kW)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Energy Mix */}
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Live Energy Mix</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingGrid ? <Skeleton className="h-48 w-full" /> : energyMix.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={energyMix} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                        {energyMix.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-1">
                    {energyMix.map(e => (
                      <div key={e.name} className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                        <span className="text-muted-foreground">{e.name}: {e.value} kW</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p className="text-xs text-muted-foreground text-center py-8">No live data</p>}
            </CardContent>
          </Card>

          {/* Monthly Generation */}
          <Card className="glass-card grain-overlay md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Monthly Renewable Generation (kWh)</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMonthly ? <Skeleton className="h-48 w-full" /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend />
                    <Bar dataKey="solar" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name="Solar" />
                    <Bar dataKey="wind" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} name="Wind" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Solar Array Health */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" />Solar Array Health Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingArrays ? <Skeleton className="h-40 w-full" /> : arrays.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No solar arrays found</p>
            ) : (
              <div className="space-y-3">
                {arrays.map(a => {
                  const eff = a.latest_reading?.efficiency_pct ?? 0;
                  return (
                    <div key={a.id} className="flex items-center gap-4 border border-border rounded-lg p-3">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">{a.name}</p>
                        <p className="text-[10px] text-muted-foreground">{a.panel_count ?? "?"} panels · {a.capacity_kw ?? "?"}kW capacity</p>
                      </div>
                      <div className="w-32">
                        <Progress value={eff} className="h-2" />
                      </div>
                      <span className="text-xs font-bold text-foreground w-10 text-right">{eff.toFixed(0)}%</span>
                      <Badge variant="outline" className={`text-[10px] h-4 ${a.status === "optimal" ? "text-emerald-400 border-emerald-500/30" : "text-red-400 border-red-500/30"}`}>
                        {a.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Renewables;
