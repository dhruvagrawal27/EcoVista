import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

// ── Add User (DB-only: hashes password with SHA-256, stores in users table) ──
export interface NewUserPayload {
  name: string;
  email: string;
  password: string;
  role_id: number;
  department_id: number;
}

/** SHA-256 hex digest — built into all modern browsers, no npm package needed */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function useAddUser(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewUserPayload) => {
      // Hash password with SHA-256 (no rate limits, no Supabase Auth call)
      const passwordHash = await sha256(payload.password);

      const { data, error: dbError } = await supabase.from("users").insert({
        name: payload.name,
        email: payload.email,
        password_hash: passwordHash,
        role_id: payload.role_id,
        department_id: payload.department_id,
        status: "active",
        last_active_at: new Date().toISOString(),
      }).select().single();
      if (dbError) throw dbError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users", campusId] });
    },
  });
}

// ── Toggle User Status ────────────────────────────────────────────────────────
export function useToggleUserStatus(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, newStatus }: { userId: number; newStatus: "active" | "inactive" }) => {
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users", campusId] });
    },
  });
}

// ── Retrain ML Model ──────────────────────────────────────────────────────────
export function useRetrainModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (modelId: number) => {
      const { error } = await supabase
        .from("ml_models")
        .update({ last_trained_at: new Date().toISOString() })
        .eq("id", modelId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ml-models"] });
    },
  });
}

// ── Roles & Departments (for Add User form) ────────────────────────────────
export function useRoles() {
  return useQuery<{ id: number; name: string }[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("roles").select("id,name").order("id");
      if (error) throw error;
      return (data ?? []) as { id: number; name: string }[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useDepartments() {
  return useQuery<{ id: number; name: string; type: string }[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("id,name,type").order("name");
      if (error) throw error;
      return (data ?? []) as { id: number; name: string; type: string }[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ── Platform Config — read + write ─────────────────────────────────────────
export interface PlatformConfigRow {
  config_key: string;
  config_value: string;
  config_group: string | null;
}

export function usePlatformConfig(campusId: number) {
  return useQuery<Record<string, string>>({
    queryKey: ["platform-config", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_config")
        .select("config_key, config_value")
        .eq("campus_id", campusId);
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((row: { config_key: string; config_value: string }) => {
        map[row.config_key] = row.config_value;
      });
      return map;
    },
    enabled: !!campusId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSavePlatformConfig(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entries: { key: string; value: string; group: string }[]) => {
      const rows = entries.map(e => ({
        campus_id: campusId,
        config_key: e.key,
        config_value: e.value,
        config_group: e.group,
      }));
      const { error } = await supabase
        .from("platform_config")
        .upsert(rows, { onConflict: "campus_id,config_key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-config", campusId] });
    },
  });
}

// ── Alert Config — read + write ────────────────────────────────────────────
export interface AlertConfigRow {
  critical_auto_escalate: boolean;
  email_on_warning: boolean;
  sms_on_critical: boolean;
  auto_acknowledge_info: boolean;
}

export function useAlertConfig(campusId: number) {
  return useQuery<AlertConfigRow>({
    queryKey: ["alert-config", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alert_config")
        .select("*")
        .eq("campus_id", campusId)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return (data as AlertConfigRow) ?? {
        critical_auto_escalate: true,
        email_on_warning: true,
        sms_on_critical: false,
        auto_acknowledge_info: true,
      };
    },
    enabled: !!campusId,
  });
}

export function useSaveAlertConfig(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cfg: AlertConfigRow) => {
      const { error } = await supabase
        .from("alert_config")
        .upsert({ campus_id: campusId, ...cfg }, { onConflict: "campus_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-config", campusId] });
    },
  });
}

// ── Insert Audit Log ───────────────────────────────────────────────────────
export function useInsertAuditLog(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userLabel,
      action,
      logType,
    }: {
      userLabel: string;
      action: string;
      logType: "alert" | "config" | "action" | "system" | "report";
    }) => {
      const { error } = await supabase.from("audit_logs").insert({
        campus_id: campusId,
        user_label: userLabel,
        action,
        log_type: logType,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs", campusId] });
    },
  });
}
