import { AlertTriangle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useCampusContext } from "@/context/CampusContext";
import { useActiveAlerts } from "@/hooks/useAlerts";
import { Skeleton } from "@/components/ui/skeleton";

const AlertCard = () => {
  const { campusId } = useCampusContext();
  const { data: alerts, isLoading } = useActiveAlerts(campusId, 5);

  return (
    <div className="glass-card grain-overlay p-5">
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        Critical Alerts
      </h3>
      <div className="space-y-2">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))
          : (alerts ?? []).map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                  alert.alert_type === "critical"
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border/50 bg-accent/20"
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      alert.alert_type === "critical" ? "text-destructive" : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.location_label} ·{" "}
                      {new Date(alert.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
      </div>
    </div>
  );
};

export default AlertCard;
