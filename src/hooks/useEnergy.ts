import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  EnergyReading,
  EnergyDailySummary,
  EnergyRiskScore,
  GridState,
  Equipment,
  EquipmentLoadReading,
  EnergyForecast,
  ForecastAccuracyDaily,
  LoadProfile,
  BenchmarkData,
  EnergyCostDaily,
  RetrofitSuggestion,
  Building,
} from "@/lib/types";

export function useEnergyReadings(campusId: number, hours = 24) {
  return useQuery<EnergyReading[]>({
    queryKey: ["energy-readings", campusId, hours],
    queryFn: async () => {
      const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from("energy_readings")
        .select("*")
        .eq("campus_id", campusId)
        .gte("recorded_at", since)
        .order("recorded_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EnergyReading[];
    },
    enabled: !!campusId,
    staleTime: 60 * 1000,
  });
}

export function useEnergyDailySummary(campusId: number, days = 30) {
  return useQuery<EnergyDailySummary[]>({
    queryKey: ["energy-daily-summary", campusId, days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400 * 1000)
        .toISOString()
        .split("T")[0];
      const { data, error } = await supabase
        .from("energy_daily_summary")
        .select("*")
        .eq("campus_id", campusId)
        .gte("summary_date", since)
        .order("summary_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EnergyDailySummary[];
    },
    enabled: !!campusId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLatestEnergyDailySummary(campusId: number) {
  return useQuery<EnergyDailySummary | null>({
    queryKey: ["energy-daily-summary-latest", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("energy_daily_summary")
        .select("*")
        .eq("campus_id", campusId)
        .is("building_id", null)
        .order("summary_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as EnergyDailySummary | null;
    },
    enabled: !!campusId,
    staleTime: 60 * 1000,
  });
}

export function useEnergyRiskScore(campusId: number) {
  return useQuery<EnergyRiskScore | null>({
    queryKey: ["energy-risk-score", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("energy_risk_scores")
        .select("*")
        .eq("campus_id", campusId)
        .order("recorded_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as EnergyRiskScore | null;
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGridState(campusId: number) {
  return useQuery<GridState | null>({
    queryKey: ["grid-state", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grid_state")
        .select("*")
        .eq("campus_id", campusId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as GridState | null;
    },
    enabled: !!campusId,
    staleTime: 60 * 1000,
  });
}

export interface EquipmentWithLoad extends Equipment {
  latest_load: EquipmentLoadReading | null;
}

export function useEquipmentLoad(campusId: number) {
  return useQuery<EquipmentWithLoad[]>({
    queryKey: ["equipment-load", campusId],
    queryFn: async () => {
      const { data: buildings, error: bErr } = await supabase
        .from("buildings")
        .select("id")
        .eq("campus_id", campusId);
      if (bErr) throw bErr;
      const buildingIds = (buildings ?? []).map((b: { id: number }) => b.id);
      if (buildingIds.length === 0) return [];

      const { data: equipment, error: eErr } = await supabase
        .from("equipment")
        .select("*")
        .in("building_id", buildingIds);
      if (eErr) throw eErr;

      const equipmentIds = (equipment ?? []).map((e: Equipment) => e.id);
      if (equipmentIds.length === 0) return [];

      const { data: loads, error: lErr } = await supabase
        .from("equipment_load_readings")
        .select("*")
        .in("equipment_id", equipmentIds)
        .order("recorded_at", { ascending: false });
      if (lErr) throw lErr;

      const latestByEquipment = new Map<number, EquipmentLoadReading>();
      for (const load of loads ?? []) {
        if (!latestByEquipment.has(load.equipment_id)) {
          latestByEquipment.set(load.equipment_id, load as EquipmentLoadReading);
        }
      }

      return (equipment ?? []).map((e: Equipment) => ({
        ...e,
        latest_load: latestByEquipment.get(e.id) ?? null,
      })) as EquipmentWithLoad[];
    },
    enabled: !!campusId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useEnergyForecasts(campusId: number, hours = 72) {
  return useQuery<EnergyForecast[]>({
    queryKey: ["energy-forecasts", campusId, hours],
    queryFn: async () => {
      const now = new Date().toISOString();
      const until = new Date(Date.now() + hours * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from("energy_forecasts")
        .select("*")
        .eq("campus_id", campusId)
        .gte("forecast_at", now)
        .lte("forecast_at", until)
        .order("forecast_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EnergyForecast[];
    },
    enabled: !!campusId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useForecastAccuracy(campusId: number, days = 30) {
  return useQuery<ForecastAccuracyDaily[]>({
    queryKey: ["forecast-accuracy", campusId, days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400 * 1000)
        .toISOString()
        .split("T")[0];
      const { data, error } = await supabase
        .from("forecast_accuracy_daily")
        .select("*")
        .eq("campus_id", campusId)
        .gte("report_date", since)
        .order("report_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ForecastAccuracyDaily[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useLoadProfiles(campusId: number) {
  return useQuery<LoadProfile[]>({
    queryKey: ["load-profiles", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("load_profiles")
        .select("*")
        .eq("campus_id", campusId)
        .order("profile_date", { ascending: false })
        .order("hour", { ascending: true })
        .limit(96); // 2 days (weekday + weekend) × 48 half-hours max
      if (error) throw error;
      return (data ?? []) as LoadProfile[];
    },
    enabled: !!campusId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useBenchmarkData(campusId: number) {
  return useQuery<BenchmarkData[]>({
    queryKey: ["benchmark-data", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("benchmark_data")
        .select("*")
        .eq("campus_id", campusId)
        .order("recorded_year", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BenchmarkData[];
    },
    enabled: !!campusId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useEnergyCostHeatmap(campusId: number) {
  return useQuery<EnergyCostDaily[]>({
    queryKey: ["energy-cost-heatmap", campusId],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { data, error } = await supabase
        .from("energy_cost_daily")
        .select("*")
        .eq("campus_id", campusId)
        .gte("cost_date", startOfMonth.toISOString().split("T")[0])
        .order("cost_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EnergyCostDaily[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useRetrofitSuggestions(campusId: number, buildingId?: number) {
  return useQuery<RetrofitSuggestion[]>({
    queryKey: ["retrofit-suggestions", campusId, buildingId],
    queryFn: async () => {
      let query = supabase
        .from("retrofit_suggestions")
        .select("*")
        .eq("campus_id", campusId);
      if (buildingId) query = query.eq("building_id", buildingId);
      const { data, error } = await query.order("created_at", {
        ascending: false,
      });
      if (error) throw error;
      return (data ?? []) as RetrofitSuggestion[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useBuildings(campusId: number) {
  return useQuery<Building[]>({
    queryKey: ["buildings", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .eq("campus_id", campusId)
        .order("name");
      if (error) throw error;
      return (data ?? []) as Building[];
    },
    enabled: !!campusId,
    staleTime: 15 * 60 * 1000,
  });
}
