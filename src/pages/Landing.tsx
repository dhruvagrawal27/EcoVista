import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Zap, Sun, IndianRupee, Brain, Settings, TrendingUp, ArrowRight, ChevronRight } from "lucide-react";
const iconMap: Record<string, React.ComponentType<any>> = {
  Zap, Leaf, Sun, IndianRupee, Brain, Settings, TrendingUp,
};

const liveMetricsStrip = [
  { label: "Solar Generated Today", value: "1.24 MWh", icon: "Sun" },
  { label: "Grid Consumption", value: "3.87 MWh", icon: "Zap" },
  { label: "Carbon Offset", value: "0.62 tCO₂", icon: "Leaf" },
  { label: "Energy Cost Today", value: "₹18,400", icon: "IndianRupee" },
];

const landingFeatures = [
  { title: "Energy Intelligence", description: "Real-time monitoring of energy consumption across all campus buildings.", icon: "Zap" },
  { title: "Carbon Tracking", description: "Scope 1, 2 & 3 emissions tracking with automated reporting.", icon: "Leaf" },
  { title: "Solar & Renewables", description: "Monitor renewable generation and battery storage in real time.", icon: "Sun" },
  { title: "Finance Insights", description: "Track energy costs, green investments, and ROI automatically.", icon: "IndianRupee" },
  { title: "AI Recommendations", description: "Actionable AI-powered insights to reduce costs and emissions.", icon: "Brain" },
  { title: "Sustainability KPIs", description: "Track SDG alignment, sustainability scores, and risk indicators.", icon: "TrendingUp" },
  { title: "Roadmap Planning", description: "Phase-based net-zero roadmap with milestone tracking.", icon: "Settings" },
  { title: "Community Engagement", description: "Leaderboards, eco-challenges, and campus events to drive action.", icon: "TrendingUp" },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg premium-button flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">EcoVista</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-full text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="premium-button px-5 py-2.5 text-sm font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ background: "var(--hero-gradient)" }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AI-Powered Campus Sustainability
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6"
          >
            Smart Campus{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--hero-gradient)" }}>
              Net-Zero
            </span>{" "}
            Intelligence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Monitor energy, track carbon, optimize costs, and accelerate your campus net-zero journey with AI-powered intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate("/dashboard")}
              className="premium-button px-8 py-3 text-sm font-semibold flex items-center gap-2"
            >
              Launch Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted/50 transition-all"
            >
              Request Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto"
          >
            {[
              { label: "Buildings", value: "50+" },
              { label: "Carbon Reduced", value: "67%" },
              { label: "Energy Saved", value: "4.2 GWh" },
              { label: "Cost Saved", value: "₹8.4M" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live Metrics Strip */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {liveMetricsStrip.map((metric) => {
              const Icon = iconMap[metric.icon];
              return (
                <div key={metric.label} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/50">
                    <Icon className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Intelligent Sustainability Platform</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to monitor, analyze, and optimize campus sustainability at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {landingFeatures.map((feature, i) => {
              const Icon = iconMap[feature.icon];
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="glass-card grain-overlay p-6"
                >
                  <div className="p-3 rounded-xl bg-accent/50 w-fit mb-4">
                    <Icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Connect Sensors", desc: "Deploy IoT sensors across campus buildings and infrastructure." },
              { step: "02", title: "AI Analyzes", desc: "Our AI processes real-time data to find optimization opportunities." },
              { step: "03", title: "Take Action", desc: "Implement recommendations and track your net-zero progress." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full premium-button flex items-center justify-center mx-auto mb-4">
                  <span className="text-sm font-bold text-primary-foreground">{item.step}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Go Net-Zero?</h2>
          <p className="text-muted-foreground mb-8">
            Join leading universities in their sustainability transformation.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="premium-button px-10 py-3.5 text-sm font-semibold inline-flex items-center gap-2"
          >
            Start Your Journey <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">EcoVista</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 EcoVista. Smart Campus Net-Zero Intelligence.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
