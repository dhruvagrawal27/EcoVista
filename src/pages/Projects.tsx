import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FolderKanban, TrendingUp, Leaf, DollarSign, CheckCircle2, Clock, Flame, Info, Edit2 } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useAuth } from "@/context/AuthContext";
import { useProjects, useUpdateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import type { ProjectWithDetails } from "@/hooks/useProjects";
import type { RoleName } from "@/context/AuthContext";

const statusColors: Record<string, string> = {
  "In Progress": "text-blue-400 border-blue-500/30",
  Completed: "text-emerald-400 border-emerald-500/30",
  Planned: "text-yellow-400 border-yellow-500/30",
  "On Hold": "text-orange-400 border-orange-500/30",
  Cancelled: "text-red-400 border-red-500/30",
};

const riskColors: Record<string, string> = {
  Low: "text-emerald-400",
  Medium: "text-yellow-400",
  High: "text-red-400",
};

const CHART_TICK = "hsl(215 16% 55%)";

const ROLE_INFO: Partial<Record<NonNullable<RoleName>, { color: string; msg: string }>> = {
  "Admin": {
    color: "text-violet-400 border-violet-500/20",
    msg: "Full access — you can inline-edit project status, actual spend, and timeline progress. Add or delete projects in Admin → Planning tab.",
  },
  "Facility Manager": {
    color: "text-blue-400 border-blue-500/20",
    msg: "You can inline-edit project status, actual spend, and timeline %. To add or delete projects go to Admin → Planning.",
  },
  "Finance": {
    color: "text-emerald-400 border-emerald-500/20",
    msg: "Read-only view of all campus projects, budgets, ROI, and CO₂ reduction targets. Contact Facility Manager or Admin for changes.",
  },
  "Faculty": {
    color: "text-yellow-400 border-yellow-500/20",
    msg: "Read-only view of sustainability projects and their current status.",
  },
};

interface ProjectCardProps {
  p: ProjectWithDetails;
  canEdit?: boolean;
  onEdit?: (p: ProjectWithDetails) => void;
}

function ProjectCard({ p, canEdit, onEdit }: ProjectCardProps) {
  const spentPct = p.budget_inr ? Math.round(((p.spent_inr ?? 0) / p.budget_inr) * 100) : 0;
  const doneMilestones = p.milestones.filter(m => m.is_done).length;
  return (
    <Card className="glass-card grain-overlay">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold leading-tight">{p.name}</CardTitle>
            {p.created_at && (
              <p className="text-[10px] text-muted-foreground opacity-60 mt-0.5">
                Created {new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                {p.updated_at !== p.created_at && ` · Updated ${new Date(p.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className={`text-[10px] ${statusColors[p.status] ?? ""}`}>{p.status}</Badge>
            {canEdit && onEdit && (
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onClick={() => onEdit(p)}>
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        {p.summary && <p className="text-xs text-muted-foreground leading-relaxed mt-1">{p.summary}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Budget */}
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Budget Utilisation</span>
            <span>₹{(p.spent_inr ?? 0).toLocaleString()} / ₹{(p.budget_inr ?? 0).toLocaleString()}</span>
          </div>
          <Progress value={Math.min(spentPct, 100)} className="h-1.5" />
        </div>
        {/* Timeline */}
        {p.timeline_pct != null && (
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Timeline</span><span>{p.timeline_pct}%</span>
            </div>
            <Progress value={p.timeline_pct} className="h-1.5" />
          </div>
        )}
        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="bg-muted/30 rounded p-1.5">
            <p className="font-semibold text-foreground">{p.roi_pct?.toFixed(1) ?? "—"}%</p>
            <p className="text-muted-foreground">ROI</p>
          </div>
          <div className="bg-muted/30 rounded p-1.5">
            <p className="font-semibold text-foreground">{p.carbon_reduction_t_yr?.toFixed(1) ?? "—"} t</p>
            <p className="text-muted-foreground">CO₂/yr</p>
          </div>
          <div className="bg-muted/30 rounded p-1.5">
            <p className={`font-semibold ${riskColors[p.risk_level ?? ""] ?? "text-foreground"}`}>{p.risk_level ?? "—"}</p>
            <p className="text-muted-foreground">Risk</p>
          </div>
        </div>
        {/* Milestones */}
        {p.milestones.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Milestones ({doneMilestones}/{p.milestones.length})</p>
            <div className="space-y-1">
              {p.milestones.slice(0, 4).map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  {m.is_done ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-muted-foreground" />}
                  <span className={m.is_done ? "text-muted-foreground line-through" : "text-foreground"}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Dependencies */}
        {p.dependencies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.dependencies.map((d, i) => (
              <Badge key={i} variant="secondary" className="text-[9px] h-4">{d.depends_on_label}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const Projects = () => {
  const { campusId } = useCampusContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const role = user?.role_name ?? null;
  const canEdit = role === "Admin" || role === "Facility Manager";

  const { data: projects = [], isLoading } = useProjects(campusId);
  const updateProject = useUpdateProject(campusId);

  // Inline edit dialog state
  const [editingProject, setEditingProject] = useState<{ id: number; status: string; spent_inr: string; timeline_pct: string } | null>(null);

  const handleSaveProject = () => {
    if (!editingProject) return;
    updateProject.mutate(
      {
        id: editingProject.id,
        status: editingProject.status as ProjectWithDetails["status"],
        spent_inr: Number(editingProject.spent_inr),
        timeline_pct: Number(editingProject.timeline_pct),
      },
      {
        onSuccess: () => { toast({ title: "Project updated ✓" }); setEditingProject(null); },
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const ri = role ? (ROLE_INFO[role] ?? null) : null;

  const active = projects.filter(p => p.status === "In Progress" || p.status === "Planned");
  const totalBudget = projects.reduce((s, p) => s + (p.budget_inr ?? 0), 0);
  const totalCarbon = projects.reduce((s, p) => s + (p.carbon_reduction_t_yr ?? 0), 0);
  const avgRoi = projects.length > 0
    ? projects.reduce((s, p) => s + (p.roi_pct ?? 0), 0) / projects.length
    : 0;

  const categoryData = Array.from(
    projects.reduce((map, p) => {
      const cat = p.category ?? "Other";
      map.set(cat, (map.get(cat) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).map(([category, count]) => ({ category, count }));

  return (
    <DashboardLayout title="Projects" breadcrumb="Projects · Sustainability Initiatives">
      <div className="max-w-[1400px] mx-auto space-y-4">

        {/* Role info banner */}
        {ri && (
          <Card className={`glass-card grain-overlay border ${ri.color.split(" ")[1]}`}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start gap-2 text-xs">
                <Info className={`w-4 h-4 shrink-0 mt-0.5 ${ri.color.split(" ")[0]}`} />
                <div>
                  <span className={`font-semibold ${ri.color.split(" ")[0]}`}>{role}</span>
                  <span className="text-muted-foreground ml-2">{ri.msg}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inline edit dialog */}
        {canEdit && editingProject && (() => {
          const proj = projects.find(p => p.id === editingProject.id);
          return (
            <Card className="glass-card grain-overlay border border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-primary" />Editing: {proj?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Select value={editingProject.status} onValueChange={v => setEditingProject(ep => ep ? {...ep, status: v} : ep)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{["Planned","In Progress","Completed","On Hold","Cancelled"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Spent (Rs.)</p>
                    <Input type="number" className="h-9 text-xs" value={editingProject.spent_inr} onChange={e => setEditingProject(ep => ep ? {...ep, spent_inr: e.target.value} : ep)} />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Timeline %</p>
                    <Input type="number" className="h-9 text-xs" value={editingProject.timeline_pct} min={0} max={100} onChange={e => setEditingProject(ep => ep ? {...ep, timeline_pct: e.target.value} : ep)} />
                  </div>
                  <div className="flex gap-2">
                    <Button className="premium-button text-xs flex-1" size="sm" onClick={handleSaveProject} disabled={updateProject.isPending}>
                      {updateProject.isPending ? "Saving…" : "Save"}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditingProject(null)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />) : [
            { label: "Active Projects", value: active.length.toString(), icon: FolderKanban },
            { label: "Total Budget", value: `₹${(totalBudget / 1e7).toFixed(1)}Cr`, icon: DollarSign },
            { label: "CO₂ Reduction", value: `${totalCarbon.toFixed(0)} t/yr`, icon: Leaf },
            { label: "Avg ROI", value: `${avgRoi.toFixed(1)}%`, icon: TrendingUp },
          ].map(item => (
            <motion.div key={item.label} whileHover={{ y: -2 }}>
              <Card className="glass-card grain-overlay">
                <CardContent className="pt-4 pb-3 text-center">
                  <item.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Category breakdown */}
        {!isLoading && categoryData.length > 0 && (
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />Projects by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: CHART_TICK }} tickLine={{ stroke: CHART_TICK }} axisLine={{ stroke: CHART_TICK }} />
                  <YAxis tick={{ fontSize: 10, fill: CHART_TICK }} tickLine={{ stroke: CHART_TICK }} axisLine={{ stroke: CHART_TICK }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(10,10,20,0.92)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#e2e8f0" }} />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Projects" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Project cards grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : projects.length === 0 ? (
          <Card className="glass-card grain-overlay">
            <CardContent className="py-16 text-center text-muted-foreground text-sm">No projects found</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map(p => (
              <ProjectCard
                key={p.id}
                p={p}
                canEdit={canEdit}
                onEdit={proj => setEditingProject({ id: proj.id, status: proj.status, spent_inr: String(proj.spent_inr ?? 0), timeline_pct: String(proj.timeline_pct ?? 0) })}
              />
            ))}
          </div>
        )}
        {canEdit && (
          <p className="text-xs text-muted-foreground text-center py-1">
            To <strong>add or delete projects</strong>, go to <strong>Admin → Planning</strong> tab.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
