import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { FileText, Download, BarChart2, Settings } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useReportTemplates, useReportKPIs, useGenerateReport } from "@/hooks/useReports";

const Reports = () => {
  const { campusId } = useCampusContext();
  const { data: templates = [], isLoading: loadingTemplates } = useReportTemplates();
  const { data: kpis = [], isLoading: loadingKPIs } = useReportKPIs();
  const generateReport = useGenerateReport();

  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedKPIs, setSelectedKPIs] = useState<number[]>([]);

  const toggleKPI = (id: number) =>
    setSelectedKPIs(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);

  const handleGenerate = () => {
    if (!selectedTemplate) return;
    generateReport.mutate({
      campusId,
      templateId: selectedTemplate,
      periodLabel: new Date().getFullYear().toString(),
      generatedBy: 1,
    });
  };

  return (
    <DashboardLayout title="Reports" breadcrumb="Sustainability Reports">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><FileText className="w-3 h-3" /> Reports</Badge>
          <span>{templates.length} Templates Available</span>
          <span className="ml-auto text-[10px]">{selectedKPIs.length} KPIs selected</span>
        </div>

        <Tabs defaultValue="templates">
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="templates" className="gap-1.5"><FileText className="w-3.5 h-3.5" />Templates</TabsTrigger>
            <TabsTrigger value="kpis" className="gap-1.5"><BarChart2 className="w-3.5 h-3.5" />KPI Library</TabsTrigger>
            <TabsTrigger value="builder" className="gap-1.5"><Settings className="w-3.5 h-3.5" />Custom Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-4">
            {loadingTemplates ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(t => (
                  <motion.div key={t.id} whileHover={{ y: -2 }}>
                    <Card className={`glass-card grain-overlay cursor-pointer transition-colors ${
                      selectedTemplate === t.id ? "border-primary/60" : ""
                    }`} onClick={() => setSelectedTemplate(t.id)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          {selectedTemplate === t.id && (
                            <Badge className="text-[10px]">Selected</Badge>
                          )}
                        </div>
                        <CardTitle className="text-sm mt-2">{t.name}</CardTitle>
                        <CardDescription className="text-xs">{t.standard}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t.section_count ?? 0} sections</span>
                          <Badge variant="outline" className="text-[10px]">{t.code}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="kpis" className="mt-4">
            {loadingKPIs ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {kpis.map(k => (
                  <motion.div key={k.id} whileHover={{ x: 2 }}>
                    <Card className="glass-card grain-overlay">
                      <CardContent className="pt-3 pb-3 flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{k.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] h-4">{k.category}</Badge>
                            <span className="text-[10px] text-muted-foreground">{k.unit} · {k.period_label}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="builder" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="glass-card grain-overlay lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm">Select KPIs to Include</CardTitle>
                  <CardDescription className="text-xs">Choose which metrics to include in your custom report</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingKPIs ? (
                    <Skeleton className="h-48 w-full" />
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {kpis.map(k => (
                        <label key={k.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                          <Checkbox
                            checked={selectedKPIs.includes(k.id)}
                            onCheckedChange={() => toggleKPI(k.id)}
                          />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground">{k.name}</p>
                            <p className="text-[10px] text-muted-foreground">{k.unit} · {k.period_label}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] h-4">{k.category}</Badge>
                        </label>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card grain-overlay">
                <CardHeader>
                  <CardTitle className="text-sm">Generate Report</CardTitle>
                  <CardDescription className="text-xs">Select a template and KPIs, then generate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Template</p>
                    {loadingTemplates ? (
                      <Skeleton className="h-8 w-full" />
                    ) : (
                      <div className="space-y-1">
                        {templates.map(t => (
                          <button key={t.id}
                            className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                              selectedTemplate === t.id
                                ? "bg-primary/20 text-primary"
                                : "hover:bg-white/5 text-muted-foreground"
                            }`}
                            onClick={() => setSelectedTemplate(t.id)}>
                            {t.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground mb-1">{selectedKPIs.length} KPIs selected</p>
                    <p className="text-xs text-muted-foreground mb-3">{selectedTemplate ? "✓ Template selected" : "⚠ No template selected"}</p>
                    <Button
                      className="w-full premium-button rounded-full text-xs gap-2"
                      disabled={!selectedTemplate || generateReport.isPending}
                      onClick={handleGenerate}>
                      <Download className="w-3.5 h-3.5" />
                      {generateReport.isPending ? "Generating…" : "Generate PDF"}
                    </Button>
                    {generateReport.isSuccess && (
                      <p className="text-xs text-emerald-400 mt-2 text-center">Report generated successfully!</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
