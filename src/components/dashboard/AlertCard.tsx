import { AlertTriangle, AlertCircle, CheckCheck, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useCampusContext } from "@/context/CampusContext";
import { useActiveAlerts, useAcknowledgeAlert, useResolveAlert } from "@/hooks/useAlerts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const AlertCard = () => {
  const { campusId } = useCampusContext();
  const { user } = useAuth();
  const canAct = user?.role_name === "Admin" || user?.role_name === "Facility Manager";

  const { data: alerts, isLoading } = useActiveAlerts(campusId, 5);
  const acknowledgeMutation = useAcknowledgeAlert();
  const resolveMutation = useResolveAlert();
  const { toast } = useToast();

  const handleAcknowledge = (alertId: number, title: string) => {
    acknowledgeMutation.mutate(
      { alertId },
      {
        onSuccess: () => toast({ title: "Alert acknowledged", description: title }),
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleResolve = (alertId: number, title: string) => {
    resolveMutation.mutate(alertId, {
      onSuccess: () => toast({ title: "Alert resolved", description: title }),
      onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
    });
  };

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
                className={`p-3 rounded-xl border transition-all ${
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
                    <div className="flex gap-1.5 mt-2">
                      {canAct && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] gap-1 text-amber-500 border-amber-500/30"
                            disabled={acknowledgeMutation.isPending}
                            onClick={() => handleAcknowledge(alert.id, alert.title)}
                          >
                            <CheckCheck className="w-3 h-3" />Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] gap-1 text-emerald-500 border-emerald-500/30"
                            disabled={resolveMutation.isPending}
                            onClick={() => handleResolve(alert.id, alert.title)}
                          >
                            <ShieldCheck className="w-3 h-3" />Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        {!isLoading && (alerts ?? []).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No active alerts 🎉</p>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
