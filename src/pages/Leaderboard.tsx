import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus, Star, Flame, Users } from "lucide-react";
import { useCampusContext } from "@/context/CampusContext";
import { useLeaderboard } from "@/hooks/useCommunity";
import type { LeaderboardEntry } from "@/hooks/useCommunity";

function TrendIcon({ trend }: { trend: string | null }) {
  if (trend === "up") return <TrendingUp className="w-3 h-3 text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-yellow-400 font-bold">🥇</span>;
  if (rank === 2) return <span className="text-slate-300 font-bold">🥈</span>;
  if (rank === 3) return <span className="text-amber-600 font-bold">🥉</span>;
  return <span className="text-xs text-muted-foreground font-mono">#{rank}</span>;
}

function LeaderRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/20 transition-colors"
    >
      <div className="w-8 text-center"><RankBadge rank={entry.rank ?? index + 1} /></div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{entry.entity_name}</p>
        <p className="text-[10px] text-muted-foreground capitalize">{entry.entity_type}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <Flame className="w-3 h-3 text-orange-400" />
        <span className="text-[10px] text-muted-foreground">{entry.streak_days ?? 0}d</span>
      </div>
      <div className="flex items-center gap-1">
        <TrendIcon trend={entry.trend} />
        <span className="text-xs font-bold text-foreground">{(entry.total_points ?? 0).toLocaleString()}</span>
      </div>
      {entry.hall_of_fame && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />}
    </motion.div>
  );
}

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const top3 = entries.slice(0, 3);
  const heights = ["h-20", "h-28", "h-16"];
  const order = [1, 0, 2]; // 2nd, 1st, 3rd visually
  return (
    <div className="flex items-end justify-center gap-2 py-4">
      {order.map(i => {
        const e = top3[i];
        if (!e) return <div key={i} className="w-24" />;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground truncate max-w-20 text-center">{e.entity_name}</span>
            <span className="text-xs font-bold text-foreground">{(e.total_points ?? 0).toLocaleString()}</span>
            <div className={`${heights[i]} w-20 rounded-t-lg flex items-end justify-center pb-2 ${i === 0 ? "bg-yellow-500/20 border border-yellow-500/40" : "bg-muted/40 border border-border"}`}>
              <RankBadge rank={e.rank ?? i + 1} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const Leaderboard = () => {
  const { campusId } = useCampusContext();
  const { data: leaderboard = [], isLoading } = useLeaderboard(campusId);

  const departments = leaderboard.filter(e => e.entity_type === "department");
  const hostels = leaderboard.filter(e => e.entity_type === "hostel");
  const buildings = leaderboard.filter(e => e.entity_type === "building");
  const hallOfFame = leaderboard.filter(e => e.hall_of_fame);

  const tabs: { label: string; data: LeaderboardEntry[]; icon: React.ReactNode }[] = [
    { label: "Departments", data: departments, icon: <Users className="w-3 h-3" /> },
    { label: "Hostels", data: hostels, icon: <Trophy className="w-3 h-3" /> },
    { label: "Buildings", data: buildings, icon: <Flame className="w-3 h-3" /> },
  ];

  return (
    <DashboardLayout title="Leaderboard" breadcrumb="Community · Leaderboard">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="text-sm font-semibold text-foreground">Sustainability Leaderboard</h2>
          <Badge variant="outline" className="ml-auto text-[10px]">
            {leaderboard.length} Participants
          </Badge>
        </div>

        {/* Overall top podium */}
        <Card className="glass-card grain-overlay">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm">Overall Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-36 w-full" /> : <Podium entries={leaderboard} />}
          </CardContent>
        </Card>

        {/* Hall of fame */}
        {!isLoading && hallOfFame.length > 0 && (
          <Card className="glass-card grain-overlay border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />Hall of Fame
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {hallOfFame.map((e, i) => (
                  <Badge key={i} variant="outline" className="border-yellow-500/40 text-yellow-400 gap-1 text-[10px]">
                    <Star className="w-2.5 h-2.5 fill-current" />{e.entity_name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tabs.map(tab => (
            <Card key={tab.label} className="glass-card grain-overlay">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {tab.icon}{tab.label}
                  <Badge variant="secondary" className="ml-auto text-[10px]">{tab.data.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoading ? (
                  <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
                ) : tab.data.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground text-center py-6">No data</p>
                ) : (
                  <div className="space-y-0.5">
                    {tab.data.map((e, i) => <LeaderRow key={e.entity_name + i} entry={e} index={i} />)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
