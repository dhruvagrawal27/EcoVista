import { Building2, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useCampusContext } from "@/context/CampusContext";
import { useBuildings } from "@/hooks/useEnergy";
import { Skeleton } from "@/components/ui/skeleton";

const BuildingRanking = () => {
  const { campusId } = useCampusContext();
  const { data: buildings, isLoading } = useBuildings(campusId);

  const ranked = [...(buildings ?? [])]
    .sort((a, b) => (b.hvac_score ?? 0) - (a.hvac_score ?? 0))
    .slice(0, 5);

  return (
    <div className="glass-card grain-overlay p-5">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Building Efficiency</h3>
      </div>
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))
          : ranked.map((b, i) => {
              const efficiency = b.hvac_score ?? 0;
              const trend = b.carbon_score != null ? b.carbon_score - 50 : 0;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{b.name}</p>
                      <div className="flex items-center gap-1 text-xs">
                        {trend < 0 ? (
                          <TrendingDown className="w-3 h-3 text-primary" />
                        ) : (
                          <TrendingUp className="w-3 h-3 text-destructive" />
                        )}
                        <span className={trend < 0 ? "text-primary" : "text-destructive"}>
                          {Math.abs(trend).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${efficiency}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: "var(--hero-gradient)" }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {efficiency.toFixed(0)}%
                  </span>
                </motion.div>
              );
            })}
      </div>
    </div>
  );
};

export default BuildingRanking;
