import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Database, Brain, FileText, Settings, RefreshCw, Activity, CheckCircle2, AlertTriangle, XCircle, Clock, BarChart3, Search } from "lucide-react";
import { useState } from "react";

const users = [
  { id: 1, name: "Dr. Priya Sharma", email: "priya.sharma@campus.edu", role: "Admin", department: "Sustainability Office", status: "active" as const, lastActive: "2 min ago" },
  { id: 2, name: "Rajesh Kumar", email: "rajesh.k@campus.edu", role: "Facility Manager", department: "Facilities", status: "active" as const, lastActive: "15 min ago" },
  { id: 3, name: "Anita Desai", email: "anita.d@campus.edu", role: "Finance", department: "Finance Office", status: "active" as const, lastActive: "1 hr ago" },
  { id: 4, name: "Prof. Vikram Singh", email: "vikram.s@campus.edu", role: "Faculty", department: "Environmental Science", status: "active" as const, lastActive: "3 hrs ago" },
  { id: 5, name: "Meera Patel", email: "meera.p@campus.edu", role: "Student Lead", department: "Student Council", status: "inactive" as const, lastActive: "2 days ago" },
  { id: 6, name: "System Bot", email: "system@ecovista.ai", role: "System", department: "AI Engine", status: "active" as const, lastActive: "Just now" },
];

const dataSources = [
  { name: "Weather API (OpenMeteo)", status: "connected" as const, latency: "120ms", uptime: 99.8, lastSync: "1 min ago" },
  { name: "Solar Inverter Feed", status: "connected" as const, latency: "45ms", uptime: 99.5, lastSync: "30 sec ago" },
  { name: "Smart Meter Network", status: "connected" as const, latency: "200ms", uptime: 98.2, lastSync: "2 min ago" },
  { name: "Carbon Intensity API", status: "degraded" as const, latency: "850ms", uptime: 94.5, lastSync: "5 min ago" },
  { name: "BMS Integration", status: "connected" as const, latency: "180ms", uptime: 97.8, lastSync: "1 min ago" },
  { name: "EV Charger Network", status: "offline" as const, latency: "—", uptime: 88.2, lastSync: "2 hrs ago" },
];

const models = [
  { name: "Energy Forecast LSTM", version: "v3.2.1", accuracy: 94.2, lastTrained: "2025-02-25", status: "production" as const, predictions: "48,200" },
  { name: "Anomaly Detection (Isolation Forest)", version: "v2.8.0", accuracy: 91.8, lastTrained: "2025-02-20", status: "production" as const, predictions: "12,400" },
  { name: "Carbon Predictor (XGBoost)", version: "v1.5.3", accuracy: 89.5, lastTrained: "2025-02-18", status: "production" as const, predictions: "8,600" },
  { name: "HVAC Optimizer (RL Agent)", version: "v0.9.1", accuracy: 87.2, lastTrained: "2025-02-22", status: "staging" as const, predictions: "2,100" },
  { name: "Occupancy Estimator (CNN)", version: "v1.2.0", accuracy: 85.8, lastTrained: "2025-02-15", status: "staging" as const, predictions: "5,800" },
];

const auditLogs = [
  { time: "2 min ago", user: "System Bot", action: "Anomaly detected in Engineering Lab", type: "alert" as const },
  { time: "15 min ago", user: "Dr. Priya Sharma", action: "Updated carbon pricing assumption to ₹2,400/ton", type: "config" as const },
  { time: "1 hr ago", user: "Rajesh Kumar", action: "Acknowledged HVAC anomaly in Library", type: "action" as const },
  { time: "2 hrs ago", user: "System Bot", action: "ML model v3.2.1 deployed to production", type: "system" as const },
  { time: "3 hrs ago", user: "Anita Desai", action: "Generated Q4 Finance Report", type: "report" as const },
  { time: "5 hrs ago", user: "System Bot", action: "Solar panel fault detected in Array C", type: "alert" as const },
  { time: "8 hrs ago", user: "Prof. Vikram Singh", action: "Added new eco-challenge: Water Sprint", type: "action" as const },
  { time: "12 hrs ago", user: "System Bot", action: "Daily backup completed successfully", type: "system" as const },
];

const statusIcon = (s: string) => s === "connected" || s === "active" || s === "production" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : s === "degraded" || s === "staging" ? <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />;
const logTypeColor = (t: string) => t === "alert" ? "destructive" : t === "config" ? "secondary" : t === "system" ? "outline" : "default";

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout title="Admin Panel" breadcrumb="System · Admin">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Users", value: users.filter(u => u.status === "active").length, icon: Users },
            { label: "Data Sources", value: `${dataSources.filter(d => d.status === "connected").length}/${dataSources.length}`, icon: Database },
            { label: "ML Models", value: models.length, icon: Brain },
            { label: "System Health", value: "98.2%", icon: Activity },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="premium-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><m.icon className="w-5 h-5 text-primary" /></div>
                  <div><p className="text-xs text-muted-foreground">{m.label}</p><p className="text-lg font-bold">{m.value}</p></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="data">Data Sources</TabsTrigger>
            <TabsTrigger value="models">ML Models</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search users..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
              <Button className="premium-button" size="sm">Add User</Button>
            </div>
            <Card className="premium-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Last Active</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                      <TableRow key={u.id}>
                        <TableCell><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></TableCell>
                        <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                        <TableCell className="text-sm">{u.department}</TableCell>
                        <TableCell><div className="flex items-center gap-1.5">{statusIcon(u.status)}<span className="text-xs capitalize">{u.status}</span></div></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{u.lastActive}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="premium-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Energy Thresholds</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[{ label: "Overconsumption Alert (%)", value: "130" }, { label: "Peak Demand Limit (kW)", value: "4500" }, { label: "Min Solar Target (%)", value: "40" }].map((c, i) => (
                    <div key={i} className="space-y-1"><Label className="text-xs">{c.label}</Label><Input defaultValue={c.value} className="h-8 text-sm" /></div>
                  ))}
                  <Button size="sm" className="premium-button w-full">Save Thresholds</Button>
                </CardContent>
              </Card>
              <Card className="premium-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Carbon Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[{ label: "Carbon Price (₹/ton CO₂)", value: "2400" }, { label: "Net-Zero Target Year", value: "2035" }, { label: "Grid Emission Factor (kg/kWh)", value: "0.82" }].map((c, i) => (
                    <div key={i} className="space-y-1"><Label className="text-xs">{c.label}</Label><Input defaultValue={c.value} className="h-8 text-sm" /></div>
                  ))}
                  <Button size="sm" className="premium-button w-full">Save Carbon Config</Button>
                </CardContent>
              </Card>
              <Card className="premium-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Alert Severity</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[{ label: "Critical alerts auto-escalate", checked: true }, { label: "Email on warning level", checked: true }, { label: "SMS on critical level", checked: false }, { label: "Auto-acknowledge info alerts", checked: true }].map((c, i) => (
                    <div key={i} className="flex items-center justify-between"><Label className="text-xs">{c.label}</Label><Switch defaultChecked={c.checked} /></div>
                  ))}
                </CardContent>
              </Card>
              <Card className="premium-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Platform Settings</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[{ label: "Maintenance mode", checked: false }, { label: "AI autonomous actions", checked: true }, { label: "Real-time data streaming", checked: true }, { label: "External API access", checked: true }].map((c, i) => (
                    <div key={i} className="flex items-center justify-between"><Label className="text-xs">{c.label}</Label><Switch defaultChecked={c.checked} /></div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-4">
            <Card className="premium-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Data Source</TableHead><TableHead>Status</TableHead><TableHead>Latency</TableHead><TableHead>Uptime</TableHead><TableHead>Last Sync</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {dataSources.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm font-medium">{d.name}</TableCell>
                        <TableCell><div className="flex items-center gap-1.5">{statusIcon(d.status)}<span className="text-xs capitalize">{d.status}</span></div></TableCell>
                        <TableCell className="text-sm">{d.latency}</TableCell>
                        <TableCell><div className="flex items-center gap-2"><Progress value={d.uptime} className="h-1.5 w-16" /><span className="text-xs">{d.uptime}%</span></div></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{d.lastSync}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="mt-4 space-y-4">
            {models.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="premium-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-primary" />
                        <div><p className="text-sm font-semibold">{m.name}</p><p className="text-xs text-muted-foreground">{m.version} · {m.predictions} predictions</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={m.status === "production" ? "default" : "secondary"}>{m.status}</Badge>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><RefreshCw className="w-3 h-3" />Retrain</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><p className="text-xs text-muted-foreground">Accuracy</p><div className="flex items-center gap-2"><Progress value={m.accuracy} className="h-1.5 flex-1" /><span className="text-xs font-semibold">{m.accuracy}%</span></div></div>
                      <div><p className="text-xs text-muted-foreground">Last Trained</p><p className="text-xs font-medium">{m.lastTrained}</p></div>
                      <div><p className="text-xs text-muted-foreground">Total Predictions</p><p className="text-xs font-medium">{m.predictions}</p></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <Card className="premium-card">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {auditLogs.map((log, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {log.type === "alert" ? <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> : log.type === "config" ? <Settings className="w-3.5 h-3.5 text-blue-500" /> : log.type === "system" ? <Database className="w-3.5 h-3.5 text-purple-500" /> : log.type === "report" ? <FileText className="w-3.5 h-3.5 text-green-500" /> : <Activity className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0"><p className="text-sm">{log.action}</p><p className="text-xs text-muted-foreground mt-0.5">{log.user} · {log.time}</p></div>
                      <Badge variant={logTypeColor(log.type) as any} className="text-[10px] shrink-0">{log.type}</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" /><span>System uptime: 99.7%</span>
          <span className="mx-2">•</span><Shield className="w-3 h-3" /><span>Security: All clear</span>
          <span className="mx-2">•</span><BarChart3 className="w-3 h-3" /><span>Platform v4.1.0</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
