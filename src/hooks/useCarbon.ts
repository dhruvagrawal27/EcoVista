import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  CarbonScopeReading,
  CarbonMonthlyTrend,
  CarbonScenario,
  NetzeroMilestone,
  Campus,
} from "@/lib/types";

export function useCarbonScopes(campusId: number) {
  return useQuery<CarbonScopeReading[]>({
    queryKey: ["carbon-scopes", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carbon_scope_readings")
        .select("*")
        .eq("campus_id", campusId)
        .order("recorded_month", { ascending: false })
        .order("scope", { ascending: true })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as CarbonScopeReading[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCarbonTrend(campusId: number, months = 12) {
  return useQuery<CarbonMonthlyTrend[]>({
    queryKey: ["carbon-trend", campusId, months],
    queryFn: async () => {
      const since = new Date();
      since.setMonth(since.getMonth() - months);
      const { data, error } = await supabase
        .from("carbon_monthly_trend")
        .select("*")
        .eq("campus_id", campusId)
        .gte("trend_month", since.toISOString().split("T")[0])
        .order("trend_month", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CarbonMonthlyTrend[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCarbonScenarios(campusId: number) {
  return useQuery<CarbonScenario[]>({
    queryKey: ["carbon-scenarios", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carbon_scenarios")
        .select("*")
        .eq("campus_id", campusId)
        .order("impact_tco2e_yr", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CarbonScenario[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useNetZeroCountdown(campusId: number) {
  return useQuery<{ campus: Campus; milestones: NetzeroMilestone[] } | null>({
    queryKey: ["netzero-countdown", campusId],
    queryFn: async () => {
      const [campusRes, milestonesRes] = await Promise.all([
        supabase.from("campus").select("*").eq("id", campusId).single(),
        supabase
          .from("netzero_milestones")
          .select("*")
          .eq("campus_id", campusId)
          .order("milestone_year", { ascending: true }),
      ]);
      if (campusRes.error) throw campusRes.error;
      if (milestonesRes.error) throw milestonesRes.error;
      return {
        campus: campusRes.data as Campus,
        milestones: (milestonesRes.data ?? []) as NetzeroMilestone[],
      };
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}
