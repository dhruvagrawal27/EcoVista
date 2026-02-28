import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon: React.ReactNode;
  progress?: number;
  sparkline?: boolean;
}

const MetricCard = ({ title, value, subtitle, trend, icon, progress }: MetricCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "var(--shadow-elevated)" }}
      transition={{ duration: 0.2 }}
      className="glass-card grain-overlay p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl bg-accent/50">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend < 0 ? "text-primary" : "text-destructive"
          }`}>
            {trend < 0 ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
      
      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "var(--hero-gradient)" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MetricCard;
