import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Zap, Sun, Leaf, Brain, Target, DollarSign,
  FileText, Map, Building2, Users, Trophy, Award, Shield, Settings,
  ChevronLeft, ChevronRight, Rocket, LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useAuth";

const sidebarNavItems = {
  main: [
    { label: "Dashboard",        icon: "LayoutDashboard", route: "/dashboard" },
    { label: "Mission Control",  icon: "Rocket",          route: "/mission-control" },
    { label: "Energy Monitoring",icon: "Zap",             route: "/energy" },
    { label: "Renewable Energy", icon: "Sun",             route: "/renewables" },
    { label: "Carbon Tracking",  icon: "Leaf",            route: "/carbon" },
    { label: "AI Insights",      icon: "Brain",           route: "/insights" },
  ],
  analytics: [
    { label: "Sustainability KPIs", icon: "Target",      route: "/kpis" },
    { label: "Cost & Finance",      icon: "DollarSign",  route: "/finance" },
    { label: "Reports",             icon: "FileText",    route: "/reports" },
  ],
  planning: [
    { label: "Net-Zero Roadmap", icon: "Map",       route: "/roadmap" },
    { label: "Campus Projects",  icon: "Building2", route: "/projects" },
  ],
  engagement: [
    { label: "Community",     icon: "Users",  route: "/community" },
    { label: "Leaderboard",   icon: "Trophy", route: "/leaderboard" },
    { label: "Eco Challenges",icon: "Award",  route: "/challenges" },
  ],
  system: [
    { label: "Admin Panel", icon: "Shield",   route: "/admin" },
    { label: "Settings",    icon: "Settings", route: "/settings" },
  ],
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Zap, Sun, Leaf, Brain, Target, DollarSign,
  FileText, Map, Building2, Users, Trophy, Award, Shield, Settings, Rocket,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NavSection = ({
  title, items, collapsed, currentPath, allowedRoutes,
}: {
  title: string;
  items: { label: string; icon: string; route: string }[];
  collapsed: boolean;
  currentPath: string;
  allowedRoutes: Set<string>;
}) => {
  const navigate = useNavigate();
  // Only show items the user is allowed to visit
  const visible = items.filter((item) => allowedRoutes.has(item.route));
  if (visible.length === 0) return null;

  return (
    <div className="mb-4">
      {!collapsed && (
        <p className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {title}
        </p>
      )}
      <div className="space-y-0.5 px-2">
        {visible.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = currentPath === item.route;
          return (
            <motion.button
              key={item.route}
              onClick={() => navigate(item.route)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { user, allowedRoutes } = useAuth();
  const { mutate: logout } = useLogout();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen sticky top-0 bg-card border-r border-border flex flex-col z-30"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg premium-button flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="font-bold text-lg text-foreground">EcoVista</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User badge */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          <span className="mt-1 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {user.role_name ?? "User"}
          </span>
        </div>
      )}

      {/* Nav — filtered by role */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <NavSection title="Main"       items={sidebarNavItems.main}       collapsed={collapsed} currentPath={location.pathname} allowedRoutes={allowedRoutes} />
        <NavSection title="Analytics"  items={sidebarNavItems.analytics}  collapsed={collapsed} currentPath={location.pathname} allowedRoutes={allowedRoutes} />
        <NavSection title="Planning"   items={sidebarNavItems.planning}   collapsed={collapsed} currentPath={location.pathname} allowedRoutes={allowedRoutes} />
        <NavSection title="Engagement" items={sidebarNavItems.engagement} collapsed={collapsed} currentPath={location.pathname} allowedRoutes={allowedRoutes} />
        <NavSection title="System"     items={sidebarNavItems.system}     collapsed={collapsed} currentPath={location.pathname} allowedRoutes={allowedRoutes} />
      </div>

      {/* Footer: campus info + logout */}
      <div className="p-3 border-t border-border space-y-2">
        {!collapsed && (
          <div className="glass-card p-2.5 text-center">
            <p className="text-xs text-muted-foreground">Campus: IIT Delhi</p>
            <p className="text-xs font-medium text-primary">Net-Zero Target: 2035</p>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

