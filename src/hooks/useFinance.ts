import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  FinanceSnapshot,
  Investment,
  CapitalProjection,
  Subsidy,
  CarbonCreditForecast,
} from "@/lib/types";

export function useFinanceSnapshot(campusId: number) {
  return useQuery<FinanceSnapshot | null>({
    queryKey: ["finance-snapshot", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("finance_snapshots")
        .select("*")
        .eq("campus_id", campusId)
        .order("snapshot_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as FinanceSnapshot | null;
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useInvestments(campusId: number) {
  return useQuery<Investment[]>({
    queryKey: ["investments", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("campus_id", campusId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Investment[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCapitalProjections(campusId: number) {
  return useQuery<CapitalProjection[]>({
    queryKey: ["capital-projections", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capital_projections")
        .select("*")
        .eq("campus_id", campusId)
        .order("projection_year", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CapitalProjection[];
    },
    enabled: !!campusId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useSubsidies(campusId: number) {
  return useQuery<Subsidy[]>({
    queryKey: ["subsidies", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subsidies")
        .select("*")
        .eq("campus_id", campusId)
        .order("deadline", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Subsidy[];
    },
    enabled: !!campusId,
    staleTime: 15 * 60 * 1000,
  });
}

export function useCarbonCreditForecasts(campusId: number) {
  return useQuery<CarbonCreditForecast[]>({
    queryKey: ["carbon-credit-forecasts", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carbon_credit_forecasts")
        .select("*")
        .eq("campus_id", campusId)
        .order("forecast_year", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CarbonCreditForecast[];
    },
    enabled: !!campusId,
    staleTime: 30 * 60 * 1000,
  });
}

// ── Investment mutations ──────────────────────────────────────────────────────

export function useCreateInvestment(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inv: Omit<Investment, "id" | "campus_id" | "created_at" | "approved_by" | "approved_at">) => {
      const { data, error } = await supabase
        .from("investments")
        .insert({ ...inv, campus_id: campusId, created_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data as Investment;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["investments", campusId] }),
  });
}

export function useUpdateInvestment(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Omit<Investment, "campus_id" | "created_at">> & { id: number }) => {
      const { error } = await supabase
        .from("investments")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["investments", campusId] }),
  });
}

export function useDeleteInvestment(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("investments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["investments", campusId] }),
  });
}

// ── Subsidy mutations ─────────────────────────────────────────────────────────

export function useCreateSubsidy(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sub: Omit<Subsidy, "id" | "campus_id" | "created_at" | "updated_at">) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("subsidies")
        .insert({ ...sub, campus_id: campusId, created_at: now, updated_at: now })
        .select()
        .single();
      if (error) throw error;
      return data as Subsidy;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subsidies", campusId] }),
  });
}

export function useUpdateSubsidy(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Omit<Subsidy, "campus_id" | "created_at">> & { id: number }) => {
      const { error } = await supabase
        .from("subsidies")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subsidies", campusId] }),
  });
}

export function useDeleteSubsidy(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("subsidies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subsidies", campusId] }),
  });
}
