import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import EnergyChart from "@/components/dashboard/EnergyChart";
import AIInsightPanel from "@/components/dashboard/AIInsightPanel";
import AlertCard from "@/components/dashboard/AlertCard";
import BuildingRanking from "@/components/dashboard/BuildingRanking";
import EnergyByType from "@/components/dashboard/EnergyByType";
import RenewableGrid from "@/components/dashboard/RenewableGrid";
import QuickActions from "@/components/dashboard/QuickActions";
import { Activity, Zap, Sun, Leaf, IndianRupee, Rocket, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCampusContext } from "@/context/CampusContext";
import { useLatestEnergyDailySummary, useEnergyDailySummary } from "@/hooks/useEnergy";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import type { RoleName } from "@/context/AuthContext";

const ROLE_INFO: Partial<Record<NonNullable<RoleName>, { color: string; msg: string }>> = {
  Admin: { color: "text-violet-400 border-violet-500/20", msg: "Full access — all sections, CRUD operations, alert management." },
  "Facility Manager": { color: "text-blue-400 border-blue-500/20", msg: "Operational access — energy, renewables, carbon, insights, planning." },
  Finance: { color: "text-emerald-400 border-emerald-500/20", msg: "Financial & analytics access — carbon, KPIs, finance, reports." },
  Faculty: { color: "text-yellow-400 border-yellow-500/20", msg: "Read-only access — campus overview, carbon, KPIs, community." },
  "Student Lead": { color: "text-orange-400 border-orange-500/20", msg: "Community access — leaderboard, challenges, and campus overview." },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { campus, campusId, isLoading: campusLoading } = useCampusContext();
  const { user } = useAuth();
  const role = user?.role_name as RoleName | undefined;
  const { data: todaySummary, isLoading: summaryLoading } = useLatestEnergyDailySummary(campusId);
  const { data: last2Days = [] } = useEnergyDailySummary(campusId, 2);

  const isLoading = campusLoading || summaryLoading;

  // Compute real daily trends: today vs yesterday
  const yesterday = last2Days[last2Days.length - 2];
  const today = last2Days[last2Days.length - 1];
  const calcTrend = (a: number | null | undefined, b: number | null | undefined) => {
    if (!a || !b || b === 0) return undefined;
    return +((a - b) / b * 100).toFixed(1);
  };
  const energyTrend = calcTrend(today?.total_kwh, yesterday?.total_kwh);
  const solarTrend  = calcTrend(today?.solar_kwh,  yesterday?.solar_kwh);
  const carbonTrend = calcTrend(today?.carbon_kg,  yesterday?.carbon_kg);
  const costTrend   = calcTrend(today?.cost_inr,   yesterday?.cost_inr);

  // Role flags
  const showEnergy   = role !== "Student Lead";
  const showSolar    = role !== "Student Lead" && role !== "Finance";
  const showCarbon   = role !== "Student Lead";
  const showCost     = role === "Admin" || role === "Finance" || role === "Facility Manager";
  const showMCBanner = role === "Admin" || role === "Facility Manager";

  const ri = role ? (ROLE_INFO[role] ?? null) : null;

  return (
    <DashboardLayout title="Dashboard" breadcrumb="Campus Overview · Real-time">
      <div className="space-y-6 max-w-[1400px] mx-auto">

        {/* Role Banner */}
        {ri && (
          <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${ri.color}`}>
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span><strong>{role}</strong> — {ri.msg}</span>
          </div>
        )}

        {/* Mission Control CTA — only for operational roles */}
        {showMCBanner && (
          <motion.button
            onClick={() => navigate("/mission-control")}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full premium-button rounded-xl p-4 flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary-foreground">Open AI Mission Control</p>
                <p className="text-xs text-primary-foreground/70">Net-Zero Decision Intelligence · Executive Simulator · AI Strategy</p>
              </div>
            </div>
            <span className="text-xs font-medium text-primary-foreground/80 group-hover:translate-x-1 transition-transform">Launch →</span>
          </motion.button>
        )}

        {/* Top Metrics — filtered by role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))
          ) : (
            <>
              <MetricCard
                title="Net-Zero Progress"
                value={`${campus?.net_zero_progress ?? 0}%`}
                subtitle={`Target: ${campus?.target_year ?? "—"}`}
                icon={<Activity className="w-5 h-5 text-primary" />}
                progress={campus?.net_zero_progress ?? 0}
              />
              {showEnergy && (
                <MetricCard
                  title="Live Energy"
                  value={`${((todaySummary?.peak_demand_kw ?? 0)).toLocaleString()} kW`}
                  icon={<Zap className="w-5 h-5 text-primary" />}
                  trend={energyTrend}
                />
              )}
              {showSolar && (
                <MetricCard
                  title="Solar Today"
                  value={`${((todaySummary?.solar_kwh ?? 0) / 1000).toFixed(1)} MWh`}
                  subtitle={`Total: ${((todaySummary?.total_kwh ?? 0) / 1000).toFixed(1)} MWh`}
                  icon={<Sun className="w-5 h-5 text-primary" />}
                  trend={solarTrend}
                  progress={
                    todaySummary?.total_kwh
                      ? ((todaySummary.solar_kwh ?? 0) / todaySummary.total_kwh) * 100
                      : 0
                  }
                />
              )}
              {showCarbon && (
                <MetricCard
                  title="Carbon Today"
                  value={`${(todaySummary?.carbon_kg ?? 0).toLocaleString()} kg`}
                  icon={<Leaf className="w-5 h-5 text-primary" />}
                  trend={carbonTrend}
                />
              )}
              {showCost && (
                <MetricCard
                  title="Cost Today"
                  value={`₹${((todaySummary?.cost_inr ?? 0) / 1000).toFixed(0)}K`}
                  icon={<IndianRupee className="w-5 h-5 text-primary" />}
                  trend={costTrend}
                />
              )}
            </>
          )}
        </div>

        {/* Main Chart + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          <EnergyChart />
          <div className="space-y-4">
            <AIInsightPanel />
          </div>
        </div>

        {/* Alerts */}
        <AlertCard />

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BuildingRanking />
          <EnergyByType />
          <RenewableGrid />
        </div>

        {/* Quick Actions — role-filtered inside the component */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
