import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CampusProvider } from "@/context/CampusContext";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CampusProvider>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/energy" element={<Energy />} />
          <Route path="/renewables" element={<Renewables />} />
          <Route path="/carbon" element={<Carbon />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/kpis" element={<KPIs />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/community" element={<Community />} />
          <Route path="/mission-control" element={<MissionControl />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </CampusProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);export default App;
