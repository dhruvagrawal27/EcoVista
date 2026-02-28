import { Building2, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { buildingRankings } from "@/lib/mock-data";

const BuildingRanking = () => {
  return (
    <div className="glass-card grain-overlay p-5">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Building Efficiency</h3>
      </div>
      <div className="space-y-3">
        {buildingRankings.map((b, i) => (
          <motion.div
            key={b.name}
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
                  {b.trend < 0 ? (
                    <TrendingDown className="w-3 h-3 text-primary" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-destructive" />
                  )}
                  <span className={b.trend < 0 ? "text-primary" : "text-destructive"}>
                    {Math.abs(b.trend)}%
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${b.efficiency}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: "var(--hero-gradient)" }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-foreground">{b.efficiency}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BuildingRanking;
