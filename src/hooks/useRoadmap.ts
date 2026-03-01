import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// ── Phase mutations ────────────────────────────────────────────────────────

export type PhaseUpsert = Partial<Omit<RoadmapPhase, "id" | "created_at" | "updated_at">> & {
  campus_id: number;
};

export function useCreatePhase(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PhaseUpsert) => {
      const { error } = await supabase.from("roadmap_phases").insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmap-phases", campusId] }),
  });
}

export function useUpdatePhase(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<RoadmapPhase> & { id: number }) => {
      const { error } = await supabase
        .from("roadmap_phases")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmap-phases", campusId] }),
  });
}

export function useDeletePhase(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("roadmap_phases").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmap-phases", campusId] }),
  });
}

// ── Risk mutations ─────────────────────────────────────────────────────────

export type RiskUpsert = Partial<Omit<RiskRegister, "id" | "created_at" | "updated_at">> & {
  campus_id: number;
};

export function useCreateRisk(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RiskUpsert) => {
      const { error } = await supabase.from("risk_register").insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["risk-register", campusId] }),
  });
}

export function useUpdateRisk(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<RiskRegister> & { id: number }) => {
      const { error } = await supabase
        .from("risk_register")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["risk-register", campusId] }),
  });
}

export function useDeleteRisk(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("risk_register").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["risk-register", campusId] }),
  });
}
