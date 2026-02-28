import { X, Bot, AlertTriangle, Play } from "lucide-react";
import { motion } from "framer-motion";

interface AICommandPanelProps {
  onClose: () => void;
}

const AICommandPanel = ({ onClose }: AICommandPanelProps) => {
  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 340, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="border-l border-border bg-card overflow-y-auto"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Command Center</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Preview */}
        <div className="glass-card p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-2">AI Assistant</p>
          <div className="bg-accent/50 rounded-lg p-3 mb-2">
            <p className="text-sm text-foreground">
              Based on today's patterns, I recommend reducing HVAC in Building C3 after 6PM. 
              Estimated savings: ₹4,200 today.
            </p>
          </div>
          <input
            type="text"
            placeholder="Ask EcoVista AI..."
            className="w-full bg-muted/30 border border-border rounded-full py-2 px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Latest Anomaly */}
        <div className="glass-card p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="text-xs font-medium text-foreground">Latest Anomaly</p>
          </div>
          <p className="text-sm text-foreground mb-1">Engineering Lab Block B</p>
          <p className="text-xs text-muted-foreground">Energy consumption 45% above baseline detected 2 minutes ago.</p>
        </div>

        {/* Suggested Action */}
        <div className="glass-card p-4 mb-4">
          <p className="text-xs font-medium text-foreground mb-2">Suggested Action</p>
          <p className="text-sm text-muted-foreground mb-3">
            Run campus-wide optimization to balance loads and reduce peak consumption by ~18%.
          </p>
          <button className="premium-button w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2">
            <Play className="w-4 h-4" />
            Run Campus Optimization
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default AICommandPanel;
