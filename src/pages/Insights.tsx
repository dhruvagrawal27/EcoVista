import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Brain, CheckCircle2, Clock, Lightbulb, ThumbsUp, Eye, X, Info, Plus } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useAuth } from "@/context/AuthContext";
import type { RoleName } from "@/context/AuthContext";
import { useAIRecommendations, useAITrustScore, useMLModelPerformance, useUpdateRecommendationStatus, useCreateRecommendation } from "@/hooks/useAI";
import { useActiveMLModel } from "@/hooks/useEnergy";
import { useToast } from "@/hooks/use-toast";
import type { AIRecommendationSortBy } from "@/hooks/useAI";
import type { AIRecommendation } from "@/lib/types";

const ROLE_INFO: Partial<Record<NonNullable<RoleName>, { color: string; msg: string }>> = {
  Admin: { color: "text-violet-400 border-violet-500/20", msg: "Full access — create recommendations, approve, implement, and reject." },
  "Facility Manager": { color: "text-blue-400 border-blue-500/20", msg: "Full action access — create recommendations and manage all statuses." },
  Finance: { color: "text-emerald-400 border-emerald-500/20", msg: "You can approve and implement recommendations. Cannot create new ones." },
  Faculty: { color: "text-yellow-400 border-yellow-500/20", msg: "View-only — browse recommendations and AI model performance." },
};

const sortOptions: { key: AIRecommendationSortBy; label: string }[] = [
  { key: "roi_pct", label: "ROI" },
  { key: "carbon_impact", label: "Carbon Impact" },
  { key: "ease_score", label: "Ease" },
];

const Insights = () => {
  const { campusId } = useCampusContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const role = user?.role_name as RoleName | undefined;
  const canAct = role === "Admin" || role === "Facility Manager" || role === "Finance";
  const canCreate = role === "Admin" || role === "Facility Manager";

  const [sortBy, setSortBy] = useState<AIRecommendationSortBy>("roi_pct");
  const [addRecOpen, setAddRecOpen] = useState(false);
  const [newRec, setNewRec] = useState({ title: "", description: "", category: "", roi_pct: 0, carbon_impact: 0, ease_score: 0, confidence_pct: 0, priority: "medium" });

  const { data: recommendations = [], isLoading: loadingRecs } = useAIRecommendations(campusId, sortBy);
  const { data: trustScore, isLoading: loadingTrust } = useAITrustScore(campusId);
  const { data: modelPerformance = [], isLoading: loadingModel } = useMLModelPerformance(30);
  const { data: activeModel } = useActiveMLModel();
  const modelLabel = activeModel ? `${activeModel.name} v${activeModel.version}` : "Model v3.2.1";

  const updateStatus = useUpdateRecommendationStatus();
  const createRec = useCreateRecommendation(campusId);

  const adopted = recommendations.filter(r => r.status === "implemented").length;
  const adoptionRate = recommendations.length > 0 ? Math.round((adopted / recommendations.length) * 100) : 0;
  const modelChartData = modelPerformance.map(m => ({ day: new Date(m.report_date).getDate(), accuracy: m.accuracy ?? 0 }));
  const trustComponents = trustScore ? [
    { name: "Prediction Accuracy", score: trustScore.prediction_accuracy ?? 0 },
    { name: "Data Quality", score: trustScore.data_quality ?? 0 },
    { name: "Model Stability", score: trustScore.model_stability ?? 0 },
    { name: "Recommendation Relevance", score: trustScore.recommendation_relevance ?? 0 },
  ] : [];
  const quickWins = recommendations.filter(r => (r.roi_pct ?? 0) > 20 && (r.ease_score ?? 0) > 70).length;
  const strategic = recommendations.filter(r => (r.roi_pct ?? 0) > 20 && (r.ease_score ?? 0) <= 70).length;
  const easyFixes = recommendations.filter(r => (r.roi_pct ?? 0) <= 20 && (r.ease_score ?? 0) > 70).length;
  const deprioritize = recommendations.filter(r => (r.roi_pct ?? 0) <= 20 && (r.ease_score ?? 0) <= 70).length;

  const handleStatusChange = (rec: AIRecommendation, newStatus: AIRecommendation["status"]) => {
    updateStatus.mutate(
      { id: rec.id, status: newStatus },
      {
        onSuccess: () => toast({ title: `Recommendation ${newStatus}`, description: rec.title }),
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleAddRec = () => {
    createRec.mutate(newRec, {
      onSuccess: () => {
        setAddRecOpen(false);
        setNewRec({ title: "", description: "", category: "", roi_pct: 0, carbon_impact: 0, ease_score: 0, confidence_pct: 0, priority: "medium" });
        toast({ title: "Recommendation added" });
      },
      onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
    });
  };

  const ri = role ? (ROLE_INFO[role] ?? null) : null;

  const statusActionMap: Record<string, { next: AIRecommendation["status"]; label: string; icon: React.ElementType; color: string }[]> = {
    new: [
      { next: "in-review", label: "Review", icon: Eye, color: "text-blue-400" },
      { next: "approved", label: "Approve", icon: ThumbsUp, color: "text-emerald-400" },
    ],
    "in-review": [
      { next: "approved", label: "Approve", icon: ThumbsUp, color: "text-emerald-400" },
      { next: "rejected", label: "Reject", icon: X, color: "text-destructive" },
    ],
    approved: [
      { next: "implemented", label: "Mark Done", icon: CheckCircle2, color: "text-emerald-400" },
      { next: "rejected", label: "Reject", icon: X, color: "text-destructive" },
    ],
    implemented: [],
    rejected: [
      { next: "new", label: "Reopen", icon: Lightbulb, color: "text-primary" },
    ],
  };

  return (
    <DashboardLayout title="AI Insights" breadcrumb="AI Recommendations">
      <div className="max-w-[1400px] mx-auto space-y-4">
        {/* Role banner */}
        {ri && (
          <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${ri.color}`}>
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span><strong>{role}</strong> — {ri.msg}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><Brain className="w-3 h-3" /> AI Engine</Badge>
          <span>{modelLabel}</span>
          {loadingTrust ? <Skeleton className="h-4 w-24 ml-auto" /> : <Badge variant="outline" className="gap-1 ml-auto">Trust Score: {trustScore?.overall_score ?? "--"}%</Badge>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loadingTrust ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />) : trustComponents.map(c => (
            <motion.div key={c.name} whileHover={{ y: -2 }}>
              <Card className="glass-card grain-overlay">
                <CardContent className="pt-4 pb-3 text-center">
                  <p className="text-xl font-bold text-foreground">{c.score}%</p>
                  <p className="text-xs text-muted-foreground">{c.name}</p>
                  <Progress value={c.score} className="h-1 mt-2" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-4">
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" />Recommendation Engine</CardTitle>
                <div className="flex gap-1">
                  {sortOptions.map(o => (
                    <Button key={o.key} size="sm" variant={sortBy === o.key ? "default" : "outline"} className="rounded-full text-[10px] h-6 px-2" onClick={() => setSortBy(o.key)}>{o.label}</Button>
                  ))}
                  {canCreate && (
                    <Button size="sm" variant="outline" className="rounded-full text-[10px] h-6 px-2 gap-1 ml-1" onClick={() => setAddRecOpen(true)}>
                      <Plus className="w-3 h-3" />Add
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingRecs ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />) : recommendations.map(r => {
                const StatusIcon = r.status === "implemented" ? CheckCircle2 : r.status === "in-review" ? Clock : Lightbulb;
                const actions = statusActionMap[r.status] ?? [];
                return (
                  <motion.div key={r.id} whileHover={{ x: 4 }} className="border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusIcon className={`w-4 h-4 ${r.status === "implemented" ? "text-[hsl(var(--chart-2))]" : "text-primary"}`} />
                      <span className="text-xs font-medium text-foreground flex-1">{r.title}</span>
                      <Badge variant="outline" className="text-[10px] h-4">{r.category}</Badge>
                      <Badge variant="outline" className="text-[10px] h-4 capitalize">{r.status}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center mb-3">
                      <div><p className="text-sm font-bold text-foreground">{r.roi_pct ?? "--"}%</p><p className="text-[10px] text-muted-foreground">ROI</p></div>
                      <div><p className="text-sm font-bold text-foreground">-{r.carbon_impact ?? "--"}</p><p className="text-[10px] text-muted-foreground">tCO2e</p></div>
                      <div><p className="text-sm font-bold text-foreground">{r.ease_score ?? "--"}%</p><p className="text-[10px] text-muted-foreground">Ease</p></div>
                      <div><p className="text-sm font-bold text-foreground">{r.confidence_pct ?? "--"}%</p><p className="text-[10px] text-muted-foreground">Confidence</p></div>
                    </div>
                    {actions.length > 0 && canAct && (
                      <div className="flex gap-2 justify-end">
                        {actions.map(({ next, label, icon: Icon, color }) => (
                          <Button
                            key={next}
                            size="sm"
                            variant="outline"
                            className={`h-6 text-[10px] gap-1 ${color}`}
                            disabled={updateStatus.isPending}
                            onClick={() => handleStatusChange(r, next)}
                          >
                            <Icon className="w-3 h-3" />{label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card className="glass-card grain-overlay">
              <CardHeader className="pb-2"><CardTitle className="text-sm">AI Learning Progress</CardTitle></CardHeader>
              <CardContent>
                {loadingModel ? <Skeleton className="h-[180px] w-full" /> : (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={modelChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Line dataKey="accuracy" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Model Accuracy %" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card className="glass-card grain-overlay">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Adoption Rate</CardTitle></CardHeader>
              <CardContent className="text-center">
                {loadingRecs ? <Skeleton className="h-24 w-full" /> : (
                  <>
                    <div className="relative w-20 h-20 mx-auto">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--chart-2))" strokeWidth="8" strokeDasharray={`${adoptionRate * 2.51} 251`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">{adoptionRate}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{adopted} of {recommendations.length} adopted</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="glass-card grain-overlay">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Impact vs Difficulty</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-primary/10 rounded-lg p-3 border border-primary/20"><p className="font-bold text-foreground">Quick Wins</p><p className="text-muted-foreground">High Impact Easy</p><p className="text-lg font-bold text-primary mt-1">{quickWins}</p></div>
                  <div className="bg-accent/30 rounded-lg p-3"><p className="font-bold text-foreground">Strategic</p><p className="text-muted-foreground">High Impact Hard</p><p className="text-lg font-bold text-foreground mt-1">{strategic}</p></div>
                  <div className="bg-accent/30 rounded-lg p-3"><p className="font-bold text-foreground">Easy Fixes</p><p className="text-muted-foreground">Low Impact Easy</p><p className="text-lg font-bold text-foreground mt-1">{easyFixes}</p></div>
                  <div className="bg-muted/50 rounded-lg p-3"><p className="font-bold text-foreground">Deprioritize</p><p className="text-muted-foreground">Low Impact Hard</p><p className="text-lg font-bold text-foreground mt-1">{deprioritize}</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Recommendation dialog */}
      <Dialog open={addRecOpen} onOpenChange={v => !v && setAddRecOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-sm">Add AI Recommendation</DialogTitle></DialogHeader>
          <div className="space-y-3 text-xs">
            <div><p className="text-muted-foreground mb-1">Title</p>
              <Input value={newRec.title} onChange={e => setNewRec(p => ({ ...p, title: e.target.value }))} className="h-8 text-xs" /></div>
            <div><p className="text-muted-foreground mb-1">Description</p>
              <Input value={newRec.description} onChange={e => setNewRec(p => ({ ...p, description: e.target.value }))} className="h-8 text-xs" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-muted-foreground mb-1">Category</p>
                <Input value={newRec.category} onChange={e => setNewRec(p => ({ ...p, category: e.target.value }))} className="h-8 text-xs" /></div>
              <div><p className="text-muted-foreground mb-1">Priority</p>
                <select value={newRec.priority} onChange={e => setNewRec(p => ({ ...p, priority: e.target.value }))} className="w-full h-8 text-xs rounded-md border border-border bg-background px-2">
                  {["low", "medium", "high", "critical"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div><p className="text-muted-foreground mb-1">ROI %</p>
                <Input type="number" value={newRec.roi_pct} onChange={e => setNewRec(p => ({ ...p, roi_pct: +e.target.value }))} className="h-8 text-xs" /></div>
              <div><p className="text-muted-foreground mb-1">Carbon Impact (tCO₂e)</p>
                <Input type="number" value={newRec.carbon_impact} onChange={e => setNewRec(p => ({ ...p, carbon_impact: +e.target.value }))} className="h-8 text-xs" /></div>
              <div><p className="text-muted-foreground mb-1">Ease Score %</p>
                <Input type="number" value={newRec.ease_score} onChange={e => setNewRec(p => ({ ...p, ease_score: +e.target.value }))} className="h-8 text-xs" /></div>
              <div><p className="text-muted-foreground mb-1">Confidence %</p>
                <Input type="number" value={newRec.confidence_pct} onChange={e => setNewRec(p => ({ ...p, confidence_pct: +e.target.value }))} className="h-8 text-xs" /></div>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddRecOpen(false)}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs premium-button" disabled={createRec.isPending || !newRec.title} onClick={handleAddRec}>
              {createRec.isPending ? "Saving…" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Insights;