import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { User, DataSource, AuditLog } from "@/lib/types";
import type { MLModelPerformance } from "@/lib/types";

// ── Users with role + department names ─────────────────────────────────────
export interface UserWithMeta extends User {
  role_name: string | null;
  department_name: string | null;
}

export function useUsers(campusId: number) {
  return useQuery<UserWithMeta[]>({
    queryKey: ["admin-users", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          roles:role_id ( name ),
          departments:department_id ( name )
        `)
        .order("name", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as unknown[]).map((u: unknown) => {
        const row = u as Record<string, unknown>;
        const roles = row.roles as { name?: string } | null;
        const departments = row.departments as { name?: string } | null;
        return {
          ...(row as unknown as User),
          role_name: roles?.name ?? null,
          department_name: departments?.name ?? null,
        };
      });
    },
    enabled: !!campusId,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Data Sources ────────────────────────────────────────────────────────────
export function useDataSources(campusId: number) {
  return useQuery<DataSource[]>({
    queryKey: ["admin-data-sources", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_sources")
        .select("*")
        .eq("campus_id", campusId)
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DataSource[];
    },
    enabled: !!campusId,
    refetchInterval: 60 * 1000,
  });
}

// ── ML Models (global, not campus-scoped) ──────────────────────────────────
export interface MLModelWithPerformance {
  id: number;
  name: string;
  version: string;
  accuracy_pct: number | null;
  last_trained_at: string | null;
  status: "staging" | "production" | "deprecated" | "archived";
  total_predictions: number;
  model_type: string | null;
  deployed_at: string | null;
  created_at: string;
  latest_accuracy: number | null;
}

export function useMLModels() {
  return useQuery<MLModelWithPerformance[]>({
    queryKey: ["admin-ml-models"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ml_models")
        .select("*")
        .order("status", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as unknown[]).map((m: unknown) => {
        const row = m as Record<string, unknown>;
        return {
          ...(row as unknown as MLModelWithPerformance),
          latest_accuracy: (row.accuracy_pct as number | null),
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Audit Logs ──────────────────────────────────────────────────────────────
export function useAuditLogs(campusId: number, limit = 50) {
  return useQuery<AuditLog[]>({
    queryKey: ["admin-audit-logs", campusId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("campus_id", campusId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as AuditLog[];
    },
    enabled: !!campusId,
    refetchInterval: 30 * 1000,
  });
}

// ── User Sessions (for Settings) ────────────────────────────────────────────
export function useCurrentUserSessions(userId: number | string | null) {
  return useQuery({
    queryKey: ["user-sessions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", userId!)
        .is("revoked_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
