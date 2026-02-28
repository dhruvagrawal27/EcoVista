import { AlertTriangle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { alerts } from "@/lib/mock-data";

const AlertCard = () => {
  return (
    <div className="glass-card grain-overlay p-5">
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        Critical Alerts
      </h3>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.01 }}
            className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
              alert.type === "critical"
                ? "border-destructive/30 bg-destructive/5"
                : "border-border/50 bg-accent/20"
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                alert.type === "critical" ? "text-destructive" : "text-muted-foreground"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.location} · {alert.time}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AlertCard;
