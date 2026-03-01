import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from "recharts";
import { IndianRupee, TrendingUp, BarChart3, Target, Coins, FileCheck, AlertTriangle, Plus, Pencil, Trash2, Info } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useAuth } from "@/context/AuthContext";
import type { RoleName } from "@/context/AuthContext";
import { useFinanceSnapshot, useInvestments, useCapitalProjections, useSubsidies, useCarbonCreditForecasts, useCreateInvestment, useUpdateInvestment, useDeleteInvestment, useCreateSubsidy, useUpdateSubsidy, useDeleteSubsidy } from "@/hooks/useFinance";
import { Skeleton } from "@/components/ui/skeleton";
import type { Investment, Subsidy } from "@/lib/types";

const CHART_TICK = "hsl(215 16% 55%)";
const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
const statusColors: Record<string, string> = { completed: "hsl(var(--chart-2))", "in-progress": "hsl(var(--chart-1))", approved: "hsl(var(--chart-5))", proposed: "hsl(var(--chart-4))", rejected: "hsl(var(--muted-foreground))" };

const ROLE_INFO: Partial<Record<NonNullable<RoleName>, { color: string; msg: string }>> = {
  "Admin": {
    color: "text-violet-400 border-violet-500/20",
    msg: "Full access — you can add, edit, and delete investments and subsidies. Financial snapshots and projections are updated via data pipelines.",
  },
  "Finance": {
    color: "text-emerald-400 border-emerald-500/20",
    msg: "You can add, edit, and delete investments and subsidies. Run stress tests and analyse 10-year capital projections.",
  },
};

const emptyInv = (): Omit<Investment, "id" | "campus_id" | "created_at" | "approved_by" | "approved_at"> => ({
  name: "",
  cost_cr: null,
  impact_score: null,
  roi_pct: null,
  status: "proposed",
});

const emptySub = (): Omit<Subsidy, "id" | "campus_id" | "created_at" | "updated_at"> => ({
  name: "",
  amount_inr: 0,
  status: "eligible",
  deadline: null,
  deadline_text: null,
  notes: null,
});

const Finance = () => {
  const [energyPriceIncrease, setEnergyPriceIncrease] = useState([10]);
  const { campusId } = useCampusContext();
  const { user } = useAuth();
  const role = user?.role_name as RoleName | undefined;
  const canManage = role === "Admin" || role === "Finance";

  const { data: snapshot, isLoading: snapshotLoading } = useFinanceSnapshot(campusId);
  const { data: investments = [], isLoading: investmentsLoading } = useInvestments(campusId);
  const { data: projections = [], isLoading: projectionsLoading } = useCapitalProjections(campusId);
  const { data: subsidies = [], isLoading: subsidiesLoading } = useSubsidies(campusId);
  const { data: carbonForecasts = [] } = useCarbonCreditForecasts(campusId);

  const createInvestment = useCreateInvestment(campusId);
  const updateInvestment = useUpdateInvestment(campusId);
  const deleteInvestment = useDeleteInvestment(campusId);
  const createSubsidy = useCreateSubsidy(campusId);
  const updateSubsidy = useUpdateSubsidy(campusId);
  const deleteSubsidy = useDeleteSubsidy(campusId);

  // Investment dialog state
  const [invDialog, setInvDialog] = useState<{ open: boolean; editing: Investment | null }>({ open: false, editing: null });
  const [invForm, setInvForm] = useState(emptyInv());

  // Subsidy dialog state
  const [subDialog, setSubDialog] = useState<{ open: boolean; editing: Subsidy | null }>({ open: false, editing: null });
  const [subForm, setSubForm] = useState(emptySub());

  const openInvAdd = () => { setInvForm(emptyInv()); setInvDialog({ open: true, editing: null }); };
  const openInvEdit = (inv: Investment) => {
    setInvForm({ name: inv.name, cost_cr: inv.cost_cr, impact_score: inv.impact_score, roi_pct: inv.roi_pct, status: inv.status });
    setInvDialog({ open: true, editing: inv });
  };
  const saveInv = () => {
    if (!invForm.name.trim()) return;
    if (invDialog.editing) {
      updateInvestment.mutate({ id: invDialog.editing.id, ...invForm }, { onSuccess: () => setInvDialog({ open: false, editing: null }) });
    } else {
      createInvestment.mutate(invForm, { onSuccess: () => setInvDialog({ open: false, editing: null }) });
    }
  };

  const openSubAdd = () => { setSubForm(emptySub()); setSubDialog({ open: true, editing: null }); };
  const openSubEdit = (s: Subsidy) => {
    setSubForm({ name: s.name, amount_inr: s.amount_inr, status: s.status, deadline: s.deadline, deadline_text: s.deadline_text, notes: s.notes });
    setSubDialog({ open: true, editing: s });
  };
  const saveSub = () => {
    if (!subForm.name.trim()) return;
    if (subDialog.editing) {
      updateSubsidy.mutate({ id: subDialog.editing.id, ...subForm }, { onSuccess: () => setSubDialog({ open: false, editing: null }) });
    } else {
      createSubsidy.mutate(subForm, { onSuccess: () => setSubDialog({ open: false, editing: null }) });
    }
  };

  const annualSavings = snapshot?.annual_savings ?? 0;
  const stressedSavings = Math.round(annualSavings * (1 + energyPriceIncrease[0] / 100));

  const investmentMatrix = investments.map((inv) => ({
    cost: inv.cost_cr ?? 0,
    impact: inv.impact_score ?? 0,
    roi: inv.roi_pct ?? 0,
    status: inv.status,
    name: inv.name,
  }));

  const projectionChart = projections.map((p) => ({
    year: p.projection_year,
    investment: p.investment_inr ?? 0,
    savings: p.cumulative_inr ?? 0,
  }));

  const carbonChart = carbonForecasts.length > 0
    ? carbonForecasts.map(f => ({ year: f.forecast_year, credits: f.credits_inr }))
    : Array.from({ length: 5 }, (_, i) => ({ year: 2026 + i, credits: Math.round(1250000 * Math.pow(1.25, i)) }));

  const ri = role ? (ROLE_INFO[role] ?? null) : null;

  return (
    <DashboardLayout title="Cost & Finance" breadcrumb="Finance · Executive Analytics">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><IndianRupee className="w-3 h-3" /> Finance</Badge>
          <span>Last Updated: live</span>
          <Badge variant="outline" className="gap-1 ml-auto">Data Confidence: 96%</Badge>
        </div>

        {ri && (
          <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${ri.color}`}>
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{ri.msg}</span>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {snapshotLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            : [
                { label: "Total Investment", value: `₹${((snapshot?.total_investment ?? 0) / 10000000).toFixed(1)} Cr`, icon: Coins, trend: null },
                { label: "Annual Savings", value: `₹${(annualSavings / 100000).toFixed(0)} L`, icon: TrendingUp, trend: 12.4 },
                { label: "NPV (10yr)", value: `₹${((snapshot?.npv_10yr ?? 0) / 10000000).toFixed(1)} Cr`, icon: BarChart3, trend: null },
                { label: "IRR", value: `${snapshot?.irr_pct ?? 0}%`, icon: Target, trend: 2.1 },
              ].map((item) => (
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
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2"><Target className="w-4 h-4 text-primary" />Investment Prioritization Matrix</CardTitle>
                <CardDescription className="text-xs">Impact vs Cost · Bubble size = ROI</CardDescription>
              </div>
              {canManage && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={openInvAdd}>
                  <Plus className="w-3 h-3" />Add Investment
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {investmentsLoading ? (
              <Skeleton className="h-[280px] w-full rounded-xl" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="cost" name="Cost (₹Cr)" tick={{ fontSize: 10, fill: CHART_TICK }} label={{ value: "Cost (₹Cr)", position: "bottom", fontSize: 10, fill: CHART_TICK }} />
                    <YAxis dataKey="impact" name="Impact Score" tick={{ fontSize: 10, fill: CHART_TICK }} label={{ value: "Impact", angle: -90, position: "left", fontSize: 10, fill: CHART_TICK }} />
                    <ZAxis dataKey="roi" range={[200, 800]} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(val: number, name: string) => [name === "roi" ? `${val}%` : val, name === "roi" ? "ROI" : name]} />
                    <Scatter data={investmentMatrix} name="Projects">
                      {investmentMatrix.map((entry, i) => (
                        <Cell key={i} fill={statusColors[entry.status] ?? CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.7} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="flex gap-4 justify-center mt-2 flex-wrap">
                  {Object.entries(statusColors).map(([s, c]) => (
                    <div key={s} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                      <span className="capitalize">{s}</span>
                    </div>
                  ))}
                </div>

                {canManage && investments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Investment Records</p>
                    {investments.map(inv => (
                      <div key={inv.id} className="flex items-center gap-2 border border-border rounded-lg p-2 text-xs">
                        <span className="flex-1 font-medium text-foreground">{inv.name}</span>
                        <span className="text-muted-foreground">₹{inv.cost_cr ?? "--"}Cr</span>
                        <Badge variant="outline" className="text-[10px] h-4 capitalize">{inv.status}</Badge>
                        <button onClick={() => openInvEdit(inv)} className="text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => deleteInvestment.mutate(inv.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* 10-Year Projection + Stress Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">10-Year Capital Projection</CardTitle>
            </CardHeader>
            <CardContent>
              {projectionsLoading ? (
                <Skeleton className="h-[250px] w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={projectionChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: CHART_TICK }} />
                    <YAxis tick={{ fontSize: 10, fill: CHART_TICK }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`} />
                    <Area dataKey="savings" fill="hsl(var(--chart-2) / 0.2)" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Cumulative Savings" />
                    <Area dataKey="investment" fill="hsl(var(--chart-5) / 0.2)" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Annual Investment" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
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
                  <p className="text-lg font-bold text-foreground">₹{(annualSavings / 100000).toFixed(0)}L</p>
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><FileCheck className="w-4 h-4 text-primary" />Subsidy & Eligibility Tracker</CardTitle>
                {canManage && (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={openSubAdd}>
                    <Plus className="w-3 h-3" />Add
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subsidiesLoading ? (
                <Skeleton className="h-40 w-full rounded-xl" />
              ) : (
                subsidies.map((s) => (
                  <div key={s.id} className="border border-border rounded-lg p-3 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Deadline: {s.deadline_text ?? (s.deadline ? new Date(s.deadline).toLocaleDateString("en-IN") : "—")}
                      </p>
                      {s.notes && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{s.notes}</p>}
                    </div>
                    <p className="text-sm font-bold text-foreground">₹{(s.amount_inr / 100000).toFixed(1)}L</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-4 ${s.status === "approved" ? "text-primary" : s.status === "active" ? "text-[hsl(var(--chart-2))]" : ""}`}
                    >
                      {s.status}
                    </Badge>
                    {canManage && (
                      <>
                        <button onClick={() => openSubEdit(s)} className="text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => deleteSubsidy.mutate(s.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Coins className="w-4 h-4 text-primary" />Carbon Credit Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={carbonChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: CHART_TICK }} />
                  <YAxis tick={{ fontSize: 10, fill: CHART_TICK }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Bar dataKey="credits" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Investment Dialog */}
      <Dialog open={invDialog.open} onOpenChange={o => setInvDialog(d => ({ ...d, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{invDialog.editing ? "Edit Investment" : "Add Investment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name *</p>
              <Input value={invForm.name} onChange={e => setInvForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Solar Panel Array" className="text-xs h-8" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cost (₹Cr)</p>
                <Input value={invForm.cost_cr ?? ""} onChange={e => setInvForm(f => ({ ...f, cost_cr: parseFloat(e.target.value) || null }))} type="number" step="0.1" className="text-xs h-8" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Impact Score</p>
                <Input value={invForm.impact_score ?? ""} onChange={e => setInvForm(f => ({ ...f, impact_score: parseFloat(e.target.value) || null }))} type="number" step="0.1" min="0" max="10" className="text-xs h-8" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">ROI (%)</p>
                <Input value={invForm.roi_pct ?? ""} onChange={e => setInvForm(f => ({ ...f, roi_pct: parseFloat(e.target.value) || null }))} type="number" step="0.1" className="text-xs h-8" />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Select value={invForm.status} onValueChange={v => setInvForm(f => ({ ...f, status: v as Investment["status"] }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposed">Proposed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setInvDialog({ open: false, editing: null })}>Cancel</Button>
            <Button size="sm" onClick={saveInv} disabled={createInvestment.isPending || updateInvestment.isPending}>
              {createInvestment.isPending || updateInvestment.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subsidy Dialog */}
      <Dialog open={subDialog.open} onOpenChange={o => setSubDialog(d => ({ ...d, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{subDialog.editing ? "Edit Subsidy" : "Add Subsidy"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name *</p>
              <Input value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. MNRE Solar Subsidy" className="text-xs h-8" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount (₹)</p>
                <Input value={subForm.amount_inr} onChange={e => setSubForm(f => ({ ...f, amount_inr: parseFloat(e.target.value) || 0 }))} type="number" className="text-xs h-8" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Select value={subForm.status} onValueChange={v => setSubForm(f => ({ ...f, status: v as Subsidy["status"] }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eligible">Eligible</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Deadline (Date)</p>
                <Input value={subForm.deadline ?? ""} onChange={e => setSubForm(f => ({ ...f, deadline: e.target.value || null }))} type="date" className="text-xs h-8" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Deadline Label</p>
                <Input value={subForm.deadline_text ?? ""} onChange={e => setSubForm(f => ({ ...f, deadline_text: e.target.value || null }))} placeholder="e.g. Q1 FY26" className="text-xs h-8" />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <Input value={subForm.notes ?? ""} onChange={e => setSubForm(f => ({ ...f, notes: e.target.value || null }))} placeholder="Optional notes" className="text-xs h-8" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSubDialog({ open: false, editing: null })}>Cancel</Button>
            <Button size="sm" onClick={saveSub} disabled={createSubsidy.isPending || updateSubsidy.isPending}>
              {createSubsidy.isPending || updateSubsidy.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Finance;
