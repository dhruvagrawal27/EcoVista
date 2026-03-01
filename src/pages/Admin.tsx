import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Database, Brain, FileText, Settings, RefreshCw, Activity, CheckCircle2, AlertTriangle, XCircle, Clock, BarChart3, Search, UserPlus } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useUsers, useDataSources, useMLModels, useAuditLogs, useAddUser, useToggleUserStatus, useRetrainModel, useRoles, useDepartments, usePlatformConfig, useSavePlatformConfig, useAlertConfig, useSaveAlertConfig, useInsertAuditLog } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

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
  const { toast } = useToast();
  const { user } = useAuth();
  const actorLabel = user?.name ?? user?.email ?? "Admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", confirmPassword: "", role_id: "", department_id: "" });

  // Threshold + carbon config state (populated from DB)
  const [thresholds, setThresholds] = useState({ overconsumption: "130", peakDemand: "4500", minSolar: "40" });
  const [carbonConfig, setCarbonConfig] = useState({ carbonPrice: "2400", netZeroYear: "2035", gridFactor: "0.82" });

  // Alert config state (populated from DB)
  const [alertCfg, setAlertCfg] = useState({
    critical_auto_escalate: true,
    email_on_warning: true,
    sms_on_critical: false,
    auto_acknowledge_info: true,
  });

  // ── DB reads ──────────────────────────────────────────────────────────────
  const { data: users = [], isLoading: loadingUsers } = useUsers(campusId);
  const { data: dataSources = [], isLoading: loadingDS } = useDataSources(campusId);
  const { data: models = [], isLoading: loadingModels } = useMLModels();
  const { data: auditLogs = [], isLoading: loadingAudit } = useAuditLogs(campusId);
  const { data: roles = [] } = useRoles();
  const { data: departments = [] } = useDepartments();
  const { data: platformConfig, isSuccess: configLoaded } = usePlatformConfig(campusId);
  const { data: alertConfigData, isSuccess: alertLoaded } = useAlertConfig(campusId);

  // ── Populate state when DB data arrives ──────────────────────────────────
  useEffect(() => {
    if (configLoaded && platformConfig) {
      setThresholds({
        overconsumption: platformConfig["overconsumption_alert_pct"] ?? "130",
        peakDemand: platformConfig["peak_demand_limit_kw"] ?? "4500",
        minSolar: platformConfig["min_solar_target_pct"] ?? "40",
      });
      setCarbonConfig({
        carbonPrice: platformConfig["carbon_price_inr_ton"] ?? "2400",
        netZeroYear: platformConfig["netzero_target_year"] ?? "2035",
        gridFactor: platformConfig["grid_emission_factor"] ?? "0.82",
      });
    }
  }, [configLoaded, platformConfig]);

  useEffect(() => {
    if (alertLoaded && alertConfigData) {
      setAlertCfg({
        critical_auto_escalate: alertConfigData.critical_auto_escalate,
        email_on_warning: alertConfigData.email_on_warning,
        sms_on_critical: alertConfigData.sms_on_critical,
        auto_acknowledge_info: alertConfigData.auto_acknowledge_info,
      });
    }
  }, [alertLoaded, alertConfigData]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const addUserMutation = useAddUser(campusId);
  const toggleStatusMutation = useToggleUserStatus(campusId);
  const retrainMutation = useRetrainModel();
  const savePlatformConfig = useSavePlatformConfig(campusId);
  const saveAlertConfig = useSaveAlertConfig(campusId);
  const insertAuditLog = useInsertAuditLog(campusId);

  const activeUsers = users.filter(u => u.status === "active").length;
  const connectedDS = dataSources.filter(d => d.status === "connected").length;
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role_id || !newUser.department_id) {
      toast({ title: "All fields required", variant: "destructive" });
      return;
    }
    if (newUser.password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    addUserMutation.mutate(
      {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role_id: Number(newUser.role_id),
        department_id: Number(newUser.department_id),
      },
      {
        onSuccess: () => {
          toast({
            title: "✅ User created!",
            description: `${newUser.name} (${newUser.email}) can now log in immediately.`,
          });
          insertAuditLog.mutate({ userLabel: actorLabel, action: `Created user ${newUser.name} (${newUser.email})`, logType: "action" });
          setAddUserOpen(false);
          setNewUser({ name: "", email: "", password: "", confirmPassword: "", role_id: "", department_id: "" });
        },
        onError: (e) => {
          const msg = (e as Error).message;
          toast({
            title: "Failed to create user",
            description: msg.includes("already registered")
              ? `${newUser.email} already has an account. Try a different email.`
              : msg,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleToggleStatus = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    toggleStatusMutation.mutate(
      { userId, newStatus },
      {
        onSuccess: () => {
          toast({ title: `User ${newStatus === "active" ? "activated" : "deactivated"}` });
          insertAuditLog.mutate({ userLabel: actorLabel, action: `${newStatus === "active" ? "Activated" : "Deactivated"} user ID ${userId}`, logType: "action" });
        },
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleRetrain = (modelId: number, modelName: string) => {
    retrainMutation.mutate(modelId, {
      onSuccess: () => {
        toast({ title: "Retrain triggered", description: `${modelName} retraining started.` });
        insertAuditLog.mutate({ userLabel: actorLabel, action: `Triggered retraining for model: ${modelName}`, logType: "system" });
      },
      onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
    });
  };

  const handleSaveThresholds = () => {
    savePlatformConfig.mutate(
      [
        { key: "overconsumption_alert_pct", value: thresholds.overconsumption, group: "thresholds" },
        { key: "peak_demand_limit_kw", value: thresholds.peakDemand, group: "thresholds" },
        { key: "min_solar_target_pct", value: thresholds.minSolar, group: "thresholds" },
      ],
      {
        onSuccess: () => {
          toast({ title: "Thresholds saved", description: `Overconsumption: ${thresholds.overconsumption}%, Peak: ${thresholds.peakDemand} kW, Solar: ${thresholds.minSolar}%` });
          insertAuditLog.mutate({ userLabel: actorLabel, action: `Updated energy thresholds — overconsumption: ${thresholds.overconsumption}%, peak: ${thresholds.peakDemand} kW, solar: ${thresholds.minSolar}%`, logType: "config" });
        },
        onError: (e) => toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleSaveCarbonConfig = () => {
    savePlatformConfig.mutate(
      [
        { key: "carbon_price_inr_ton", value: carbonConfig.carbonPrice, group: "carbon" },
        { key: "netzero_target_year", value: carbonConfig.netZeroYear, group: "carbon" },
        { key: "grid_emission_factor", value: carbonConfig.gridFactor, group: "carbon" },
      ],
      {
        onSuccess: () => {
          toast({ title: "Carbon config saved", description: `₹${carbonConfig.carbonPrice}/ton CO₂, Net-Zero ${carbonConfig.netZeroYear}` });
          insertAuditLog.mutate({ userLabel: actorLabel, action: `Updated carbon config — price: ₹${carbonConfig.carbonPrice}/ton, net-zero: ${carbonConfig.netZeroYear}, grid factor: ${carbonConfig.gridFactor}`, logType: "config" });
        },
        onError: (e) => toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleAlertToggle = (key: keyof typeof alertCfg, value: boolean) => {
    const updated = { ...alertCfg, [key]: value };
    setAlertCfg(updated);
    saveAlertConfig.mutate(updated, {
      onSuccess: () => {
        toast({ title: "Alert setting saved" });
        insertAuditLog.mutate({ userLabel: actorLabel, action: `Updated alert config: ${key} → ${value}`, logType: "config" });
      },
      onError: (e) => toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" }),
    });
  };

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

        {/* Add User Dialog */}
        <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <Input placeholder="e.g. Rahul Sharma" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input type="email" placeholder="user@iitd.ac.in" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Password</Label>
                <Input type="password" placeholder="Min. 6 characters" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Confirm Password</Label>
                <Input type="password" placeholder="Repeat password" value={newUser.confirmPassword} onChange={e => setNewUser(p => ({ ...p, confirmPassword: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Role</Label>
                <Select value={newUser.role_id} onValueChange={v => setNewUser(p => ({ ...p, role_id: v, department_id: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Select role…" /></SelectTrigger>
                  <SelectContent>{roles.filter(r => r.name !== "System").map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Department
                  {newUser.role_id && (
                    <span className="ml-2 text-muted-foreground font-normal">
                      {["1","3","5"].includes(newUser.role_id) && "— administrative"}
                      {newUser.role_id === "2" && "— operational"}
                      {newUser.role_id === "4" && "— academic"}
                    </span>
                  )}
                </Label>
                <Select
                  value={newUser.department_id}
                  onValueChange={v => setNewUser(p => ({ ...p, department_id: v }))}
                  disabled={!newUser.role_id}
                >
                  <SelectTrigger><SelectValue placeholder={newUser.role_id ? "Select department…" : "Select role first"} /></SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter(d => {
                        // Admin(1), Finance(3), Student Lead(5) → administrative
                        if (["1","3","5"].includes(newUser.role_id)) return d.type === "administrative";
                        // Facility Manager(2) → operational
                        if (newUser.role_id === "2") return d.type === "operational";
                        // Faculty(4) → academic
                        if (newUser.role_id === "4") return d.type === "academic";
                        return true;
                      })
                      .map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
              <Button className="premium-button" onClick={handleAddUser} disabled={addUserMutation.isPending}>
                {addUserMutation.isPending ? "Adding…" : "Add User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              <Button className="premium-button" size="sm" onClick={() => setAddUserOpen(true)}>
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />Add User
              </Button>
            </div>
            <Card className="premium-card">
              <CardContent className="p-0">
                {loadingUsers ? (
                  <div className="p-4 space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Last Active</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredUsers.map(u => (
                        <TableRow key={u.id}>
                          <TableCell><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></TableCell>
                          <TableCell><Badge variant="outline">{u.role_name ?? "—"}</Badge></TableCell>
                          <TableCell className="text-sm">{u.department_name ?? "—"}</TableCell>
                          <TableCell><div className="flex items-center gap-1.5">{statusIcon(u.status)}<span className="text-xs capitalize">{u.status}</span></div></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{u.last_active_at ? new Date(u.last_active_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              disabled={toggleStatusMutation.isPending}
                              onClick={() => handleToggleStatus(u.id, u.status)}
                            >
                              {u.status === "active" ? "Deactivate" : "Activate"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredUsers.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">No users found</TableCell></TableRow>}
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
                  <div className="space-y-1"><Label className="text-xs">Overconsumption Alert (%)</Label><Input value={thresholds.overconsumption} onChange={e => setThresholds(p => ({ ...p, overconsumption: e.target.value }))} className="h-8 text-sm" /></div>
                  <div className="space-y-1"><Label className="text-xs">Peak Demand Limit (kW)</Label><Input value={thresholds.peakDemand} onChange={e => setThresholds(p => ({ ...p, peakDemand: e.target.value }))} className="h-8 text-sm" /></div>
                  <div className="space-y-1"><Label className="text-xs">Min Solar Target (%)</Label><Input value={thresholds.minSolar} onChange={e => setThresholds(p => ({ ...p, minSolar: e.target.value }))} className="h-8 text-sm" /></div>
                  <Button size="sm" className="premium-button w-full" onClick={handleSaveThresholds} disabled={savePlatformConfig.isPending}>
                    {savePlatformConfig.isPending ? "Saving…" : "Save Thresholds"}
                  </Button>
                </CardContent>
              </Card>
              <Card className="premium-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Carbon Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1"><Label className="text-xs">Carbon Price (₹/ton CO₂)</Label><Input value={carbonConfig.carbonPrice} onChange={e => setCarbonConfig(p => ({ ...p, carbonPrice: e.target.value }))} className="h-8 text-sm" /></div>
                  <div className="space-y-1"><Label className="text-xs">Net-Zero Target Year</Label><Input value={carbonConfig.netZeroYear} onChange={e => setCarbonConfig(p => ({ ...p, netZeroYear: e.target.value }))} className="h-8 text-sm" /></div>
                  <div className="space-y-1"><Label className="text-xs">Grid Emission Factor (kg/kWh)</Label><Input value={carbonConfig.gridFactor} onChange={e => setCarbonConfig(p => ({ ...p, gridFactor: e.target.value }))} className="h-8 text-sm" /></div>
                  <Button size="sm" className="premium-button w-full" onClick={handleSaveCarbonConfig} disabled={savePlatformConfig.isPending}>
                    {savePlatformConfig.isPending ? "Saving…" : "Save Carbon Config"}
                  </Button>
                </CardContent>
              </Card>
              <Card className="premium-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Alert Severity</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Critical alerts auto-escalate", key: "critical_auto_escalate" as const },
                    { label: "Email on warning level", key: "email_on_warning" as const },
                    { label: "SMS on critical level", key: "sms_on_critical" as const },
                    { label: "Auto-acknowledge info alerts", key: "auto_acknowledge_info" as const },
                  ].map((c) => (
                    <div key={c.key} className="flex items-center justify-between">
                      <Label className="text-xs">{c.label}</Label>
                      <Switch
                        checked={alertCfg[c.key]}
                        onCheckedChange={(v) => handleAlertToggle(c.key, v)}
                        disabled={saveAlertConfig.isPending}
                      />
                    </div>
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          disabled={retrainMutation.isPending}
                          onClick={() => handleRetrain(m.id, m.name)}
                        >
                          <RefreshCw className={`w-3 h-3 ${retrainMutation.isPending ? "animate-spin" : ""}`} />Retrain
                        </Button>
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