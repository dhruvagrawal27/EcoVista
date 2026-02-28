import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { MissionDecision, MissionInsight } from "@/lib/types";

export function useMissionDecisions(campusId: number) {
  return useQuery<MissionDecision[]>({
    queryKey: ["mission-decisions", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mission_decisions")
        .select("*")
        .eq("campus_id", campusId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MissionDecision[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMissionInsights(campusId: number) {
  return useQuery<MissionInsight[]>({
    queryKey: ["mission-insights", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mission_insights")
        .select("*")
        .eq("campus_id", campusId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MissionInsight[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}
