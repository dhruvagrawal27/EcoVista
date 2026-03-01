import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Users, Trophy, Award, Calendar, Flame, CheckCircle2, Info, Shield } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useLeaderboard, useEcoChallenges, useCommunityEvents, useJoinChallenge, useRsvpEvent, useUserChallengeIds, useUserRsvpIds } from "@/hooks/useCommunity";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Community = () => {
  const { campusId } = useCampusContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: leaderboard = [], isLoading: loadingLB } = useLeaderboard(campusId);
  const { data: challenges = [], isLoading: loadingCh } = useEcoChallenges(campusId);
  const { data: events = [], isLoading: loadingEv } = useCommunityEvents(campusId);
  const { data: joinedIds = new Set<number>() } = useUserChallengeIds(user?.id, user?.email);
  const { data: rsvpdIds = new Set<number>() } = useUserRsvpIds(user?.id, user?.email);
  const joinChallenge = useJoinChallenge();
  const rsvpEvent = useRsvpEvent();

  const activeChallenges = challenges.filter(c => c.status === "active").length;

  const handleJoinChallenge = (challengeId: number, title: string) => {
    if (!user) {
      toast({ title: "Not logged in", description: "Please sign in to join challenges.", variant: "destructive" });
      return;
    }
    joinChallenge.mutate(
      { challengeId, userId: user.id, userEmail: user.email },
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
    if (!user) {
      toast({ title: "Not logged in", description: "Please sign in to RSVP.", variant: "destructive" });
      return;
    }
    rsvpEvent.mutate(
      { eventId, userId: user.id, userEmail: user.email },
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

        {/* Role access info banner */}
        {user && (
          <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground">
            {user.role_name === "Admin" ? (
              <Shield className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            ) : (
              <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            )}
            <div>
              {user.role_name === "Admin" ? (
                <span><span className="font-medium text-primary">Admin:</span> You can create/delete challenges & events and validate completed challenges (crediting points to leaderboard) from the <span className="font-medium">Admin → Engagement</span> tab.</span>
              ) : user.role_name === "Faculty" || user.role_name === "Facility Manager" ? (
                <span><span className="font-medium text-primary capitalize">{user.role_name}:</span> You can join challenges, RSVP to events and track your team's leaderboard standing. Challenge creation is managed by Admins.</span>
              ) : (
                <span><span className="font-medium text-primary">How it works:</span> Join active challenges → participate during the challenge period → Admin validates completion → <span className="font-medium text-emerald-400">reward points are credited to your team on the leaderboard.</span> RSVP to events to reserve your spot.</span>
              )}
            </div>
          </div>
        )}

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
            {loadingCh ? <Skeleton className="h-48 w-full" /> : (() => {
              const active = challenges.filter(ch => ch.status === "active");
              const upcoming = challenges.filter(ch => ch.status === "upcoming");
              const completed = challenges.filter(ch => ch.status === "completed");

              const ChallengeCard = (ch: typeof challenges[0]) => {
                const alreadyJoined = joinedIds.has(ch.id);
                const pct = ch.max_participants ? Math.round((ch.participant_count / ch.max_participants) * 100) : 0;
                const isCompleted = ch.status === "completed";
                return (
                  <motion.div key={ch.id} whileHover={{ y: -2 }}>
                    <Card className={`glass-card grain-overlay ${isCompleted ? "opacity-50" : ch.status !== "active" ? "opacity-70" : ""}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{ch.title}</CardTitle>
                          <Badge
                            variant={ch.status === "active" ? "default" : "outline"}
                            className={`text-[10px] capitalize ${isCompleted ? "text-muted-foreground" : ""}`}
                          >{ch.status}</Badge>
                        </div>
                        <CardDescription className="text-xs">{ch.category} · {ch.reward_points ?? 0} pts reward</CardDescription>
                        {ch.description && (
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{ch.description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ch.participant_count} joined{ch.max_participants ? ` / ${ch.max_participants} max` : ""}</span>
                          <span>{isCompleted ? "Ended:" : "Ends:"} {ch.end_date}</span>
                        </div>
                        {ch.max_participants && <Progress value={pct} className="h-1.5 mb-2" />}
                        {isCompleted ? (
                          alreadyJoined ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-500 mt-2">
                              <CheckCircle2 className="w-3.5 h-3.5" /> You participated · Points credited to your department
                            </div>
                          ) : (
                            <p className="text-[11px] text-muted-foreground mt-2">Challenge ended</p>
                          )
                        ) : ch.status === "active" ? (
                          alreadyJoined ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-500 mt-2">
                              <CheckCircle2 className="w-3.5 h-3.5" /> You're participating
                            </div>
                          ) : (
                            <Button size="sm" className="rounded-full mt-2 w-full premium-button text-xs"
                              disabled={joinChallenge.isPending}
                              onClick={() => handleJoinChallenge(ch.id, ch.title)}>
                              Join Challenge
                            </Button>
                          )
                        ) : null}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              };

              return (
                <div className="space-y-4">
                  {active.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />Active
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {active.map(ch => ChallengeCard(ch))}
                      </div>
                    </>
                  )}
                  {upcoming.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-foreground mt-2">Upcoming</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcoming.map(ch => ChallengeCard(ch))}
                      </div>
                    </>
                  )}
                  {completed.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground mt-2 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />Completed
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {completed.map(ch => ChallengeCard(ch))}
                      </div>
                    </>
                  )}
                  {challenges.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-8">No challenges yet</p>
                  )}
                </div>
              );
            })()}
          </TabsContent>
          <TabsContent value="events" className="space-y-4 mt-4">
            {loadingEv ? <Skeleton className="h-48 w-full" /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map(ev => {
                  const alreadyRsvpd = rsvpdIds.has(ev.id);
                  return (
                    <motion.div key={ev.id} whileHover={{ x: 4 }}>
                      <Card className="glass-card grain-overlay">
                        <CardContent className="pt-4 pb-3">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{ev.title}</p>
                              <p className="text-xs text-muted-foreground">{ev.event_date} · {ev.location ?? "Campus"}</p>
                              {(ev as any).description && (
                                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 line-clamp-2">{(ev as any).description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5">
                                <Badge variant="outline" className="text-[10px] h-4">{ev.event_type ?? "Event"}</Badge>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Users className="w-3 h-3" />{ev.rsvp_count} RSVP'd{ev.max_attendees ? ` / ${ev.max_attendees}` : ""}
                                </span>
                              </div>
                            </div>
                            {alreadyRsvpd ? (
                              <div className="flex items-center gap-1 text-xs text-emerald-500 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" className="rounded-full text-xs shrink-0"
                                disabled={rsvpEvent.isPending}
                                onClick={() => handleRsvp(ev.id, ev.title)}>
                                RSVP
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Community;