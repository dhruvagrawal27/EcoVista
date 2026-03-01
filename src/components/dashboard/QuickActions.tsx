import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Leaf, Brain, TrendingUp, FileText, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ALL_QUICK_ACTIONS = [
  { id: 1, label: "Energy Dashboard", icon: "Zap",     route: "/energy",     color: "chart-1" },
  { id: 2, label: "Carbon Tracker",   icon: "Leaf",    route: "/carbon",     color: "chart-2" },
  { id: 3, label: "AI Recommendations", icon: "Brain", route: "/insights",   color: "chart-3" },
  { id: 4, label: "Financial Insights", icon: "TrendingUp", route: "/finance", color: "chart-4" },
  { id: 5, label: "Generate Report",  icon: "FileText", route: "/reports",   color: "chart-5" },
  { id: 6, label: "Renewables",       icon: "Sun",     route: "/renewables", color: "chart-4" },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Leaf, Brain, TrendingUp, FileText, Sun,
};

const QuickActions = () => {
  const navigate = useNavigate();
  const { canAccess } = useAuth();

  // Only show actions whose route the current role is allowed to access
  const visibleActions = ALL_QUICK_ACTIONS.filter(a => canAccess(a.route));

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {visibleActions.map((action, i) => {
        const Icon = iconMap[action.icon];
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3, boxShadow: "var(--shadow-elevated)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(action.route)}
            className="glass-card grain-overlay p-4 flex flex-col items-center gap-2 cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-accent/50">
              <Icon className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">{action.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default QuickActions;
