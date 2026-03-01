import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Report, ReportTemplate, ReportKpiDefinition } from "@/lib/types";

export function useReportTemplates() {
  return useQuery<ReportTemplate[]>({
    queryKey: ["report-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []) as ReportTemplate[];
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useReportKPIs() {
  return useQuery<ReportKpiDefinition[]>({
    queryKey: ["report-kpis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_kpi_definitions")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []) as ReportKpiDefinition[];
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useReports(campusId: number) {
  return useQuery<Report[]>({
    queryKey: ["reports", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("campus_id", campusId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Report[];
    },
    enabled: !!campusId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campusId,
      templateId,
      periodLabel,
      generatedBy,
    }: {
      campusId: number;
      templateId: number;
      periodLabel?: string;
      generatedBy?: number;
    }) => {
      const { data, error } = await supabase
        .from("reports")
        .insert({
          campus_id: campusId,
          template_id: templateId,
          period_label: periodLabel ?? null,
          generated_by: generatedBy ?? null,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as Report;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reports", variables.campusId] });
    },
  });
}

export function useCompleteReport(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      fileSizeKb,
    }: {
      id: number;
      fileSizeKb: number;
    }) => {
      const { error } = await supabase
        .from("reports")
        .update({
          status: "completed",
          file_size_kb: fileSizeKb,
          generated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", campusId] });
    },
  });
}

export function useDeleteReport(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", campusId] });
    },
  });
}
