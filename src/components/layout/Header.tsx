import { useState, useRef, useEffect } from "react";
import { Bell, Search, Bot, ChevronDown, User, X, AlertTriangle, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveAlerts, useAcknowledgeAlert } from "@/hooks/useAlerts";
import { useCampusContext } from "@/context/CampusContext";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  onToggleAI?: () => void;
}

const ALERT_ICON = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const ALERT_COLOR = {
  critical: "text-destructive",
  warning: "text-[hsl(var(--chart-4))]",
  info: "text-primary",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const Header = ({ title, breadcrumb, onToggleAI }: HeaderProps) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { campusId } = useCampusContext();
  const { data: alerts = [] } = useActiveAlerts(campusId, 20);
  const acknowledge = useAcknowledgeAlert();

  // Close panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Left */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {breadcrumb && (
          <p className="text-xs text-muted-foreground">{breadcrumb}</p>
        )}
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex items-center max-w-md flex-1 mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search buildings, reports, alerts..."
            className="w-full bg-muted/50 border border-border rounded-full py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifOpen(v => !v)}
            className="relative p-2.5 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors"
          >
            <Bell className="w-[18px] h-[18px]" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-destructive rounded-full flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                {alerts.length > 9 ? "9+" : alerts.length}
              </span>
            )}
            {alerts.length === 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            )}
          </motion.button>

          {/* Notification panel */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Alerts</span>
                    {alerts.length > 0 && (
                      <Badge variant="destructive" className="text-[10px] h-4 px-1.5">{alerts.length}</Badge>
                    )}
                  </div>
                  <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Alert list */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
                  {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-8 h-8 text-chart-2 opacity-60" />
                      <p className="text-xs">All clear — no active alerts</p>
                    </div>
                  ) : (
                    alerts.map(alert => {
                      const AlertIcon = ALERT_ICON[alert.alert_type] ?? Info;
                      const iconColor = ALERT_COLOR[alert.alert_type] ?? "text-primary";
                      return (
                        <div key={alert.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
                          <AlertIcon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground leading-snug">{alert.title}</p>
                            {alert.description && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{alert.description}</p>
                            )}
                            {alert.location_label && (
                              <p className="text-[10px] text-muted-foreground/70 mt-0.5">{alert.location_label}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(alert.created_at)}</p>
                          </div>
                          <button
                            onClick={() => acknowledge.mutate({ alertId: alert.id })}
                            className="opacity-0 group-hover:opacity-100 text-[10px] text-muted-foreground hover:text-foreground border border-border rounded px-1.5 py-0.5 transition-all shrink-0 mt-0.5"
                            title="Acknowledge"
                          >
                            ACK
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {alerts.length > 0 && (
                  <div className="px-4 py-2 border-t border-border bg-muted/20">
                    <p className="text-[10px] text-muted-foreground text-center">Hover an alert to acknowledge it</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleAI}
          className="p-2.5 rounded-full hover:bg-accent text-accent-foreground transition-colors"
        >
          <Bot className="w-[18px] h-[18px]" />
        </motion.button>

        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-muted/50 text-sm text-foreground transition-colors">
          <span className="hidden sm:inline">IIT Delhi</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
      </div>
    </header>
  );
};

export default Header;
