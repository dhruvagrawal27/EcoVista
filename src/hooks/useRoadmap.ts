import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { RoadmapPhase, RoadmapMilestone, RiskRegister } from "@/lib/types";

export interface RoadmapPhaseWithMilestones extends RoadmapPhase {
  milestones: RoadmapMilestone[];
}

export function useRoadmapPhases(campusId: number) {
  return useQuery<RoadmapPhaseWithMilestones[]>({
    queryKey: ["roadmap-phases", campusId],
    queryFn: async () => {
      const { data: phases, error: pErr } = await supabase
        .from("roadmap_phases")
        .select("*")
        .eq("campus_id", campusId)
        .order("phase_number", { ascending: true });
      if (pErr) throw pErr;

      const phaseIds = (phases ?? []).map((p: RoadmapPhase) => p.id);
      if (phaseIds.length === 0) return [];

      const { data: milestones, error: mErr } = await supabase
        .from("roadmap_milestones")
        .select("*")
        .in("phase_id", phaseIds)
        .order("target_date", { ascending: true });
      if (mErr) throw mErr;

      const milestoneMap = new Map<number, RoadmapMilestone[]>();
      for (const m of milestones ?? []) {
        const arr = milestoneMap.get(m.phase_id) ?? [];
        arr.push(m as RoadmapMilestone);
        milestoneMap.set(m.phase_id, arr);
      }

      return (phases ?? []).map((p: RoadmapPhase) => ({
        ...p,
        milestones: milestoneMap.get(p.id) ?? [],
      })) as RoadmapPhaseWithMilestones[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useRiskRegister(campusId: number) {
  return useQuery<RiskRegister[]>({
    queryKey: ["risk-register", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("risk_register")
        .select("*")
        .eq("campus_id", campusId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as RiskRegister[];
    },
    enabled: !!campusId,
    staleTime: 10 * 60 * 1000,
  });
}
