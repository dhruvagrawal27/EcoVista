/**
 * AuthContext — single source of truth for the logged-in user,
 * their role, and which routes / nav sections they are allowed to see.
 *
 * Role → Permission matrix
 * ─────────────────────────────────────────────────────────────────────
 * Role ID  | Name             | Allowed routes (nav visible)
 * ─────────────────────────────────────────────────────────────────────
 * 1        | Admin            | ALL
 * 2        | Facility Manager | dashboard, mission-control, energy,
 *          |                  | renewables, carbon, insights, kpis,
 *          |                  | reports, roadmap, projects,
 *          |                  | community, leaderboard, challenges,
 *          |                  | settings
 *          |                  | (NO finance, NO admin)
 * 3        | Finance          | dashboard, carbon, insights, kpis,
 *          |                  | finance, reports, roadmap, settings
 * 4        | Faculty          | dashboard, carbon, insights, kpis,
 *          |                  | reports, community, leaderboard,
 *          |                  | challenges, settings
 * 5        | Student Lead     | dashboard, community, leaderboard,
 *          |                  | challenges, settings
 * 6        | System           | (bot account — should never log in)
 * ─────────────────────────────────────────────────────────────────────
 *
 * Department → Role constraint (enforced in Admin "Add User" form)
 * ─────────────────────────────────────────────────────────────────────
 * administrative depts  : Admin, Finance, Student Lead
 * operational depts     : Facility Manager, System
 * academic depts        : Faculty
 * ─────────────────────────────────────────────────────────────────────
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

const DB_SESSION_KEY = "ecovista_db_user";

// ── Types ──────────────────────────────────────────────────────────────────

export type RoleName =
  | "Admin"
  | "Facility Manager"
  | "Finance"
  | "Faculty"
  | "Student Lead"
  | "System"
  | null;

export interface AppUser {
  id: string;          // string so both Supabase UUID and DB integer work
  email: string;
  name: string;
  role_id: number;
  role_name: RoleName;
  department_id: number;
  avatar_url?: string | null;
  source: "supabase" | "db";
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  allowedRoutes: Set<string>;
  canAccess: (route: string) => boolean;
  refresh: () => Promise<void>;
}

// ── Permission map ─────────────────────────────────────────────────────────

const ROLE_ROUTES: Record<number, string[]> = {
  1: [ // Admin — everything
    "/dashboard", "/mission-control", "/energy", "/renewables", "/carbon",
    "/insights", "/kpis", "/finance", "/reports", "/roadmap", "/projects",
    "/community", "/leaderboard", "/challenges", "/admin", "/settings",
  ],
  2: [ // Facility Manager — no Finance, no Admin Panel
    "/dashboard", "/mission-control", "/energy", "/renewables", "/carbon",
    "/insights", "/kpis", "/reports", "/roadmap", "/projects",
    "/community", "/leaderboard", "/challenges", "/settings",
  ],
  3: [ // Finance — financial + analytics pages only
    "/dashboard", "/carbon", "/insights", "/kpis",
    "/finance", "/reports", "/roadmap", "/settings",
  ],
  4: [ // Faculty — read-only, community engagement
    "/dashboard", "/carbon", "/insights", "/kpis",
    "/reports", "/community", "/leaderboard", "/challenges", "/settings",
  ],
  5: [ // Student Lead — community & engagement only
    "/dashboard", "/community", "/leaderboard", "/challenges", "/settings",
  ],
  6: [], // System bot — should never be able to log in
};

const ROLE_NAME_MAP: Record<number, RoleName> = {
  1: "Admin",
  2: "Facility Manager",
  3: "Finance",
  4: "Faculty",
  5: "Student Lead",
  6: "System",
};

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  allowedRoutes: new Set(),
  canAccess: () => false,
  refresh: async () => {},
});

// ── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function resolveUser() {
    // ── 1. Try Supabase Auth session ──────────────────────────────────────
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser) {
      // Fetch the DB row to get role_id / department_id
      const { data: dbRow } = await supabase
        .from("users")
        .select("id, name, role_id, department_id, avatar_url")
        .eq("email", sbUser.email!)
        .single();

      const role_id: number = dbRow?.role_id ?? 1;
      setUser({
        id: sbUser.id,
        email: sbUser.email!,
        name: dbRow?.name ?? sbUser.user_metadata?.name ?? sbUser.email!,
        role_id,
        role_name: ROLE_NAME_MAP[role_id] ?? null,
        department_id: dbRow?.department_id ?? 0,
        avatar_url: dbRow?.avatar_url ?? null,
        source: "supabase",
      });
      setLoading(false);
      return;
    }

    // ── 2. Try DB session (admin-created accounts) ────────────────────────
    const stored = localStorage.getItem(DB_SESSION_KEY);
    if (stored) {
      try {
        const dbUser = JSON.parse(stored);
        const role_id: number = dbUser.role_id ?? 4;
        setUser({
          id: String(dbUser.id),
          email: dbUser.email,
          name: dbUser.name,
          role_id,
          role_name: ROLE_NAME_MAP[role_id] ?? null,
          department_id: dbUser.department_id ?? 0,
          avatar_url: dbUser.avatar_url ?? null,
          source: "db",
        });
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem(DB_SESSION_KEY);
      }
    }

    setUser(null);
    setLoading(false);
  }

  useEffect(() => {
    resolveUser();

    // Re-resolve whenever Supabase session changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      resolveUser();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allowedRoutes = new Set<string>(
    user ? (ROLE_ROUTES[user.role_id] ?? []) : []
  );

  const canAccess = (route: string) => allowedRoutes.has(route);

  return (
    <AuthContext.Provider value={{ user, loading, allowedRoutes, canAccess, refresh: resolveUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

// Export permission map so Admin form can use it
export { ROLE_ROUTES, ROLE_NAME_MAP };
