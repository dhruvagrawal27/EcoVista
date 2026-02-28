export const campusMetrics = {
  netZeroProgress: 67.3,
  targetYear: 2035,
  liveEnergy: 2847,
  liveEnergyUnit: "kW",
  solarToday: 18420,
  solarTarget: 22000,
  carbonToday: 1245,
  carbonYesterday: 1380,
  costSavings: 847500,
  costTrend: 12.4,
  totalBuildings: 50,
  totalStudents: 15000,
  solarCapacity: 5,
  campusArea: 120,
};

export const energyTimeSeries = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  actual: Math.round(2000 + Math.sin(i / 3) * 800 + Math.random() * 300),
  predicted: Math.round(2100 + Math.sin(i / 3) * 750 + Math.random() * 100),
  solar: Math.round(i >= 6 && i <= 18 ? Math.sin(((i - 6) / 12) * Math.PI) * 1200 + Math.random() * 100 : 0),
}));

export const buildingRankings = [
  { name: "Science Block A", efficiency: 94, consumption: 320, trend: -5.2 },
  { name: "Library Complex", efficiency: 91, consumption: 280, trend: -3.8 },
  { name: "Admin Building", efficiency: 88, consumption: 195, trend: -2.1 },
  { name: "Engineering Lab", efficiency: 85, consumption: 410, trend: -1.5 },
  { name: "Student Center", efficiency: 82, consumption: 350, trend: 0.8 },
];

export const energyByType = [
  { name: "HVAC", value: 42, kwh: 11960 },
  { name: "Lighting", value: 24, kwh: 6840 },
  { name: "Labs", value: 18, kwh: 5130 },
  { name: "Hostels", value: 10, kwh: 2850 },
  { name: "Others", value: 6, kwh: 1710 },
];

export const renewableVsGrid = [
  { name: "Solar", value: 38 },
  { name: "Wind", value: 5 },
  { name: "Grid", value: 57 },
];

export const aiInsights = [
  {
    id: 1,
    title: "HVAC Optimization Opportunity",
    description: "Building C3 HVAC running 23% above optimal. Reducing setpoint by 2°C during off-hours could save ₹12,400/month.",
    impact: { cost: "₹12,400/mo", carbon: "-180 kg CO₂" },
    priority: "high" as const,
  },
  {
    id: 2,
    title: "Solar Panel Cleaning Alert",
    description: "Panels on Rooftop B showing 8% efficiency drop. Scheduled cleaning could recover 340 kWh/day.",
    impact: { cost: "₹8,200/mo", carbon: "-95 kg CO₂" },
    priority: "medium" as const,
  },
  {
    id: 3,
    title: "Peak Load Shifting",
    description: "Shifting lab equipment charging to off-peak hours (10PM-6AM) could reduce costs by 15%.",
    impact: { cost: "₹18,700/mo", carbon: "-220 kg CO₂" },
    priority: "high" as const,
  },
];

export const alerts = [
  { id: 1, type: "critical" as const, title: "Overconsumption Detected", location: "Engineering Lab Block B", time: "2 min ago", description: "Energy consumption 45% above baseline for the last 30 minutes." },
  { id: 2, type: "warning" as const, title: "Solar Panel Fault", location: "Rooftop Array C", time: "15 min ago", description: "Panel cluster C-7 reporting 0 output. Possible inverter failure." },
  { id: 3, type: "warning" as const, title: "HVAC Anomaly", location: "Library Complex", time: "1 hr ago", description: "Cooling system cycling irregularly. Temperature variance ±3°C." },
];

export const quickActions = [
  { id: 1, label: "Energy Dashboard", icon: "Zap", route: "/energy", color: "chart-1" },
  { id: 2, label: "Carbon Tracker", icon: "Leaf", route: "/carbon", color: "chart-2" },
  { id: 3, label: "AI Recommendations", icon: "Brain", route: "/insights", color: "chart-3" },
  { id: 4, label: "Financial Insights", icon: "TrendingUp", route: "/finance", color: "chart-4" },
  { id: 5, label: "Generate Report", icon: "FileText", route: "/reports", color: "chart-5" },
];

export const sidebarNavItems = {
  main: [
    { label: "Dashboard", icon: "LayoutDashboard", route: "/dashboard" },
    { label: "Mission Control", icon: "Rocket", route: "/mission-control" },
    { label: "Energy Monitoring", icon: "Zap", route: "/energy" },
    { label: "Renewable Energy", icon: "Sun", route: "/renewables" },
    { label: "Carbon Tracking", icon: "Leaf", route: "/carbon" },
    { label: "AI Insights", icon: "Brain", route: "/insights" },
  ],
  analytics: [
    { label: "Sustainability KPIs", icon: "Target", route: "/kpis" },
    { label: "Cost & Finance", icon: "DollarSign", route: "/finance" },
    { label: "Reports", icon: "FileText", route: "/reports" },
  ],
  planning: [
    { label: "Net-Zero Roadmap", icon: "Map", route: "/roadmap" },
    { label: "Campus Projects", icon: "Building2", route: "/projects" },
  ],
  engagement: [
    { label: "Community", icon: "Users", route: "/community" },
    { label: "Leaderboard", icon: "Trophy", route: "/leaderboard" },
    { label: "Eco Challenges", icon: "Award", route: "/challenges" },
  ],
  system: [
    { label: "Admin Panel", icon: "Shield", route: "/admin" },
    { label: "Settings", icon: "Settings", route: "/settings" },
  ],
};

export const liveMetricsStrip = [
  { label: "Energy Saved Today", value: "4,280 kWh", icon: "Zap" },
  { label: "Carbon Reduced", value: "1.2 tons", icon: "Leaf" },
  { label: "Solar Generated", value: "18.4 MWh", icon: "Sun" },
  { label: "Cost Saved", value: "₹84,750", icon: "IndianRupee" },
];

export const landingFeatures = [
  {
    title: "AI-Powered Monitoring",
    description: "Real-time energy monitoring with ML anomaly detection across all campus buildings.",
    icon: "Brain",
  },
  {
    title: "Carbon Intelligence",
    description: "Track, forecast, and reduce Scope 1-3 emissions with AI-driven carbon analytics.",
    icon: "Leaf",
  },
  {
    title: "Predictive Maintenance",
    description: "Prevent equipment failures and optimize maintenance schedules using predictive AI.",
    icon: "Settings",
  },
  {
    title: "Financial Optimization",
    description: "ROI tracking, cost forecasting, and smart budget allocation for sustainability investments.",
    icon: "TrendingUp",
  },
];
