// Extended mock data for all modules

export const energyRiskScore = {
  overall: 72,
  factors: [
    { name: "Grid Dependency", score: 62, weight: 0.3 },
    { name: "Peak Volatility", score: 78, weight: 0.25 },
    { name: "Weather Exposure", score: 85, weight: 0.2 },
    { name: "Overconsumption Freq", score: 45, weight: 0.15 },
    { name: "Equipment Age", score: 68, weight: 0.1 },
  ],
  stabilityIndex: 84.2,
  thirtyDayVariance: 6.8,
};

export const costHeatmapData = Array.from({ length: 28 }, (_, i) => ({
  day: i + 1,
  cost: Math.round(15000 + Math.random() * 25000),
  weekday: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i % 7],
}));

export const loadProfileData = {
  weekday: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    load: Math.round(1800 + Math.sin((i - 8) / 4) * 900 + (i >= 8 && i <= 18 ? 600 : 0)),
  })),
  weekend: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    load: Math.round(1200 + Math.sin((i - 10) / 5) * 400 + (i >= 10 && i <= 16 ? 200 : 0)),
  })),
};

export const benchmarkData = [
  { metric: "EUI (kWh/m²)", campus: 142, national: 168 },
  { metric: "Solar %", campus: 38, national: 22 },
  { metric: "Carbon Intensity", campus: 0.42, national: 0.58 },
  { metric: "HVAC Efficiency", campus: 88, national: 76 },
  { metric: "Cost/Student (₹)", campus: 12400, national: 15800 },
];

export const gridFlowData = {
  solar: { current: 1240, capacity: 5000, status: "active" as const },
  wind: { current: 180, capacity: 500, status: "active" as const },
  battery: { charge: 72, capacity: 2000, status: "charging" as const },
  grid: { current: 1427, import: true },
  demand: { current: 2847, predicted: 2650 },
};

export const equipmentLoad = [
  { name: "Central HVAC Unit A", load: 420, capacity: 500, building: "Science Block A", status: "high" as const },
  { name: "Chiller Plant B2", load: 380, capacity: 450, building: "Engineering Lab", status: "high" as const },
  { name: "Data Center Cooling", load: 310, capacity: 400, building: "IT Block", status: "medium" as const },
  { name: "Lab Equipment Array", load: 285, capacity: 350, building: "Chemistry Lab", status: "medium" as const },
  { name: "Lighting System D", load: 220, capacity: 300, building: "Library Complex", status: "normal" as const },
  { name: "Server Room UPS", load: 195, capacity: 250, building: "Admin Building", status: "normal" as const },
  { name: "Water Heating System", load: 180, capacity: 250, building: "Hostel Block C", status: "normal" as const },
  { name: "Elevator System", load: 145, capacity: 200, building: "Student Center", status: "normal" as const },
];

export const forecastData = Array.from({ length: 72 }, (_, i) => ({
  hour: i,
  actual: i < 24 ? Math.round(2200 + Math.sin(i / 3) * 700 + Math.random() * 200) : null,
  predicted: Math.round(2300 + Math.sin(i / 3) * 650 + Math.random() * 50),
  upper: Math.round(2600 + Math.sin(i / 3) * 700),
  lower: Math.round(2000 + Math.sin(i / 3) * 600),
}));

export const forecastAccuracy = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  accuracy: Math.round(88 + Math.random() * 10),
  drift: +(Math.random() * 4 - 2).toFixed(1),
}));

export const buildingDetails = [
  { id: "science-a", name: "Science Block A", eui: 135, hvac: 92, carbon: 88, maintenance: 75, occupancy: 94, floors: 4, area: 4200, yearBuilt: 2018 },
  { id: "library", name: "Library Complex", eui: 128, hvac: 88, carbon: 91, maintenance: 82, occupancy: 90, floors: 3, area: 5800, yearBuilt: 2015 },
  { id: "engineering", name: "Engineering Lab", eui: 165, hvac: 78, carbon: 72, maintenance: 65, occupancy: 85, floors: 5, area: 6200, yearBuilt: 2010 },
  { id: "admin", name: "Admin Building", eui: 98, hvac: 95, carbon: 94, maintenance: 88, occupancy: 70, floors: 3, area: 3400, yearBuilt: 2020 },
  { id: "student-center", name: "Student Center", eui: 142, hvac: 82, carbon: 80, maintenance: 72, occupancy: 88, floors: 2, area: 4800, yearBuilt: 2012 },
];

export const retrofitSuggestions = [
  { action: "LED Retrofit - All Common Areas", cost: 850000, annualSaving: 320000, payback: 2.7, carbonReduction: 42 },
  { action: "Smart HVAC Controls", cost: 1200000, annualSaving: 480000, payback: 2.5, carbonReduction: 65 },
  { action: "Solar Panel Expansion (2MW)", cost: 8500000, annualSaving: 2400000, payback: 3.5, carbonReduction: 180 },
  { action: "Building Envelope Insulation", cost: 2200000, annualSaving: 560000, payback: 3.9, carbonReduction: 38 },
];

// Carbon module data
export const carbonScopes = {
  scope1: { total: 1250, sources: [
    { name: "Natural Gas", value: 680, trend: -8 },
    { name: "Diesel Generators", value: 320, trend: -12 },
    { name: "Fleet Vehicles", value: 250, trend: -5 },
  ]},
  scope2: { total: 3420, sources: [
    { name: "Purchased Electricity", value: 2800, trend: -15 },
    { name: "District Heating", value: 420, trend: -3 },
    { name: "District Cooling", value: 200, trend: -7 },
  ]},
  scope3: { total: 2180, sources: [
    { name: "Student Commute", value: 980, trend: -4 },
    { name: "Procurement", value: 650, trend: -2 },
    { name: "Waste", value: 320, trend: -18 },
    { name: "Business Travel", value: 230, trend: -22 },
  ]},
};

export const carbonTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  actual: Math.round(580 - i * 12 + Math.random() * 40),
  target: Math.round(600 - i * 15),
  forecast: i > 8 ? Math.round(500 - (i - 8) * 18 + Math.random() * 20) : null,
}));

export const carbonScenarios = [
  { name: "Electrify Fleet", impact: -180, timeline: "18 months", cost: 4500000, feasibility: 85 },
  { name: "Expand Solar to 8MW", impact: -420, timeline: "24 months", cost: 12000000, feasibility: 78 },
  { name: "Building Insulation", impact: -95, timeline: "12 months", cost: 2200000, feasibility: 92 },
  { name: "Green Procurement Policy", impact: -130, timeline: "6 months", cost: 500000, feasibility: 95 },
  { name: "Waste-to-Energy Plant", impact: -210, timeline: "36 months", cost: 18000000, feasibility: 60 },
];

export const netZeroCountdown = {
  targetYear: 2035,
  currentEmissions: 6850,
  baselineEmissions: 12400,
  reductionRate: 8.5,
  onTrack: true,
  milestones: [
    { year: 2024, target: 7200, actual: 6850, status: "achieved" as const },
    { year: 2026, target: 5800, actual: null, status: "on-track" as const },
    { year: 2028, target: 4200, actual: null, status: "planned" as const },
    { year: 2030, target: 2500, actual: null, status: "planned" as const },
    { year: 2035, target: 0, actual: null, status: "planned" as const },
  ],
};

// Finance module data
export const financeMetrics = {
  totalInvestment: 45000000,
  annualSavings: 8400000,
  npv: 28500000,
  irr: 18.4,
  paybackPeriod: 5.4,
  carbonCredits: 1250000,
  subsidies: 3200000,
};

export const investmentMatrix = [
  { name: "Solar Expansion", cost: 12, impact: 9.2, roi: 22, status: "approved" as const },
  { name: "Smart HVAC", cost: 4.5, impact: 7.8, roi: 28, status: "in-progress" as const },
  { name: "LED Retrofit", cost: 2.8, impact: 6.5, roi: 35, status: "completed" as const },
  { name: "Battery Storage", cost: 8, impact: 8.5, roi: 15, status: "proposed" as const },
  { name: "EV Charging", cost: 3.2, impact: 5.2, roi: 18, status: "approved" as const },
  { name: "Green Roof", cost: 5.5, impact: 4.8, roi: 12, status: "proposed" as const },
];

export const capitalProjection = Array.from({ length: 10 }, (_, i) => ({
  year: 2025 + i,
  investment: Math.round(4500000 * Math.pow(0.85, i)),
  savings: Math.round(2400000 * Math.pow(1.12, i)),
  cumulative: Math.round(2400000 * ((Math.pow(1.12, i + 1) - 1) / 0.12) - 4500000 * ((Math.pow(0.85, i + 1) - 0.85) / -0.15)),
}));

export const subsidyTracker = [
  { name: "National Solar Mission", amount: 1800000, status: "approved" as const, deadline: "2025-06-30" },
  { name: "Green Building Certification", amount: 500000, status: "applied" as const, deadline: "2025-03-15" },
  { name: "State Energy Efficiency Fund", amount: 900000, status: "eligible" as const, deadline: "2025-09-30" },
  { name: "Carbon Credit Trading", amount: 1250000, status: "active" as const, deadline: "Ongoing" },
];

// KPI module data
export const sustainabilityScore = {
  overall: 78,
  categories: [
    { name: "Energy Efficiency", score: 82, trend: 4, weight: 0.25 },
    { name: "Carbon Reduction", score: 76, trend: 6, weight: 0.2 },
    { name: "Renewable Share", score: 85, trend: 8, weight: 0.2 },
    { name: "Water Conservation", score: 72, trend: 2, weight: 0.15 },
    { name: "Waste Management", score: 68, trend: 5, weight: 0.1 },
    { name: "Biodiversity", score: 74, trend: 3, weight: 0.1 },
  ],
};

export const sdgAlignment = [
  { sdg: 7, name: "Affordable & Clean Energy", score: 88 },
  { sdg: 9, name: "Industry & Innovation", score: 72 },
  { sdg: 11, name: "Sustainable Cities", score: 81 },
  { sdg: 12, name: "Responsible Consumption", score: 65 },
  { sdg: 13, name: "Climate Action", score: 79 },
  { sdg: 15, name: "Life on Land", score: 58 },
];

export const kpiRiskIndicators = [
  { kpi: "Energy Intensity (kWh/m²)", current: 142, target: 120, status: "at-risk" as const, deadline: "Q4 2025" },
  { kpi: "Renewable Energy Share (%)", current: 43, target: 60, status: "on-track" as const, deadline: "Q2 2026" },
  { kpi: "Carbon per Student (kg)", current: 456, target: 350, status: "at-risk" as const, deadline: "Q4 2025" },
  { kpi: "Water Use Intensity (L/m²)", current: 8.2, target: 6.5, status: "critical" as const, deadline: "Q3 2025" },
  { kpi: "Waste Diversion Rate (%)", current: 62, target: 80, status: "on-track" as const, deadline: "Q4 2026" },
  { kpi: "Green Certified Buildings (%)", current: 34, target: 50, status: "on-track" as const, deadline: "Q2 2027" },
];

// AI Insights module data
export const aiRecommendations = [
  { id: 1, title: "Optimize HVAC Scheduling", category: "Energy", roi: 28, carbonImpact: 180, ease: 85, confidence: 92, status: "new" as const, adoptionRate: 0 },
  { id: 2, title: "Solar Panel Repositioning", category: "Renewables", roi: 15, carbonImpact: 95, ease: 60, confidence: 88, status: "implemented" as const, adoptionRate: 100 },
  { id: 3, title: "Peak Load Shifting", category: "Energy", roi: 22, carbonImpact: 220, ease: 75, confidence: 94, status: "in-review" as const, adoptionRate: 0 },
  { id: 4, title: "Smart Lighting Zones", category: "Energy", roi: 35, carbonImpact: 65, ease: 90, confidence: 96, status: "new" as const, adoptionRate: 0 },
  { id: 5, title: "Predictive Maintenance Alert", category: "Operations", roi: 18, carbonImpact: 40, ease: 70, confidence: 85, status: "implemented" as const, adoptionRate: 78 },
  { id: 6, title: "EV Charging Optimization", category: "Transport", roi: 12, carbonImpact: 150, ease: 55, confidence: 79, status: "new" as const, adoptionRate: 0 },
];

export const modelPerformance = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  accuracy: +(86 + Math.log(i + 1) * 3 + Math.random() * 2).toFixed(1),
  predictions: Math.round(120 + i * 8 + Math.random() * 20),
}));

export const aiTrustScore = {
  overall: 91,
  components: [
    { name: "Prediction Accuracy", score: 94 },
    { name: "Data Quality", score: 89 },
    { name: "Model Stability", score: 92 },
    { name: "Recommendation Relevance", score: 88 },
  ],
};

// Roadmap module data
export const roadmapPhases = [
  { id: 1, name: "Foundation", start: "2024-01", end: "2024-12", progress: 85, budget: 8000000, spent: 6800000, risk: "low" as const,
    milestones: [
      { name: "Energy Audit Complete", date: "2024-03", done: true },
      { name: "Solar Phase 1 Online", date: "2024-06", done: true },
      { name: "Smart Meters Deployed", date: "2024-09", done: true },
      { name: "Baseline Established", date: "2024-12", done: false },
    ]},
  { id: 2, name: "Acceleration", start: "2025-01", end: "2026-06", progress: 35, budget: 15000000, spent: 5250000, risk: "medium" as const,
    milestones: [
      { name: "HVAC Optimization", date: "2025-03", done: true },
      { name: "Solar Phase 2", date: "2025-09", done: false },
      { name: "Battery Storage", date: "2026-01", done: false },
      { name: "50% Renewable", date: "2026-06", done: false },
    ]},
  { id: 3, name: "Transformation", start: "2026-07", end: "2030-12", progress: 0, budget: 22000000, spent: 0, risk: "high" as const,
    milestones: [
      { name: "Full Electrification", date: "2027-06", done: false },
      { name: "80% Renewable", date: "2028-12", done: false },
      { name: "Carbon Neutral Operations", date: "2030-06", done: false },
    ]},
  { id: 4, name: "Net-Zero", start: "2031-01", end: "2035-12", progress: 0, budget: 10000000, spent: 0, risk: "medium" as const,
    milestones: [
      { name: "Offset Remaining Emissions", date: "2032-12", done: false },
      { name: "Carbon Negative Target", date: "2035-12", done: false },
    ]},
];

export const riskRegister = [
  { id: 1, risk: "Solar panel supply chain delays", impact: "high" as const, probability: "medium" as const, mitigation: "Diversified supplier contracts", owner: "Facilities", phase: 2 },
  { id: 2, risk: "Budget overrun on HVAC retrofit", impact: "high" as const, probability: "low" as const, mitigation: "Phased implementation approach", owner: "Finance", phase: 2 },
  { id: 3, risk: "Grid instability during transition", impact: "critical" as const, probability: "low" as const, mitigation: "Battery backup systems", owner: "Operations", phase: 3 },
  { id: 4, risk: "Regulatory changes in carbon pricing", impact: "medium" as const, probability: "high" as const, mitigation: "Flexible carbon strategy", owner: "Strategy", phase: 3 },
  { id: 5, risk: "Technology obsolescence", impact: "medium" as const, probability: "medium" as const, mitigation: "Modular system design", owner: "IT", phase: 4 },
];

// Reports module data
export const reportTemplates = [
  { id: "gri", name: "GRI Standards Report", standard: "GRI 2021", sections: 12, lastGenerated: "2025-01-15" },
  { id: "cdp", name: "CDP Climate Disclosure", standard: "CDP 2024", sections: 8, lastGenerated: "2024-12-01" },
  { id: "stars", name: "AASHE STARS Report", standard: "STARS 2.2", sections: 6, lastGenerated: "2024-11-20" },
  { id: "tcfd", name: "TCFD Disclosure", standard: "TCFD 2023", sections: 4, lastGenerated: null },
  { id: "custom", name: "Custom Monthly Report", standard: "Internal", sections: 10, lastGenerated: "2025-02-01" },
];

export const reportKPIs = [
  { name: "Total Energy Consumption", value: "28,470 MWh", period: "FY 2024-25", change: -8.2 },
  { name: "Renewable Energy Share", value: "43%", period: "FY 2024-25", change: 12.5 },
  { name: "Total GHG Emissions", value: "6,850 tCO₂e", period: "FY 2024-25", change: -15.3 },
  { name: "Energy Cost", value: "₹4.2 Cr", period: "FY 2024-25", change: -6.8 },
  { name: "Water Consumption", value: "182 ML", period: "FY 2024-25", change: -4.2 },
  { name: "Waste Diverted", value: "62%", period: "FY 2024-25", change: 8.0 },
];

// Community module data
export const leaderboard = [
  { rank: 1, name: "Green Warriors", department: "Environmental Science", points: 12840, badge: "🏆", streak: 45 },
  { rank: 2, name: "Solar Squad", department: "Physics", points: 11200, badge: "☀️", streak: 38 },
  { rank: 3, name: "Eco Engineers", department: "Mechanical Eng.", points: 10560, badge: "⚡", streak: 32 },
  { rank: 4, name: "Carbon Crusaders", department: "Chemistry", points: 9800, badge: "🌱", streak: 28 },
  { rank: 5, name: "Sustainability Stars", department: "Architecture", points: 9200, badge: "⭐", streak: 25 },
  { rank: 6, name: "Planet Protectors", department: "Biology", points: 8640, badge: "🌍", streak: 22 },
  { rank: 7, name: "Recycle Rangers", department: "Civil Eng.", points: 7980, badge: "♻️", streak: 18 },
  { rank: 8, name: "Watt Savers", department: "Electrical Eng.", points: 7320, badge: "💡", streak: 15 },
];

export const ecoChallenges = [
  { id: 1, title: "Zero Waste Week", participants: 342, target: 500, endDate: "2025-03-15", reward: "500 pts", category: "Waste", active: true },
  { id: 2, title: "Bike to Campus Month", participants: 218, target: 300, endDate: "2025-03-31", reward: "750 pts", category: "Transport", active: true },
  { id: 3, title: "Energy Detective", participants: 156, target: 200, endDate: "2025-04-15", reward: "1000 pts", category: "Energy", active: true },
  { id: 4, title: "Plant a Tree Drive", participants: 500, target: 500, endDate: "2025-02-28", reward: "300 pts", category: "Biodiversity", active: false },
];

export const communityEvents = [
  { id: 1, title: "Sustainability Hackathon", date: "2025-03-20", location: "Innovation Hub", attendees: 120, type: "Competition" },
  { id: 2, title: "Green Building Workshop", date: "2025-03-25", location: "Architecture Hall", attendees: 45, type: "Workshop" },
  { id: 3, title: "Climate Action Seminar", date: "2025-04-02", location: "Main Auditorium", attendees: 200, type: "Seminar" },
  { id: 4, title: "Solar Panel Installation Demo", date: "2025-04-10", location: "Engineering Block", attendees: 60, type: "Demo" },
];
