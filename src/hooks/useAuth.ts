import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const DB_SESSION_KEY = "ecovista_db_user";

/** SHA-256 hex — matches the hash stored by useAddUser */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refresh } = useAuth();
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      // ── Path A: Supabase Auth (original admin accounts) ───────────────────
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data.user) return { source: "supabase", user: data.user };

      // ── Path B: DB password_hash check (admin-created accounts) ──────────
      const hash = await sha256(password);
      const { data: dbUser, error: dbError } = await supabase
        .from("users")
        .select("id, name, email, role_id, department_id, status, avatar_url")
        .eq("email", email)
        .eq("password_hash", hash)
        .eq("status", "active")
        .single();

      if (dbError || !dbUser) {
        throw error ?? new Error("Invalid email or password");
      }

      localStorage.setItem(DB_SESSION_KEY, JSON.stringify(dbUser));
      return { source: "db", user: dbUser };
    },
    onSuccess: async () => {
      // Refresh AuthContext FIRST so ProtectedRoute sees the user,
      // then navigate — no blank screen / reload needed.
      await refresh();
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      navigate("/dashboard", { replace: true });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refresh } = useAuth();
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem(DB_SESSION_KEY);
      await supabase.auth.signOut();
    },
    onSuccess: async () => {
      await refresh();
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      navigate("/login", { replace: true });
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      // Check Supabase Auth first
      const { data: { user } } = await supabase.auth.getUser();
      if (user) return user;

      // Fall back to DB session for admin-created users
      const stored = localStorage.getItem(DB_SESSION_KEY);
      if (stored) {
        const dbUser = JSON.parse(stored);
        // Return a shape compatible with supabase User so callers work unchanged
        return {
          id: String(dbUser.id),
          email: dbUser.email,
          user_metadata: {
            name: dbUser.name,
            role_id: dbUser.role_id,
            department_id: dbUser.department_id,
          },
          app_metadata: {},
          aud: "authenticated",
          created_at: "",
        } as unknown as import("@supabase/supabase-js").User;
      }

      return null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
