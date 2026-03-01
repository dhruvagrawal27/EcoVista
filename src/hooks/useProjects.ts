import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Project,
  ProjectMilestone,
  ProjectDependency,
  ProjectEmissionProjection,
} from "@/lib/types";

export interface ProjectWithDetails extends Project {
  milestones: ProjectMilestone[];
  dependencies: ProjectDependency[];
  emission_projections: ProjectEmissionProjection[];
}

export function useProjects(campusId: number) {
  return useQuery<ProjectWithDetails[]>({
    queryKey: ["projects", campusId],
    queryFn: async () => {
      const { data: projects, error: pErr } = await supabase
        .from("projects")
        .select("*")
        .eq("campus_id", campusId)
        .order("created_at", { ascending: false });
      if (pErr) throw pErr;
      if (!projects || projects.length === 0) return [];

      const ids = projects.map((p: Project) => p.id);

      const [msRes, depRes, emRes] = await Promise.all([
        supabase.from("project_milestones").select("*").in("project_id", ids).order("sort_order"),
        supabase.from("project_dependencies").select("*").in("project_id", ids),
        supabase.from("project_emission_projections").select("*").in("project_id", ids).order("projection_year"),
      ]);

      const msMap = new Map<number, ProjectMilestone[]>();
      const depMap = new Map<number, ProjectDependency[]>();
      const emMap = new Map<number, ProjectEmissionProjection[]>();

      for (const m of msRes.data ?? []) {
        const arr = msMap.get(m.project_id) ?? [];
        arr.push(m as ProjectMilestone);
        msMap.set(m.project_id, arr);
      }
      for (const d of depRes.data ?? []) {
        const arr = depMap.get(d.project_id) ?? [];
        arr.push(d as ProjectDependency);
        depMap.set(d.project_id, arr);
      }
      for (const e of emRes.data ?? []) {
        const arr = emMap.get(e.project_id) ?? [];
        arr.push(e as ProjectEmissionProjection);
        emMap.set(e.project_id, arr);
      }

      return (projects as Project[]).map((p) => ({
        ...p,
        milestones: msMap.get(p.id) ?? [],
        dependencies: depMap.get(p.id) ?? [],
        emission_projections: emMap.get(p.id) ?? [],
      })) as ProjectWithDetails[];
    },
    enabled: !!campusId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Project mutations ──────────────────────────────────────────────────────

export type ProjectInsert = Partial<Omit<Project, "id" | "created_at" | "updated_at">> & {
  campus_id: number;
  name: string;
};

export function useCreateProject(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProjectInsert) => {
      const { error } = await supabase.from("projects").insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", campusId] }),
  });
}

export function useUpdateProject(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Project> & { id: number }) => {
      const { error } = await supabase
        .from("projects")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", campusId] }),
  });
}

export function useDeleteProject(campusId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", campusId] }),
  });
}
