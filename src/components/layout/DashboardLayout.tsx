import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AICommandPanel from "./AICommandPanel";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb?: string;
}

const DashboardLayout = ({ children, title, breadcrumb }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} breadcrumb={breadcrumb} onToggleAI={() => setAiPanelOpen(!aiPanelOpen)} />
        
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
          
          {aiPanelOpen && <AICommandPanel onClose={() => setAiPanelOpen(false)} />}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
