import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { AIRecommendation, AITrustScore, MLModelPerformance } from "@/lib/types";

export type AIRecommendationSortBy = "roi_pct" | "carbon_impact" | "ease_score" | "created_at";

export function useAIRecommendations(
  campusId: number,
  sortBy: AIRecommendationSortBy = "created_at",
  status?: AIRecommendation["status"]
) {
  return useQuery<AIRecommendation[]>({
    queryKey: ["ai-recommendations", campusId, sortBy, status],
    queryFn: async () => {
      let query = supabase
        .from("ai_recommendations")
        .select("*")
        .eq("campus_id", campusId);
      if (status) query = query.eq("status", status);
      const { data, error } = await query.order(sortBy, { ascending: false });
      if (error) throw error;
      return (data ?? []) as AIRecommendation[];
    },
    enabled: !!campusId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateRecommendationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: AIRecommendation["status"];
    }) => {
      const { error } = await supabase
        .from("ai_recommendations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-recommendations"] });
    },
  });
}

export function useAITrustScore(campusId: number) {
  return useQuery<AITrustScore | null>({
    queryKey: ["ai-trust-score", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_trust_scores")
        .select("*")
        .eq("campus_id", campusId)
        .order("score_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as AITrustScore | null;
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMLModelPerformance(days = 30) {
  return useQuery<MLModelPerformance[]>({
    queryKey: ["ml-model-performance", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400 * 1000)
        .toISOString()
        .split("T")[0];
      const { data, error } = await supabase
        .from("ml_model_performance")
        .select("*")
        .gte("report_date", since)
        .order("report_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MLModelPerformance[];
    },
    staleTime: 30 * 60 * 1000,
  });
}

/* ── Create recommendation ─────────────────────────────────────────── */

export function useCreateRecommendation(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Omit<AIRecommendation, "id" | "campus_id" | "created_at" | "updated_at">
    ) => {
      const now = new Date().toISOString();
      const { error } = await supabase.from("ai_recommendations").insert({
        ...payload,
        campus_id: campusId,
        status: "new",
        created_at: now,
        updated_at: now,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-recommendations"] });
    },
  });
}
