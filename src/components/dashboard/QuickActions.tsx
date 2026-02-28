import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Leaf, Brain, TrendingUp, FileText } from "lucide-react";
import { quickActions } from "@/lib/mock-data";

const iconMap: Record<string, React.ComponentType<any>> = {
  Zap, Leaf, Brain, TrendingUp, FileText,
};

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {quickActions.map((action, i) => {
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
