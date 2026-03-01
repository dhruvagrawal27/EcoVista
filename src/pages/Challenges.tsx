import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Zap, Leaf, Droplets, Recycle, Users, Star, Calendar,
  TrendingUp, Award, Trophy,
} from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useEcoChallenges, useJoinChallenge } from "@/hooks/useCommunity";
import { useCurrentUser } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { EcoChallenge } from "@/lib/types";

const categoryIcons: Record<string, React.ElementType> = {
  energy: Zap,
  carbon: Leaf,
  water: Droplets,
  waste: Recycle,
  community: Users,
};

const statusColors: Record<string, string> = {
  active: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  upcoming: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  completed: "text-muted-foreground border-border",
  cancelled: "text-red-400 border-red-500/30",
};

function ChallengeCard({
  challenge,
  onJoin,
  joining,
}: {
  challenge: EcoChallenge;
  onJoin: (id: number) => void;
  joining: boolean;
}) {
  const Icon = categoryIcons[challenge.category?.toLowerCase() ?? "energy"] ?? Leaf;
  const endDate = challenge.end_date ? new Date(challenge.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;
  const startDate = challenge.start_date ? new Date(challenge.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;

  return (
    <motion.div whileHover={{ y: -2 }}>
      <Card className="glass-card grain-overlay h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-sm leading-tight">{challenge.title}</CardTitle>
            </div>
            <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[challenge.status] ?? ""}`}>
              {challenge.status}
            </Badge>
          </div>
          {challenge.description && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">{challenge.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3 flex-1 flex flex-col">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="bg-muted/30 rounded p-1.5">
              <p className="font-bold text-foreground">{challenge.reward_points ?? 0}</p>
              <p className="text-muted-foreground">Points</p>
            </div>
            <div className="bg-muted/30 rounded p-1.5">
              <p className="font-bold text-foreground">{challenge.carbon_potential_t?.toFixed(1) ?? "—"} t</p>
              <p className="text-muted-foreground">CO₂ Saved</p>
            </div>
            <div className="bg-muted/30 rounded p-1.5">
              <p className="font-bold text-foreground">{challenge.impact_score?.toFixed(0) ?? "—"}</p>
              <p className="text-muted-foreground">Impact</p>
            </div>
          </div>

          {/* Max participants */}
          {challenge.max_participants != null && (
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />Capacity</span>
                <span>{challenge.max_participants} max</span>
              </div>
              <Progress value={60} className="h-1.5" />
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {startDate && (
              <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />Start: {startDate}</span>
            )}
            {endDate && (
              <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />End: {endDate}</span>
            )}
          </div>

          {/* Reward badge */}
          {challenge.reward_badge && (
            <div className="flex items-center gap-1.5 text-[10px] text-yellow-400">
              <Award className="w-3 h-3" />
              <span>Badge: {challenge.reward_badge}</span>
            </div>
          )}

          {/* Join button */}
          {challenge.status === "active" && (
            <Button
              size="sm"
              className="mt-auto text-xs h-7"
              onClick={() => challenge.id && onJoin(Number(challenge.id))}
              disabled={joining}
            >
              {joining ? "Joining…" : "Join Challenge"}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

const Challenges = () => {
  const { campusId } = useCampusContext();
  const { data: challenges = [], isLoading } = useEcoChallenges(campusId);
  const { data: currentUser } = useCurrentUser();
  const joinMutation = useJoinChallenge();
  const { toast } = useToast();

  const active = challenges.filter(c => c.status === "active");
  const upcoming = challenges.filter(c => c.status === "upcoming");
  const completed = challenges.filter(c => c.status === "completed");

  const totalPoints = challenges.reduce((s, c) => s + (c.reward_points ?? 0), 0);
  const totalCarbon = challenges.reduce((s, c) => s + (c.carbon_potential_t ?? 0), 0);

  const handleJoin = (challengeId: number, title: string) => {
    if (!currentUser) {
      toast({ title: "Not logged in", description: "Please sign in to join challenges.", variant: "destructive" });
      return;
    }
    joinMutation.mutate(
      { challengeId, userId: currentUser.id as unknown as number },
      {
        onSuccess: () => toast({ title: "Joined! 🎉", description: `You've joined "${title}". Good luck!` }),
        onError: (e) => {
          const msg = (e as Error).message;
          if (msg.includes("duplicate") || msg.includes("unique")) {
            toast({ title: "Already joined", description: `You're already in "${title}".` });
          } else {
            toast({ title: "Error joining", description: msg, variant: "destructive" });
          }
        },
      }
    );
  };

  // Static achievement badges (UI decorations, not DB-driven)
  const badges = [
    { label: "Energy Saver", icon: Zap, color: "chart-4" },
    { label: "Carbon Warrior", icon: Leaf, color: "chart-2" },
    { label: "Eco Champion", icon: Trophy, color: "chart-5" },
    { label: "Top Scorer", icon: Star, color: "chart-1" },
  ];

  return (
    <DashboardLayout title="Eco Challenges" breadcrumb="Community · Challenges">
      <div className="max-w-[1400px] mx-auto space-y-4">
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />) : [
            { label: "Active Challenges", value: active.length.toString(), icon: Zap },
            { label: "Upcoming", value: upcoming.length.toString(), icon: Calendar },
            { label: "Total Points", value: totalPoints.toLocaleString(), icon: Star },
            { label: "CO₂ Potential", value: `${totalCarbon.toFixed(1)} t`, icon: Leaf },
          ].map(item => (
            <Card key={item.label} className="glass-card grain-overlay">
              <CardContent className="pt-3 pb-2 text-center">
                <item.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold text-foreground">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active challenges */}
        {(isLoading || active.length > 0) && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <h3 className="text-sm font-semibold text-foreground">Active Challenges</h3>
              <Badge variant="outline" className="text-[10px] ml-auto">{active.length}</Badge>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {active.map(c => (
                  <ChallengeCard
                    key={c.id}
                    challenge={c}
                    onJoin={id => handleJoin(id, c.title)}
                    joining={joinMutation.isPending}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Upcoming challenges */}
        {!isLoading && upcoming.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-foreground">Upcoming Challenges</h3>
              <Badge variant="outline" className="text-[10px] ml-auto">{upcoming.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {upcoming.map(c => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  onJoin={() => {}}
                  joining={false}
                />
              ))}
            </div>
          </>
        )}

        {/* Completed challenges */}
        {!isLoading && completed.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Completed</h3>
              <Badge variant="outline" className="text-[10px] ml-auto">{completed.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {completed.map(c => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  onJoin={() => {}}
                  joining={false}
                />
              ))}
            </div>
          </>
        )}

        {/* Achievement badges (static UI) */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Award className="w-4 h-4 text-yellow-400" />Achievement Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {badges.map(b => (
                <div key={b.label} className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
                  <b.icon className={`w-4 h-4 text-[hsl(var(--${b.color}))]`} />
                  {b.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {!isLoading && challenges.length === 0 && (
          <Card className="glass-card grain-overlay">
            <CardContent className="py-16 text-center text-muted-foreground text-sm">No challenges found for this campus.</CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Challenges;
