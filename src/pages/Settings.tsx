import { useState, useEffect } from "react";
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
  Smartphone, MapPin, Clock, CheckCircle2, XCircle, Save,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useAuth";
import { useCurrentUserSessions } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";

// ── Per-user preference persistence in localStorage ───────────────────────
function prefsKey(userId: string, section: string) {
  return `ecovista_prefs_${userId}_${section}`;
}

function loadPrefs<T>(userId: string | undefined, section: string, defaults: T): T {
  if (!userId) return defaults;
  try {
    const raw = localStorage.getItem(prefsKey(userId, section));
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) } as T;
  } catch {
    return defaults;
  }
}

function savePrefs(userId: string, section: string, value: unknown) {
  localStorage.setItem(prefsKey(userId, section), JSON.stringify(value));
}

// ── Default preference shapes ──────────────────────────────────────────────
const defaultNotif = {
  emailCritical: true,
  emailDaily: true,
  emailWeekly: false,
  emailMonthly: true,
  emailAI: true,
  pushCritical: true,
  pushEquipment: true,
  pushChallenge: false,
  pushCommunity: false,
};

const defaultDisplay = {
  executiveMode: false,
  showConfidence: true,
  animateCharts: true,
};

const defaultAI = {
  autonomousHVAC: false,
  predictiveMaintenance: true,
  autoOptimizeSolar: true,
  smartLoadBalancing: false,
  automationSuggestions: true,
};

const Settings = () => {
  const { user } = useAuth();
  const { data: sessions = [], isLoading: loadingSessions } = useCurrentUserSessions(
    user?.id ?? null,
  );
  const { mutate: logout } = useLogout();
  const { toast } = useToast();

  // ── Pref state — initialised lazily after user resolves ───────────────
  const [notifPrefs, setNotifPrefs] = useState(defaultNotif);
  const [displayPrefs, setDisplayPrefs] = useState(defaultDisplay);
  const [aiPrefs, setAiPrefs] = useState(defaultAI);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Load saved prefs once the user is known
  useEffect(() => {
    if (user?.id && !prefsLoaded) {
      setNotifPrefs(loadPrefs(user.id, "notifications", defaultNotif));
      setDisplayPrefs(loadPrefs(user.id, "display", defaultDisplay));
      setAiPrefs(loadPrefs(user.id, "ai", defaultAI));
      setPrefsLoaded(true);
    }
  }, [user?.id, prefsLoaded]);

  const togglePref = <T extends Record<string, boolean>>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    key: string,
  ) => setter((prev) => ({ ...prev, [key]: !prev[key as keyof T] }));

  const handleSavePreferences = (section: "notifications" | "display" | "ai") => {
    if (!user?.id) {
      toast({ title: "Not signed in", variant: "destructive" });
      return;
    }
    const value = section === "notifications" ? notifPrefs : section === "display" ? displayPrefs : aiPrefs;
    savePrefs(user.id, section, value);
    toast({ title: "Preferences saved ✓", description: `Your ${section} preferences have been updated.` });
  };

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
                {!user ? (
                  <div className="space-y-3">
                    {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {(user.name ?? user.email)?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{user.name ?? user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          UID: {user.id}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {user.role_name ?? "authenticated"}
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Email</Label>
                        <Input value={user.email ?? ""} readOnly className="bg-muted/30 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Role</Label>
                        <Input value={user.role_name ?? "—"} readOnly className="bg-muted/30 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Auth Source</Label>
                        <Input
                          value={user.source === "supabase" ? "Supabase Auth" : "DB Account"}
                          readOnly
                          className="bg-muted/30 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">User ID</Label>
                        <Input
                          value={user.id}
                          readOnly
                          className="bg-muted/30 text-sm font-mono text-xs"
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
            <Button className="premium-button gap-2" onClick={() => handleSavePreferences("notifications")}>
              <Save className="w-4 h-4" />Save Notification Preferences
            </Button>
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
            <Button className="premium-button gap-2" onClick={() => handleSavePreferences("display")}>
              <Save className="w-4 h-4" />Save Display Preferences
            </Button>
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
            <Button className="premium-button gap-2" onClick={() => handleSavePreferences("ai")}>
              <Save className="w-4 h-4" />Save AI Preferences
            </Button>
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