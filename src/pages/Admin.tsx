import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Database, Brain, FileText, Settings, RefreshCw, Activity, CheckCircle2, AlertTriangle, XCircle, Clock, BarChart3, Search } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useUsers, useDataSources, useMLModels, useAuditLogs } from "@/hooks/useAdmin";

const statusIcon = (s: string) =>
  s === "connected" || s === "active" || s === "production"
    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
    : s === "degraded" || s === "staging"
    ? <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
    : <XCircle className="w-3.5 h-3.5 text-red-500" />;

const logTypeIcon = (t: string) => {
  if (t === "alert") return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
  if (t === "config") return <Settings className="w-3.5 h-3.5 text-blue-500" />;
  if (t === "system") return <Database className="w-3.5 h-3.5 text-purple-500" />;
  if (t === "report") return <FileText className="w-3.5 h-3.5 text-green-500" />;
  return <Activity className="w-3.5 h-3.5 text-primary" />;
};

const Admin = () => {
  const { campusId } = useCampusContext();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: users = [], isLoading: loadingUsers } = useUsers(campusId);
  const { data: dataSources = [], isLoading: loadingDS } = useDataSources(campusId);
  const { data: models = [], isLoading: loadingModels } = useMLModels();
  const { data: auditLogs = [], isLoading: loadingAudit } = useAuditLogs(campusId);
  const activeUsers = users.filter(u => u.status === "active").length;
  const connectedDS = dataSources.filter(d => d.status === "connected").length;
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <DashboardLayout title="Admin Panel" breadcrumb="System · Admin">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Users", value: loadingUsers ? "…" : activeUsers.toString(), icon: Users },
            { label: "Data Sources", value: loadingDS ? "…" : `${connectedDS}/${dataSources.length}`, icon: Database },
            { label: "ML Models", value: loadingModels ? "…" : models.length.toString(), icon: Brain },
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
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search users…" className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Button className="premium-button" size="sm">Add User</Button>
            </div>
            <Card className="premium-card">
              <CardContent className="p-0">
                {loadingUsers ? (
                  <div className="p-4 space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Last Active</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredUsers.map(u => (
                        <TableRow key={u.id}>
                          <TableCell><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></TableCell>
                          <TableCell><Badge variant="outline">{u.role_name ?? "—"}</Badge></TableCell>
                          <TableCell className="text-sm">{u.department_name ?? "—"}</TableCell>
                          <TableCell><div className="flex items-center gap-1.5">{statusIcon(u.status)}<span className="text-xs capitalize">{u.status}</span></div></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{u.last_active_at ? new Date(u.last_active_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—"}</TableCell>
                        </TableRow>
                      ))}
                      {filteredUsers.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">No users found</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                )}
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
                {loadingDS ? (
                  <div className="p-4 space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Data Source</TableHead><TableHead>Status</TableHead><TableHead>Latency</TableHead><TableHead>Uptime</TableHead><TableHead>Last Sync</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {dataSources.map(d => (
                        <TableRow key={d.id}>
                          <TableCell className="text-sm font-medium">{d.name}</TableCell>
                          <TableCell><div className="flex items-center gap-1.5">{statusIcon(d.status)}<span className="text-xs capitalize">{d.status}</span></div></TableCell>
                          <TableCell className="text-sm">{d.latency_ms != null ? `${d.latency_ms}ms` : "—"}</TableCell>
                          <TableCell><div className="flex items-center gap-2"><Progress value={d.uptime_pct ?? 0} className="h-1.5 w-16" /><span className="text-xs">{d.uptime_pct?.toFixed(1) ?? "—"}%</span></div></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{d.last_sync_at ? new Date(d.last_sync_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—"}</TableCell>
                        </TableRow>
                      ))}
                      {dataSources.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">No data sources</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="models" className="mt-4 space-y-4">
            {loadingModels ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />) : models.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="premium-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-primary" />
                        <div><p className="text-sm font-semibold">{m.name}</p><p className="text-xs text-muted-foreground">{m.version} · {m.total_predictions.toLocaleString()} predictions</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={m.status === "production" ? "default" : "secondary"}>{m.status}</Badge>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><RefreshCw className="w-3 h-3" />Retrain</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><p className="text-xs text-muted-foreground">Accuracy</p><div className="flex items-center gap-2"><Progress value={m.accuracy_pct ?? 0} className="h-1.5 flex-1" /><span className="text-xs font-semibold">{m.accuracy_pct?.toFixed(1) ?? "—"}%</span></div></div>
                      <div><p className="text-xs text-muted-foreground">Last Trained</p><p className="text-xs font-medium">{m.last_trained_at ? new Date(m.last_trained_at).toLocaleDateString("en-IN") : "—"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Total Predictions</p><p className="text-xs font-medium">{m.total_predictions.toLocaleString()}</p></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {!loadingModels && models.length === 0 && <Card className="premium-card"><CardContent className="py-12 text-center text-xs text-muted-foreground">No ML models found</CardContent></Card>}
          </TabsContent>
          <TabsContent value="audit" className="mt-4">
            <Card className="premium-card">
              <CardContent className="p-4">
                {loadingAudit ? (
                  <div className="space-y-2">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log, i) => (
                      <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">{logTypeIcon(log.log_type)}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm">{log.action}</p><p className="text-xs text-muted-foreground mt-0.5">{log.user_label ?? "System"} · {new Date(log.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</p></div>
                        <Badge variant="outline" className="text-[10px] shrink-0">{log.log_type}</Badge>
                      </motion.div>
                    ))}
                    {auditLogs.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No audit logs</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" /><span>System uptime: 99.7%</span>
          <span className="mx-2">·</span><Shield className="w-3 h-3" /><span>Security: All clear</span>
          <span className="mx-2">·</span><BarChart3 className="w-3 h-3" /><span>Platform v4.1.0</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;