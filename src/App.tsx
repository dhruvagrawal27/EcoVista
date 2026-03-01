import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CampusProvider } from "@/context/CampusContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Energy from "./pages/Energy";
import Renewables from "./pages/Renewables";
import Carbon from "./pages/Carbon";
import Insights from "./pages/Insights";
import KPIs from "./pages/KPIs";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import Roadmap from "./pages/Roadmap";
import Community from "./pages/Community";
import MissionControl from "./pages/MissionControl";
import ComingSoon from "./pages/ComingSoon";
import Projects from "./pages/Projects";
import Leaderboard from "./pages/Leaderboard";
import Challenges from "./pages/Challenges";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Guards a route: redirect to /login if not authenticated,
 *  or to /dashboard if authenticated but not allowed for their role. */
function ProtectedRoute({ route, element }: { route: string; element: React.ReactNode }) {
  const { user, loading, canAccess } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!canAccess(route)) return <Navigate to="/dashboard" replace />;
  return <>{element}</>;
}

/** On the login page: if already logged in, go straight to /dashboard */
function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<LoginRoute />} />
    <Route path="/dashboard"       element={<ProtectedRoute route="/dashboard"       element={<Dashboard />} />} />
    <Route path="/mission-control" element={<ProtectedRoute route="/mission-control" element={<MissionControl />} />} />
    <Route path="/energy"          element={<ProtectedRoute route="/energy"          element={<Energy />} />} />
    <Route path="/renewables"      element={<ProtectedRoute route="/renewables"      element={<Renewables />} />} />
    <Route path="/carbon"          element={<ProtectedRoute route="/carbon"          element={<Carbon />} />} />
    <Route path="/insights"        element={<ProtectedRoute route="/insights"        element={<Insights />} />} />
    <Route path="/kpis"            element={<ProtectedRoute route="/kpis"            element={<KPIs />} />} />
    <Route path="/finance"         element={<ProtectedRoute route="/finance"         element={<Finance />} />} />
    <Route path="/reports"         element={<ProtectedRoute route="/reports"         element={<Reports />} />} />
    <Route path="/roadmap"         element={<ProtectedRoute route="/roadmap"         element={<Roadmap />} />} />
    <Route path="/projects"        element={<ProtectedRoute route="/projects"        element={<Projects />} />} />
    <Route path="/community"       element={<ProtectedRoute route="/community"       element={<Community />} />} />
    <Route path="/leaderboard"     element={<ProtectedRoute route="/leaderboard"     element={<Leaderboard />} />} />
    <Route path="/challenges"      element={<ProtectedRoute route="/challenges"      element={<Challenges />} />} />
    <Route path="/admin"           element={<ProtectedRoute route="/admin"           element={<Admin />} />} />
    <Route path="/settings"        element={<ProtectedRoute route="/settings"        element={<Settings />} />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CampusProvider>
            <AppRoutes />
          </CampusProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
