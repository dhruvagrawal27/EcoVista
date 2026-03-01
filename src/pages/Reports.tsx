import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, BarChart2, Clock, Trash2, AlertCircle, Info, Search,
  ChevronRight, CheckCircle2, Download, X, Layers, BookOpen,
  TrendingUp, Leaf, Droplets, Recycle, Loader2,
} from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useAuth } from "@/context/AuthContext";
import type { RoleName } from "@/context/AuthContext";
import { useReportTemplates, useReportKPIs, useGenerateReport, useReports, useDeleteReport, useCompleteReport } from "@/hooks/useReports";
import type { ReportTemplate } from "@/lib/types";
import { generateReportPdf, downloadBlob } from "@/lib/report-generator";

/* ─── constants ─────────────────────────────────────────── */
const ROLE_INFO: Partial<Record<NonNullable<RoleName>, { color: string; msg: string }>> = {
  "Admin": {
    color: "text-violet-400 border-violet-500/20",
    msg: "Full access — generate reports from any template, view history, delete old reports.",
  },
  "Facility Manager": {
    color: "text-blue-400 border-blue-500/20",
    msg: "You can generate and schedule reports, and view the full report history.",
  },
  "Finance": {
    color: "text-emerald-400 border-emerald-500/20",
    msg: "You can generate finance, cost and ROI reports, and view the report history.",
  },
  "Faculty": {
    color: "text-yellow-400 border-yellow-500/20",
    msg: "Read-only access — browse templates and the KPI library. Ask an Admin or Manager to generate reports.",
  },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Energy: TrendingUp,
  Carbon: Leaf,
  Water: Droplets,
  Waste: Recycle,
  Finance: BarChart2,
};

const STATUS_COLOR: Record<string, string> = {
  completed: "text-emerald-400",
  pending: "text-amber-400",
  generating: "text-primary",
  failed: "text-destructive",
};

/* ─── sub-components ─────────────────────────────────────── */
function TemplateCard({
  t,
  onUse,
  canGenerate,
}: {
  t: ReportTemplate;
  onUse: (t: ReportTemplate) => void;
  canGenerate: boolean;
}) {
  const iconMap: Record<string, string> = {
    "STARS": "🌟",
    "CDP": "🌍",
    "GRI": "📘",
    "TCFD": "🏦",
    "CUSTOM": "🛠️",
  };
  const emoji = Object.entries(iconMap).find(([k]) => t.code?.toUpperCase().includes(k))?.[1] ?? "📄";

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="glass-card grain-overlay h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="text-3xl">{emoji}</div>
            <Badge variant="outline" className="text-[10px] shrink-0">{t.code}</Badge>
          </div>
          <CardTitle className="text-sm mt-2 leading-snug">{t.name}</CardTitle>
          {t.standard && (
            <CardDescription className="text-xs">{t.standard}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col flex-1 justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Layers className="w-3.5 h-3.5" />
            <span>{t.section_count ?? 0} sections</span>
          </div>
          <Button
            size="sm"
            className="w-full gap-2 text-xs rounded-full premium-button"
            disabled={!canGenerate}
            onClick={() => onUse(t)}
          >
            <ChevronRight className="w-3.5 h-3.5" />
            Use Template
          </Button>
          {!canGenerate && (
            <p className="text-[10px] text-muted-foreground text-center">
              Generation restricted to Admin / Manager
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── main component ──────────────────────────────────────── */
const Reports = () => {
  const { campusId } = useCampusContext();
  const { user } = useAuth();
  const role = user?.role_name as RoleName | undefined;
  const canGenerate = role === "Admin" || role === "Facility Manager" || role === "Finance";
  const canDelete = role === "Admin";

  const { data: templates = [], isLoading: loadingTemplates } = useReportTemplates();
  const { data: kpis = [], isLoading: loadingKPIs } = useReportKPIs();
  const { data: reports = [], isLoading: loadingReports } = useReports(campusId);
  const generateReport = useGenerateReport();
  const completeReport = useCompleteReport(campusId);
  const deleteReport = useDeleteReport(campusId);

  /* generation panel state */
  const [activeTemplate, setActiveTemplate] = useState<ReportTemplate | null>(null);
  const [selectedKPIs, setSelectedKPIs] = useState<number[]>([]);
  const [periodLabel, setPeriodLabel] = useState(String(new Date().getFullYear()));
  const [isGenerating, setIsGenerating] = useState(false);

  /* kpi library filters */
  const [kpiSearch, setKpiSearch] = useState("");
  const [kpiCategory, setKpiCategory] = useState("All");

  const kpiCategories = useMemo(() => {
    const cats = new Set(kpis.map(k => k.category ?? "Other"));
    return ["All", ...Array.from(cats).sort()];
  }, [kpis]);

  const filteredKPIs = useMemo(() => {
    return kpis.filter(k => {
      const matchSearch = k.name.toLowerCase().includes(kpiSearch.toLowerCase());
      const matchCat = kpiCategory === "All" || k.category === kpiCategory;
      return matchSearch && matchCat;
    });
  }, [kpis, kpiSearch, kpiCategory]);

  const toggleKPI = (id: number) =>
    setSelectedKPIs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleOpenTemplate = (t: ReportTemplate) => {
    setActiveTemplate(t);
    setSelectedKPIs([]);
    setPeriodLabel(String(new Date().getFullYear()));
  };

  const handleGenerate = async () => {
    if (!activeTemplate || !canGenerate || isGenerating) return;
    const generatedBy = user?.id ? parseInt(user.id, 10) : undefined;
    const validGeneratedBy = !isNaN(generatedBy ?? NaN) ? generatedBy : undefined;

    setIsGenerating(true);
    try {
      // 1. Create DB row with status "pending"
      const report = await generateReport.mutateAsync({
        campusId,
        templateId: activeTemplate.id,
        periodLabel,
        generatedBy: validGeneratedBy,
      });

      // 2. Generate PDF in-browser from live DB data
      const generatorName = user?.email ?? user?.id ?? "EcoVista";
      const blob = await generateReportPdf({
        campusId,
        template: activeTemplate,
        periodLabel,
        selectedKpiIds: selectedKPIs,
        allKpiDefinitions: kpis,
        generatorName: String(generatorName),
      });

      // 3. Trigger download immediately
      const safeCode = (activeTemplate.code ?? "report").replace(/[^a-z0-9]/gi, "_");
      const safePeriod = periodLabel.replace(/[^a-z0-9]/gi, "_");
      downloadBlob(blob, `EcoVista_${safeCode}_${safePeriod}.pdf`);

      // 4. Update DB row to "completed" with file size
      const fileSizeKb = Math.round(blob.size / 1024);
      await completeReport.mutateAsync({ id: report.id, fileSizeKb });

      // 5. Close panel
      setActiveTemplate(null);
      setSelectedKPIs([]);
    } catch (err) {
      console.error("Report generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const ri = role ? (ROLE_INFO[role] ?? null) : null;

  return (
    <DashboardLayout title="Reports" breadcrumb="Sustainability Reports">
      <div className="max-w-[1400px] mx-auto space-y-4">
        {/* header strip */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><FileText className="w-3 h-3" />Reports</Badge>
          <span>{templates.length} Templates</span>
          <span>·</span>
          <span>{reports.length} Generated</span>
          <Badge variant="outline" className="gap-1 ml-auto text-primary">{role ?? "—"}</Badge>
        </div>

        {/* role banner */}
        {ri && (
          <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${ri.color}`}>
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{ri.msg}</span>
          </div>
        )}

        <div className="flex gap-4">
          {/* ── left: tabs ── */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="templates">
              <TabsList className="grid w-full grid-cols-3 h-11">
                <TabsTrigger value="templates" className="gap-1.5">
                  <FileText className="w-3.5 h-3.5" />Templates
                </TabsTrigger>
                <TabsTrigger value="kpis" className="gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />KPI Library
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  History
                  {reports.length > 0 && (
                    <Badge className="ml-1 text-[9px] h-4 px-1">{reports.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ── TEMPLATES ── */}
              <TabsContent value="templates" className="mt-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Click <strong className="text-foreground">Use Template</strong> on any card to open the generation panel →
                </p>
                {loadingTemplates ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {templates.map(t => (
                      <TemplateCard key={t.id} t={t} onUse={handleOpenTemplate} canGenerate={canGenerate} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ── KPI LIBRARY ── */}
              <TabsContent value="kpis" className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      value={kpiSearch}
                      onChange={e => setKpiSearch(e.target.value)}
                      placeholder="Search KPIs…"
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                  <Select value={kpiCategory} onValueChange={setKpiCategory}>
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {kpiCategories.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {loadingKPIs ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                  </div>
                ) : filteredKPIs.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-12">No KPIs match your search.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredKPIs.map(k => {
                      const CatIcon = CATEGORY_ICONS[k.category ?? ""] ?? BarChart2;
                      return (
                        <motion.div key={k.id} whileHover={{ x: 2 }}>
                          <Card className="glass-card grain-overlay">
                            <CardContent className="py-3 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <CatIcon className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{k.name}</p>
                                <p className="text-[10px] text-muted-foreground">{k.unit} · {k.period_label}</p>
                              </div>
                              <Badge variant="outline" className="text-[10px] h-4 shrink-0">{k.category}</Badge>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* ── HISTORY ── */}
              <TabsContent value="history" className="mt-4">
                {loadingReports ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No reports generated yet</p>
                    <p className="text-xs mt-1">Use a template from the Templates tab to generate your first report.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* summary row */}
                    <div className="flex gap-3 mb-4 text-xs text-muted-foreground">
                      {(["completed", "pending", "generating", "failed"] as const).map(s => {
                        const count = reports.filter(r => r.status === s).length;
                        if (!count) return null;
                        return (
                          <span key={s} className={`font-medium ${STATUS_COLOR[s]}`}>
                            {count} {s}
                          </span>
                        );
                      })}
                    </div>
                    {reports.map(r => {
                      const template = templates.find(t => t.id === r.template_id);
                      return (
                        <motion.div key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                          <Card className="glass-card grain-overlay">
                            <CardContent className="py-3 flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                r.status === "completed" ? "bg-emerald-500/10" :
                                r.status === "failed" ? "bg-destructive/10" : "bg-primary/10"
                              }`}>
                                {r.status === "completed"
                                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  : <FileText className="w-3.5 h-3.5 text-primary" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {template?.name ?? `Report #${r.id}`}
                                </p>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                  <span>{r.period_label ? `Period: ${r.period_label}` : "—"}</span>
                                  <span>·</span>
                                  <span>{new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                  {r.file_size_kb && <><span>·</span><span>{r.file_size_kb} KB</span></>}
                                </p>
                              </div>
                              <Badge variant="outline" className={`text-[10px] h-4 capitalize shrink-0 ${STATUS_COLOR[r.status] ?? ""}`}>
                                {r.status}
                              </Badge>
                              {r.status === "completed" && r.file_path && (
                                <a
                                  href={r.file_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                                  title="Re-download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {r.status === "completed" && !r.file_path && (
                                <span
                                  className="text-[10px] text-emerald-400 shrink-0"
                                  title="Downloaded at generation time"
                                >
                                  ✓ PDF downloaded
                                </span>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => deleteReport.mutate(r.id)}
                                  disabled={deleteReport.isPending}
                                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* ── right: generation panel (slides in when template selected) ── */}
          <AnimatePresence>
            {activeTemplate && (
              <motion.div
                key="gen-panel"
                initial={{ opacity: 0, x: 32, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 320 }}
                exit={{ opacity: 0, x: 32, width: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="shrink-0 overflow-hidden"
                style={{ width: 320 }}
              >
                <Card className="glass-card grain-overlay h-full flex flex-col sticky top-4">
                  {/* panel header */}
                  <CardHeader className="pb-3 border-b border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm">{activeTemplate.name}</CardTitle>
                        <CardDescription className="text-[10px] mt-0.5">
                          {activeTemplate.standard} · {activeTemplate.section_count ?? 0} sections
                        </CardDescription>
                      </div>
                      <button onClick={() => setActiveTemplate(null)} className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 overflow-y-auto py-4 space-y-5">
                    {/* period */}
                    <div>
                      <p className="text-xs font-medium text-foreground mb-2">Report Period</p>
                      <Input
                        value={periodLabel}
                        onChange={e => setPeriodLabel(e.target.value)}
                        placeholder="e.g. 2025, Q3 FY25, Jan–Mar 2026"
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* kpi selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-foreground">Include KPIs</p>
                        <button
                          className="text-[10px] text-primary hover:underline"
                          onClick={() => setSelectedKPIs(selectedKPIs.length === kpis.length ? [] : kpis.map(k => k.id))}
                        >
                          {selectedKPIs.length === kpis.length ? "Clear all" : "Select all"}
                        </button>
                      </div>
                      {loadingKPIs ? (
                        <Skeleton className="h-40 w-full" />
                      ) : (
                        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                          {kpis.map(k => {
                            const CatIcon = CATEGORY_ICONS[k.category ?? ""] ?? BarChart2;
                            return (
                              <label key={k.id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer group">
                                <Checkbox
                                  checked={selectedKPIs.includes(k.id)}
                                  onCheckedChange={() => toggleKPI(k.id)}
                                  className="shrink-0"
                                />
                                <CatIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-medium text-foreground truncate">{k.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{k.unit}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* summary */}
                    <div className="rounded-lg bg-accent/30 p-3 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Template</span>
                        <span className="font-medium text-foreground">{activeTemplate.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Period</span>
                        <span className="font-medium text-foreground">{periodLabel || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">KPIs included</span>
                        <span className="font-medium text-foreground">{selectedKPIs.length} / {kpis.length}</span>
                      </div>
                    </div>
                  </CardContent>

                  {/* generate button */}
                  <div className="p-4 border-t border-border space-y-2">
                    {!canGenerate && (
                      <div className="flex items-start gap-1.5 text-[10px] text-yellow-400">
                        <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>Generation restricted to Admin / Manager / Finance</span>
                      </div>
                    )}
                    <Button
                      className="w-full premium-button rounded-full text-xs gap-2"
                      disabled={!canGenerate || !periodLabel.trim() || isGenerating}
                      onClick={handleGenerate}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Generating PDF…
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          Generate &amp; Download PDF
                        </>
                      )}
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">
                      {isGenerating
                        ? "Pulling live data and building your PDF — please wait."
                        : "PDF downloads instantly. A record is saved to History."}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
