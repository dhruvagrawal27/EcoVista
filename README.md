# EcoVista — Comprehensive Project Report

> **App Name:** EcoVista  
> **Version:** 1.0.0  
> **Description:** AI-powered smart campus net-zero intelligence platform — India's premier campus sustainability management system  
> **Stack:** React 18 + TypeScript + Vite + Supabase (PostgreSQL) + Groq API + TensorFlow/scikit-learn

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Platform Modules Map](#2-platform-modules-map)
3. [All Pages](#3-all-pages)
4. [Hooks & Services](#4-hooks--services)
5. [Role-Based Access Control](#5-role-based-access-control)
6. [ML Models (`ecovista_models`)](#6-ml-models-ecovista_models)
7. [Database Schema (Supabase Tables)](#7-database-schema-supabase-tables)
8. [AI Features (Deep Dive)](#8-ai-features-deep-dive)
9. [Tech Stack](#9-tech-stack)
10. [Project Structure](#10-project-structure)
11. [Environment Variables](#11-environment-variables)
12. [Getting Started](#12-getting-started)
13. [Deployment](#13-deployment)

---

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

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  Frontend (React 18 + Vite + TypeScript)  →  Vercel                 │
│  ─ Tailwind CSS + shadcn/ui + Framer Motion + Recharts              │
│  ─ TanStack React Query for data fetching                            │
│  ─ Context: CampusContext + AuthContext                              │
└────────────────────────┬─────────────────────────────────────────────┘
                         │ Supabase JS client
┌────────────────────────▼─────────────────────────────────────────────┐
│  Supabase (PostgreSQL + Auth + Storage + Realtime)                   │
│  ─ 35+ tables: buildings, energy_readings, carbon_emissions,         │
│    alerts, retrofit_suggestions, ai_recommendations, load_profiles,  │
│    energy_forecasts, mission_decisions, leaderboard, challenges, ... │
│  ─ Row-Level Security policies per table                             │
│  ─ Storage bucket: ml-models (model artifacts)                       │
└───┬────────────────────────────────────────────────────────┬─────────┘
    │                                                        │
┌───▼────────────────────────────┐              ┌───────────▼──────────┐
│  Groq API                      │              │  ML Models           │
│  moonshotai/kimi-k2-instruct   │              │  (ecovista_models)   │
│  Streaming chat assistant      │              │  LSTM, KMeans,       │
│  context window: 12 messages   │              │  IsoForest, GBR, RF  │
└────────────────────────────────┘              └──────────────────────┘
```

---

## 2. Platform Modules Map

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Marketing homepage — feature overview, live metrics strip, CTA |
| `/login` | Login | Email/password auth with Supabase, role resolved on sign-in |
| `/dashboard` | Dashboard | Live campus KPI overview, energy chart, building rankings, AI insight panel |
| `/energy` | Energy | 5-tab intelligence hub (Overview, Grid, Forecast, Buildings) |
| `/mission-control` | MissionControl | Net-zero trajectory simulator with decarbonisation levers |
| `/carbon` | Carbon | Scope 1/2/3 tracker, scenario builder, net-zero countdown |
| `/renewables` | Renewables | Solar array status, monthly generation chart, battery state |
| `/insights` | Insights | AI recommendations engine ranked by ROI / Carbon / Ease |
| `/finance` | Finance | Cost analytics, investments, subsidies, carbon credit forecasts |
| `/kpis` | KPIs | Sustainability KPI tracker, SDG alignment radar |
| `/reports` | Reports | PDF report generator (Executive, Building, Carbon Disclosure) |
| `/roadmap` | Roadmap | Phase-based net-zero project roadmap with milestones |
| `/leaderboard` | Leaderboard | Department & building ranking with podium + streak tracking |
| `/challenges` | Challenges | Campus eco-challenges with join/progress tracking |
| `/community` | Community | Campus sustainability events and announcements |
| `/admin` | Admin | User management, role assignment, campus/building configuration |
| `/settings` | Settings | Profile & notification settings |

**Total: 17 routes, 20 page components**

---

## 3. All Pages

| Page | File | Key Data Sources | Role Gate |
|------|------|-----------------|-----------|
| **Landing** | `Landing.tsx` | Static metrics strip | Public |
| **Login** | `Login.tsx` | Supabase Auth | Public |
| **Dashboard** | `Dashboard.tsx` | `energy_daily_summary`, `alerts`, `buildings` | All roles |
| **Energy** | `Energy.tsx` | `energy_readings`, `energy_forecasts`, `load_profiles`, `retrofit_suggestions`, `buildings` | All roles (manage: Admin/FM) |
| **MissionControl** | `MissionControl.tsx` | `mission_decisions`, `mission_insights`, `ai_recommendations` | All roles (edit: Admin/FM) |
| **Carbon** | `Carbon.tsx` | `carbon_scopes`, `carbon_monthly_trend`, `carbon_scenarios`, `net_zero_countdown` | All roles (manage: Admin/FM/Finance) |
| **Renewables** | `Renewables.tsx` | `solar_arrays`, `renewable_monthly_generation`, `grid_state` | All roles (manage: Admin/FM) |
| **Insights** | `Insights.tsx` | `ai_recommendations`, `ai_trust_score`, `ml_model_performance` | All roles (create: Admin/FM) |
| **Finance** | `Finance.tsx` | `finance_snapshot`, `investments`, `capital_projections`, `subsidies`, `carbon_credit_forecasts` | Admin/Finance only |
| **KPIs** | `KPIs.tsx` | `sustainability_score`, `sdg_scores`, `kpi_risk_indicators`, `kpi_indicators` | All roles (edit: Admin/FM) |
| **Reports** | `Reports.tsx` | Aggregated campus data | All roles |
| **Roadmap** | `Roadmap.tsx` | `roadmap_phases`, `roadmap_milestones` | All roles |
| **Leaderboard** | `Leaderboard.tsx` | `leaderboard` (dept + building) | All roles |
| **Challenges** | `Challenges.tsx` | `eco_challenges`, `challenge_participants` | All roles (join: authenticated) |
| **Community** | `Community.tsx` | `community_events` | All roles |
| **Admin** | `Admin.tsx` | `users`, `roles`, `campuses`, `buildings` | Admin only |
| **Settings** | `Settings.tsx` | `users` profile | Authenticated |
| **NotFound** | `NotFound.tsx` | — | Public |

---

## 4. Hooks & Services

### Custom React Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useEnergy` | `useEnergy.tsx` | Energy readings, forecasts, risk score, heatmap, load profiles, benchmark, grid state, equipment, retrofit CRUD, ML model info |
| `useCarbon` | `useCarbon.ts` | Carbon scopes, monthly trend, scenarios, net-zero countdown, CRUD operations |
| `useAI` | `useAI.ts` | AI recommendations CRUD, trust score, ML model performance, status updates |
| `useMission` | `useMission.ts` | Mission decisions, insights, CRUD for decarbonisation levers |
| `useRenewables` | `useRenewables.ts` | Solar arrays, monthly generation, grid state, status updates |
| `useFinance` | `useFinance.ts` | Finance snapshot, investments, capital projections, subsidies, carbon credits, CRUD |
| `useKPIs` | `useKPIs.ts` | Sustainability score, SDG scores, KPI risk indicators, inline edit |
| `useCommunity` | `useCommunity.ts` | Leaderboard, eco challenges, join challenge, user challenge IDs |
| `useAuth` | (AuthContext) | User session, login/logout, role resolution, route guards |
| `useCampusContext` | (CampusContext) | Active campus ID, campus metadata, campus switcher |
| `use-mobile` | `use-mobile.tsx` | Responsive breakpoint detection |
| `use-toast` | `use-toast.ts` | Toast notification hook |

### Context Providers

| Context | File | State |
|---------|------|-------|
| `AuthContext` | `AuthContext.tsx` | `user`, `loading`, `login`, `logout`, `canAccess(route)` |
| `CampusContext` | `CampusContext.tsx` | `campus`, `campusId`, `isLoading`, campus switcher for multi-campus |

---

## 5. Role-Based Access Control

| Role | Dashboard | Energy | Mission Control | Carbon | Renewables | Insights | Finance | KPIs | Reports | Leaderboard | Admin |
|------|:---------:|:------:|:---------------:|:------:|:----------:|:--------:|:-------:|:----:|:-------:|:-----------:|:-----:|
| **Admin** | ✅ Full | ✅ + Manage | ✅ + Edit levers | ✅ + Manage | ✅ + Manage | ✅ + Create | ✅ Full | ✅ + Edit | ✅ | ✅ | ✅ |
| **Facility Manager** | ✅ Full | ✅ + Manage | ✅ + Simulate | ✅ + Approve | ✅ + Manage | ✅ + Create | ❌ | ✅ + Edit | ✅ | ✅ | ❌ |
| **Finance** | ✅ | ✅ View | ✅ View | ✅ + Approve | ✅ View | ✅ + Approve | ✅ Full | ✅ View | ✅ | ✅ | ❌ |
| **Faculty** | ✅ | ✅ View | ✅ View | ✅ View | ✅ View | ✅ View | ❌ | ✅ View | ✅ | ✅ | ❌ |
| **Student Lead** | ✅ Partial | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 6. ML Models (`ecovista_models`)

All AI-powered features are backed by models trained in `backend/EcoVista_AI_Training.ipynb` on synthetic IIT-Delhi-scale campus data (2 years × hourly, ~17,520 rows). Models are exported as `.pkl` (scikit-learn) or `.keras` (TensorFlow).

### Model Inventory

| Model File | Algorithm | Training Input | Output | Powers |
|-----------|-----------|---------------|--------|--------|
| `lstm_forecaster.keras` | LSTM (2-layer, 128→64 units) | 168h window × 10 features | 72h predicted kW | Energy Forecast tab — 72h forecast + 90% CI bands |
| `lstm_scaler.pkl` | MinMaxScaler | All 10 LSTM features | Scaled features | Feature normalisation for LSTM |
| `demand_scaler.pkl` | MinMaxScaler | `gross_demand_kw` only | Inverse transform | CI band reconstruction in kW |
| `carbon_forecaster.pkl` | Ridge Regression pipeline | month, year, avg_temp, lag carbon | `forecast_tco2e` | Carbon → monthly forecast |
| `building_clusterer.pkl` | K-Means pipeline (silhouette-optimal k) | EUI, hvac_score, carbon_score, lighting_score, occupancy, age | Cluster label (Excellent → Critical) | Building efficiency tiers |
| `anomaly_detector.pkl` | Isolation Forest pipeline (contamination=1.2%) | demand, hour, dow, temp, solar, rolling stats | Anomaly flag (−1 = anomaly) | Auto-generated critical alerts |
| `retrofit_scorer.pkl` | Gradient Boosting × 3 (200 trees) | building + retrofit type features | `payback_years`, `annual_saving_inr`, `carbon_reduction_tons` | Building deep-dive retrofit cards |
| `recommendation_engine.pkl` | Gradient Boosting × 3 (150 trees) | campus profile snapshot | `roi_pct`, `ease_score`, `confidence_pct` | Insights page recommendation scoring |
| `load_classifier.pkl` | Random Forest (200 trees, depth 12) | demand, hour, dow, month, temp, occupancy, solar | `weekday` / `weekend` / `holiday` | Load profile day-type classification |

### Feature Engineering

| Feature | How Generated |
|---------|--------------|
| `hour_sin`, `hour_cos` | Cyclic encoding: `sin/cos(2π·hour/24)` |
| `dow_sin`, `dow_cos` | Cyclic encoding: `sin/cos(2π·dow/7)` |
| `month_sin`, `month_cos` | Cyclic encoding: `sin/cos(2π·month/12)` |
| `temperature` | Indian climate model: seasonal base + diurnal swing + noise |
| `occupancy` | Gaussian bell-curve weekday, 20% weekend, semester-break damping |
| `solar_irr` | Sine arc noon peak, monsoon factor (Jul–Sep 0.45×), cloud noise |
| `demand_roll_mean_24` | 24-hour rolling mean (anomaly detection feature) |

### Training the Models
```bash
# On Kaggle (GPU T4 recommended):
# 1. Upload backend/EcoVista_AI_Training.ipynb
# 2. Enable GPU accelerator
# 3. Run All → download /kaggle/working/ecovista_models.zip
```

---

## 7. Database Schema (Supabase Tables)

### Core Tables

| Table | Key Columns | Used By |
|-------|-------------|---------|
| `campuses` | `id`, `name`, `location`, `target_year`, `baseline_emissions`, `current_emissions` | All modules |
| `buildings` | `id`, `campus_id`, `name`, `hvac_score`, `carbon_score`, `maintenance_score`, `occupancy_rate`, `eui`, `area_sqm`, `floors`, `year_built` | Energy Buildings tab, Building Clusterer |
| `users` | `id`, `campus_id`, `email`, `password_hash`, `role_id`, `created_at` | Auth, Admin |
| `roles` | `id`, `name` | RBAC everywhere |

### Energy Tables

| Table | Key Columns | Used By |
|-------|-------------|---------|
| `energy_readings` | `campus_id`, `building_id`, `timestamp`, `value_kw`, `reading_type` | Energy Overview, Anomaly Detection |
| `energy_daily_summary` | `campus_id`, `date`, `total_kwh`, `solar_kwh`, `carbon_kg`, `cost_inr` | Dashboard KPI cards |
| `energy_forecasts` | `campus_id`, `forecast_at`, `predicted_kw`, `upper_bound_kw`, `lower_bound_kw`, `actual_kw` | Forecast tab, LSTM output |
| `load_profiles` | `campus_id`, `hour`, `day_type`, `load_kw` | Load Profile chart, RF Classifier output |
| `grid_state` | `campus_id`, `solar_current_kw`, `solar_capacity_kw`, `battery_pct`, `grid_import_kw` | Real-Time Grid tab |
| `equipment_load` | `campus_id`, `category`, `load_kw` | Equipment load bars |
| `energy_risk_score` | `campus_id`, `score`, `level`, `factors` | Risk score gauge |
| `ml_models` | `id`, `name`, `version`, `type`, `status`, `accuracy`, `trained_at` | Model info display |
| `forecast_accuracy` | `campus_id`, `report_date`, `accuracy` | 30-day accuracy chart |

### Carbon Tables

| Table | Key Columns | Used By |
|-------|-------------|---------|
| `carbon_monthly_trend` | `campus_id`, `month`, `year`, `actual_tco2e`, `forecast_tco2e` | Carbon Tracker, Ridge model output |
| `carbon_scopes` | `campus_id`, `scope`, `value_tco2e`, `timestamp` | Scope breakdown pie chart |
| `carbon_scenarios` | `campus_id`, `name`, `impact_tco2e_yr`, `timeline_months`, `cost_inr`, `feasibility_pct`, `status` | Scenario builder |
| `net_zero_countdown` | `campus_id`, `target_year`, `milestones` | Net-zero countdown widget |

### AI & Insights Tables

| Table | Key Columns | Used By |
|-------|-------------|---------|
| `ai_recommendations` | `campus_id`, `title`, `description`, `roi_pct`, `ease_score`, `confidence_pct`, `priority`, `status`, `carbon_impact` | Insights page, Rec Engine |
| `ai_trust_score` | `campus_id`, `prediction_accuracy`, `data_quality`, `model_stability`, `recommendation_relevance` | AI Trust Score panel |
| `alerts` | `campus_id`, `building_id`, `alert_type`, `title`, `description`, `status` | Header bell, Anomaly Detector output |
| `retrofit_suggestions` | `building_id`, `campus_id`, `action`, `estimated_cost`, `annual_saving`, `payback_years`, `carbon_reduction_tons`, `status` | Buildings tab, Retrofit Scorer |

### Mission & Planning Tables

| Table | Key Columns | Used By |
|-------|-------------|---------|
| `mission_decisions` | `campus_id`, `decision_key`, `label`, `icon`, `years_accelerated`, `cost_saving_lakhs_yr`, `emission_reduction_pct` | Mission Control levers |
| `mission_insights` | `campus_id`, `insight`, `type` | Mission Control insight cards |
| `roadmap_phases` | `campus_id`, `name`, `start_year`, `end_year`, `status` | Roadmap page |

### Finance Tables

| Table | Key Columns | Used By |
|-------|-------------|---------|
| `investments` | `campus_id`, `name`, `cost_cr`, `roi_pct`, `impact_score`, `status` | Finance investments tracker |
| `subsidies` | `campus_id`, `name`, `amount_inr`, `status`, `deadline` | Subsidy tracker |
| `capital_projections` | `campus_id`, `year`, `capex`, `opex`, `savings` | 10-year projection chart |
| `carbon_credit_forecasts` | `campus_id`, `month`, `credits`, `price_inr` | Carbon credit chart |

### Community Tables

| Table | Key Columns | Used By |
|-------|-------------|---------|
| `leaderboard` | `campus_id`, `entity_name`, `entity_type`, `total_points`, `rank`, `trend`, `streak_days`, `hall_of_fame` | Leaderboard page |
| `eco_challenges` | `campus_id`, `title`, `category`, `start_date`, `end_date`, `max_participants`, `status`, `points_reward` | Challenges page |
| `challenge_participants` | `challenge_id`, `user_id`, `joined_at` | Challenges join/track |

### Renewables Tables

| Table | Key Columns | Used By |
|-------|-------------|---------|
| `solar_arrays` | `campus_id`, `name`, `capacity_kwp`, `status`, `current_output_kw` | Renewables page |
| `renewable_monthly_generation` | `campus_id`, `month`, `year`, `solar_kwh`, `wind_kwh`, `total_kwh` | Monthly generation chart |

### KPI Tables

| Table | Key Columns | Used By |
|-------|-------------|---------|
| `sustainability_score` | `campus_id`, `overall`, `energy`, `carbon`, `water`, `waste` | KPIs radar chart |
| `sdg_scores` | `campus_id`, `sdg_number`, `score` | SDG alignment radar |
| `kpi_risk_indicators` | `campus_id`, `name`, `current_value`, `target`, `unit`, `status` | KPI risk table (inline editable) |
| `kpi_indicators` | `campus_id`, `name`, `value`, `target`, `trend` | KPI cards |

---

## 8. AI Features (Deep Dive)

### 8.1 EcoVista AI Chat Assistant (`AICommandPanel.tsx`)

| Attribute | Value |
|-----------|-------|
| Model | `moonshotai/kimi-k2-instruct-0905` via Groq API |
| Response style | Token streaming (word-by-word) |
| Context window | Last 12 messages (sliding) |
| System prompt | Full EcoVista platform knowledge — all modules, DB schema, role system, sustainability context |
| UI | Bottom-right floating panel, available on every page |
| Quick chips | 4 sample questions shown before first message |
| Guardrails | Refuses non-EcoVista / non-sustainability questions |

### 8.2 ML-Powered Features

| Feature | Model | How it works |
|---------|-------|-------------|
| 72-hour energy forecast | `lstm_forecaster.keras` | LSTM reads last 168h of demand + weather + calendar features → predicts next 72h; `demand_scaler` inverses back to kW; ±1.65σ residual std → 90% CI bands |
| Confidence bands | `lstm_metadata.json` | `residual_std_kw` saved at training time; bands = `predicted ± 1.65 × residual_std` |
| Building efficiency tier | `building_clusterer.pkl` | StandardScaler → KMeans(k=silhouette-best); clusters sorted by mean EUI: Excellent / Efficient / Average / Below Average / Poor / Critical |
| Critical alerts | `anomaly_detector.pkl` | IsolationForest scores each reading; score < threshold → insert row into `alerts` with `alert_type: critical` |
| Retrofit ROI | `retrofit_scorer.pkl` | GBR predicts payback years, annual saving (₹), carbon reduction (tCO₂) given building area + EUI + retrofit type |
| Recommendation scoring | `recommendation_engine.pkl` | GBR predicts ROI %, ease score, confidence % for each recommendation category given campus profile |
| Load day-type | `load_classifier.pkl` | RandomForest classifies each hour as weekday / weekend / holiday using demand + calendar features |
| Carbon forecast | `carbon_forecaster.pkl` | Ridge regression on monthly carbon with seasonal cyclic encoding + lag-2 features |

### 8.3 What-If Demand Simulator

| Component | Detail |
|-----------|--------|
| Inputs | Temperature slider (°C), Occupancy % slider, Solar Efficiency % slider |
| Computation | Linear scaling: `delta_kw = base × (hvac_delta + occ_delta − solar_delta)` |
| Output | Estimated demand shift in kW displayed as badge |
| Location | Energy → Forecast tab |

---

## 9. Tech Stack

### Frontend

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | 18.3 |
| Language | TypeScript | 5.x |
| Build tool | Vite | 5.x |
| Styling | Tailwind CSS | 3.x |
| Component library | shadcn/ui (Radix primitives) | Latest |
| Animation | Framer Motion | 12.x |
| Charts | Recharts | 2.x |
| Routing | React Router DOM | 6.x |
| Data fetching | TanStack React Query | 5.x |
| Forms | React Hook Form + Zod | Latest |
| Icons | Lucide React | Latest |
| Toasts | Sonner | Latest |
| Testing | Vitest | Latest |

### Backend / Infrastructure

| Category | Technology |
|----------|-----------|
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + SHA-256 role-based access |
| Storage | Supabase Storage (ml-models bucket) |
| AI Chat | Groq API — `moonshotai/kimi-k2-instruct-0905` |
| ML Training | TensorFlow 2.x / Keras, scikit-learn, pandas, numpy, joblib |
| Hosting (Frontend) | Vercel |
| Hosting (DB) | Supabase Cloud |

---

## 10. Project Structure

```
EcoVista/
├── src/
│   ├── components/
│   │   ├── dashboard/            # MetricCard, EnergyChart, AIInsightPanel
│   │   │                         # AlertCard, BuildingRanking, EnergyByType
│   │   │                         # RenewableGrid, QuickActions
│   │   ├── layout/               # Header, Sidebar, DashboardLayout
│   │   │                         # AICommandPanel (Groq streaming chat)
│   │   └── ui/                   # 50+ shadcn/ui components
│   ├── context/
│   │   ├── AuthContext.tsx       # Session, login, logout, canAccess()
│   │   └── CampusContext.tsx     # Active campus, multi-campus switcher
│   ├── hooks/
│   │   ├── useEnergy.tsx         # Energy, forecasts, retrofits, grid, ML model
│   │   ├── useCarbon.ts          # Carbon scopes, trend, scenarios
│   │   ├── useAI.ts              # AI recommendations, trust score, model perf
│   │   ├── useMission.ts         # Mission decisions, insights CRUD
│   │   ├── useRenewables.ts      # Solar arrays, generation, grid state
│   │   ├── useFinance.ts         # Investments, subsidies, projections
│   │   ├── useKPIs.ts            # Sustainability score, SDG, indicators
│   │   ├── useCommunity.ts       # Leaderboard, challenges, join
│   │   ├── use-mobile.tsx        # Responsive breakpoint
│   │   └── use-toast.ts          # Toast notifications
│   ├── lib/
│   │   ├── utils.ts              # Tailwind cn() helper
│   │   ├── types.ts              # All TypeScript interfaces
│   │   ├── mock-data.ts          # Fallback mock data
│   │   └── module-data.ts        # Static module configuration
│   └── pages/                    # 20 route-level page components
│       └── (see Section 3)
├── backend/
│   ├── EcoVista_AI_Training.ipynb    # Full ML pipeline (7 models)
│   ├── schema.sql                    # Complete Supabase schema (35+ tables)
│   ├── seed.sql                      # Demo data for IIT Delhi campus
│   └── migration_leaderboard_dept_building.sql
├── public/
│   ├── favicon.svg               # Green leaf icon
│   └── robots.txt
├── index.html                    # Entry point, SVG favicon
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 11. Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Groq (AI chat assistant)
VITE_GROQ_API_KEY=gsk_...
```

---

## 12. Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Supabase project | Any plan |
| Groq API key | Free tier sufficient |

### Setup Steps

```bash
# 1. Clone
git clone https://github.com/dhruvagrawal27/EcoVista.git
cd EcoVista

# 2. Install dependencies
npm install

# 3. Create .env file (see Section 11)

# 4. Apply database schema (in Supabase SQL Editor, run in order):
#    backend/schema.sql
#    backend/seed.sql
#    backend/migration_leaderboard_dept_building.sql

# 5. Start dev server
npm run dev
# → http://localhost:8080

# 6. Build for production
npm run build

# 7. Run tests
npm test
```

---

## 13. Deployment

### Vercel (Frontend)

| Step | Action |
|------|--------|
| 1 | Push to GitHub (`dhruv` branch) |
| 2 | Import repo in [vercel.com](https://vercel.com) |
| 3 | Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GROQ_API_KEY` |
| 4 | Deploy — Vite preset auto-detected |
| 5 | All routes → `index.html` (SPA rewrite) |

### Supabase (Backend / DB)

| Step | Action |
|------|--------|
| 1 | Create project at [supabase.com](https://supabase.com) |
| 2 | Run schema + seed SQL files |
| 3 | Enable Row-Level Security policies as defined in `schema.sql` |
| 4 | (Optional) Create `ml-models` storage bucket for model artifacts |

### ML Models (Kaggle → Supabase Storage)

| Step | Action |
|------|--------|
| 1 | Open `backend/EcoVista_AI_Training.ipynb` on Kaggle with GPU T4 |
| 2 | Run All — downloads `ecovista_models.zip` |
| 3 | Upload `.pkl` / `.keras` files to Supabase Storage bucket `ml-models` |
| 4 | See deployment guide in notebook Section 10 for Edge Function integration |

---

## 📄 License

MIT © 2025 Dhruv Agrawal / CanTrace

---

<div align="center">
Built with 💚 for a net-zero future
</div>
