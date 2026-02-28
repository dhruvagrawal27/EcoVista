import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FolderOpen, IndianRupee, Leaf, TrendingUp, AlertTriangle, Clock, Brain, Target, Shield, BarChart3 } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const projects = [
  { id: 1, name: "Solar Expansion Phase 2", category: "Solar", status: "In Progress", budget: 12000000, spent: 5400000, carbonReduction: 420, roi: 22, timeline: 65, risk: "Low", aiScore: 94, summary: "Expand rooftop solar from 5MW to 8MW across 12 buildings.", npv: 8200000, irr: 18.4, payback: 3.5, dependencies: ["Grid upgrade", "Panel procurement"], milestones: [{ name: "Design Complete", done: true }, { name: "Procurement", done: true }, { name: "Installation Phase 1", done: false }, { name: "Commissioning", done: false }] },
  { id: 2, name: "Smart HVAC Retrofit", category: "HVAC", status: "In Progress", budget: 4500000, spent: 2100000, carbonReduction: 180, roi: 28, timeline: 45, risk: "Medium", aiScore: 88, summary: "AI-controlled HVAC optimization across top 20 buildings.", npv: 3800000, irr: 24.2, payback: 2.5, dependencies: ["Sensor deployment", "AI model training"], milestones: [{ name: "Audit", done: true }, { name: "Sensor Install", done: true }, { name: "AI Integration", done: false }, { name: "Full Rollout", done: false }] },
  { id: 3, name: "LED Campus Retrofit", category: "Retrofit", status: "Completed", budget: 2800000, spent: 2650000, carbonReduction: 65, roi: 35, timeline: 100, risk: "Low", aiScore: 96, summary: "Complete LED replacement across all campus common areas and corridors.", npv: 2400000, irr: 32, payback: 1.8, dependencies: [], milestones: [{ name: "Planning", done: true }, { name: "Procurement", done: true }, { name: "Installation", done: true }, { name: "Verification", done: true }] },
  { id: 4, name: "Battery Storage System", category: "EV", status: "Planned", budget: 8000000, spent: 0, carbonReduction: 150, roi: 15, timeline: 0, risk: "High", aiScore: 72, summary: "2MWh battery storage for peak shaving and solar energy storage.", npv: 4100000, irr: 14.8, payback: 4.2, dependencies: ["Solar Phase 2", "Grid interconnect approval"], milestones: [{ name: "Feasibility", done: false }, { name: "Design", done: false }, { name: "Installation", done: false }, { name: "Testing", done: false }] },
  { id: 5, name: "Waste-to-Energy Plant", category: "Waste", status: "Planned", budget: 18000000, spent: 0, carbonReduction: 210, roi: 12, timeline: 0, risk: "High", aiScore: 58, summary: "Biogas plant converting campus organic waste to energy.", npv: 5200000, irr: 11.2, payback: 6.8, dependencies: ["Environmental clearance", "Land allocation"], milestones: [{ name: "EIA Study", done: false }, { name: "Approval", done: false }, { name: "Construction", done: false }, { name: "Operations", done: false }] },
  { id: 6, name: "Green Roof Initiative", category: "Behavioral", status: "In Progress", budget: 5500000, spent: 1800000, carbonReduction: 35, roi: 10, timeline: 30, risk: "Low", aiScore: 81, summary: "Install green roofs on 8 campus buildings for insulation and biodiversity.", npv: 1900000, irr: 9.5, payback: 5.2, dependencies: ["Structural assessment"], milestones: [{ name: "Assessment", done: true }, { name: "Design", done: false }, { name: "Installation", done: false }, { name: "Planting", done: false }] },
];

const statusColor = (s: string) => s === "Completed" ? "default" : s === "In Progress" ? "secondary" : "outline";
const riskColor = (r: string) => r === "Low" ? "text-green-500" : r === "Medium" ? "text-yellow-500" : "text-red-500";

const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
const totalCarbon = projects.reduce((s, p) => s + p.carbonReduction, 0);
const avgRoi = +(projects.reduce((s, p) => s + p.roi, 0) / projects.length).toFixed(1);
const activeCount = projects.filter(p => p.status !== "Completed").length;

const ProjectDetail = ({ project }: { project: typeof projects[0] }) => {
  const radarData = [
    { metric: "ROI", value: Math.min(project.roi * 3, 100) },
    { metric: "Carbon Impact", value: Math.min(project.carbonReduction / 4.2, 100) },
    { metric: "AI Priority", value: project.aiScore },
    { metric: "Feasibility", value: 100 - (project.risk === "Low" ? 10 : project.risk === "Medium" ? 40 : 70) },
    { metric: "Progress", value: project.timeline },
  ];
  const projectionData = Array.from({ length: 10 }, (_, i) => ({
    year: 2025 + i,
    emissions: Math.round(project.carbonReduction * (1 - (i + 1) * 0.08)),
    savings: Math.round((project.budget * project.roi / 100) * (i + 1) * 0.1),
  }));

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <p className="text-sm text-muted-foreground">{project.summary}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-muted/50"><p className="text-xs text-muted-foreground">NPV</p><p className="text-sm font-bold">₹{(project.npv / 1000000).toFixed(1)}M</p></div>
        <div className="p-3 rounded-xl bg-muted/50"><p className="text-xs text-muted-foreground">IRR</p><p className="text-sm font-bold">{project.irr}%</p></div>
        <div className="p-3 rounded-xl bg-muted/50"><p className="text-xs text-muted-foreground">Payback</p><p className="text-sm font-bold">{project.payback} yrs</p></div>
        <div className="p-3 rounded-xl bg-muted/50"><p className="text-xs text-muted-foreground">AI Score</p><p className="text-sm font-bold">{project.aiScore}/100</p></div>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-2">Project Scorecard</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-2">Emission Impact Projection</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip />
              <Area type="monotone" dataKey="emissions" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} name="CO₂ Reduced (tons)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-2">Milestones</h4>
        <div className="space-y-2">
          {project.milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${m.done ? "bg-green-500" : "bg-muted-foreground/30"}`} />
              <span className={`text-sm ${m.done ? "text-foreground" : "text-muted-foreground"}`}>{m.name}</span>
            </div>
          ))}
        </div>
      </div>
      {project.dependencies.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Dependencies</h4>
          <div className="flex flex-wrap gap-2">
            {project.dependencies.map((d, i) => <Badge key={i} variant="outline">{d}</Badge>)}
          </div>
        </div>
      )}
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-1"><Brain className="w-4 h-4 text-primary" /><span className="text-sm font-semibold">AI Recommendation</span></div>
        <p className="text-xs text-muted-foreground">{project.aiScore >= 80 ? "High priority — proceed with accelerated timeline." : project.aiScore >= 60 ? "Moderate priority — review dependencies before proceeding." : "Lower priority — consider deferring to next fiscal cycle."}</p>
      </div>
    </div>
  );
};

const Projects = () => (
  <DashboardLayout title="Campus Projects" breadcrumb="Planning · Projects">
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Projects", value: activeCount, icon: FolderOpen },
          { label: "Total Budget", value: `₹${(totalBudget / 10000000).toFixed(1)} Cr`, icon: IndianRupee },
          { label: "Carbon Reduction", value: `${totalCarbon} tons/yr`, icon: Leaf },
          { label: "Avg ROI", value: `${avgRoi}%`, icon: TrendingUp },
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

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        {["all", "active", "planned", "completed"].map(tab => (
          <TabsContent key={tab} value={tab} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {projects.filter(p => tab === "all" || (tab === "active" && p.status === "In Progress") || (tab === "planned" && p.status === "Planned") || (tab === "completed" && p.status === "Completed")).map(p => (
              <Dialog key={p.id}>
                <DialogTrigger asChild>
                  <motion.div whileHover={{ y: -2 }} className="cursor-pointer">
                    <Card className="premium-card h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={statusColor(p.status)}>{p.status}</Badge>
                          <Badge variant="outline" className="text-xs">{p.category}</Badge>
                        </div>
                        <CardTitle className="text-sm mt-2">{p.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Carbon</span><p className="font-semibold">-{p.carbonReduction} t/yr</p></div>
                          <div><span className="text-muted-foreground">ROI</span><p className="font-semibold">{p.roi}%</p></div>
                          <div><span className="text-muted-foreground">Budget</span><p className="font-semibold">₹{(p.budget / 1000000).toFixed(1)}M</p></div>
                          <div className="flex items-center gap-1"><AlertTriangle className={`w-3 h-3 ${riskColor(p.risk)}`} /><span className={`font-semibold ${riskColor(p.risk)}`}>{p.risk}</span></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Progress</span><span>{p.timeline}%</span></div>
                          <Progress value={p.timeline} className="h-1.5" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs"><Brain className="w-3 h-3 text-primary" /><span>AI Score: <strong>{p.aiScore}</strong>/100</span></div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>{p.name}</DialogTitle></DialogHeader>
                  <ProjectDetail project={p} />
                </DialogContent>
              </Dialog>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" /><span>Last updated: 2 minutes ago</span>
        <span className="mx-2">•</span><Shield className="w-3 h-3" /><span>Data Confidence: 94%</span>
        <span className="mx-2">•</span><BarChart3 className="w-3 h-3" /><span>AI Model v3.2.1</span>
      </div>
    </div>
  </DashboardLayout>
);

export default Projects;
