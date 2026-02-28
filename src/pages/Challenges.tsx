import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Users, Leaf, Zap, Trophy, Target, Clock, Shield, BarChart3, Bike, Trash2, FlaskConical, TreePine, Droplets, Flame, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const challenges = [
  { id: 1, title: "Zero Waste Week", description: "Reduce campus waste to landfill by 90% for one full week. Segregate, compost, and recycle everything.", duration: "7 days", target: "90% waste diversion", impact: 92, reward: "500 pts + Gold Badge", carbonPotential: 1.8, participants: 342, maxParticipants: 500, endDate: "Mar 15, 2025", status: "active" as const, category: "Waste", icon: Trash2, departmentData: [{ dept: "EnvSci", participation: 85 }, { dept: "Physics", participation: 72 }, { dept: "MechE", participation: 65 }, { dept: "Chem", participation: 58 }, { dept: "Arch", participation: 52 }] },
  { id: 2, title: "Bike to Campus Month", description: "Switch from motor vehicles to cycling for your daily commute. Track rides via campus app.", duration: "30 days", target: "300 cyclists", impact: 85, reward: "750 pts + Silver Badge", carbonPotential: 4.2, participants: 218, maxParticipants: 300, endDate: "Mar 31, 2025", status: "active" as const, category: "Transport", icon: Bike, departmentData: [{ dept: "CivilE", participation: 78 }, { dept: "Physics", participation: 68 }, { dept: "Bio", participation: 62 }, { dept: "ElecE", participation: 55 }, { dept: "Chem", participation: 48 }] },
  { id: 3, title: "Energy Detective", description: "Identify and report energy waste across campus. Top reporters earn bonus points and recognition.", duration: "14 days", target: "200 reports", impact: 78, reward: "1000 pts + Platinum Badge", carbonPotential: 2.5, participants: 156, maxParticipants: 200, endDate: "Apr 15, 2025", status: "active" as const, category: "Energy", icon: Zap, departmentData: [{ dept: "ElecE", participation: 90 }, { dept: "MechE", participation: 75 }, { dept: "EnvSci", participation: 70 }, { dept: "Arch", participation: 60 }, { dept: "Bio", participation: 45 }] },
  { id: 4, title: "Plant a Tree Drive", description: "Campus-wide tree planting initiative. Each participant plants and adopts one tree.", duration: "3 days", target: "500 trees", impact: 88, reward: "300 pts + Green Badge", carbonPotential: 8.5, participants: 500, maxParticipants: 500, endDate: "Feb 28, 2025", status: "completed" as const, category: "Biodiversity", icon: TreePine, departmentData: [{ dept: "EnvSci", participation: 95 }, { dept: "Bio", participation: 88 }, { dept: "Arch", participation: 72 }, { dept: "CivilE", participation: 65 }, { dept: "Chem", participation: 58 }] },
  { id: 5, title: "Water Conservation Sprint", description: "Reduce water usage across hostels by 15%. Monitor daily consumption and compete.", duration: "14 days", target: "15% reduction", impact: 72, reward: "600 pts + Blue Badge", carbonPotential: 0.8, participants: 0, maxParticipants: 400, endDate: "Apr 30, 2025", status: "upcoming" as const, category: "Water", icon: Droplets, departmentData: [] },
  { id: 6, title: "Lab Efficiency Drive", description: "Optimize lab equipment usage. Turn off unused equipment, schedule shared resources.", duration: "21 days", target: "20% energy reduction", impact: 82, reward: "800 pts + Tech Badge", carbonPotential: 3.1, participants: 0, maxParticipants: 150, endDate: "May 15, 2025", status: "upcoming" as const, category: "Energy", icon: FlaskConical, departmentData: [] },
];

const badges = [
  { name: "Carbon Warrior", icon: "🌍", holders: 142, requirement: "Reduce 100kg CO₂" },
  { name: "Solar Champion", icon: "☀️", holders: 89, requirement: "Promote solar adoption" },
  { name: "Zero Waste Hero", icon: "♻️", holders: 234, requirement: "Complete Zero Waste Week" },
  { name: "Green Commuter", icon: "🚲", holders: 178, requirement: "30 bike commute days" },
  { name: "Energy Detective", icon: "🔍", holders: 56, requirement: "Report 10+ waste points" },
  { name: "Tree Guardian", icon: "🌳", holders: 500, requirement: "Plant & adopt a tree" },
];

const active = challenges.filter(c => c.status === "active");
const upcoming = challenges.filter(c => c.status === "upcoming");
const completed = challenges.filter(c => c.status === "completed");
const totalParticipation = active.reduce((s, c) => s + c.participants, 0);
const avgRate = Math.round(active.reduce((s, c) => s + (c.participants / c.maxParticipants) * 100, 0) / active.length);

const ChallengeDetail = ({ c }: { c: typeof challenges[0] }) => (
  <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
    <p className="text-sm text-muted-foreground">{c.description}</p>
    <div className="grid grid-cols-3 gap-3">
      <div className="p-3 rounded-xl bg-muted/50 text-center"><p className="text-xs text-muted-foreground">Duration</p><p className="text-sm font-bold">{c.duration}</p></div>
      <div className="p-3 rounded-xl bg-muted/50 text-center"><p className="text-xs text-muted-foreground">Carbon Potential</p><p className="text-sm font-bold">{c.carbonPotential} tons</p></div>
      <div className="p-3 rounded-xl bg-muted/50 text-center"><p className="text-xs text-muted-foreground">Impact Score</p><p className="text-sm font-bold">{c.impact}/100</p></div>
    </div>
    <div>
      <div className="flex justify-between text-sm mb-1"><span>Participation</span><span>{c.participants}/{c.maxParticipants}</span></div>
      <Progress value={(c.participants / c.maxParticipants) * 100} className="h-2" />
    </div>
    {c.departmentData.length > 0 && (
      <div>
        <h4 className="text-sm font-semibold mb-2">Department Comparison</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={c.departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip />
              <Bar dataKey="participation" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Participation %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )}
    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
      <p className="text-xs font-semibold mb-1">🏅 Reward</p>
      <p className="text-sm">{c.reward}</p>
    </div>
    {c.status === "active" && <Button className="w-full premium-button">Join Challenge</Button>}
  </div>
);

const Challenges = () => (
  <DashboardLayout title="Eco Challenges" breadcrumb="Engagement · Challenges">
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Challenges", value: active.length, icon: Target },
          { label: "Total Participants", value: totalParticipation.toLocaleString(), icon: Users },
          { label: "Avg Participation", value: `${avgRate}%`, icon: Flame },
          { label: "Badges Earned", value: "1,199", icon: Award },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="premium-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><m.icon className="w-5 h-5 text-primary" /></div>
                <div><p className="text-xs text-muted-foreground">{m.label}</p><p className="text-lg font-bold">{m.value}</p></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        {[{ key: "active", items: active }, { key: "upcoming", items: upcoming }, { key: "completed", items: completed }].map(({ key, items }) => (
          <TabsContent key={key} value={key} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <AnimatePresence>
              {items.map((c, i) => (
                <Dialog key={c.id}>
                  <DialogTrigger asChild>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -2 }} className="cursor-pointer">
                      <Card className="premium-card h-full">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><c.icon className="w-4 h-4 text-primary" /></div>
                            <Badge variant={c.status === "active" ? "default" : c.status === "completed" ? "secondary" : "outline"}>{c.status}</Badge>
                          </div>
                          <CardTitle className="text-sm mt-2">{c.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-muted-foreground">Duration</span><p className="font-semibold">{c.duration}</p></div>
                            <div><span className="text-muted-foreground">Carbon</span><p className="font-semibold">-{c.carbonPotential} tons</p></div>
                          </div>
                          {c.status !== "upcoming" && (
                            <div>
                              <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Progress</span><span>{Math.round((c.participants / c.maxParticipants) * 100)}%</span></div>
                              <Progress value={(c.participants / c.maxParticipants) * 100} className="h-1.5" />
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{c.endDate}</span>
                            <span className="font-medium">{c.reward.split(" + ")[0]}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><c.icon className="w-5 h-5" />{c.title}</DialogTitle></DialogHeader>
                    <ChallengeDetail c={c} />
                  </DialogContent>
                </Dialog>
              ))}
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="premium-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Award className="w-4 h-4 text-primary" />Achievement Badges</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {badges.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="text-center p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="text-2xl">{b.icon}</span>
                <p className="text-xs font-semibold mt-1">{b.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{b.holders} holders</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" /><span>Updated: 10 minutes ago</span>
        <span className="mx-2">•</span><Shield className="w-3 h-3" /><span>Verification: Automated</span>
      </div>
    </div>
  </DashboardLayout>
);

export default Challenges;
