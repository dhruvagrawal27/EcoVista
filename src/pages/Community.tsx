import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Users, Trophy, Award, Calendar, Flame } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useLeaderboard, useEcoChallenges, useCommunityEvents, useJoinChallenge, useRsvpEvent } from "@/hooks/useCommunity";
import { useCurrentUser } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Community = () => {
  const { campusId } = useCampusContext();
  const { data: currentUser } = useCurrentUser();
  const { toast } = useToast();
  const { data: leaderboard = [], isLoading: loadingLB } = useLeaderboard(campusId);
  const { data: challenges = [], isLoading: loadingCh } = useEcoChallenges(campusId);
  const { data: events = [], isLoading: loadingEv } = useCommunityEvents(campusId);
  const joinChallenge = useJoinChallenge();
  const rsvpEvent = useRsvpEvent();

  const activeChallenges = challenges.filter(c => c.status === "active").length;

  const handleJoinChallenge = (challengeId: number, title: string) => {
    if (!currentUser) {
      toast({ title: "Not logged in", description: "Please sign in to join challenges.", variant: "destructive" });
      return;
    }
    joinChallenge.mutate(
      { challengeId, userId: currentUser.id as unknown as number },
      {
        onSuccess: () => toast({ title: "Joined! 🎉", description: `You've joined "${title}".` }),
        onError: (e) => {
          const msg = (e as Error).message;
          if (msg.includes("duplicate") || msg.includes("unique")) {
            toast({ title: "Already joined", description: `You're already participating in "${title}".` });
          } else {
            toast({ title: "Error", description: msg, variant: "destructive" });
          }
        },
      }
    );
  };

  const handleRsvp = (eventId: number, title: string) => {
    if (!currentUser) {
      toast({ title: "Not logged in", description: "Please sign in to RSVP.", variant: "destructive" });
      return;
    }
    rsvpEvent.mutate(
      { eventId, userId: currentUser.id as unknown as number },
      {
        onSuccess: () => toast({ title: "RSVP confirmed! 📅", description: `You're registered for "${title}".` }),
        onError: (e) => {
          const msg = (e as Error).message;
          if (msg.includes("duplicate") || msg.includes("unique")) {
            toast({ title: "Already registered", description: `You've already RSVP'd to "${title}".` });
          } else {
            toast({ title: "Error", description: msg, variant: "destructive" });
          }
        },
      }
    );
  };

  return (
    <DashboardLayout title="Community" breadcrumb="Engagement Community">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1"><Users className="w-3 h-3" /> Community</Badge>
          <span>{leaderboard.length} Teams Active</span>
          <Badge variant="outline" className="gap-1 ml-auto">{activeChallenges} Active Challenges</Badge>
        </div>
        <Tabs defaultValue="leaderboard">
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="leaderboard" className="gap-1.5"><Trophy className="w-3.5 h-3.5" />Leaderboard</TabsTrigger>
            <TabsTrigger value="challenges" className="gap-1.5"><Award className="w-3.5 h-3.5" />Eco Challenges</TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5"><Calendar className="w-3.5 h-3.5" />Events</TabsTrigger>
          </TabsList>
          <TabsContent value="leaderboard" className="space-y-4 mt-4">
            {loadingLB ? <Skeleton className="h-48 w-full" /> : (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {leaderboard.slice(0, 3).map((team, i) => (
                    <motion.div key={team.id} whileHover={{ y: -4 }}>
                      <Card className={`glass-card grain-overlay text-center ${i === 0 ? "border-primary/40" : ""}`}>
                        <CardContent className="pt-6 pb-4">
                          <span className="text-3xl">{["🥇","🥈","🥉"][i]}</span>
                          <p className="text-sm font-bold text-foreground mt-2">{team.entity_name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{team.entity_type}</p>
                          <p className="text-2xl font-bold text-primary mt-2">{(team.total_points ?? 0).toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">points</p>
                          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Flame className="w-3 h-3 text-destructive" />{team.streak_days ?? 0} day streak
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                <Card className="glass-card grain-overlay">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      {leaderboard.slice(3).map(team => (
                        <div key={team.id} className="flex items-center gap-3 border border-border rounded-lg p-3">
                          <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{team.rank ?? "?"}</span>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground">{team.entity_name}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{team.entity_type}</p>
                          </div>
                          <span className="text-sm font-bold text-foreground">{(team.total_points ?? 0).toLocaleString()} pts</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Flame className="w-3 h-3" />{team.streak_days ?? 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          <TabsContent value="challenges" className="space-y-4 mt-4">
            {loadingCh ? <Skeleton className="h-48 w-full" /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map(ch => (
                  <motion.div key={ch.id} whileHover={{ y: -2 }}>
                    <Card className={`glass-card grain-overlay ${ch.status !== "active" ? "opacity-60" : ""}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{ch.title}</CardTitle>
                          <Badge variant={ch.status === "active" ? "default" : "outline"} className="text-[10px] capitalize">{ch.status}</Badge>
                        </div>
                        <CardDescription className="text-xs">{ch.category} · {ch.reward_points ?? 0} pts reward</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>Max: {ch.max_participants ?? "Unlimited"} participants</span>
                          <span>Ends: {ch.end_date}</span>
                        </div>
                        {ch.status === "active" && (
                          <Button size="sm" className="rounded-full mt-2 w-full premium-button text-xs"
                            disabled={joinChallenge.isPending}
                            onClick={() => handleJoinChallenge(ch.id, ch.title)}>
                            Join Challenge
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="events" className="space-y-4 mt-4">
            {loadingEv ? <Skeleton className="h-48 w-full" /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map(ev => (
                  <motion.div key={ev.id} whileHover={{ x: 4 }}>
                    <Card className="glass-card grain-overlay">
                      <CardContent className="pt-4 pb-3 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">{ev.event_date} · {ev.location ?? "Campus"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] h-4">{ev.event_type ?? "Event"}</Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" />{ev.max_attendees ?? "Open"}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="rounded-full text-xs"
                          disabled={rsvpEvent.isPending}
                          onClick={() => handleRsvp(ev.id, ev.title)}>
                          RSVP
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Community;