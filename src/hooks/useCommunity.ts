import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  LeaderboardScore,
  EcoChallenge,
  CommunityEvent,
  Team,
  Department,
} from "@/lib/types";

export interface LeaderboardEntry extends LeaderboardScore {
  entity_name: string;
}

// ── Resolve DB integer user ID from AppUser ────────────────────────────────
// AppUser.id is a Supabase UUID for supabase-source users, or a numeric
// string for DB-source users. Challenge/RSVP tables need the DB integer.
export async function resolveDbUserId(appUserId: string, appUserEmail: string): Promise<number> {
  // DB users already have numeric string IDs
  const asInt = parseInt(appUserId, 10);
  if (!isNaN(asInt) && String(asInt) === appUserId) return asInt;

  // Supabase auth users — look up by email in users table
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", appUserEmail)
    .single();
  if (error || !data) throw new Error("User not found in database. Please contact admin.");
  return data.id as number;
}

export function useLeaderboard(campusId: number) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leaderboard_scores")
        .select("*")
        .eq("campus_id", campusId);
      if (error) throw error;

      const rows = (data ?? []) as LeaderboardScore[];

      // Aggregate: sum total_points across all periods per (entity_type, entity_id)
      // Keep the most recent row's metadata (streak_days, trend, hall_of_fame)
      const aggregated = new Map<string, LeaderboardScore>();
      for (const row of rows) {
        const key = `${row.entity_type}::${row.entity_id}`;
        if (!aggregated.has(key)) {
          aggregated.set(key, { ...row });
        } else {
          const existing = aggregated.get(key)!;
          aggregated.set(key, {
            ...existing,
            total_points: existing.total_points + row.total_points,
            // keep highest streak
            streak_days: Math.max(existing.streak_days ?? 0, row.streak_days ?? 0),
            // if any row is hall_of_fame, keep it
            hall_of_fame: existing.hall_of_fame || row.hall_of_fame,
            // trend: if any row says "up", keep "up"
            trend: row.trend === "up" ? "up" : existing.trend,
          });
        }
      }

      // Sort by total_points descending, re-derive rank
      const scores = Array.from(aggregated.values())
        .sort((a, b) => b.total_points - a.total_points)
        .map((s, i) => ({ ...s, rank: (i + 1) as unknown as LeaderboardScore["rank"] }));

      const teamIds = scores.filter(s => s.entity_type === "team").map(s => s.entity_id);
      const deptIds = scores.filter(s => s.entity_type === "department").map(s => s.entity_id);
      const buildingIds = scores.filter(s => s.entity_type === "building").map(s => s.entity_id);

      const [teamsRes, deptsRes, bldgsRes] = await Promise.all([
        teamIds.length > 0
          ? supabase.from("teams").select("id,name").in("id", teamIds)
          : { data: [], error: null },
        deptIds.length > 0
          ? supabase.from("departments").select("id,name").in("id", deptIds)
          : { data: [], error: null },
        buildingIds.length > 0
          ? supabase.from("buildings").select("id,name").in("id", buildingIds)
          : { data: [], error: null },
      ]);

      const teamMap = new Map<number, string>((teamsRes.data ?? []).map((t: any) => [t.id, t.name]));
      const deptMap = new Map<number, string>((deptsRes.data ?? []).map((d: any) => [d.id, d.name]));
      const bldgMap = new Map<number, string>((bldgsRes.data ?? []).map((b: any) => [b.id, b.name]));

      return scores.map(s => ({
        ...s,
        entity_name:
          s.entity_type === "team" ? teamMap.get(s.entity_id) ?? `Team ${s.entity_id}`
          : s.entity_type === "department" ? deptMap.get(s.entity_id) ?? `Dept ${s.entity_id}`
          : s.entity_type === "building" ? bldgMap.get(s.entity_id) ?? `Building ${s.entity_id}`
          : `${s.entity_type} ${s.entity_id}`,
      })) as LeaderboardEntry[];
    },
    enabled: !!campusId,
    staleTime: 30 * 1000, // refresh every 30s so points show quickly after validate
  });
}

// Returns all challenges (active, upcoming, completed) with participant count
export function useEcoChallenges(campusId: number) {
  return useQuery<(EcoChallenge & { participant_count: number })[]>({
    queryKey: ["eco-challenges", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eco_challenges")
        .select("*, challenge_participants(count)")
        .eq("campus_id", campusId)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        ...row,
        participant_count: row.challenge_participants?.[0]?.count ?? 0,
      }));
    },
    enabled: !!campusId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCommunityEvents(campusId: number) {
  return useQuery<(CommunityEvent & { rsvp_count: number })[]>({
    queryKey: ["community-events", campusId],
    queryFn: async () => {
      const now = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("community_events")
        .select("*, event_rsvps(count)")
        .eq("campus_id", campusId)
        .gte("event_date", now)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        ...row,
        rsvp_count: row.event_rsvps?.[0]?.count ?? 0,
      }));
    },
    enabled: !!campusId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      challengeId,
      userId,
      userEmail,
    }: {
      challengeId: number;
      userId: string;
      userEmail: string;
    }) => {
      const dbUserId = await resolveDbUserId(userId, userEmail);
      const { error } = await supabase.from("challenge_participants").insert({
        challenge_id: challengeId,
        user_id: dbUserId,
        joined_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["eco-challenges"] });
      queryClient.invalidateQueries({ queryKey: ["user-challenge-ids", vars.userId] });
    },
  });
}

export function useRsvpEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      userId,
      userEmail,
    }: {
      eventId: number;
      userId: string;
      userEmail: string;
    }) => {
      const dbUserId = await resolveDbUserId(userId, userEmail);
      const { error } = await supabase.from("event_rsvps").insert({
        event_id: eventId,
        user_id: dbUserId,
        rsvped_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["community-events"] });
      queryClient.invalidateQueries({ queryKey: ["user-rsvp-ids", vars.userId] });
    },
  });
}

// ── Track what the current user has already joined/RSVP'd ─────────────────
export function useUserChallengeIds(userId: string | undefined, userEmail: string | undefined) {
  return useQuery<Set<number>>({
    queryKey: ["user-challenge-ids", userId],
    queryFn: async () => {
      if (!userId || !userEmail) return new Set<number>();
      const dbUserId = await resolveDbUserId(userId, userEmail);
      const { data, error } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", dbUserId);
      if (error) throw error;
      return new Set((data ?? []).map((r: any) => r.challenge_id as number));
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserRsvpIds(userId: string | undefined, userEmail: string | undefined) {
  return useQuery<Set<number>>({
    queryKey: ["user-rsvp-ids", userId],
    queryFn: async () => {
      if (!userId || !userEmail) return new Set<number>();
      const dbUserId = await resolveDbUserId(userId, userEmail);
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("event_id")
        .eq("user_id", dbUserId);
      if (error) throw error;
      return new Set((data ?? []).map((r: any) => r.event_id as number));
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Admin: create / delete challenges and events ───────────────────────────
export function useCreateChallenge(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ch: {
      title: string; description: string; category: string;
      start_date: string; end_date: string;
      reward_points: number; max_participants: number | null;
    }) => {
      const { error } = await supabase.from("eco_challenges").insert({
        campus_id: campusId,
        ...ch,
        status: "upcoming",
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["eco-challenges", campusId] }),
  });
}

export function useDeleteChallenge(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (challengeId: number) => {
      const { error } = await supabase.from("eco_challenges").delete().eq("id", challengeId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["eco-challenges", campusId] }),
  });
}

export function useCreateEvent(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ev: {
      title: string; event_date: string; location: string;
      event_type: string; max_attendees: number | null;
    }) => {
      const { error } = await supabase.from("community_events").insert({
        campus_id: campusId,
        ...ev,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-events", campusId] }),
  });
}

export function useDeleteEvent(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: number) => {
      const { error } = await supabase.from("community_events").delete().eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-events", campusId] }),
  });
}

// ── Admin: mark challenge completed + credit points to participants ─────────
// Each participant → their department → department leaderboard_scores updated.
// Two writes per department: (a) a challenge-specific period row for audit,
// (b) the existing main monthly period row so leaderboard rank changes live.
export function useCompleteChallenge(campusId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ challengeId, rewardPoints }: { challengeId: number; rewardPoints: number }) => {

      // 1. Mark challenge as completed
      const { error: upErr } = await supabase
        .from("eco_challenges")
        .update({ status: "completed" })
        .eq("id", challengeId);
      if (upErr) throw upErr;

      // 2. Get all participants (DB integer user_ids)
      const { data: participants, error: pErr } = await supabase
        .from("challenge_participants")
        .select("user_id")
        .eq("challenge_id", challengeId);
      if (pErr) throw pErr;
      if (!participants || participants.length === 0) return { credited: 0, departments: 0 };

      const userIds: number[] = [...new Set(participants.map((p: any) => p.user_id as number))];

      // 3. Resolve user → department_id
      const { data: usersData, error: uErr } = await supabase
        .from("users")
        .select("id, department_id")
        .in("id", userIds);
      if (uErr) throw uErr;

      // Collect unique department IDs (one credit per dept, not per user)
      const deptIds = new Set<number>();
      for (const u of (usersData ?? [])) {
        if (u.department_id) deptIds.add(u.department_id as number);
      }

      if (deptIds.size === 0) return { credited: userIds.length, departments: 0 };

      const today = new Date().toISOString().split("T")[0];
      const periodLabel = `challenge_${challengeId}`;

      for (const deptId of deptIds) {
        // (a) Write / update the challenge-specific reward row
        const { data: rewardRow } = await supabase
          .from("leaderboard_scores")
          .select("id, total_points")
          .eq("campus_id", campusId)
          .eq("entity_type", "department")
          .eq("entity_id", deptId)
          .eq("period_label", periodLabel)
          .maybeSingle();

        if (rewardRow) {
          await supabase
            .from("leaderboard_scores")
            .update({ total_points: rewardRow.total_points + rewardPoints, trend: "up" })
            .eq("id", rewardRow.id);
        } else {
          await supabase.from("leaderboard_scores").insert({
            campus_id: campusId,
            entity_type: "department",
            entity_id: deptId,
            period_label: periodLabel,
            period_start: today,
            period_end: today,
            total_points: rewardPoints,
            streak_days: 0,
            rank: 1,
            trend: "up",
            hall_of_fame: false,
          });
        }

        // (b) Also bump the most recent main period row (e.g. "Feb 2026") so the
        //     Departments leaderboard tab reflects the change immediately
        const { data: mainRows } = await supabase
          .from("leaderboard_scores")
          .select("id, total_points, period_label")
          .eq("campus_id", campusId)
          .eq("entity_type", "department")
          .eq("entity_id", deptId)
          .neq("period_label", periodLabel)
          .order("computed_at", { ascending: false })
          .limit(1);

        if (mainRows && mainRows.length > 0) {
          await supabase
            .from("leaderboard_scores")
            .update({ total_points: mainRows[0].total_points + rewardPoints, trend: "up" })
            .eq("id", mainRows[0].id);
        }
      }

      return { credited: userIds.length, departments: deptIds.size };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eco-challenges", campusId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard", campusId] });
    },
  });
}
