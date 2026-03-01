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
import { Users, Shield, Database, Brain, FileText, Settings, RefreshCw, Activity, CheckCircle2, AlertTriangle, XCircle, Clock, BarChart3, Search, UserPlus, Award, Calendar, Plus, Trash2, Map, FolderKanban, Edit2 } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useUsers, useDataSources, useMLModels, useAuditLogs, useAddUser, useToggleUserStatus, useRetrainModel, useRoles, useDepartments, usePlatformConfig, useSavePlatformConfig, useAlertConfig, useSaveAlertConfig, useInsertAuditLog } from "@/hooks/useAdmin";
import { useEcoChallenges, useCommunityEvents, useCreateChallenge, useDeleteChallenge, useCreateEvent, useDeleteEvent, useCompleteChallenge } from "@/hooks/useCommunity";
import { useRoadmapPhases, useRiskRegister, useUpdatePhase, useCreateRisk, useUpdateRisk, useDeleteRisk } from "@/hooks/useRoadmap";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
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

  // ── Engagement data + mutations ───────────────────────────────────────────
  const { data: challenges = [], isLoading: loadingChallenges } = useEcoChallenges(campusId);
  const { data: events = [], isLoading: loadingEvents } = useCommunityEvents(campusId);
  const createChallenge = useCreateChallenge(campusId);
  const deleteChallenge = useDeleteChallenge(campusId);
  const createEvent = useCreateEvent(campusId);
  const deleteEvent = useDeleteEvent(campusId);
  const completeChallenge = useCompleteChallenge(campusId);

  const [newChallenge, setNewChallenge] = useState({
    title: "", description: "", category: "Energy",
    start_date: "", end_date: "", reward_points: "200", max_participants: "",
  });
  const [newEvent, setNewEvent] = useState({
    title: "", event_date: "", location: "", event_type: "Workshop", max_attendees: "",
  });

  // ── Planning data + mutations ─────────────────────────────────────────────
  const { data: phases = [], isLoading: loadingPhases } = useRoadmapPhases(campusId);
  const { data: risks = [], isLoading: loadingRisks } = useRiskRegister(campusId);
  const { data: adminProjects = [], isLoading: loadingProjects } = useProjects(campusId);
  const updatePhase = useUpdatePhase(campusId);
  const createRisk = useCreateRisk(campusId);
  const updateRisk = useUpdateRisk(campusId);
  const deleteRisk = useDeleteRisk(campusId);
  const createProject = useCreateProject(campusId);
  const updateProject = useUpdateProject(campusId);
  const deleteProject = useDeleteProject(campusId);

  // ── Planning edit state ───────────────────────────────────────────────────
  const [editingPhase, setEditingPhase] = useState<{ id: number; progress_pct: string; spent_inr: string } | null>(null);
  const [editingRisk, setEditingRisk] = useState<{ id: number; status: string; mitigation: string } | null>(null);
  const [newRisk, setNewRisk] = useState({ risk_description: "", impact: "medium", probability: "medium", mitigation: "", owner_label: "", status: "open" });
  const [newRiskOpen, setNewRiskOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{ id: number; status: string; spent_inr: string; timeline_pct: string } | null>(null);
  const [newProject, setNewProject] = useState({ name: "", summary: "", category: "Renewable Energy", status: "Planned", budget_inr: "", carbon_reduction_t_yr: "", roi_pct: "", risk_level: "Low" });
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const handleSavePhase = (id: number) => {
    if (!editingPhase) return;
    updatePhase.mutate(
      { id, progress_pct: Number(editingPhase.progress_pct), spent_inr: Number(editingPhase.spent_inr) },
      {
        onSuccess: () => {
          toast({ title: "Phase updated ✓" });
          insertAuditLog.mutate({ userLabel: actorLabel, action: `Updated roadmap phase id=${id}: progress=${editingPhase.progress_pct}%, spent=${editingPhase.spent_inr}`, logType: "action" });
          setEditingPhase(null);
        },
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleSaveRisk = (id: number) => {
    if (!editingRisk) return;
    updateRisk.mutate(
      { id, status: editingRisk.status as "open" | "mitigated" | "closed", mitigation: editingRisk.mitigation },
      {
        onSuccess: () => {
          toast({ title: "Risk updated ✓" });
          insertAuditLog.mutate({ userLabel: actorLabel, action: `Updated risk id=${id}: status=${editingRisk.status}`, logType: "action" });
          setEditingRisk(null);
        },
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleDeleteRisk = (id: number, desc: string) => {
    deleteRisk.mutate(id, {
      onSuccess: () => {
        toast({ title: "Risk removed ✓" });
        insertAuditLog.mutate({ userLabel: actorLabel, action: `Deleted risk: "${desc.slice(0, 60)}"`, logType: "action" });
      },
      onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
    });
  };

  const handleCreateRisk = () => {
    if (!newRisk.risk_description) { toast({ title: "Risk description required", variant: "destructive" }); return; }
    createRisk.mutate(
      { ...newRisk, campus_id: campusId, impact: newRisk.impact as "low"|"medium"|"high"|"critical", probability: newRisk.probability as "low"|"medium"|"high", status: newRisk.status as "open"|"mitigated"|"closed" },
      {
        onSuccess: () => {
          toast({ title: "Risk added ✓" });
          insertAuditLog.mutate({ userLabel: actorLabel, action: `Created risk: "${newRisk.risk_description.slice(0,60)}"`, logType: "action" });
          setNewRisk({ risk_description: "", impact: "medium", probability: "medium", mitigation: "", owner_label: "", status: "open" });
          setNewRiskOpen(false);
        },
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleSaveProject = (id: number) => {
    if (!editingProject) return;
    updateProject.mutate(
      { id, status: editingProject.status as "Planned"|"In Progress"|"Completed"|"On Hold"|"Cancelled", spent_inr: Number(editingProject.spent_inr), timeline_pct: Number(editingProject.timeline_pct) },
      {
        onSuccess: () => {
          toast({ title: "Project updated ✓" });
          insertAuditLog.mutate({ userLabel: actorLabel, action: `Updated project id=${id}: status=${editingProject.status}, spent=${editingProject.spent_inr}`, logType: "action" });
          setEditingProject(null);
        },
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleCreateProject = () => {
    if (!newProject.name) { toast({ title: "Project name required", variant: "destructive" }); return; }
    createProject.mutate(
      {
        campus_id: campusId, name: newProject.name, summary: newProject.summary,
        category: newProject.category, status: newProject.status as "Planned"|"In Progress"|"Completed"|"On Hold"|"Cancelled",
        budget_inr: newProject.budget_inr ? Number(newProject.budget_inr) : null,
        carbon_reduction_t_yr: newProject.carbon_reduction_t_yr ? Number(newProject.carbon_reduction_t_yr) : null,
        roi_pct: newProject.roi_pct ? Number(newProject.roi_pct) : null,
        risk_level: newProject.risk_level as "Low"|"Medium"|"High",
        spent_inr: 0, timeline_pct: 0,
      },
      {
        onSuccess: () => {
          toast({ title: "Project created ✓" });
          insertAuditLog.mutate({ userLabel: actorLabel, action: `Created project: "${newProject.name}"`, logType: "action" });
          setNewProject({ name: "", summary: "", category: "Renewable Energy", status: "Planned", budget_inr: "", carbon_reduction_t_yr: "", roi_pct: "", risk_level: "Low" });
          setNewProjectOpen(false);
        },
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleDeleteProject = (id: number, name: string) => {
    deleteProject.mutate(id, {
      onSuccess: () => {
        toast({ title: "Project deleted" });
        insertAuditLog.mutate({ userLabel: actorLabel, action: `Deleted project: "${name}"`, logType: "action" });
      },
      onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
    });
  };
  
  const handleCreateChallenge = () => {
    if (!newChallenge.title || !newChallenge.start_date || !newChallenge.end_date) {
      toast({ title: "Title, start date and end date are required", variant: "destructive" }); return;
    }
    createChallenge.mutate(
      {
        title: newChallenge.title,
        description: newChallenge.description,
        category: newChallenge.category,
        start_date: newChallenge.start_date,
        end_date: newChallenge.end_date,
        reward_points: Number(newChallenge.reward_points) || 0,
        max_participants: newChallenge.max_participants ? Number(newChallenge.max_participants) : null,
      },
      {
        onSuccess: () => {
          toast({ title: "Challenge created ✓" });
          insertAuditLog.mutate({ userLabel: actorLabel, action: `Created challenge: ${newChallenge.title}`, logType: "action" });
          setNewChallenge({ title: "", description: "", category: "Energy", start_date: "", end_date: "", reward_points: "200", max_participants: "" });
        },
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleDeleteChallenge = (id: number, title: string) => {
    deleteChallenge.mutate(id, {
      onSuccess: () => {
        toast({ title: "Challenge deleted" });
        insertAuditLog.mutate({ userLabel: actorLabel, action: `Deleted challenge: ${title}`, logType: "action" });
      },
      onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
    });
  };

  const handleCompleteChallenge = (id: number, title: string, rewardPoints: number) => {
    completeChallenge.mutate(
      { challengeId: id, rewardPoints },
      {
        onSuccess: (result: any) => {
          const users = result?.credited ?? 0;
          const depts = result?.departments ?? 0;
          toast({
            title: `Challenge validated ✓`,
            description: depts > 0
              ? `"${title}" completed. ${rewardPoints} pts credited to ${users} participant(s) across ${depts} department(s) — check the Departments tab on the Leaderboard.`
              : `"${title}" completed. ${users} participant(s) found but no department data — points not credited. Ensure users have a department assigned.`,
          });
          insertAuditLog.mutate({
            userLabel: actorLabel,
            action: `Validated challenge "${title}" — ${users} participants, ${depts} departments credited ${rewardPoints} pts`,
            logType: "action",
          });
        },
        onError: (e) => toast({ title: "Validation error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.event_date) {
      toast({ title: "Title and date are required", variant: "destructive" }); return;
    }
    createEvent.mutate(
      {
        title: newEvent.title,
        event_date: newEvent.event_date,
        location: newEvent.location,
        event_type: newEvent.event_type,
        max_attendees: newEvent.max_attendees ? Number(newEvent.max_attendees) : null,
      },
      {
        onSuccess: () => {
          toast({ title: "Event created ✓" });
          insertAuditLog.mutate({ userLabel: actorLabel, action: `Created event: ${newEvent.title}`, logType: "action" });
          setNewEvent({ title: "", event_date: "", location: "", event_type: "Workshop", max_attendees: "" });
        },
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleDeleteEvent = (id: number, title: string) => {
    deleteEvent.mutate(id, {
      onSuccess: () => {
        toast({ title: "Event deleted" });
        insertAuditLog.mutate({ userLabel: actorLabel, action: `Deleted event: ${title}`, logType: "action" });
      },
      onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
    });
  };

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
            <TabsTrigger value="engagement" className="gap-1"><Award className="w-3.5 h-3.5" />Engagement</TabsTrigger>
            <TabsTrigger value="planning" className="gap-1"><Map className="w-3.5 h-3.5" />Planning</TabsTrigger>
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

          {/* ── Engagement tab ─────────────────────────────────────────── */}
          <TabsContent value="engagement" className="mt-4 space-y-6">

            {/* Eco Challenges */}
            <Card className="premium-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />Eco Challenges
                </CardTitle>
                <Button size="sm" className="premium-button gap-1 h-7 text-xs"
                  onClick={() => setNewChallenge({ title: "", description: "", category: "Energy", start_date: "", end_date: "", reward_points: "200", max_participants: "" })}>
                  <Plus className="w-3 h-3" />New Challenge
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {loadingChallenges ? (
                  <div className="p-4 space-y-2">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {challenges.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="text-sm font-medium">{c.title}</TableCell>
                          <TableCell className="text-xs">{c.category}</TableCell>
                          <TableCell>
                            <Badge variant={c.status === "active" ? "default" : "outline"} className="text-[10px] capitalize">{c.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{c.reward_points} pts</TableCell>
                          <TableCell className="text-xs">
                            {c.participant_count}{c.max_participants ? ` / ${c.max_participants}` : ""}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{c.end_date}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {c.status !== "completed" && (
                                <Button
                                  size="sm" variant="outline"
                                  className="h-7 text-xs gap-1 text-emerald-500 border-emerald-500/40 hover:bg-emerald-500/10"
                                  disabled={completeChallenge.isPending}
                                  onClick={() => handleCompleteChallenge(c.id, c.title, c.reward_points ?? 0)}
                                  title="Mark as complete and credit points to all participants on leaderboard"
                                >
                                  <CheckCircle2 className="w-3 h-3" />Validate
                                </Button>
                              )}
                              <Button size="sm" variant="destructive" className="h-7 text-xs gap-1"
                                disabled={deleteChallenge.isPending}
                                onClick={() => handleDeleteChallenge(c.id, c.title)}>
                                <Trash2 className="w-3 h-3" />Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {challenges.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">No challenges yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Create Challenge inline form */}
            <Card className="premium-card border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Add New Challenge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Title *</Label>
                    <Input value={newChallenge.title} onChange={e => setNewChallenge(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Reduce electricity 10%" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Category</Label>
                    <Select value={newChallenge.category} onValueChange={v => setNewChallenge(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Energy","Carbon","Water","Waste","Transport","Community","Biodiversity","Renewable"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description</Label>
                  <Input value={newChallenge.description} onChange={e => setNewChallenge(p => ({ ...p, description: e.target.value }))} placeholder="Brief description…" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Start Date *</Label>
                    <Input type="date" value={newChallenge.start_date} onChange={e => setNewChallenge(p => ({ ...p, start_date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">End Date *</Label>
                    <Input type="date" value={newChallenge.end_date} onChange={e => setNewChallenge(p => ({ ...p, end_date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Reward Pts</Label>
                    <Input type="number" value={newChallenge.reward_points} onChange={e => setNewChallenge(p => ({ ...p, reward_points: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max Participants</Label>
                    <Input type="number" placeholder="Unlimited" value={newChallenge.max_participants} onChange={e => setNewChallenge(p => ({ ...p, max_participants: e.target.value }))} />
                  </div>
                </div>
                <Button className="premium-button gap-1 text-xs" size="sm" onClick={handleCreateChallenge} disabled={createChallenge.isPending}>
                  <Plus className="w-3 h-3" />{createChallenge.isPending ? "Creating…" : "Create Challenge"}
                </Button>
              </CardContent>
            </Card>

            {/* Community Events */}
            <Card className="premium-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />Community Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingEvents ? (
                  <div className="p-4 space-y-2">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>RSVPs</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map(ev => (
                        <TableRow key={ev.id}>
                          <TableCell className="text-sm font-medium">{ev.title}</TableCell>
                          <TableCell className="text-xs">{ev.event_date}</TableCell>
                          <TableCell className="text-xs">{ev.location ?? "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{ev.event_type ?? "Event"}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {ev.rsvp_count}{ev.max_attendees ? ` / ${ev.max_attendees}` : ""}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="destructive" className="h-7 text-xs gap-1"
                              disabled={deleteEvent.isPending}
                              onClick={() => handleDeleteEvent(ev.id, ev.title)}>
                              <Trash2 className="w-3 h-3" />Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {events.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">No events yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Create Event inline form */}
            <Card className="premium-card border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Add New Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Title *</Label>
                    <Input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Green Campus Fair 2026" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Type</Label>
                    <Select value={newEvent.event_type} onValueChange={v => setNewEvent(p => ({ ...p, event_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Workshop","Conference","Tour","Seminar","Fair","Webinar","Other"].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Event Date *</Label>
                    <Input type="date" value={newEvent.event_date} onChange={e => setNewEvent(p => ({ ...p, event_date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Location</Label>
                    <Input value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Main Auditorium" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max Attendees</Label>
                    <Input type="number" placeholder="Unlimited" value={newEvent.max_attendees} onChange={e => setNewEvent(p => ({ ...p, max_attendees: e.target.value }))} />
                  </div>
                </div>
                <Button className="premium-button gap-1 text-xs" size="sm" onClick={handleCreateEvent} disabled={createEvent.isPending}>
                  <Plus className="w-3 h-3" />{createEvent.isPending ? "Creating…" : "Create Event"}
                </Button>
              </CardContent>
            </Card>

          </TabsContent>

          {/* ── Planning Tab ─────────────────────────────────────────── */}
          <TabsContent value="planning" className="mt-4 space-y-6">

            {/* Role info banner */}
            <Card className="glass-card grain-overlay border-blue-500/20">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-400">Admin — Planning Manager</span>
                    <p className="mt-0.5">You can edit phase progress &amp; spend, manage risks (create / update / delete), and manage projects (create / update / delete). Facility Manager can also edit phases &amp; project status. Finance &amp; Faculty have read-only access. Student Leads do not see Planning.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Roadmap Phases ── */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Map className="w-4 h-4 text-primary" />Roadmap Phases — Progress &amp; Budget</h3>
              {loadingPhases ? <Skeleton className="h-40 w-full" /> : (
                <Card className="premium-card">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Phase</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Progress %</TableHead>
                          <TableHead>Budget (Rs.M)</TableHead>
                          <TableHead>Spent (Rs.M)</TableHead>
                          <TableHead>Risk</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {phases.map(p => (
                          <TableRow key={p.id}>
                            <TableCell className="text-xs font-medium">{p.phase_number}</TableCell>
                            <TableCell className="text-xs max-w-[180px] truncate">{p.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{p.start_date.slice(0,7)} → {p.end_date.slice(0,7)}</TableCell>
                            <TableCell>
                              {editingPhase?.id === p.id
                                ? <Input type="number" className="h-7 w-20 text-xs" value={editingPhase.progress_pct} onChange={e => setEditingPhase(ep => ep ? {...ep, progress_pct: e.target.value} : ep)} min={0} max={100} />
                                : <span className="text-xs">{p.progress_pct ?? 0}%</span>}
                            </TableCell>
                            <TableCell className="text-xs">{((p.budget_inr ?? 0)/1e6).toFixed(1)}</TableCell>
                            <TableCell>
                              {editingPhase?.id === p.id
                                ? <Input type="number" className="h-7 w-24 text-xs" value={editingPhase.spent_inr} onChange={e => setEditingPhase(ep => ep ? {...ep, spent_inr: e.target.value} : ep)} />
                                : <span className="text-xs">{((p.spent_inr ?? 0)/1e6).toFixed(1)}</span>}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-[10px] ${p.risk_level === "low" ? "text-emerald-400" : p.risk_level === "medium" ? "text-yellow-400" : p.risk_level === "high" ? "text-orange-400" : "text-red-400"}`}>{p.risk_level}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {editingPhase?.id === p.id ? (
                                <div className="flex gap-1 justify-end">
                                  <Button size="sm" className="h-7 text-xs premium-button" onClick={() => handleSavePhase(p.id)} disabled={updatePhase.isPending}>Save</Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingPhase(null)}>Cancel</Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setEditingPhase({ id: p.id, progress_pct: String(p.progress_pct ?? 0), spent_inr: String(p.spent_inr ?? 0) })}>
                                  <Edit2 className="w-3 h-3" />Edit
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── Risk Register ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" />Risk Register</h3>
                <Button size="sm" className="premium-button gap-1 text-xs" onClick={() => setNewRiskOpen(true)}>
                  <Plus className="w-3 h-3" />Add Risk
                </Button>
              </div>

              {/* New Risk Dialog */}
              <Dialog open={newRiskOpen} onOpenChange={setNewRiskOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle className="text-sm">Add New Risk</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Risk Description *</Label>
                      <Input value={newRisk.risk_description} onChange={e => setNewRisk(r => ({...r, risk_description: e.target.value}))} placeholder="Describe the risk..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Impact</Label>
                        <Select value={newRisk.impact} onValueChange={v => setNewRisk(r => ({...r, impact: v}))}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>{["low","medium","high","critical"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Probability</Label>
                        <Select value={newRisk.probability} onValueChange={v => setNewRisk(r => ({...r, probability: v}))}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>{["low","medium","high"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Mitigation Strategy</Label>
                      <Input value={newRisk.mitigation} onChange={e => setNewRisk(r => ({...r, mitigation: e.target.value}))} placeholder="How will this be mitigated?" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Owner</Label>
                        <Input value={newRisk.owner_label} onChange={e => setNewRisk(r => ({...r, owner_label: e.target.value}))} placeholder="e.g. Finance Office" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Status</Label>
                        <Select value={newRisk.status} onValueChange={v => setNewRisk(r => ({...r, status: v}))}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>{["open","mitigated","closed"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" size="sm" onClick={() => setNewRiskOpen(false)}>Cancel</Button>
                    <Button className="premium-button gap-1 text-xs" size="sm" onClick={handleCreateRisk} disabled={createRisk.isPending}>
                      <Plus className="w-3 h-3" />{createRisk.isPending ? "Adding…" : "Add Risk"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {loadingRisks ? <Skeleton className="h-40 w-full" /> : (
                <Card className="premium-card">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Risk</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Impact</TableHead>
                          <TableHead>Prob.</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Mitigation</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {risks.map(r => (
                          <TableRow key={r.id}>
                            <TableCell className="text-xs max-w-[200px]">{r.risk_description}</TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{r.owner_label ?? "—"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-[10px] ${r.impact === "low" ? "text-emerald-400" : r.impact === "medium" ? "text-yellow-400" : r.impact === "high" ? "text-orange-400" : "text-red-400"}`}>{r.impact}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{r.probability}</TableCell>
                            <TableCell>
                              {editingRisk?.id === r.id
                                ? <Select value={editingRisk.status} onValueChange={v => setEditingRisk(er => er ? {...er, status: v} : er)}>
                                    <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>{["open","mitigated","closed"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                                  </Select>
                                : <Badge variant="outline" className={`text-[10px] ${r.status === "open" ? "text-red-400" : r.status === "mitigated" ? "text-yellow-400" : "text-emerald-400"}`}>{r.status}</Badge>
                              }
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                              {editingRisk?.id === r.id
                                ? <Input className="h-7 text-xs" value={editingRisk.mitigation} onChange={e => setEditingRisk(er => er ? {...er, mitigation: e.target.value} : er)} />
                                : r.mitigation ?? "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingRisk?.id === r.id ? (
                                <div className="flex gap-1 justify-end">
                                  <Button size="sm" className="h-7 text-xs premium-button" onClick={() => handleSaveRisk(r.id)} disabled={updateRisk.isPending}>Save</Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingRisk(null)}>Cancel</Button>
                                </div>
                              ) : (
                                <div className="flex gap-1 justify-end">
                                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setEditingRisk({ id: r.id, status: r.status, mitigation: r.mitigation ?? "" })}>
                                    <Edit2 className="w-3 h-3" />Edit
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400 hover:text-red-300" onClick={() => handleDeleteRisk(r.id, r.risk_description)} disabled={deleteRisk.isPending}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── Projects ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2"><FolderKanban className="w-4 h-4 text-primary" />Campus Projects</h3>
                <Button size="sm" className="premium-button gap-1 text-xs" onClick={() => setNewProjectOpen(true)}>
                  <Plus className="w-3 h-3" />Add Project
                </Button>
              </div>

              {/* New Project Dialog */}
              <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle className="text-sm">Add New Project</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Project Name *</Label>
                      <Input value={newProject.name} onChange={e => setNewProject(p => ({...p, name: e.target.value}))} placeholder="e.g. Solar Rooftop Phase 3" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Summary</Label>
                      <Input value={newProject.summary} onChange={e => setNewProject(p => ({...p, summary: e.target.value}))} placeholder="Short description..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Category</Label>
                        <Select value={newProject.category} onValueChange={v => setNewProject(p => ({...p, category: v}))}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>{["Renewable Energy","Energy Efficiency","Carbon Sequestration","Transport","Water","Waste","Other"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Status</Label>
                        <Select value={newProject.status} onValueChange={v => setNewProject(p => ({...p, status: v}))}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>{["Planned","In Progress","Completed","On Hold","Cancelled"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Budget (Rs.)</Label>
                        <Input type="number" value={newProject.budget_inr} onChange={e => setNewProject(p => ({...p, budget_inr: e.target.value}))} placeholder="e.g. 5000000" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">CO₂ t/yr</Label>
                        <Input type="number" value={newProject.carbon_reduction_t_yr} onChange={e => setNewProject(p => ({...p, carbon_reduction_t_yr: e.target.value}))} placeholder="e.g. 50" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Est. ROI %</Label>
                        <Input type="number" value={newProject.roi_pct} onChange={e => setNewProject(p => ({...p, roi_pct: e.target.value}))} placeholder="e.g. 18" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Risk Level</Label>
                      <Select value={newProject.risk_level} onValueChange={v => setNewProject(p => ({...p, risk_level: v}))}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>{["Low","Medium","High"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" size="sm" onClick={() => setNewProjectOpen(false)}>Cancel</Button>
                    <Button className="premium-button gap-1 text-xs" size="sm" onClick={handleCreateProject} disabled={createProject.isPending}>
                      <Plus className="w-3 h-3" />{createProject.isPending ? "Creating…" : "Create Project"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {loadingProjects ? <Skeleton className="h-40 w-full" /> : (
                <Card className="premium-card">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Budget (Rs.)</TableHead>
                          <TableHead>Spent (Rs.)</TableHead>
                          <TableHead>Timeline %</TableHead>
                          <TableHead>CO₂ t/yr</TableHead>
                          <TableHead>Risk</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminProjects.map(p => (
                          <TableRow key={p.id}>
                            <TableCell className="text-xs font-medium max-w-[160px] truncate">{p.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{p.category ?? "—"}</TableCell>
                            <TableCell>
                              {editingProject?.id === p.id
                                ? <Select value={editingProject.status} onValueChange={v => setEditingProject(ep => ep ? {...ep, status: v} : ep)}>
                                    <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>{["Planned","In Progress","Completed","On Hold","Cancelled"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                                  </Select>
                                : <Badge variant="outline" className={`text-[10px] ${p.status === "In Progress" ? "text-blue-400" : p.status === "Completed" ? "text-emerald-400" : p.status === "Planned" ? "text-yellow-400" : "text-orange-400"}`}>{p.status}</Badge>}
                            </TableCell>
                            <TableCell className="text-xs">{p.budget_inr ? `₹${(p.budget_inr/1e5).toFixed(1)}L` : "—"}</TableCell>
                            <TableCell>
                              {editingProject?.id === p.id
                                ? <Input type="number" className="h-7 w-24 text-xs" value={editingProject.spent_inr} onChange={e => setEditingProject(ep => ep ? {...ep, spent_inr: e.target.value} : ep)} />
                                : <span className="text-xs">{p.spent_inr ? `₹${(p.spent_inr/1e5).toFixed(1)}L` : "₹0"}</span>}
                            </TableCell>
                            <TableCell>
                              {editingProject?.id === p.id
                                ? <Input type="number" className="h-7 w-16 text-xs" value={editingProject.timeline_pct} onChange={e => setEditingProject(ep => ep ? {...ep, timeline_pct: e.target.value} : ep)} min={0} max={100} />
                                : <span className="text-xs">{p.timeline_pct ?? 0}%</span>}
                            </TableCell>
                            <TableCell className="text-xs">{p.carbon_reduction_t_yr?.toFixed(0) ?? "—"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-[10px] ${p.risk_level === "Low" ? "text-emerald-400" : p.risk_level === "Medium" ? "text-yellow-400" : "text-red-400"}`}>{p.risk_level}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {editingProject?.id === p.id ? (
                                <div className="flex gap-1 justify-end">
                                  <Button size="sm" className="h-7 text-xs premium-button" onClick={() => handleSaveProject(p.id)} disabled={updateProject.isPending}>Save</Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingProject(null)}>Cancel</Button>
                                </div>
                              ) : (
                                <div className="flex gap-1 justify-end">
                                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setEditingProject({ id: p.id, status: p.status, spent_inr: String(p.spent_inr ?? 0), timeline_pct: String(p.timeline_pct ?? 0) })}>
                                    <Edit2 className="w-3 h-3" />Edit
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400 hover:text-red-300" onClick={() => handleDeleteProject(p.id, p.name)} disabled={deleteProject.isPending}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

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