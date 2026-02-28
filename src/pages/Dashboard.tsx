import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import EnergyChart from "@/components/dashboard/EnergyChart";
import AIInsightPanel from "@/components/dashboard/AIInsightPanel";
import AlertCard from "@/components/dashboard/AlertCard";
import BuildingRanking from "@/components/dashboard/BuildingRanking";
import EnergyByType from "@/components/dashboard/EnergyByType";
import RenewableGrid from "@/components/dashboard/RenewableGrid";
import QuickActions from "@/components/dashboard/QuickActions";
import { Activity, Zap, Sun, Leaf, IndianRupee, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCampusContext } from "@/context/CampusContext";
import { useLatestEnergyDailySummary } from "@/hooks/useEnergy";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  const { campus, campusId, isLoading: campusLoading } = useCampusContext();
  const { data: todaySummary, isLoading: summaryLoading } = useLatestEnergyDailySummary(campusId);

  const isLoading = campusLoading || summaryLoading;

  return (
    <DashboardLayout title="Dashboard" breadcrumb="Campus Overview · Real-time">
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Mission Control CTA */}
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

        {/* Top Metrics */}
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
              <MetricCard
                title="Live Energy"
                value={`${((todaySummary?.peak_demand_kw ?? 0)).toLocaleString()} kW`}
                icon={<Zap className="w-5 h-5 text-primary" />}
                trend={-3.2}
              />
              <MetricCard
                title="Solar Today"
                value={`${((todaySummary?.solar_kwh ?? 0) / 1000).toFixed(1)} MWh`}
                subtitle={`Total: ${((todaySummary?.total_kwh ?? 0) / 1000).toFixed(1)} MWh`}
                icon={<Sun className="w-5 h-5 text-primary" />}
                progress={
                  todaySummary?.total_kwh
                    ? ((todaySummary.solar_kwh ?? 0) / todaySummary.total_kwh) * 100
                    : 0
                }
              />
              <MetricCard
                title="Carbon Today"
                value={`${(todaySummary?.carbon_kg ?? 0).toLocaleString()} kg`}
                icon={<Leaf className="w-5 h-5 text-primary" />}
                trend={-2.4}
              />
              <MetricCard
                title="Cost Savings"
                value={`₹${((todaySummary?.cost_inr ?? 0) / 1000).toFixed(0)}K`}
                icon={<IndianRupee className="w-5 h-5 text-primary" />}
                trend={-1.8}
              />
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

        {/* Quick Actions */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
