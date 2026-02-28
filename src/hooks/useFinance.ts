import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  FinanceSnapshot,
  Investment,
  CapitalProjection,
  Subsidy,
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
