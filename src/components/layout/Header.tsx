import { Bell, Search, Bot, ChevronDown, User } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  onToggleAI?: () => void;
}

const Header = ({ title, breadcrumb, onToggleAI }: HeaderProps) => {
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </motion.button>

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
