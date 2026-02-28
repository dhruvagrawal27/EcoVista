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

export function useLeaderboard(campusId: number) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leaderboard_scores")
        .select("*")
        .eq("campus_id", campusId)
        .order("rank", { ascending: true });
      if (error) throw error;

      const scores = (data ?? []) as LeaderboardScore[];
      const teamIds = scores
        .filter((s) => s.entity_type === "team")
        .map((s) => s.entity_id);
      const deptIds = scores
        .filter((s) => s.entity_type === "department")
        .map((s) => s.entity_id);

      const [teamsRes, deptsRes] = await Promise.all([
        teamIds.length > 0
          ? supabase.from("teams").select("id,name").in("id", teamIds)
          : { data: [], error: null },
        deptIds.length > 0
          ? supabase.from("departments").select("id,name").in("id", deptIds)
          : { data: [], error: null },
      ]);

      const teamMap = new Map<number, string>(
        (teamsRes.data ?? []).map((t: Team) => [t.id, t.name])
      );
      const deptMap = new Map<number, string>(
        (deptsRes.data ?? []).map((d: Department) => [d.id, d.name])
      );

      return scores.map((s) => ({
        ...s,
        entity_name:
          s.entity_type === "team"
            ? teamMap.get(s.entity_id) ?? `Team ${s.entity_id}`
            : s.entity_type === "department"
            ? deptMap.get(s.entity_id) ?? `Dept ${s.entity_id}`
            : `${s.entity_type} ${s.entity_id}`,
      })) as LeaderboardEntry[];
    },
    enabled: !!campusId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEcoChallenges(campusId: number) {
  return useQuery<EcoChallenge[]>({
    queryKey: ["eco-challenges", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eco_challenges")
        .select("*")
        .eq("campus_id", campusId)
        .in("status", ["active", "upcoming"])
        .order("start_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EcoChallenge[];
    },
    enabled: !!campusId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCommunityEvents(campusId: number) {
  return useQuery<CommunityEvent[]>({
    queryKey: ["community-events", campusId],
    queryFn: async () => {
      const now = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("community_events")
        .select("*")
        .eq("campus_id", campusId)
        .gte("event_date", now)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CommunityEvent[];
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
    }: {
      challengeId: number;
      userId: number;
    }) => {
      const { error } = await supabase.from("challenge_participants").insert({
        challenge_id: challengeId,
        user_id: userId,
        joined_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eco-challenges"] });
    },
  });
}

export function useRsvpEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      userId,
    }: {
      eventId: number;
      userId: number;
    }) => {
      const { error } = await supabase.from("event_rsvps").insert({
        event_id: eventId,
        user_id: userId,
        rsvped_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-events"] });
    },
  });
}
