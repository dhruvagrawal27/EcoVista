import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  UserNotificationPreferences,
  UserDisplayPreferences,
  UserAIPreferences,
} from "@/lib/types";

// ── Notification Preferences ──────────────────────────────────────────────

export function useNotificationPrefs(userId: number | null) {
  return useQuery<UserNotificationPreferences | null>({
    queryKey: ["notif-prefs", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return (data as UserNotificationPreferences) ?? null;
    },
  });
}

export function useSaveNotificationPrefs(userId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Omit<UserNotificationPreferences, "id" | "user_id" | "updated_at">) => {
      const { error } = await supabase
        .from("user_notification_preferences")
        .upsert(
          { user_id: userId!, ...prefs, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notif-prefs", userId] });
    },
  });
}

// ── Display Preferences ────────────────────────────────────────────────────

export function useDisplayPrefs(userId: number | null) {
  return useQuery<UserDisplayPreferences | null>({
    queryKey: ["display-prefs", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_display_preferences")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return (data as UserDisplayPreferences) ?? null;
    },
  });
}

export function useSaveDisplayPrefs(userId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Omit<UserDisplayPreferences, "id" | "user_id" | "updated_at">) => {
      const { error } = await supabase
        .from("user_display_preferences")
        .upsert(
          { user_id: userId!, ...prefs, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["display-prefs", userId] });
    },
  });
}

// ── AI Preferences ─────────────────────────────────────────────────────────

export function useAIPrefs(userId: number | null) {
  return useQuery<UserAIPreferences | null>({
    queryKey: ["ai-prefs", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_ai_preferences")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return (data as UserAIPreferences) ?? null;
    },
  });
}

export function useSaveAIPrefs(userId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Omit<UserAIPreferences, "id" | "user_id" | "updated_at">) => {
      const { error } = await supabase
        .from("user_ai_preferences")
        .upsert(
          { user_id: userId!, ...prefs, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-prefs", userId] });
    },
  });
}
