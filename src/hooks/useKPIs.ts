import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { SustainabilityScore, SdgScore, KpiRiskIndicator } from "@/lib/types";

export function useSustainabilityScore(campusId: number) {
  return useQuery<SustainabilityScore | null>({
    queryKey: ["sustainability-score", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sustainability_scores")
        .select("*")
        .eq("campus_id", campusId)
        .order("score_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SustainabilityScore | null;
    },
    enabled: !!campusId,
    staleTime: 15 * 60 * 1000,
  });
}

export function useSdgScores(campusId: number) {
  return useQuery<SdgScore[]>({
    queryKey: ["sdg-scores", campusId],
    queryFn: async () => {
      const { data: latest } = await supabase
        .from("sdg_scores")
        .select("score_date")
        .eq("campus_id", campusId)
        .order("score_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latest) return [];

      const { data, error } = await supabase
        .from("sdg_scores")
        .select("*")
        .eq("campus_id", campusId)
        .eq("score_date", latest.score_date)
        .order("sdg_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SdgScore[];
    },
    enabled: !!campusId,
    staleTime: 15 * 60 * 1000,
  });
}

export function useKpiRiskIndicators(campusId: number) {
  return useQuery<KpiRiskIndicator[]>({
    queryKey: ["kpi-risk-indicators", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kpi_risk_indicators")
        .select("*")
        .eq("campus_id", campusId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as KpiRiskIndicator[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}
