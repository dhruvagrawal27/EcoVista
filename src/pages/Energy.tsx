import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Shield, Zap, Activity, TrendingUp, Building2, Cpu, Sun, Battery, AlertTriangle, Gauge, Calendar, BarChart3, Brain, Thermometer, Info, Plus } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useAuth } from "@/context/AuthContext";
import type { RoleName } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useEnergyRiskScore,
  useEnergyCostHeatmap,
  useLoadProfiles,
  useBenchmarkData,
  useGridState,
  useEquipmentLoad,
  useEnergyForecasts,
  useForecastAccuracy,
  useBuildings,
  useRetrofitSuggestions,
  useActiveMLModel,
  useUpdateRetrofitStatus,
  useCreateRetrofitSuggestion,
} from "@/hooks/useEnergy";

const ROLE_INFO: Partial<Record<NonNullable<RoleName>, { color: string; msg: string }>> = {
  Admin: { color: "text-violet-400 border-violet-500/20", msg: "Full access — manage autonomous mode, approve/reject retrofit suggestions." },
  "Facility Manager": { color: "text-blue-400 border-blue-500/20", msg: "You can approve retrofits and toggle autonomous AI control." },
  Finance: { color: "text-emerald-400 border-emerald-500/20", msg: "View-only — review energy costs and forecast data across all tabs." },
  Faculty: { color: "text-yellow-400 border-yellow-500/20", msg: "View-only — energy overview and forecast tabs available." },
};

const RETROFIT_STATUSES = ["proposed", "approved", "in-progress", "completed", "rejected"] as const;
type RetrofitStatus = typeof RETROFIT_STATUSES[number];

const STATUS_NEXT: Record<RetrofitStatus, { next: RetrofitStatus; label: string; color: string }[]> = {
  proposed: [{ next: "approved", label: "Approve", color: "text-emerald-400" }, { next: "rejected", label: "Reject", color: "text-destructive" }],
  approved: [{ next: "in-progress", label: "Start", color: "text-blue-400" }, { next: "rejected", label: "Reject", color: "text-destructive" }],
  "in-progress": [{ next: "completed", label: "Complete", color: "text-emerald-400" }],
  completed: [],
  rejected: [{ next: "proposed", label: "Reopen", color: "text-primary" }],
};

const StatusDot = ({ status }: { status: string }) => {
  const colors: Record<string, string> = { high: "bg-destructive", medium: "bg-[hsl(var(--chart-4))]", normal: "bg-[hsl(var(--chart-2))]" };
  return <span className={`w-2 h-2 rounded-full ${colors[status] || colors.normal}`} />;
};

const Energy = () => {
  const { campusId } = useCampusContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const role = user?.role_name as RoleName | undefined;
  const canManage = role === "Admin" || role === "Facility Manager";

  const [whatIfTemp, setWhatIfTemp] = useState([25]);
  const [whatIfOccupancy, setWhatIfOccupancy] = useState([75]);
  const [whatIfSolar, setWhatIfSolar] = useState([85]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [addRetrofitOpen, setAddRetrofitOpen] = useState(false);
  const [newRetrofit, setNewRetrofit] = useState({ action: "", estimated_cost: 0, annual_saving: 0, payback_years: 0, carbon_reduction_tons: 0 });

  const { data: activeModel } = useActiveMLModel();
  const modelLabel = activeModel ? `${activeModel.name} v${activeModel.version}` : "AI Model v3.2.1";

  const { data: riskScore, isLoading: loadingRisk } = useEnergyRiskScore(campusId);
  const { data: heatmapData = [], isLoading: loadingHeatmap } = useEnergyCostHeatmap(campusId);
  const { data: loadProfiles, isLoading: loadingProfiles } = useLoadProfiles(campusId);
  const { data: benchmarkData = [], isLoading: loadingBenchmark } = useBenchmarkData(campusId);
  const { data: gridState, isLoading: loadingGrid } = useGridState(campusId);
  const { data: equipmentLoad = [], isLoading: loadingEquipment } = useEquipmentLoad(campusId);
  const { data: forecastData = [], isLoading: loadingForecast } = useEnergyForecasts(campusId, 72);
  const { data: forecastAccuracy = [], isLoading: loadingAccuracy } = useForecastAccuracy(campusId, 30);
  const { data: buildings = [], isLoading: loadingBuildings } = useBuildings(campusId);

  const selectedBuilding = buildings.find(b => b.id === Number(selectedBuildingId)) ?? buildings[0] ?? null;
  const { data: retrofitSuggestions = [], isLoading: loadingRetrofit } = useRetrofitSuggestions(campusId, selectedBuilding?.id);

  const updateRetrofit = useUpdateRetrofitStatus(campusId);
  const createRetrofit = useCreateRetrofitSuggestion(campusId);

  const handleRetrofitStatusChange = (id: number, status: RetrofitStatus) => {
    updateRetrofit.mutate({ id, status }, {
      onSuccess: () => toast({ title: `Retrofit ${status}` }),
      onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
    });
  };

  const handleAddRetrofit = () => {
    if (!selectedBuilding) return;
    createRetrofit.mutate(
      { ...newRetrofit, building_id: selectedBuilding.id, status: "proposed" },
      {
        onSuccess: () => { setAddRetrofitOpen(false); setNewRetrofit({ action: "", estimated_cost: 0, annual_saving: 0, payback_years: 0, carbon_reduction_tons: 0 }); toast({ title: "Retrofit suggestion added" }); },
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const tempMultiplier = 1 + (whatIfTemp[0] - 25) * 0.03;
  const occMultiplier = whatIfOccupancy[0] / 75;
  const solarMultiplier = whatIfSolar[0] / 85;

  const radarData = selectedBuilding ? [
    { subject: "HVAC", value: selectedBuilding.hvac_score ?? 0, fullMark: 100 },
    { subject: "Carbon", value: selectedBuilding.carbon_score ?? 0, fullMark: 100 },
    { subject: "Maintenance", value: selectedBuilding.maintenance_score ?? 0, fullMark: 100 },
    { subject: "Occupancy", value: selectedBuilding.occupancy_rate ?? 0, fullMark: 100 },
    { subject: "EUI", value: Math.min((selectedBuilding.eui ?? 0) / 3, 100), fullMark: 100 },
  ] : [];

  const forecastChartData = forecastData.map(f => ({
    hour: new Date(f.forecast_at).getHours() + "h",
    predicted: f.predicted_kw,
    upper: f.upper_bound_kw,
    lower: f.lower_bound_kw,
    actual: f.actual_kw ?? null,
  }));

  const accuracyChartData = forecastAccuracy.map(f => ({
    day: new Date(f.report_date).getDate(),
    accuracy: f.accuracy,
  }));

  const weekdayLoad = loadProfiles?.filter(p => p.day_type === "weekday").map(p => ({ hour: p.hour, load: p.load_kw })) ?? [];
  const weekendLoad = loadProfiles?.filter(p => p.day_type === "weekend").map(p => ({ hour: p.hour, load: p.load_kw })) ?? [];

  const solarKw = gridState?.solar_current_kw ?? 0;
  const solarCap = gridState?.solar_capacity_kw ?? 1;
  const batteryPct = gridState?.battery_charge_pct ?? 0;
  const gridImportKw = gridState?.grid_import_kw ?? 0;
  const totalDemandKw = solarKw + gridImportKw;
  const demandPredicted = gridState?.predicted_demand_kw ?? totalDemandKw;

  const ri = role ? (ROLE_INFO[role] ?? null) : null;

  // Faculty: only show overview + forecast tabs
  const allTabs = [
    { value: "overview", label: "Overview", icon: BarChart3, facultyAllowed: true },
    { value: "realtime", label: "Real-Time Grid", icon: Zap, facultyAllowed: false },
    { value: "forecast", label: "Forecast", icon: Brain, facultyAllowed: true },
    { value: "building", label: "Building Deep Dive", icon: Building2, facultyAllowed: false },
  ];
  const visibleTabs = role === "Faculty" ? allTabs.filter(t => t.facultyAllowed) : allTabs;

  return (
    <DashboardLayout title="Energy Monitoring" breadcrumb="Energy · Intelligence System">
      <div className="max-w-[1400px] mx-auto space-y-4">
        {/* Role banner */}
        {ri && (
          <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${ri.color}`}>
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span><strong>{role}</strong> — {ri.msg}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><Activity className="w-3 h-3" /> Live</Badge>
          <span>{modelLabel}</span>
          <span>Data Latency: 1.2s</span>
          <span>Last Updated: Just now</span>
          <Badge variant="outline" className="gap-1 ml-auto">Confidence: 94%</Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className={`grid w-full h-11`} style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
            {visibleTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                <tab.icon className="w-3.5 h-3.5" />{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card grain-overlay">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Energy Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingRisk ? <Skeleton className="h-24 w-full" /> : (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-20 h-20">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--chart-1))" strokeWidth="8"
                              strokeDasharray={`${(riskScore?.overall_score ?? 0) * 2.51} 251`} strokeLinecap="round" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">
                            {riskScore?.overall_score ?? "--"}
                          </span>
                        </div>
                        <div className="space-y-1 flex-1">
                          {[
                            { name: "Grid Dependency", val: riskScore?.grid_dependency },
                            { name: "Peak Volatility", val: riskScore?.peak_volatility },
                            { name: "Weather Exposure", val: riskScore?.weather_exposure },
                          ].map(f => (
                            <div key={f.name} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{f.name}</span>
                              <span className="font-medium text-foreground">{f.val ?? "--"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-accent/30 rounded-lg px-3 py-2">
                        <span className="text-muted-foreground">Stability Index</span>
                        <span className="font-semibold text-foreground">{riskScore?.stability_index ?? "--"}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card grain-overlay md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Cost Heatmap — Current Month</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingHeatmap ? <Skeleton className="h-32 w-full" /> : (
                    <div className="grid grid-cols-7 gap-1">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                        <span key={i} className="text-[10px] text-center text-muted-foreground font-medium">{d}</span>
                      ))}
                      {heatmapData.map((d) => {
                        const costs = heatmapData.map(x => x.cost_inr);
                        const minCost = Math.min(...costs);
                        const maxCost = Math.max(...costs);
                        const intensity = maxCost > minCost ? (d.cost_inr - minCost) / (maxCost - minCost) : 0;
                        const day = new Date(d.cost_date).getDate();
                        return (
                          <motion.div key={d.cost_date} whileHover={{ scale: 1.15 }}
                            className="aspect-square rounded-md flex items-center justify-center text-[10px] font-medium cursor-pointer"
                            style={{ backgroundColor: `hsl(var(--chart-1) / ${0.15 + intensity * 0.65})`, color: intensity > 0.5 ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))" }}
                            title={`₹${d.cost_inr.toLocaleString()}`}
                          >
                            {day}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card grain-overlay">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Load Profile Comparison</CardTitle>
                  <CardDescription className="text-xs">Weekday vs Weekend</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingProfiles ? <Skeleton className="h-[200px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="hour" type="number" domain={[0, 23]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Area data={weekdayLoad} dataKey="load" name="Weekday" fill="hsl(var(--chart-1) / 0.2)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                        <Area data={weekendLoad} dataKey="load" name="Weekend" fill="hsl(var(--chart-3) / 0.2)" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card grain-overlay">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Campus vs National Average</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingBenchmark ? <Skeleton className="h-[200px] w-full" /> : (
                    <div className="space-y-3">
                      {benchmarkData.map(b => (
                        <div key={b.metric_name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{b.metric_name}</span>
                            <span className="font-medium text-foreground">{b.campus_value} vs {b.national_avg}</span>
                          </div>
                          <div className="flex gap-1 h-2">
                            <div className="rounded-full bg-primary" style={{ width: `${((b.campus_value ?? 0) / Math.max(b.campus_value ?? 0, b.national_avg ?? 1)) * 100}%` }} />
                            <div className="rounded-full bg-muted-foreground/30" style={{ width: `${((b.national_avg ?? 0) / Math.max(b.campus_value ?? 0, b.national_avg ?? 1)) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* REAL-TIME GRID TAB */}
          <TabsContent value="realtime" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {loadingGrid ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />) : [
                { label: "Solar", value: solarKw, unit: "kW", max: solarCap, icon: Sun, color: "chart-4" },
                { label: "Battery", value: batteryPct, unit: "%", max: 100, icon: Battery, color: "chart-2" },
                { label: "Grid Import", value: gridImportKw, unit: "kW", max: 3000, icon: Zap, color: "chart-5" },
                { label: "Total Demand", value: totalDemandKw, unit: "kW", max: 4000, icon: Gauge, color: "chart-1" },
              ].map(item => (
                <motion.div key={item.label} whileHover={{ y: -2 }}>
                  <Card className="glass-card grain-overlay">
                    <CardContent className="pt-4 pb-3 text-center">
                      <item.icon className={`w-6 h-6 mx-auto mb-2 text-[hsl(var(--${item.color}))]`} />
                      <p className="text-2xl font-bold text-foreground">{item.value.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{item.unit}</p>
                      <Progress value={(item.value / item.max) * 100} className="mt-2 h-1.5" />
                      <p className="text-[10px] text-muted-foreground mt-1">{item.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card grain-overlay">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" />Live Demand Spike Detector</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingGrid ? <Skeleton className="h-20 w-full" /> : (
                    <>
                      <div className="bg-destructive/10 rounded-lg p-4 mb-3 border border-destructive/20">
                        <p className="text-sm font-semibold text-foreground">
                          Currently {demandPredicted > 0 ? `${Math.round((totalDemandKw / demandPredicted - 1) * 100)}%` : "N/A"} above predicted baseline
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Predicted: {demandPredicted.toLocaleString()} kW → Actual: {totalDemandKw.toLocaleString()} kW
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-accent/30 rounded-lg px-3 py-2">
                        <span className="text-muted-foreground">Total Demand</span>
                        <span className="font-semibold text-foreground">{(gridState?.total_demand_kw ?? 0).toFixed(0)} kW monitored</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card grain-overlay">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Cpu className="w-4 h-4 text-primary" />Equipment Load Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingEquipment ? <Skeleton className="h-[200px] w-full" /> : (
                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                      {equipmentLoad.map((eq) => {
                        const load = eq.latest_load?.load_kw ?? 0;
                        const capacity = eq.capacity_kw ?? 1;
                        const status = load / capacity > 0.85 ? "high" : load / capacity > 0.6 ? "medium" : "normal";
                        return (
                          <div key={eq.id} className="flex items-center gap-2 text-xs">
                            <StatusDot status={status} />
                            <span className="flex-1 text-foreground truncate">{eq.name}</span>
                            <span className="text-muted-foreground text-[10px]">{eq.equipment_type ?? "—"}</span>
                            <span className="font-mono font-medium text-foreground w-20 text-right">{load}/{capacity} kW</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FORECAST TAB */}
          <TabsContent value="forecast" className="space-y-4">
            <Card className="glass-card grain-overlay">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">72-Hour Energy Forecast with Confidence Bands</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingForecast ? <Skeleton className="h-[300px] w-full" /> : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={forecastChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Area dataKey="upper" fill="hsl(var(--chart-1) / 0.08)" stroke="none" />
                      <Area dataKey="lower" fill="hsl(var(--background))" stroke="none" />
                      <Line dataKey="predicted" stroke="hsl(var(--chart-1))" strokeWidth={2} strokeDasharray="5 3" dot={false} />
                      <Line dataKey="actual" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card grain-overlay">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Forecast Drift Tracker — 30 Day Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAccuracy ? <Skeleton className="h-[180px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={accuracyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} />
                        <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Line dataKey="accuracy" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card grain-overlay">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Thermometer className="w-4 h-4 text-primary" />What-If Simulator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Temperature</span><span className="font-medium text-foreground">{whatIfTemp[0]}°C</span></div>
                    <Slider value={whatIfTemp} onValueChange={setWhatIfTemp} min={15} max={45} step={1} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Occupancy</span><span className="font-medium text-foreground">{whatIfOccupancy[0]}%</span></div>
                    <Slider value={whatIfOccupancy} onValueChange={setWhatIfOccupancy} min={10} max={100} step={5} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Solar Efficiency</span><span className="font-medium text-foreground">{whatIfSolar[0]}%</span></div>
                    <Slider value={whatIfSolar} onValueChange={setWhatIfSolar} min={30} max={100} step={5} />
                  </div>
                  <div className="bg-accent/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Estimated Demand</p>
                    <p className="text-xl font-bold text-foreground">
                      {Math.round((totalDemandKw || 2847) * tempMultiplier * occMultiplier / solarMultiplier).toLocaleString()} kW
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* BUILDING DEEP DIVE TAB */}
          <TabsContent value="building" className="space-y-4">
            {loadingBuildings ? <Skeleton className="h-10 w-full" /> : (
              <div className="flex gap-2 flex-wrap">
                {buildings.map(b => (
                  <Button key={b.id} variant={selectedBuilding?.id === b.id ? "default" : "outline"} size="sm" className="rounded-full text-xs"
                    onClick={() => setSelectedBuildingId(String(b.id))}>{b.name}</Button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card grain-overlay">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{selectedBuilding?.name ?? "—"} — Efficiency Scorecard</CardTitle>
                  <CardDescription className="text-xs">
                    {selectedBuilding
                      ? `${selectedBuilding.floors ?? "?"} floors · ${(selectedBuilding.area_sqm ?? 0).toLocaleString()} m² · Built ${selectedBuilding.year_built ?? "?"}`
                      : "Select a building"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingBuildings ? <Skeleton className="h-[250px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1) / 0.2)" strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card grain-overlay">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />AI Retrofit Suggestions</CardTitle>
                    {canManage && selectedBuilding && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => setAddRetrofitOpen(true)}>
                        <Plus className="w-3 h-3" />Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingRetrofit ? <Skeleton className="h-[200px] w-full" /> : (
                    <div className="space-y-3">
                      {retrofitSuggestions.map((r) => {
                        const status = (r.status ?? "proposed") as RetrofitStatus;
                        const actions = STATUS_NEXT[status] ?? [];
                        return (
                          <motion.div key={r.id} whileHover={{ x: 4 }} className="border border-border rounded-lg p-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-foreground flex-1">{r.action}</p>
                              <Badge variant="outline" className="text-[10px] h-4 capitalize">{status}</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                              <span>Cost: ₹{((r.estimated_cost ?? 0) / 100000).toFixed(1)}L</span>
                              <span>Saves: ₹{((r.annual_saving ?? 0) / 100000).toFixed(1)}L/yr</span>
                              <span>Payback: {r.payback_years ?? "?"} yrs</span>
                              <Badge variant="outline" className="text-[10px] h-4">-{r.carbon_reduction_tons ?? 0} tCO₂</Badge>
                            </div>
                            <Progress value={r.payback_years ? Math.min(100, 100 / r.payback_years * 2) : 0} className="h-1" />
                            {canManage && actions.length > 0 && (
                              <div className="flex gap-2 justify-end pt-1">
                                {actions.map(({ next, label, color }) => (
                                  <Button key={next} size="sm" variant="outline" className={`h-5 text-[10px] ${color}`}
                                    disabled={updateRetrofit.isPending}
                                    onClick={() => handleRetrofitStatusChange(r.id, next)}>
                                    {label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                      {retrofitSuggestions.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center mt-4">No retrofit suggestions available</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* Add Retrofit dialog */}
      <Dialog open={addRetrofitOpen} onOpenChange={v => !v && setAddRetrofitOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-sm">Add Retrofit Suggestion</DialogTitle></DialogHeader>
          <div className="space-y-3 text-xs">
            <div><p className="text-muted-foreground mb-1">Action Description</p>
              <Input value={newRetrofit.action} onChange={e => setNewRetrofit(p => ({ ...p, action: e.target.value }))} className="h-8 text-xs" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-muted-foreground mb-1">Estimated Cost (₹)</p>
                <Input type="number" value={newRetrofit.estimated_cost} onChange={e => setNewRetrofit(p => ({ ...p, estimated_cost: +e.target.value }))} className="h-8 text-xs" /></div>
              <div><p className="text-muted-foreground mb-1">Annual Saving (₹)</p>
                <Input type="number" value={newRetrofit.annual_saving} onChange={e => setNewRetrofit(p => ({ ...p, annual_saving: +e.target.value }))} className="h-8 text-xs" /></div>
              <div><p className="text-muted-foreground mb-1">Payback Years</p>
                <Input type="number" value={newRetrofit.payback_years} onChange={e => setNewRetrofit(p => ({ ...p, payback_years: +e.target.value }))} className="h-8 text-xs" /></div>
              <div><p className="text-muted-foreground mb-1">CO₂ Reduction (t)</p>
                <Input type="number" value={newRetrofit.carbon_reduction_tons} onChange={e => setNewRetrofit(p => ({ ...p, carbon_reduction_tons: +e.target.value }))} className="h-8 text-xs" /></div>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddRetrofitOpen(false)}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs premium-button" disabled={createRetrofit.isPending || !newRetrofit.action} onClick={handleAddRetrofit}>
              {createRetrofit.isPending ? "Saving…" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Energy;
