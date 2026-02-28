import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  SolarArray,
  SolarArrayReading,
  RenewableMonthlyGeneration,
  GridState,
} from "@/lib/types";

export interface SolarArrayWithLatest extends SolarArray {
  latest_reading: SolarArrayReading | null;
}

export function useSolarArrays(campusId: number) {
  return useQuery<SolarArrayWithLatest[]>({
    queryKey: ["solar-arrays", campusId],
    queryFn: async () => {
      // Get all buildings for campus
      const { data: buildings, error: bErr } = await supabase
        .from("buildings")
        .select("id")
        .eq("campus_id", campusId);
      if (bErr) throw bErr;

      const buildingIds = (buildings ?? []).map((b: { id: number }) => b.id);
      if (buildingIds.length === 0) return [];

      const { data: arrays, error: aErr } = await supabase
        .from("solar_arrays")
        .select("*")
        .in("building_id", buildingIds)
        .order("name");
      if (aErr) throw aErr;

      const arrayIds = (arrays ?? []).map((a: SolarArray) => a.id);
      if (arrayIds.length === 0) return [];

      // Latest reading per array via max recorded_at
      const { data: readings, error: rErr } = await supabase
        .from("solar_array_readings")
        .select("*")
        .in("array_id", arrayIds)
        .order("recorded_at", { ascending: false })
        .limit(arrayIds.length * 5);
      if (rErr) throw rErr;

      const latestMap = new Map<number, SolarArrayReading>();
      for (const r of readings ?? []) {
        if (!latestMap.has(r.array_id)) latestMap.set(r.array_id, r as SolarArrayReading);
      }

      return (arrays ?? []).map((a: SolarArray) => ({
        ...a,
        latest_reading: latestMap.get(a.id) ?? null,
      })) as SolarArrayWithLatest[];
    },
    enabled: !!campusId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRenewableMonthlyGeneration(campusId: number, months = 12) {
  return useQuery<RenewableMonthlyGeneration[]>({
    queryKey: ["renewable-monthly", campusId, months],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("renewable_monthly_generation")
        .select("*")
        .eq("campus_id", campusId)
        .order("gen_month", { ascending: true })
        .limit(months);
      if (error) throw error;
      return (data ?? []) as RenewableMonthlyGeneration[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useLatestGridState(campusId: number) {
  return useQuery<GridState | null>({
    queryKey: ["grid-state-latest", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grid_state")
        .select("*")
        .eq("campus_id", campusId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as GridState) ?? null;
    },
    enabled: !!campusId,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
