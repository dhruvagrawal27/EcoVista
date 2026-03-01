import { useState, useRef, useEffect, useCallback } from "react";
import { X, Bot, Send, Loader2, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Groq from "groq-sdk";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

const SYSTEM_PROMPT = `You are EcoVista AI, an intelligent assistant embedded inside the EcoVista campus energy management platform.

## ABOUT ECOVISTA (your knowledge base)
EcoVista is a full-stack campus sustainability intelligence platform built for Indian university campuses (primary pilot: IIT Delhi). It is developed using React + TypeScript (frontend), Supabase (PostgreSQL backend), and Vite. The platform gives facility managers, finance teams, faculty, and administrators a single pane of glass for energy management, carbon tracking, and net-zero planning.

### Platform Modules & Features:
**Dashboard** — Live overview of campus energy KPIs: total demand (kW), solar generation, battery charge %, grid import, carbon intensity, cost per kWh. Trend sparklines, top-performing buildings leaderboard, and quick-action shortcuts.

**Energy Monitoring** — 5-tab intelligence hub:
- Overview: risk score, cost heatmap (hourly ₹/kWh), equipment load by category, load profile (weekday vs weekend), benchmark vs peer campuses.
- Real-Time Grid: live solar/battery/grid state, circuit-level equipment load bars.
- Forecast: 72-hour energy forecast with confidence bands (AreaChart), 30-day accuracy tracker, What-If simulator (adjust temperature, occupancy, solar efficiency → see estimated demand shift).
- Building Deep Dive: per-building radar scorecard (HVAC, Carbon, Maintenance, Occupancy, EUI), AI retrofit suggestions with status workflow (proposed → approved → in-progress → completed → rejected) and carbon/cost impact.

**Mission Control** — Net-Zero Trajectory Simulator. Users toggle decarbonisation levers (100% Solar, EV Fleet, Deep Retrofit, AI Demand Response, Biomass Energy), set implementation intensity (10–100%), and watch the emission trajectory update in real time. Shows net-zero year, years saved vs BAU, total investment, CO₂ reduction. Admins can add/edit/delete levers from the database.

**Carbon Tracker** — Monthly CO₂ emissions by scope (Scope 1: direct, Scope 2: purchased electricity, Scope 3: supply chain/travel). Scenario builder to model reduction pathways. Displays carbon intensity (tCO₂/student) and progress toward Science-Based Targets.

**Renewables** — Solar array performance (kWp installed, current output, capacity factor), battery storage state, renewable fraction of total consumption, satellite-based solar irradiance overlay.

**Insights** — AI-generated recommendations ranked by ROI %, payback period, carbon reduction potential. Each insight shows estimated annual saving in ₹ and tCO₂. Admins can add custom recommendations.

**Finance** — Energy cost breakdown by building and fuel type, tariff analysis (ToU vs flat rate), CAPEX/OPEX for retrofit projects, simple payback and NPV calculator, utility bill trend.

**Reports** — Auto-generate PDF reports: executive summary, building performance report, carbon disclosure report. Data is pulled live from Supabase.

**KPIs** — Configurable sustainability KPI tracker: EUI (kWh/m²/yr), renewable fraction %, carbon intensity, water intensity, waste diversion rate. Progress bars vs targets.

**Leaderboard** — Department and building ranking by % energy reduction. Gamified with badges and trend arrows.

**Community Challenges** — Campus-wide sustainability challenges (e.g. "Reduce HVAC by 10% in October"). Tracks participation and impact.

**Roadmap** — Visual timeline of planned sustainability projects with milestones, budget, and status.

**Admin Panel** — User management, role assignment, campus/building configuration, alert configuration thresholds.

### Role-Based Access:
- **Admin**: Full access — CRUD on all data, can run simulations, manage levers, configure alerts.
- **Facility Manager**: Can approve retrofits, toggle autonomous AI HVAC mode, run Mission Control simulations.
- **Finance**: View-only on energy and carbon data; full access to Finance and Reports modules.
- **Faculty**: View-only; can access Dashboard, Forecast, Carbon overview, Leaderboard, and Community Challenges.

### Technology Stack:
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui components, Framer Motion animations, Recharts for data visualisation.
- Backend: Supabase (PostgreSQL) — stores buildings, energy_readings, carbon_emissions, retrofit_suggestions, alerts, mission_decisions, load_profiles, energy_forecasts, ai_recommendations, users, roles, campuses.
- AI: Groq API (moonshotai/kimi-k2-instruct-0905) for this chat assistant; ML models (stored in ml_models table) for energy forecasting.
- Auth: Supabase auth + custom SHA-256 DB-side password hashing; role resolved from roles table on login.

### Typical Campus Context (IIT Delhi pilot):
- ~200+ buildings, hostels, academic blocks, labs, sports facilities.
- Peak demand: ~4–6 MW.
- Solar installed: ~2 MWp rooftop.
- Annual energy cost: ~₹15–25 Cr.
- Current renewable fraction: ~30–40%.
- Target: Net-zero by 2040–2045 depending on lever selection.

## YOUR PURPOSE
Help users understand:
- Energy consumption data, trends, and anomalies across campus buildings
- Carbon emissions, net-zero trajectory, and decarbonisation strategies
- Renewable energy (solar, battery storage) performance and forecasts
- Sustainability KPIs, benchmarks, and financial metrics
- How to navigate and use EcoVista's features
- Role-based access and what each role can do
- Alert notifications and anomaly explanations
- Retrofit suggestions and their carbon/cost tradeoffs
- General sustainability best practices in the context of Indian university campuses

## GUARDRAILS — strictly follow these rules:
1. Only answer questions about energy management, sustainability, carbon emissions, the EcoVista platform, and related topics.
2. If a user asks about anything unrelated (cooking, sports, politics, general coding, entertainment, celebrities, etc.), politely say: "I'm focused on EcoVista and campus sustainability topics. Is there something about your energy data or the platform I can help with?"
3. If a question is about live campus data you cannot see (e.g. "what is the exact current reading right now?"), explain that real-time data is visible on the relevant dashboard tab and offer to help them interpret what they see.
4. If a user asks something very campus-specific that goes beyond your knowledge (e.g. a specific building's meter ID, a custom contract tariff), say: "That specific detail isn't available to me yet — it will be addressed in a future EcoVista update."
5. Never fabricate specific numbers as facts. You may use illustrative examples clearly labelled as "(example)".
6. Keep answers concise, clear, and actionable. Use bullet points and bold headers for structure.
7. Be friendly, confident, and professional. You represent EcoVista.`;

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm **EcoVista AI** — your campus sustainability assistant.\n\nI can help you understand energy data, carbon emissions, renewables, KPIs, platform features, and decarbonisation strategies.\n\nWhat would you like to know?",
};

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class=\"bg-muted px-1 rounded text-[11px]\">$1</code>")
    .replace(/^### (.+)$/gm, "<p class=\"font-semibold text-foreground mt-2 mb-1\">$1</p>")
    .replace(/^## (.+)$/gm, "<p class=\"font-bold text-foreground mt-2 mb-1\">$1</p>")
    .replace(/^- (.+)$/gm, "<li class=\"ml-3 list-disc\">$1</li>")
    .replace(/(<li[\s\S]+?<\/li>)/g, "<ul class=\"space-y-0.5 my-1\">$1</ul>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

interface AICommandPanelProps {
  onClose: () => void;
}

const AICommandPanel = ({ onClose }: AICommandPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<boolean>(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();
    const assistantPlaceholder: Message = { id: assistantId, role: "assistant", content: "", pending: true };

    setMessages(prev => [...prev, userMsg, assistantPlaceholder]);
    setInput("");
    setStreaming(true);
    abortRef.current = false;

    try {
      const history = [...messages, userMsg]
        .filter(m => !m.pending)
        .slice(-12) // keep last 12 messages (6 turns) as context window
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      const stream = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history,
        ],
        model: "moonshotai/kimi-k2-instruct-0905",
        temperature: 0.1,
        max_completion_tokens: 4096,
        top_p: 1,
        stream: true,
        stop: null,
      });

      let accumulated = "";
      for await (const chunk of stream) {
        if (abortRef.current) break;
        const delta = chunk.choices[0]?.delta?.content ?? "";
        accumulated += delta;
        const snap = accumulated;
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: snap, pending: false } : m)
        );
      }

      // Ensure pending is cleared even if stream ended with no content
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, pending: false } : m)
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `⚠️ Error: ${errMsg}`, pending: false }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 360, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="border-l border-border bg-card flex flex-col overflow-hidden shrink-0"
      style={{ height: "100%" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">EcoVista AI</h3>
            <p className="text-[10px] text-muted-foreground">Sustainability Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5
                ${msg.role === "user" ? "bg-primary/20" : "bg-primary/10"}`}>
                {msg.role === "user"
                  ? <User className="w-3.5 h-3.5 text-primary" />
                  : <Bot className="w-3.5 h-3.5 text-primary" />
                }
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed
                  ${msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted/50 border border-border text-foreground rounded-tl-sm"
                  }`}
              >
                {msg.pending && msg.content === "" ? (
                  <div className="flex items-center gap-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                ) : msg.role === "assistant" ? (
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-border shrink-0">
        {/* Sample question chips — only show when chat is at welcome state */}
        {messages.length <= 1 && !streaming && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {[
              "How do I reach net-zero faster?",
              "What does Mission Control do?",
              "How are carbon emissions calculated?",
              "Which buildings use the most energy?",
            ].map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); inputRef.current?.focus(); }}
                className="text-[10px] px-2.5 py-1 rounded-full border border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-full px-3 py-1.5 focus-within:border-primary/40 transition-colors">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about energy, carbon, renewables…"
            disabled={streaming}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 min-w-0"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity hover:bg-primary/80"
          >
            {streaming
              ? <Loader2 className="w-3.5 h-3.5 text-primary-foreground animate-spin" />
              : <Send className="w-3.5 h-3.5 text-primary-foreground" />
            }
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 text-center mt-1.5">
          EcoVista AI · Powered by Kimi K2
        </p>
      </div>
    </motion.aside>
  );
};

export default AICommandPanel;

