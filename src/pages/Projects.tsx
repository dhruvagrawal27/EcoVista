import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FolderKanban, TrendingUp, Leaf, DollarSign, CheckCircle2, Clock, Flame } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useProjects } from "@/hooks/useProjects";
import type { ProjectWithDetails } from "@/hooks/useProjects";

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

function ProjectCard({ p }: { p: ProjectWithDetails }) {
  const spentPct = p.budget_inr ? Math.round(((p.spent_inr ?? 0) / p.budget_inr) * 100) : 0;
  const doneMilestones = p.milestones.filter(m => m.is_done).length;
  return (
    <Card className="glass-card grain-overlay">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-tight">{p.name}</CardTitle>
          <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[p.status] ?? ""}`}>{p.status}</Badge>
        </div>
        {p.summary && <p className="text-xs text-muted-foreground leading-relaxed">{p.summary}</p>}
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
  const { data: projects = [], isLoading } = useProjects(campusId);

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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
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
            {projects.map(p => <ProjectCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
