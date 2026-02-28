import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, TrendingDown, Minus, Flame, Star, Crown, Medal, Clock, Shield, BarChart3, Zap, Leaf, Recycle } from "lucide-react";

const departments = [
  { rank: 1, name: "Environmental Science", energyReduction: 22, carbonReduction: 18, participation: 94, wasteDiv: 85, score: 12840, trend: "up" as const, streak: 45, hallOfFame: true },
  { rank: 2, name: "Physics", energyReduction: 19, carbonReduction: 16, participation: 88, wasteDiv: 78, score: 11200, trend: "up" as const, streak: 38, hallOfFame: true },
  { rank: 3, name: "Mechanical Engineering", energyReduction: 17, carbonReduction: 15, participation: 82, wasteDiv: 72, score: 10560, trend: "up" as const, streak: 32, hallOfFame: false },
  { rank: 4, name: "Chemistry", energyReduction: 15, carbonReduction: 14, participation: 78, wasteDiv: 68, score: 9800, trend: "down" as const, streak: 28, hallOfFame: false },
  { rank: 5, name: "Architecture", energyReduction: 14, carbonReduction: 13, participation: 85, wasteDiv: 80, score: 9200, trend: "up" as const, streak: 25, hallOfFame: false },
  { rank: 6, name: "Biology", energyReduction: 12, carbonReduction: 11, participation: 76, wasteDiv: 65, score: 8640, trend: "same" as const, streak: 22, hallOfFame: false },
  { rank: 7, name: "Civil Engineering", energyReduction: 11, carbonReduction: 10, participation: 70, wasteDiv: 74, score: 7980, trend: "down" as const, streak: 18, hallOfFame: false },
  { rank: 8, name: "Electrical Engineering", energyReduction: 10, carbonReduction: 9, participation: 68, wasteDiv: 62, score: 7320, trend: "up" as const, streak: 15, hallOfFame: false },
];

const hostels = [
  { rank: 1, name: "Hostel Block A", score: 9450, energyReduction: 24, trend: "up" as const },
  { rank: 2, name: "Hostel Block D", score: 8800, energyReduction: 20, trend: "up" as const },
  { rank: 3, name: "Hostel Block B", score: 8200, energyReduction: 17, trend: "same" as const },
  { rank: 4, name: "Hostel Block C", score: 7500, energyReduction: 14, trend: "down" as const },
  { rank: 5, name: "Hostel Block E", score: 6900, energyReduction: 11, trend: "up" as const },
];

const buildings = [
  { rank: 1, name: "Science Block A", score: 9800, efficiency: 94, trend: "up" as const },
  { rank: 2, name: "Library Complex", score: 9200, efficiency: 91, trend: "up" as const },
  { rank: 3, name: "Admin Building", score: 8700, efficiency: 88, trend: "same" as const },
  { rank: 4, name: "Student Center", score: 8100, efficiency: 85, trend: "up" as const },
  { rank: 5, name: "Engineering Lab", score: 7600, efficiency: 82, trend: "down" as const },
];

const TrendIcon = ({ trend }: { trend: "up" | "down" | "same" }) =>
  trend === "up" ? <TrendingUp className="w-3.5 h-3.5 text-green-500" /> :
  trend === "down" ? <TrendingDown className="w-3.5 h-3.5 text-red-500" /> :
  <Minus className="w-3.5 h-3.5 text-muted-foreground" />;

const Podium = ({ items }: { items: { rank: number; name: string; score: number }[] }) => {
  const top3 = items.slice(0, 3);
  const order = [top3[1], top3[0], top3[2]];
  const heights = ["h-24", "h-32", "h-20"];
  const icons = [Medal, Crown, Medal];

  return (
    <div className="flex items-end justify-center gap-3 mb-6">
      {order.map((item, i) => item && (
        <motion.div key={item.rank} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15 }} className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${i === 1 ? "bg-yellow-500/20 text-yellow-500" : "bg-muted"}`}>
            {React.createElement(icons[i], { className: "w-4 h-4" })}
          </div>
          <p className="text-xs font-semibold text-center mb-1 max-w-[80px] truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground mb-1">{item.score.toLocaleString()} pts</p>
          <div className={`w-20 ${heights[i]} rounded-t-xl ${i === 1 ? "bg-gradient-to-t from-yellow-500/30 to-yellow-500/10" : "bg-gradient-to-t from-primary/20 to-primary/5"} flex items-end justify-center pb-2`}>
            <span className="text-lg font-bold">{item.rank}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

import React from "react";

const RankingTable = ({ items, extraCol }: { items: { rank: number; name: string; score: number; trend: "up" | "down" | "same"; [k: string]: any }[]; extraCol?: { label: string; key: string; suffix: string } }) => (
  <div className="space-y-2">
    {items.map((item, i) => (
      <motion.div key={item.rank} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
        <div className={`flex items-center gap-3 p-3 rounded-xl ${item.rank <= 3 ? "bg-primary/5 border border-primary/10" : "bg-muted/30"}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${item.rank === 1 ? "bg-yellow-500/20 text-yellow-600" : item.rank === 2 ? "bg-slate-300/30 text-slate-600" : item.rank === 3 ? "bg-orange-300/20 text-orange-600" : "bg-muted text-muted-foreground"}`}>{item.rank}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.name}</p>
          </div>
          {extraCol && <span className="text-xs text-muted-foreground">{item[extraCol.key]}{extraCol.suffix}</span>}
          <TrendIcon trend={item.trend} />
          <span className="text-sm font-semibold w-20 text-right">{item.score.toLocaleString()}</span>
        </div>
      </motion.div>
    ))}
  </div>
);

const Leaderboard = () => (
  <DashboardLayout title="Leaderboard" breadcrumb="Engagement · Rankings">
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Participants", value: "2,840", icon: Trophy },
          { label: "Energy Saved", value: "12,400 kWh", icon: Zap },
          { label: "Carbon Reduced", value: "4.2 tons", icon: Leaf },
          { label: "Waste Diverted", value: "68%", icon: Recycle },
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

      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="hostels">Hostels</TabsTrigger>
          <TabsTrigger value="buildings">Buildings</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="mt-4 space-y-6">
          <Podium items={departments} />
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Department Rankings</CardTitle></CardHeader>
            <CardContent>
              <RankingTable items={departments} extraCol={{ label: "Energy", key: "energyReduction", suffix: "%" }} />
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" />Hall of Fame</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {departments.filter(d => d.hallOfFame).map(d => (
                  <div key={d.rank} className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15 flex items-center gap-3">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1"><p className="text-sm font-semibold">{d.name}</p><p className="text-xs text-muted-foreground"><Flame className="w-3 h-3 inline mr-1" />{d.streak}-day streak</p></div>
                    <Badge variant="outline">{d.score.toLocaleString()} pts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Detailed Metrics</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departments.slice(0, 5).map(d => (
                  <div key={d.rank} className="space-y-2">
                    <p className="text-sm font-medium">{d.name}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[{ l: "Energy", v: d.energyReduction }, { l: "Carbon", v: d.carbonReduction }, { l: "Participation", v: d.participation }, { l: "Waste Div.", v: d.wasteDiv }].map(m => (
                        <div key={m.l}>
                          <div className="flex justify-between text-xs mb-0.5"><span className="text-muted-foreground">{m.l}</span><span>{m.v}%</span></div>
                          <Progress value={m.v} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hostels" className="mt-4 space-y-6">
          <Podium items={hostels} />
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Hostel Rankings</CardTitle></CardHeader>
            <CardContent><RankingTable items={hostels} extraCol={{ label: "Energy", key: "energyReduction", suffix: "%" }} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buildings" className="mt-4 space-y-6">
          <Podium items={buildings} />
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Building Rankings</CardTitle></CardHeader>
            <CardContent><RankingTable items={buildings} extraCol={{ label: "Efficiency", key: "efficiency", suffix: "%" }} /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" /><span>Updated: 5 minutes ago</span>
        <span className="mx-2">•</span><Shield className="w-3 h-3" /><span>Scoring Confidence: 96%</span>
        <span className="mx-2">•</span><BarChart3 className="w-3 h-3" /><span>Period: This Semester</span>
      </div>
    </div>
  </DashboardLayout>
);

export default Leaderboard;
