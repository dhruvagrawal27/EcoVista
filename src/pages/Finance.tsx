import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from "recharts";
import { IndianRupee, TrendingUp, BarChart3, Target, Shield, Coins, FileCheck, AlertTriangle } from "lucide-react";
import { financeMetrics, investmentMatrix, capitalProjection, subsidyTracker } from "@/lib/module-data";

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
const statusColors: Record<string, string> = { completed: "hsl(var(--chart-2))", "in-progress": "hsl(var(--chart-1))", approved: "hsl(var(--chart-5))", proposed: "hsl(var(--chart-4))" };

const Finance = () => {
  const [energyPriceIncrease, setEnergyPriceIncrease] = useState([10]);

  const stressedSavings = Math.round(financeMetrics.annualSavings * (1 + energyPriceIncrease[0] / 100));

  return (
    <DashboardLayout title="Cost & Finance" breadcrumb="Finance · Executive Analytics">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><IndianRupee className="w-3 h-3" /> Finance</Badge>
          <span>Last Updated: Today</span>
          <Badge variant="outline" className="gap-1 ml-auto">Data Confidence: 96%</Badge>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Investment", value: `₹${(financeMetrics.totalInvestment / 10000000).toFixed(1)} Cr`, icon: Coins, trend: null },
            { label: "Annual Savings", value: `₹${(financeMetrics.annualSavings / 100000).toFixed(0)} L`, icon: TrendingUp, trend: 12.4 },
            { label: "NPV (10yr)", value: `₹${(financeMetrics.npv / 10000000).toFixed(1)} Cr`, icon: BarChart3, trend: null },
            { label: "IRR", value: `${financeMetrics.irr}%`, icon: Target, trend: 2.1 },
          ].map(item => (
            <motion.div key={item.label} whileHover={{ y: -2 }}>
              <Card className="glass-card grain-overlay">
                <CardContent className="pt-4 pb-3 text-center">
                  <item.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  {item.trend && <Badge variant="outline" className="text-[10px] h-4 mt-1 text-primary">+{item.trend}%</Badge>}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Investment Matrix */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Target className="w-4 h-4 text-primary" />Investment Prioritization Matrix</CardTitle>
            <CardDescription className="text-xs">Impact vs Cost · Bubble size = ROI</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="cost" name="Cost (₹Cr)" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Cost (₹Cr)", position: "bottom", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="impact" name="Impact Score" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Impact", angle: -90, position: "left", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <ZAxis dataKey="roi" range={[200, 800]} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(val: number, name: string) => [name === "roi" ? `${val}%` : val, name === "roi" ? "ROI" : name]} />
                <Scatter data={investmentMatrix} name="Projects">
                  {investmentMatrix.map((entry, i) => (
                    <Cell key={i} fill={statusColors[entry.status]} fillOpacity={0.7} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2">
              {Object.entries(statusColors).map(([s, c]) => (
                <div key={s} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                  <span className="capitalize">{s}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 10-Year Projection + Stress Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">10-Year Capital Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={capitalProjection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Area dataKey="savings" fill="hsl(var(--chart-2) / 0.2)" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Cumulative Savings" />
                  <Area dataKey="investment" fill="hsl(var(--chart-5) / 0.2)" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Annual Investment" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" />Budget Stress Test</CardTitle>
              <CardDescription className="text-xs">Simulate energy price increase impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Energy Price Increase</span>
                  <span className="font-medium text-foreground">+{energyPriceIncrease[0]}%</span>
                </div>
                <Slider value={energyPriceIncrease} onValueChange={setEnergyPriceIncrease} min={0} max={50} step={5} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-accent/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Current Savings</p>
                  <p className="text-lg font-bold text-foreground">₹{(financeMetrics.annualSavings / 100000).toFixed(0)}L</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Stressed Savings</p>
                  <p className="text-lg font-bold text-primary">₹{(stressedSavings / 100000).toFixed(0)}L</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Higher energy prices increase ROI on renewable investments</p>
            </CardContent>
          </Card>
        </div>

        {/* Subsidies + Carbon Credits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><FileCheck className="w-4 h-4 text-primary" />Subsidy & Eligibility Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subsidyTracker.map(s => (
                <div key={s.name} className="border border-border rounded-lg p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">Deadline: {s.deadline}</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">₹{(s.amount / 100000).toFixed(1)}L</p>
                  <Badge variant="outline" className={`text-[10px] h-4 ${s.status === "approved" ? "text-primary" : s.status === "active" ? "text-[hsl(var(--chart-2))]" : ""}`}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Coins className="w-4 h-4 text-primary" />Carbon Credit Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Array.from({ length: 5 }, (_, i) => ({
                  year: 2025 + i,
                  credits: Math.round(1250000 * Math.pow(1.25, i)),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 100000).toFixed(0)}L`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Bar dataKey="credits" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Finance;
