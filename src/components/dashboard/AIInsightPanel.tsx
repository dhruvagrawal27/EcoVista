import { Brain, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCampusContext } from "@/context/CampusContext";
import { useAIRecommendations } from "@/hooks/useAI";
import { Skeleton } from "@/components/ui/skeleton";

const AIInsightPanel = () => {
  const navigate = useNavigate();
  const { campusId } = useCampusContext();
  const { data: insights, isLoading } = useAIRecommendations(campusId, "created_at", "new");
  const displayInsights = (insights ?? []).slice(0, 3);

  return (
    <div className="glass-card grain-overlay p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">AI Insight of the Day</h3>
      </div>

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))
          : displayInsights.map((insight, i) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="p-3 rounded-xl bg-accent/30 border border-border/50 cursor-pointer transition-colors hover:bg-accent/50"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">{insight.title}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      insight.priority === "high"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {insight.priority}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {insight.description}
                </p>
                <div className="flex items-center gap-3 text-[10px]">
                  {insight.impact_cost && (
                    <span className="text-primary font-medium">{insight.impact_cost}</span>
                  )}
                  {insight.impact_carbon && (
                    <span className="text-muted-foreground">{insight.impact_carbon}</span>
                  )}
                </div>
              </motion.div>
            ))}
      </div>

      <button
        onClick={() => navigate("/insights")}
        className="w-full mt-3 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        View All Insights <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AIInsightPanel;
