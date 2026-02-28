import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { FileText, Download, Clock, CheckCircle2, Settings, Calendar, Eye } from "lucide-react";
import { reportTemplates, reportKPIs } from "@/lib/module-data";

const Reports = () => {
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(reportKPIs.slice(0, 4).map(k => k.name));

  return (
    <DashboardLayout title="Reports" breadcrumb="Reports · Generator">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><FileText className="w-3 h-3" /> Reports</Badge>
          <span>Last Generated: Feb 1, 2025</span>
        </div>

        {/* Compliance Templates */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Compliance Report Templates</CardTitle>
            <CardDescription className="text-xs">Select a template to generate a sustainability report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {reportTemplates.map(t => (
                <motion.div key={t.id} whileHover={{ y: -4 }} className="border border-border rounded-lg p-4 cursor-pointer hover:border-primary/40 transition-colors">
                  <FileText className="w-6 h-6 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{t.standard} · {t.sections} sections</p>
                  {t.lastGenerated ? (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-[hsl(var(--chart-2))]" />
                      Last: {t.lastGenerated}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Not yet generated
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-4">
          {/* Custom Report Builder */}
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Settings className="w-4 h-4 text-primary" />Custom Report Builder</CardTitle>
              <CardDescription className="text-xs">Select KPIs to include in your custom report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportKPIs.map(k => (
                <div key={k.name} className="flex items-center gap-3 border border-border rounded-lg p-3">
                  <Checkbox
                    checked={selectedKPIs.includes(k.name)}
                    onCheckedChange={(c) => {
                      setSelectedKPIs(prev => c ? [...prev, k.name] : prev.filter(n => n !== k.name));
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{k.name}</p>
                    <p className="text-[10px] text-muted-foreground">{k.period}</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{k.value}</p>
                  <Badge variant="outline" className={`text-[10px] h-4 ${k.change < 0 ? "text-[hsl(var(--chart-2))]" : "text-destructive"}`}>
                    {k.change > 0 ? "+" : ""}{k.change}%
                  </Badge>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button className="rounded-full gap-1 flex-1 premium-button"><Download className="w-3 h-3" />Generate PDF</Button>
                <Button variant="outline" className="rounded-full gap-1"><Eye className="w-3 h-3" />Preview</Button>
                <Button variant="outline" className="rounded-full gap-1"><Calendar className="w-3 h-3" />Schedule</Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card className="glass-card grain-overlay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Report Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg p-4 bg-accent/20 min-h-[300px]">
                <div className="text-center mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">EcoVista Campus</p>
                  <p className="text-sm font-bold text-foreground">Sustainability Report</p>
                  <p className="text-[10px] text-muted-foreground">FY 2024-25 · Generated Feb 2025</p>
                </div>
                <div className="space-y-2">
                  {selectedKPIs.map(name => {
                    const kpi = reportKPIs.find(k => k.name === name);
                    if (!kpi) return null;
                    return (
                      <div key={name} className="flex items-center justify-between text-xs border-b border-border/50 pb-1">
                        <span className="text-muted-foreground">{kpi.name}</span>
                        <span className="font-medium text-foreground">{kpi.value}</span>
                      </div>
                    );
                  })}
                </div>
                {selectedKPIs.length === 0 && <p className="text-xs text-muted-foreground text-center mt-8">Select KPIs to preview</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
