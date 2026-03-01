import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

/* ── Mission decision mutations ─────────────────────────────────────── */

export function useCreateMissionDecision(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<MissionDecision, "id" | "campus_id">) => {
      const { error } = await supabase
        .from("mission_decisions")
        .insert({ ...payload, campus_id: campusId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mission-decisions", campusId] });
    },
  });
}

export function useUpdateMissionDecision(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<MissionDecision> & { id: number }) => {
      const { error } = await supabase
        .from("mission_decisions")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mission-decisions", campusId] });
    },
  });
}

export function useDeleteMissionDecision(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("mission_decisions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mission-decisions", campusId] });
    },
  });
}
