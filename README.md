<div align="center">

<img src="public/favicon.svg" width="72" height="72" alt="EcoVista logo" />

# EcoVista
### Smart Campus Net-Zero Intelligence Platform

**AI-powered sustainability management for Indian university campuses**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[**Live Demo**](https://ecovista.vercel.app) · [**ML Training Notebook**](backend/EcoVista_AI_Training.ipynb) · [**Database Schema**](backend/schema.sql)

---

</div>

## 📌 Overview

EcoVista is a production-ready, full-stack campus sustainability platform that gives facility managers, finance teams, faculty, and administrators a **single pane of glass** for energy monitoring, carbon tracking, and net-zero planning.

Built as the primary pilot for **IIT Delhi**, it handles multi-campus deployments with real-time data from Supabase, AI-driven recommendations from trained ML models (stored in `ecovista_models`), and an embedded conversational AI assistant powered by the Groq API.

---

## ✨ Key Features

### 🏠 Dashboard — Live Campus Overview
- Real-time KPI cards: total demand (kW), solar generation, battery state-of-charge, grid import, carbon intensity, cost per kWh
- Day-over-day trend deltas computed from live `energy_daily_summary` table
- Top building rankings by energy reduction
- Role-aware UI — each user sees only what their role permits

### ⚡ Energy Intelligence (5-Tab Hub)
| Tab | What it shows |
|-----|--------------|
| **Overview** | Risk score gauge, hourly ₹/kWh cost heatmap, equipment load by category, weekday vs weekend load profiles, peer-campus benchmark radar |
| **Real-Time Grid** | Live solar/battery/grid state, circuit-level equipment load bars |
| **Forecast** | 72-hour energy demand forecast with 90% confidence bands; 30-day accuracy tracker; **What-If Simulator** (adjust temperature, occupancy %, solar efficiency → see predicted demand shift) |
| **Buildings** | Per-building radar scorecard (HVAC / Carbon / Maintenance / Occupancy / EUI); AI-suggested retrofits with full status workflow (proposed → approved → in-progress → completed → rejected) |

> The 72-hour forecast and building retrofit scores are produced by ML models trained in `backend/EcoVista_AI_Training.ipynb` and stored in `ecovista_models`.

### 🚀 Mission Control — Net-Zero Trajectory Simulator
- Toggle decarbonisation levers: 100% Solar, EV Fleet, Deep Retrofit, AI Demand Response, Biomass Energy, and more
- Slide implementation intensity (10–100%) and watch the emission trajectory chart animate in real time
- Calculates net-zero year, years accelerated vs BAU, total investment (₹ cr), and CO₂ abated
- Admins can add / edit / delete levers directly from the database

### 🍃 Carbon Tracker
- Monthly emissions split by **Scope 1** (direct combustion), **Scope 2** (purchased electricity), **Scope 3** (supply chain + travel)
- Carbon intensity per student (tCO₂/student)
- Science-Based Target countdown (years to net-zero)
- Scenario builder: model reduction pathways, approve/reject via role-gated workflow

### ☀️ Renewables Monitor
- Solar array status dashboard (optimal / degraded / offline / maintenance)
- Monthly renewable generation chart (12-month history)
- Renewable fraction of total consumption
- Battery storage state and grid offset metrics

### 🧠 AI Insights Engine
- Ranked recommendations by ROI %, payback period, and carbon reduction potential
- Each insight: estimated annual saving (₹ & tCO₂), ease score, confidence %
- Sortable by ROI / Carbon Impact / Ease
- AI Trust Score panel: prediction accuracy, data quality, model stability, recommendation relevance
- ML model performance chart (30-day accuracy history)

> Recommendations are scored by the `recommendation_engine` and `retrofit_scorer` models from `ecovista_models`.

### 💰 Finance Module
- Energy cost breakdown by building and fuel type
- Tariff analysis: ToU vs flat rate comparison
- Green investment portfolio tracker (CAPEX/OPEX, ROI, status workflow)
- Government subsidy tracker with deadlines
- Carbon credit forecast with 10-year capital projection charts
- NPV / payback calculator

### 📊 KPIs & SDG Alignment
- Configurable sustainability KPIs: EUI (kWh/m²/yr), renewable fraction %, carbon intensity, water intensity, waste diversion
- SDG alignment scores (radar chart)
- Inline-editable risk indicators for Admins and Facility Managers

### 🏆 Community & Gamification
- **Leaderboard**: department and building ranking by % energy reduction; podium with gold/silver/bronze; Hall of Fame badges; streak tracking
- **Eco Challenges**: campus-wide sustainability campaigns (e.g. "Reduce HVAC usage in October"); join/track progress; participation counts

### 📋 Reports & Roadmap
- Auto-generate PDF reports: Executive Summary, Building Performance, Carbon Disclosure
- Visual phase-based net-zero roadmap with milestones, budget, and status

### 🤖 EcoVista AI Assistant
- Embedded chat panel (bottom-right corner, available from any page)
- Powered by **Groq API** (`moonshotai/kimi-k2-instruct-0905`) with token streaming
- Knows the full EcoVista platform, all modules, data schema, and sustainability context
- Context window: last 12 messages
- Quick-start chips for common questions

---

## 🗂️ Platform Modules Map

```
/                  → Landing page
/login             → Authentication (role-based)
/dashboard         → Live campus overview
/energy            → Energy intelligence (5 tabs)
/mission-control   → Net-zero trajectory simulator
/carbon            → Carbon tracker + scenario builder
/renewables        → Solar & battery monitor
/insights          → AI recommendations engine
/finance           → Cost & investment analytics
/kpis              → Sustainability KPIs & SDG scores
/reports           → PDF report generator
/roadmap           → Net-zero project roadmap
/leaderboard       → Department / building ranking
/challenges        → Eco challenges
/community         → Campus sustainability events
/admin             → User, campus, alert management
/settings          → Profile & notification settings
```

---

## 🔐 Role-Based Access Control

| Role | Access |
|------|--------|
| **Admin** | Full access — CRUD on all data, manage levers, configure alerts, assign roles |
| **Facility Manager** | Operational access — approve retrofits, toggle AI HVAC mode, run simulations |
| **Finance** | Financial modules — cost/investment/carbon data; read-only on energy |
| **Faculty** | Read-only — Dashboard, Carbon overview, KPIs, Leaderboard, Challenges |
| **Student Lead** | Community access — Leaderboard, Challenges, campus overview only |

---

## 🤖 Machine Learning Models (`ecovista_models`)

All AI-powered features are backed by models trained in `backend/EcoVista_AI_Training.ipynb` on synthetic IIT-Delhi-scale campus data (2 years × hourly). Models are saved as `.pkl` (scikit-learn) or `.keras` (TensorFlow) files in the `ecovista_models` bundle.

| Model File | Algorithm | Powers |
|-----------|-----------|--------|
| `lstm_forecaster.keras` | LSTM (168h window → 72h forecast) | Energy Forecast tab confidence bands |
| `carbon_forecaster.pkl` | Ridge Regression | Carbon monthly `forecast_tco2e` |
| `building_clusterer.pkl` | K-Means (silhouette-optimised) | Building efficiency tiers (Excellent → Critical) |
| `anomaly_detector.pkl` | Isolation Forest (contamination=1.2%) | Auto-generated critical alerts |
| `retrofit_scorer.pkl` | Gradient Boosting × 3 | `payback_years`, `annual_saving_inr`, `carbon_reduction_tons` |
| `recommendation_engine.pkl` | Gradient Boosting × 3 | `roi_pct`, `ease_score`, `confidence_pct` |
| `load_classifier.pkl` | Random Forest | Day-type classification (weekday/weekend/holiday) |

### Training the Models
```bash
# Open on Kaggle (GPU T4 recommended) or locally:
jupyter notebook backend/EcoVista_AI_Training.ipynb
# Download ecovista_models.zip from /kaggle/working/
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 5 |
| UI | Tailwind CSS, shadcn/ui (Radix primitives), Framer Motion |
| Charts | Recharts (Area, Line, Bar, Radar, Pie, Scatter) |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth + SHA-256 role-based access |
| AI Chat | Groq API — `moonshotai/kimi-k2-instruct-0905` |
| ML Training | TensorFlow/Keras, scikit-learn, pandas, numpy |
| Package Manager | npm |
| Build Tool | Vite |
| Testing | Vitest |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- A [Supabase](https://supabase.com) project with the schema applied

### 1. Clone & install
```bash
git clone https://github.com/dhruvagrawal27/EcoVista.git
cd EcoVista
npm install
```

### 2. Environment variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GROQ_API_KEY=your-groq-api-key
```

### 3. Set up the database
```bash
# In Supabase SQL Editor, run in order:
# 1. backend/schema.sql       — creates all tables
# 2. backend/seed.sql         — seeds campus, buildings, demo data
# 3. backend/migration_leaderboard_dept_building.sql
```

### 4. Run the dev server
```bash
npm run dev
# → http://localhost:8080
```

### 5. Build for production
```bash
npm run build
```

---

## 📁 Project Structure

```
EcoVista/
├── src/
│   ├── components/
│   │   ├── dashboard/        # MetricCard, EnergyChart, AIInsightPanel, etc.
│   │   ├── layout/           # Header, Sidebar, DashboardLayout, AICommandPanel
│   │   └── ui/               # shadcn/ui component library (50+ components)
│   ├── context/              # CampusContext, AuthContext
│   ├── hooks/                # useEnergy, useCarbon, useAI, useMission, etc.
│   ├── lib/                  # utils, types, mock-data
│   └── pages/                # 20 route pages
├── backend/
│   ├── EcoVista_AI_Training.ipynb   # Full ML training pipeline (7 models)
│   ├── schema.sql                   # Complete Supabase schema
│   ├── seed.sql                     # Demo data seed
│   └── migration_leaderboard_dept_building.sql
├── public/
│   └── favicon.svg
└── index.html
```

---

## 🌍 Deployment (Vercel + Supabase)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Set environment variables in Vercel project settings
4. Deploy — Vercel auto-detects Vite and builds correctly

For ML model inference in production, see the **Deployment Guide** section at the end of `backend/EcoVista_AI_Training.ipynb`.

---

## 📄 License

MIT © 2025 Dhruv Agrawal / CanTrace

---

<div align="center">
Built with 💚 for a net-zero future
</div>

---

## How can I edit this code?

### Use your preferred IDE

You can work locally using your own IDE by cloning this repo and pushing changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Edit a file directly in GitHub

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

### Use GitHub Codespaces

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Recharts (data visualization)
- React Router (navigation)

## How to deploy this project

You can deploy this project to various platforms:

- Vercel
- Netlify
- GitHub Pages
- Custom server

For deployment instructions, refer to the Vite documentation on [deploying a static site](https://vitejs.dev/guide/static-deploy.html).

## Project Structure

```
src/
├── components/       # React components
│   ├── dashboard/    # Dashboard-specific components
│   ├── layout/       # Layout components
│   └── ui/          # Reusable UI components
├── pages/           # Page components
├── lib/             # Utility functions and mock data
├── hooks/           # Custom React hooks
└── assets/          # Static assets
```

## License

This project is proprietary and confidential.
