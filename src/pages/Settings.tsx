import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  User, Bell, Shield, Monitor, Brain, Globe, LogOut,
  Smartphone, MapPin, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { useCurrentUserSessions } from "@/hooks/useAdmin";

const Settings = () => {
  const { data: currentUser, isLoading: loadingUser } = useCurrentUser();
  const { data: sessions = [], isLoading: loadingSessions } = useCurrentUserSessions(
    currentUser?.id ?? null,
  );
  const { mutate: logout } = useLogout();

  const [notifPrefs, setNotifPrefs] = useState({
    emailCritical: true,
    emailDaily: true,
    emailWeekly: false,
    emailMonthly: true,
    emailAI: true,
    pushCritical: true,
    pushEquipment: true,
    pushChallenge: false,
    pushCommunity: false,
  });

  const [displayPrefs, setDisplayPrefs] = useState({
    executiveMode: false,
    showConfidence: true,
    animateCharts: true,
  });

  const [aiPrefs, setAiPrefs] = useState({
    autonomousHVAC: false,
    predictiveMaintenance: true,
    autoOptimizeSolar: true,
    smartLoadBalancing: false,
    automationSuggestions: true,
  });

  const togglePref = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    key: string,
  ) => setter((prev: any) => ({ ...prev, [key]: !prev[key] }));

  return (
    <DashboardLayout title="Settings" breadcrumb="System · Settings">
      <div className="space-y-6 max-w-4xl">
        <Tabs defaultValue="profile">
          <TabsList className="mb-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="ai">AI Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-4">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingUser ? (
                  <div className="space-y-3">
                    {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {currentUser?.email?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{currentUser?.email ?? "—"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          UID: {currentUser?.id?.slice(0, 8)}…
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {currentUser?.role ?? "authenticated"}
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Email</Label>
                        <Input value={currentUser?.email ?? ""} readOnly className="bg-muted/30 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Last Sign-In</Label>
                        <Input
                          value={
                            currentUser?.last_sign_in_at
                              ? new Date(currentUser.last_sign_in_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                              : "—"
                          }
                          readOnly
                          className="bg-muted/30 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Account Created</Label>
                        <Input
                          value={
                            currentUser?.created_at
                              ? new Date(currentUser.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })
                              : "—"
                          }
                          readOnly
                          className="bg-muted/30 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Auth Provider</Label>
                        <Input
                          value={currentUser?.app_metadata?.provider ?? "email"}
                          readOnly
                          className="bg-muted/30 text-sm capitalize"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button variant="destructive" size="sm" onClick={() => logout()} className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4 space-y-4">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" /> Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  ["emailCritical", "Critical Alerts", "Immediate alerts for critical energy or safety events"],
                  ["emailDaily", "Daily Summary", "End-of-day energy and carbon digest"],
                  ["emailWeekly", "Weekly Report", "7-day sustainability performance summary"],
                  ["emailMonthly", "Monthly Brief", "Monthly trend analysis and recommendations"],
                  ["emailAI", "AI Recommendations", "New AI-generated optimisation suggestions"],
                ] as [string, string, string][]).map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch checked={(notifPrefs as any)[key]} onCheckedChange={() => togglePref(setNotifPrefs, key)} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" /> Push Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  ["pushCritical", "Critical Alerts", "Instant push for P1 incidents"],
                  ["pushEquipment", "Equipment Warnings", "HVAC, solar, and equipment fault alerts"],
                  ["pushChallenge", "Challenge Milestones", "Eco-challenge progress and completions"],
                  ["pushCommunity", "Community Activity", "New events, posts, and leaderboard changes"],
                ] as [string, string, string][]).map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch checked={(notifPrefs as any)[key]} onCheckedChange={() => togglePref(setNotifPrefs, key)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="mt-4 space-y-4">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" /> Display Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  ["executiveMode", "Executive Mode", "Simplified high-level view for leadership"],
                  ["showConfidence", "Show Confidence Indicators", "Display AI prediction confidence scores"],
                  ["animateCharts", "Animate Chart Transitions", "Smooth animations on data updates"],
                ] as [string, string, string][]).map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch checked={(displayPrefs as any)[key]} onCheckedChange={() => togglePref(setDisplayPrefs, key)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="mt-4 space-y-4">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" /> AI & Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  ["automationSuggestions", "Automation Suggestions", "Let AI suggest automated actions"],
                  ["autonomousHVAC", "Autonomous HVAC Control", "AI automatically adjusts HVAC setpoints"],
                  ["predictiveMaintenance", "Predictive Maintenance Alerts", "Early warnings before equipment failure"],
                  ["autoOptimizeSolar", "Auto-Optimise Solar", "Dynamically adjust solar inverter settings"],
                  ["smartLoadBalancing", "Smart Load Balancing", "Shift loads to reduce peak demand automatically"],
                ] as [string, string, string][]).map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch checked={(aiPrefs as any)[key]} onCheckedChange={() => togglePref(setAiPrefs, key)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4 space-y-4">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSessions ? (
                  <div className="space-y-3">
                    {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No active sessions found</p>
                ) : (
                  <div className="space-y-3">
                    {(sessions as any[]).map((s, i) => (
                      <motion.div
                        key={s.id ?? i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{s.device ?? "Unknown Device"}</p>
                              {s.is_current && (
                                <Badge className="text-[10px] px-1.5 py-0 bg-green-500/20 text-green-600 border-green-500/30">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {s.location && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />{s.location}
                                </span>
                              )}
                              {s.ip_address && (
                                <span className="text-xs text-muted-foreground">{s.ip_address}</span>
                              )}
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {new Date(s.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-green-500">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="premium-card border-destructive/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <XCircle className="w-4 h-4" /> Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Sign out of all sessions</p>
                    <p className="text-xs text-muted-foreground">Revokes all active tokens except this one</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-destructive/40 text-destructive hover:bg-destructive/10">
                    Sign Out All
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Sign Out</p>
                    <p className="text-xs text-muted-foreground">End your current session</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => logout()} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;