-- =============================================================================
-- EcoVista Campus Sustainability Platform — Full Database Schema (PostgreSQL)
-- =============================================================================
-- Covers ALL pages: Dashboard, Energy, Carbon, Renewables, Finance, AI Insights,
-- KPIs, Roadmap, Projects, Reports, Community, Challenges, Leaderboard,
-- Admin, Settings, Mission Control, Login/Auth
-- =============================================================================
--
-- USAGE: Connect to your PostgreSQL database first, then run this entire file.
--   psql -U <user> -d <your_db> -f schema.sql
-- Or create a dedicated database first:
--   CREATE DATABASE ecovista;
--   \c ecovista
--   \i schema.sql
-- =============================================================================

-- =============================================================================
-- 1. AUTHENTICATION & USERS
-- Pages: Login, Settings (Profile/Security/Sessions), Admin (Users tab)
-- =============================================================================

CREATE TABLE roles (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE departments (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    type        VARCHAR(20)  NOT NULL DEFAULT 'administrative'
                    CHECK (type IN ('academic','administrative','operational')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id              SERIAL       PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    employee_id     VARCHAR(50)  UNIQUE,
    avatar_url      VARCHAR(500),
    role_id         INT          NOT NULL REFERENCES roles(id),
    department_id   INT          REFERENCES departments(id),
    status          VARCHAR(20)  NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','inactive','suspended')),
    two_fa_enabled  BOOLEAN      NOT NULL DEFAULT FALSE,
    two_fa_secret   VARCHAR(100),
    last_active_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Settings > Security > Active Sessions
CREATE TABLE user_sessions (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    device      VARCHAR(200),
    location    VARCHAR(150),
    ip_address  VARCHAR(45),
    is_current  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked_at  TIMESTAMPTZ
);

-- Settings > Notifications
CREATE TABLE user_notification_preferences (
    id                          SERIAL      PRIMARY KEY,
    user_id                     INT         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_critical_alerts       BOOLEAN     NOT NULL DEFAULT TRUE,
    email_daily_summary         BOOLEAN     NOT NULL DEFAULT TRUE,
    email_weekly_report         BOOLEAN     NOT NULL DEFAULT TRUE,
    email_monthly_brief         BOOLEAN     NOT NULL DEFAULT FALSE,
    email_ai_recommendations    BOOLEAN     NOT NULL DEFAULT TRUE,
    push_critical_alerts        BOOLEAN     NOT NULL DEFAULT TRUE,
    push_equipment_warnings     BOOLEAN     NOT NULL DEFAULT TRUE,
    push_challenge_milestones   BOOLEAN     NOT NULL DEFAULT FALSE,
    push_community_activity     BOOLEAN     NOT NULL DEFAULT FALSE,
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings > Display
CREATE TABLE user_display_preferences (
    id                          SERIAL      PRIMARY KEY,
    user_id                     INT         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    data_density                VARCHAR(20) NOT NULL DEFAULT 'comfortable'
                                    CHECK (data_density IN ('compact','comfortable','spacious')),
    executive_mode              BOOLEAN     NOT NULL DEFAULT FALSE,
    operational_mode            BOOLEAN     NOT NULL DEFAULT FALSE,
    show_confidence_indicators  BOOLEAN     NOT NULL DEFAULT TRUE,
    animate_chart_transitions   BOOLEAN     NOT NULL DEFAULT TRUE,
    default_time_range          VARCHAR(10) NOT NULL DEFAULT '24h'
                                    CHECK (default_time_range IN ('1h','24h','7d','30d')),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings > AI Preferences
CREATE TABLE user_ai_preferences (
    id                              SERIAL      PRIMARY KEY,
    user_id                         INT         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    recommendation_aggressiveness   SMALLINT    NOT NULL DEFAULT 50
                                        CHECK (recommendation_aggressiveness BETWEEN 0 AND 100),
    automation_suggestions          BOOLEAN     NOT NULL DEFAULT TRUE,
    autonomous_hvac_control         BOOLEAN     NOT NULL DEFAULT FALSE,
    predictive_maintenance_alerts   BOOLEAN     NOT NULL DEFAULT TRUE,
    auto_optimize_solar             BOOLEAN     NOT NULL DEFAULT TRUE,
    smart_load_balancing            BOOLEAN     NOT NULL DEFAULT FALSE,
    preferred_forecast_model        VARCHAR(20) NOT NULL DEFAULT 'lstm'
                                        CHECK (preferred_forecast_model IN ('lstm','xgboost','ensemble')),
    confidence_threshold            SMALLINT    NOT NULL DEFAULT 85
                                        CHECK (confidence_threshold BETWEEN 0 AND 100),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 2. CAMPUS CORE
-- Pages: Dashboard (campus metrics), Energy, Renewables, Leaderboard
-- =============================================================================

CREATE TABLE campus (
    id                  SERIAL       PRIMARY KEY,
    name                VARCHAR(200) NOT NULL DEFAULT 'Main Campus',
    net_zero_progress   NUMERIC(5,2),
    target_year         SMALLINT,
    total_buildings     SMALLINT,
    total_students      INT,
    solar_capacity_mw   NUMERIC(6,2),
    campus_area_acres   NUMERIC(8,2),
    baseline_emissions  NUMERIC(12,2),
    current_emissions   NUMERIC(12,2),
    reduction_rate      NUMERIC(5,2),
    on_track            BOOLEAN      NOT NULL DEFAULT TRUE,
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE buildings (
    id                  SERIAL       PRIMARY KEY,
    campus_id           INT          NOT NULL REFERENCES campus(id),
    code                VARCHAR(30)  UNIQUE,
    name                VARCHAR(150) NOT NULL,
    building_type       VARCHAR(20)  NOT NULL DEFAULT 'academic'
                            CHECK (building_type IN ('academic','lab','admin','residential','sports','library','it','utility')),
    floors              SMALLINT,
    area_sqm            NUMERIC(10,2),
    year_built          SMALLINT,
    eui                 NUMERIC(8,2),
    hvac_score          SMALLINT     CHECK (hvac_score BETWEEN 0 AND 100),
    carbon_score        SMALLINT     CHECK (carbon_score BETWEEN 0 AND 100),
    maintenance_score   SMALLINT     CHECK (maintenance_score BETWEEN 0 AND 100),
    occupancy_rate      NUMERIC(5,2),
    is_green_certified  BOOLEAN      NOT NULL DEFAULT FALSE,
    lat                 NUMERIC(10,7),
    lng                 NUMERIC(10,7),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE hostels (
    id          SERIAL       PRIMARY KEY,
    campus_id   INT          NOT NULL REFERENCES campus(id),
    name        VARCHAR(100) NOT NULL,
    capacity    SMALLINT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 3. ENERGY MONITORING
-- Pages: Dashboard (live metrics, chart), Energy (all 5 tabs)
-- =============================================================================

CREATE TABLE energy_readings (
    id              BIGSERIAL    PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    building_id     INT          REFERENCES buildings(id),
    recorded_at     TIMESTAMPTZ  NOT NULL,
    actual_kw       NUMERIC(10,2),
    predicted_kw    NUMERIC(10,2),
    solar_kw        NUMERIC(10,2),
    wind_kw         NUMERIC(10,2),
    battery_kw      NUMERIC(10,2),
    grid_import_kw  NUMERIC(10,2),
    total_demand_kw NUMERIC(10,2)
);
CREATE INDEX idx_energy_readings_time          ON energy_readings (recorded_at);
CREATE INDEX idx_energy_readings_building_time ON energy_readings (building_id, recorded_at);

CREATE TABLE energy_daily_summary (
    id                  BIGSERIAL    PRIMARY KEY,
    campus_id           INT          NOT NULL REFERENCES campus(id),
    building_id         INT          REFERENCES buildings(id),
    summary_date        DATE         NOT NULL,
    total_kwh           NUMERIC(12,2),
    solar_kwh           NUMERIC(12,2),
    wind_kwh            NUMERIC(12,2),
    grid_kwh            NUMERIC(12,2),
    battery_charged_kwh NUMERIC(12,2),
    peak_demand_kw      NUMERIC(10,2),
    cost_inr            NUMERIC(14,2),
    carbon_kg           NUMERIC(12,2),
    UNIQUE (campus_id, building_id, summary_date)
);
CREATE INDEX idx_energy_daily_building_date ON energy_daily_summary (building_id, summary_date);

CREATE TABLE energy_cost_daily (
    id          BIGSERIAL     PRIMARY KEY,
    campus_id   INT           NOT NULL REFERENCES campus(id),
    cost_date   DATE          NOT NULL UNIQUE,
    cost_inr    NUMERIC(14,2) NOT NULL,
    weekday     VARCHAR(3)
);

CREATE TABLE equipment (
    id              SERIAL       PRIMARY KEY,
    building_id     INT          NOT NULL REFERENCES buildings(id),
    name            VARCHAR(200) NOT NULL,
    equipment_type  VARCHAR(100),
    capacity_kw     NUMERIC(8,2),
    installed_at    DATE,
    is_smart        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE equipment_load_readings (
    id              BIGSERIAL    PRIMARY KEY,
    equipment_id    INT          NOT NULL REFERENCES equipment(id),
    recorded_at     TIMESTAMPTZ  NOT NULL,
    load_kw         NUMERIC(8,2) NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'normal'
                        CHECK (status IN ('normal','medium','high','fault'))
);
CREATE INDEX idx_equip_load_time ON equipment_load_readings (equipment_id, recorded_at);

CREATE TABLE energy_risk_scores (
    id                      SERIAL       PRIMARY KEY,
    campus_id               INT          NOT NULL REFERENCES campus(id),
    recorded_date           DATE         NOT NULL,
    overall_score           SMALLINT     CHECK (overall_score BETWEEN 0 AND 100),
    grid_dependency         SMALLINT     CHECK (grid_dependency BETWEEN 0 AND 100),
    peak_volatility         SMALLINT     CHECK (peak_volatility BETWEEN 0 AND 100),
    weather_exposure        SMALLINT     CHECK (weather_exposure BETWEEN 0 AND 100),
    overconsumption_freq    SMALLINT     CHECK (overconsumption_freq BETWEEN 0 AND 100),
    equipment_age           SMALLINT     CHECK (equipment_age BETWEEN 0 AND 100),
    stability_index         NUMERIC(5,2),
    thirty_day_variance     NUMERIC(5,2),
    UNIQUE (campus_id, recorded_date)
);

CREATE TABLE benchmark_data (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    metric_name     VARCHAR(100) NOT NULL,
    campus_value    NUMERIC(10,3),
    national_avg    NUMERIC(10,3),
    recorded_year   SMALLINT     NOT NULL,
    UNIQUE (campus_id, metric_name, recorded_year)
);

CREATE TABLE load_profiles (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    profile_date    DATE         NOT NULL,
    day_type        VARCHAR(10)  NOT NULL DEFAULT 'weekday'
                        CHECK (day_type IN ('weekday','weekend','holiday')),
    hour            SMALLINT     NOT NULL CHECK (hour BETWEEN 0 AND 23),
    load_kw         NUMERIC(10,2),
    UNIQUE (campus_id, profile_date, hour)
);

CREATE TABLE energy_forecasts (
    id              BIGSERIAL    PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    forecast_from   TIMESTAMPTZ  NOT NULL,
    forecast_at     TIMESTAMPTZ  NOT NULL,
    predicted_kw    NUMERIC(10,2),
    upper_bound_kw  NUMERIC(10,2),
    lower_bound_kw  NUMERIC(10,2),
    actual_kw       NUMERIC(10,2),
    model_version   VARCHAR(30)
);
CREATE INDEX idx_energy_forecasts_time ON energy_forecasts (campus_id, forecast_at);

CREATE TABLE forecast_accuracy_daily (
    id          SERIAL       PRIMARY KEY,
    campus_id   INT          NOT NULL REFERENCES campus(id),
    report_date DATE         NOT NULL,
    accuracy    NUMERIC(5,2),
    drift       NUMERIC(6,2),
    UNIQUE (campus_id, report_date)
);

CREATE TABLE retrofit_suggestions (
    id                      SERIAL       PRIMARY KEY,
    campus_id               INT          NOT NULL REFERENCES campus(id),
    building_id             INT          REFERENCES buildings(id),
    action                  VARCHAR(300) NOT NULL,
    estimated_cost          NUMERIC(14,2),
    annual_saving           NUMERIC(14,2),
    payback_years           NUMERIC(5,2),
    carbon_reduction_tons   NUMERIC(8,2),
    ai_generated            BOOLEAN      NOT NULL DEFAULT TRUE,
    status                  VARCHAR(20)  NOT NULL DEFAULT 'proposed'
                                CHECK (status IN ('proposed','approved','in-progress','completed','rejected')),
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE grid_state (
    id                      BIGSERIAL    PRIMARY KEY,
    campus_id               INT          NOT NULL REFERENCES campus(id),
    recorded_at             TIMESTAMPTZ  NOT NULL,
    solar_current_kw        NUMERIC(10,2),
    solar_capacity_kw       NUMERIC(10,2),
    wind_current_kw         NUMERIC(10,2),
    wind_capacity_kw        NUMERIC(10,2),
    battery_charge_pct      NUMERIC(5,2),
    battery_capacity_kwh    NUMERIC(10,2),
    battery_status          VARCHAR(15)  NOT NULL DEFAULT 'idle'
                                CHECK (battery_status IN ('idle','charging','discharging')),
    grid_import_kw          NUMERIC(10,2),
    is_grid_importing       BOOLEAN      NOT NULL DEFAULT TRUE,
    total_demand_kw         NUMERIC(10,2),
    predicted_demand_kw     NUMERIC(10,2)
);
CREATE INDEX idx_grid_state_time ON grid_state (campus_id, recorded_at);


-- =============================================================================
-- 4. CARBON TRACKING
-- Pages: Carbon (all sections), Dashboard (carbonToday / carbonYesterday)
-- =============================================================================

CREATE TABLE carbon_scope_readings (
    id              BIGSERIAL     PRIMARY KEY,
    campus_id       INT           NOT NULL REFERENCES campus(id),
    recorded_month  DATE          NOT NULL,
    scope           SMALLINT      NOT NULL CHECK (scope IN (1,2,3)),
    source_name     VARCHAR(150)  NOT NULL,
    value_tco2e     NUMERIC(12,3) NOT NULL,
    trend_pct       NUMERIC(6,2),
    UNIQUE (campus_id, recorded_month, scope, source_name)
);

CREATE TABLE carbon_monthly_trend (
    id              BIGSERIAL     PRIMARY KEY,
    campus_id       INT           NOT NULL REFERENCES campus(id),
    trend_month     DATE          NOT NULL,
    actual_tco2e    NUMERIC(12,3),
    target_tco2e    NUMERIC(12,3),
    forecast_tco2e  NUMERIC(12,3),
    UNIQUE (campus_id, trend_month)
);

CREATE TABLE netzero_milestones (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    milestone_year  SMALLINT     NOT NULL,
    target_tco2e    NUMERIC(12,3),
    actual_tco2e    NUMERIC(12,3),
    status          VARCHAR(20)  NOT NULL DEFAULT 'planned'
                        CHECK (status IN ('achieved','on-track','planned','at-risk')),
    UNIQUE (campus_id, milestone_year)
);

CREATE TABLE carbon_scenarios (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    name            VARCHAR(200) NOT NULL,
    impact_tco2e_yr NUMERIC(10,2) NOT NULL,
    timeline_months SMALLINT,
    cost_inr        NUMERIC(15,2),
    feasibility_pct SMALLINT     CHECK (feasibility_pct BETWEEN 0 AND 100),
    status          VARCHAR(20)  NOT NULL DEFAULT 'proposed'
                        CHECK (status IN ('proposed','approved','in-progress','completed','rejected')),
    created_by      INT          REFERENCES users(id),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE carbon_daily (
    id              BIGSERIAL     PRIMARY KEY,
    campus_id       INT           NOT NULL REFERENCES campus(id),
    reading_date    DATE          NOT NULL,
    total_kg_co2e   NUMERIC(12,3) NOT NULL,
    scope1_kg       NUMERIC(12,3),
    scope2_kg       NUMERIC(12,3),
    scope3_kg       NUMERIC(12,3),
    UNIQUE (campus_id, reading_date)
);
CREATE INDEX idx_carbon_daily_date ON carbon_daily (campus_id, reading_date);


-- =============================================================================
-- 5. RENEWABLE ENERGY
-- Pages: Renewables (KPIs, solar chart, panel health, monthly generation)
-- =============================================================================

CREATE TABLE solar_arrays (
    id              SERIAL       PRIMARY KEY,
    building_id     INT          NOT NULL REFERENCES buildings(id),
    name            VARCHAR(150) NOT NULL,
    panel_count     SMALLINT,
    capacity_kw     NUMERIC(8,2),
    installed_at    DATE,
    manufacturer    VARCHAR(100),
    status          VARCHAR(20)  NOT NULL DEFAULT 'optimal'
                        CHECK (status IN ('optimal','degraded','offline','maintenance')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE solar_array_readings (
    id              BIGSERIAL    PRIMARY KEY,
    array_id        INT          NOT NULL REFERENCES solar_arrays(id),
    recorded_at     TIMESTAMPTZ  NOT NULL,
    efficiency_pct  NUMERIC(5,2),
    generation_kw   NUMERIC(10,2),
    temperature_c   NUMERIC(5,2),
    irradiance      NUMERIC(8,2)
);
CREATE INDEX idx_solar_array_time ON solar_array_readings (array_id, recorded_at);

CREATE TABLE wind_turbines (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    name            VARCHAR(150) NOT NULL,
    capacity_kw     NUMERIC(8,2),
    hub_height_m    NUMERIC(6,2),
    installed_at    DATE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','offline','maintenance'))
);

CREATE TABLE battery_systems (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    name            VARCHAR(150) NOT NULL,
    capacity_kwh    NUMERIC(10,2),
    max_power_kw    NUMERIC(8,2),
    chemistry       VARCHAR(50),
    installed_at    DATE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','offline','maintenance'))
);

CREATE TABLE battery_readings (
    id              BIGSERIAL    PRIMARY KEY,
    battery_id      INT          NOT NULL REFERENCES battery_systems(id),
    recorded_at     TIMESTAMPTZ  NOT NULL,
    charge_pct      NUMERIC(5,2),
    power_kw        NUMERIC(8,2),
    temperature_c   NUMERIC(5,2)
);
CREATE INDEX idx_battery_readings_time ON battery_readings (battery_id, recorded_at);

CREATE TABLE renewable_monthly_generation (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    gen_month       DATE         NOT NULL,
    solar_kwh       NUMERIC(14,2),
    wind_kwh        NUMERIC(14,2),
    total_kwh       NUMERIC(14,2),
    grid_offset_pct NUMERIC(5,2),
    UNIQUE (campus_id, gen_month)
);


-- =============================================================================
-- 6. FINANCIAL ANALYTICS
-- Pages: Finance (KPIs, investment matrix, 10yr projection, stress test, subsidies)
-- =============================================================================

CREATE TABLE finance_snapshots (
    id                  SERIAL       PRIMARY KEY,
    campus_id           INT          NOT NULL REFERENCES campus(id),
    snapshot_date       DATE         NOT NULL,
    total_investment    NUMERIC(15,2),
    annual_savings      NUMERIC(14,2),
    npv_10yr            NUMERIC(15,2),
    irr_pct             NUMERIC(6,3),
    payback_years       NUMERIC(5,2),
    carbon_credits_inr  NUMERIC(14,2),
    subsidies_inr       NUMERIC(14,2),
    UNIQUE (campus_id, snapshot_date)
);

CREATE TABLE investments (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    name            VARCHAR(200) NOT NULL,
    cost_cr         NUMERIC(10,2),
    impact_score    NUMERIC(4,2),
    roi_pct         NUMERIC(6,2),
    status          VARCHAR(20)  NOT NULL DEFAULT 'proposed'
                        CHECK (status IN ('proposed','approved','in-progress','completed','rejected')),
    approved_by     INT          REFERENCES users(id),
    approved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE capital_projections (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    projection_year SMALLINT     NOT NULL,
    investment_inr  NUMERIC(15,2),
    savings_inr     NUMERIC(15,2),
    cumulative_inr  NUMERIC(15,2),
    UNIQUE (campus_id, projection_year)
);

CREATE TABLE subsidies (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    name            VARCHAR(200) NOT NULL,
    amount_inr      NUMERIC(14,2) NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'eligible'
                        CHECK (status IN ('eligible','applied','approved','active','expired','rejected')),
    deadline        DATE,
    deadline_text   VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE carbon_credit_forecasts (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    forecast_year   SMALLINT     NOT NULL,
    credits_inr     NUMERIC(14,2) NOT NULL,
    UNIQUE (campus_id, forecast_year)
);


-- =============================================================================
-- 7. SUSTAINABILITY KPIs
-- Pages: KPIs (health score, SDG radar, risk indicators, leading/lagging)
-- =============================================================================

CREATE TABLE sustainability_scores (
    id                  SERIAL       PRIMARY KEY,
    campus_id           INT          NOT NULL REFERENCES campus(id),
    score_date          DATE         NOT NULL,
    overall_score       SMALLINT     CHECK (overall_score BETWEEN 0 AND 100),
    energy_efficiency   SMALLINT     CHECK (energy_efficiency BETWEEN 0 AND 100),
    carbon_reduction    SMALLINT     CHECK (carbon_reduction BETWEEN 0 AND 100),
    renewable_share     SMALLINT     CHECK (renewable_share BETWEEN 0 AND 100),
    water_conservation  SMALLINT     CHECK (water_conservation BETWEEN 0 AND 100),
    waste_management    SMALLINT     CHECK (waste_management BETWEEN 0 AND 100),
    biodiversity        SMALLINT     CHECK (biodiversity BETWEEN 0 AND 100),
    energy_trend        NUMERIC(5,2),
    carbon_trend        NUMERIC(5,2),
    renewable_trend     NUMERIC(5,2),
    water_trend         NUMERIC(5,2),
    waste_trend         NUMERIC(5,2),
    biodiversity_trend  NUMERIC(5,2),
    UNIQUE (campus_id, score_date)
);

CREATE TABLE sdg_scores (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    score_date      DATE         NOT NULL,
    sdg_number      SMALLINT     NOT NULL,
    sdg_name        VARCHAR(100),
    score           SMALLINT     CHECK (score BETWEEN 0 AND 100),
    UNIQUE (campus_id, score_date, sdg_number)
);

CREATE TABLE kpi_risk_indicators (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    kpi_name        VARCHAR(150) NOT NULL,
    current_value   NUMERIC(10,3) NOT NULL,
    target_value    NUMERIC(10,3) NOT NULL,
    unit            VARCHAR(30),
    status          VARCHAR(20)  NOT NULL DEFAULT 'on-track'
                        CHECK (status IN ('on-track','at-risk','critical','achieved')),
    deadline_label  VARCHAR(20),
    deadline_date   DATE,
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (campus_id, kpi_name)
);

CREATE TABLE kpi_indicators (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    name            VARCHAR(200) NOT NULL,
    indicator_type  VARCHAR(10)  NOT NULL CHECK (indicator_type IN ('leading','lagging')),
    description     TEXT,
    UNIQUE (campus_id, name, indicator_type)
);


-- =============================================================================
-- 8. AI INSIGHTS & RECOMMENDATIONS
-- Pages: Insights, Admin > ML Models, Dashboard > AI Insight Panel & Alerts
-- =============================================================================

CREATE TABLE ai_recommendations (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    title           VARCHAR(250) NOT NULL,
    description     TEXT,
    category        VARCHAR(80),
    roi_pct         NUMERIC(6,2),
    carbon_impact   NUMERIC(10,2),
    ease_score      SMALLINT     CHECK (ease_score BETWEEN 0 AND 100),
    confidence_pct  SMALLINT     CHECK (confidence_pct BETWEEN 0 AND 100),
    status          VARCHAR(20)  NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new','in-review','approved','implemented','rejected')),
    adoption_rate   NUMERIC(5,2),
    impact_cost     VARCHAR(50),
    impact_carbon   VARCHAR(50),
    priority        VARCHAR(10)  NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low','medium','high')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recs_status ON ai_recommendations (campus_id, status, priority);

CREATE TABLE ai_recommendation_actions (
    id                  BIGSERIAL    PRIMARY KEY,
    recommendation_id   INT          NOT NULL REFERENCES ai_recommendations(id),
    user_id             INT          NOT NULL REFERENCES users(id),
    action              VARCHAR(20)  NOT NULL
                            CHECK (action IN ('approved','rejected','implemented','deferred')),
    notes               TEXT,
    acted_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE ml_models (
    id                  SERIAL       PRIMARY KEY,
    name                VARCHAR(200) NOT NULL,
    version             VARCHAR(30)  NOT NULL,
    accuracy_pct        NUMERIC(5,2),
    last_trained_at     DATE,
    status              VARCHAR(20)  NOT NULL DEFAULT 'staging'
                            CHECK (status IN ('staging','production','deprecated','archived')),
    total_predictions   INT          NOT NULL DEFAULT 0,
    model_type          VARCHAR(100),
    deployed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (name, version)
);

CREATE TABLE ml_model_performance (
    id          BIGSERIAL    PRIMARY KEY,
    model_id    INT          NOT NULL REFERENCES ml_models(id),
    report_date DATE         NOT NULL,
    accuracy    NUMERIC(5,2),
    predictions INT,
    UNIQUE (model_id, report_date)
);

CREATE TABLE ai_trust_scores (
    id                          SERIAL       PRIMARY KEY,
    campus_id                   INT          NOT NULL REFERENCES campus(id),
    score_date                  DATE         NOT NULL,
    overall_score               SMALLINT     CHECK (overall_score BETWEEN 0 AND 100),
    prediction_accuracy         SMALLINT     CHECK (prediction_accuracy BETWEEN 0 AND 100),
    data_quality                SMALLINT     CHECK (data_quality BETWEEN 0 AND 100),
    model_stability             SMALLINT     CHECK (model_stability BETWEEN 0 AND 100),
    recommendation_relevance    SMALLINT     CHECK (recommendation_relevance BETWEEN 0 AND 100),
    UNIQUE (campus_id, score_date)
);

CREATE TABLE alerts (
    id              BIGSERIAL    PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    building_id     INT          REFERENCES buildings(id),
    equipment_id    INT          REFERENCES equipment(id),
    alert_type      VARCHAR(10)  NOT NULL DEFAULT 'info'
                        CHECK (alert_type IN ('critical','warning','info')),
    title           VARCHAR(250) NOT NULL,
    description     TEXT,
    location_label  VARCHAR(200),
    status          VARCHAR(20)  NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','acknowledged','resolved','auto-resolved')),
    acknowledged_by INT          REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_alerts_campus_status ON alerts (campus_id, alert_type, status);


-- =============================================================================
-- 9. NET-ZERO ROADMAP
-- Pages: Roadmap (timeline, budget burn, risk register, strategic impact)
-- =============================================================================

CREATE TABLE roadmap_phases (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    phase_number    SMALLINT     NOT NULL,
    name            VARCHAR(100) NOT NULL,
    start_date      DATE         NOT NULL,
    end_date        DATE         NOT NULL,
    progress_pct    SMALLINT     NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    budget_inr      NUMERIC(15,2),
    spent_inr       NUMERIC(15,2) NOT NULL DEFAULT 0,
    risk_level      VARCHAR(10)  NOT NULL DEFAULT 'low'
                        CHECK (risk_level IN ('low','medium','high','critical')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (campus_id, phase_number)
);

CREATE TABLE roadmap_milestones (
    id              SERIAL       PRIMARY KEY,
    phase_id        INT          NOT NULL REFERENCES roadmap_phases(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    target_date     DATE         NOT NULL,
    is_done         BOOLEAN      NOT NULL DEFAULT FALSE,
    completed_at    DATE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE risk_register (
    id                  SERIAL       PRIMARY KEY,
    campus_id           INT          NOT NULL REFERENCES campus(id),
    phase_id            INT          REFERENCES roadmap_phases(id),
    risk_description    VARCHAR(400) NOT NULL,
    impact              VARCHAR(10)  NOT NULL DEFAULT 'medium'
                            CHECK (impact IN ('low','medium','high','critical')),
    probability         VARCHAR(10)  NOT NULL DEFAULT 'medium'
                            CHECK (probability IN ('low','medium','high')),
    mitigation          TEXT,
    owner_label         VARCHAR(100),
    owner_user_id       INT          REFERENCES users(id),
    status              VARCHAR(15)  NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open','mitigated','closed')),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 10. CAMPUS PROJECTS
-- Pages: Projects (all tabs, project detail dialog)
-- =============================================================================

CREATE TABLE projects (
    id                      SERIAL       PRIMARY KEY,
    campus_id               INT          NOT NULL REFERENCES campus(id),
    name                    VARCHAR(300) NOT NULL,
    summary                 TEXT,
    category                VARCHAR(80),
    status                  VARCHAR(20)  NOT NULL DEFAULT 'Planned'
                                CHECK (status IN ('Planned','In Progress','Completed','On Hold','Cancelled')),
    budget_inr              NUMERIC(15,2),
    spent_inr               NUMERIC(15,2) NOT NULL DEFAULT 0,
    carbon_reduction_t_yr   NUMERIC(10,2),
    roi_pct                 NUMERIC(6,2),
    timeline_pct            SMALLINT     NOT NULL DEFAULT 0 CHECK (timeline_pct BETWEEN 0 AND 100),
    risk_level              VARCHAR(10)  NOT NULL DEFAULT 'Low'
                                CHECK (risk_level IN ('Low','Medium','High')),
    ai_score                SMALLINT     CHECK (ai_score BETWEEN 0 AND 100),
    npv_inr                 NUMERIC(15,2),
    irr_pct                 NUMERIC(6,2),
    payback_years           NUMERIC(5,2),
    start_date              DATE,
    end_date                DATE,
    created_by              INT          REFERENCES users(id),
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_projects_status ON projects (campus_id, status);

CREATE TABLE project_milestones (
    id          SERIAL       PRIMARY KEY,
    project_id  INT          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    is_done     BOOLEAN      NOT NULL DEFAULT FALSE,
    completed_at DATE,
    sort_order  SMALLINT     NOT NULL DEFAULT 0
);

CREATE TABLE project_dependencies (
    id                      SERIAL       PRIMARY KEY,
    project_id              INT          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    depends_on_label        VARCHAR(200) NOT NULL,
    depends_on_project_id   INT          REFERENCES projects(id)
);

CREATE TABLE project_emission_projections (
    id              SERIAL       PRIMARY KEY,
    project_id      INT          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    projection_year SMALLINT     NOT NULL,
    emissions_tons  NUMERIC(10,2),
    savings_inr     NUMERIC(14,2),
    UNIQUE (project_id, projection_year)
);


-- =============================================================================
-- 11. REPORTS
-- Pages: Reports (compliance templates, custom builder, generate/schedule)
-- =============================================================================

CREATE TABLE report_templates (
    id              SERIAL       PRIMARY KEY,
    code            VARCHAR(20)  NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    standard        VARCHAR(100),
    section_count   SMALLINT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE report_kpi_definitions (
    id              SERIAL       PRIMARY KEY,
    name            VARCHAR(200) NOT NULL UNIQUE,
    unit            VARCHAR(50),
    period_label    VARCHAR(50),
    category        VARCHAR(80)
);

CREATE TABLE reports (
    id              BIGSERIAL    PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    template_id     INT          NOT NULL REFERENCES report_templates(id),
    generated_by    INT          REFERENCES users(id),
    period_label    VARCHAR(50),
    file_path       VARCHAR(500),
    file_size_kb    INT,
    status          VARCHAR(20)  NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','generating','completed','failed')),
    scheduled_at    TIMESTAMPTZ,
    generated_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE report_kpi_inclusions (
    id          SERIAL       PRIMARY KEY,
    report_id   BIGINT       NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    kpi_id      INT          NOT NULL REFERENCES report_kpi_definitions(id),
    value_text  VARCHAR(100),
    change_pct  NUMERIC(6,2),
    UNIQUE (report_id, kpi_id)
);

CREATE TABLE report_schedules (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    template_id     INT          NOT NULL REFERENCES report_templates(id),
    created_by      INT          REFERENCES users(id),
    frequency       VARCHAR(15)  NOT NULL DEFAULT 'monthly'
                        CHECK (frequency IN ('daily','weekly','monthly','quarterly','annually')),
    next_run_at     TIMESTAMPTZ,
    recipients      JSONB,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 12. COMMUNITY & LEADERBOARD
-- Pages: Community, Leaderboard, Challenges
-- =============================================================================

CREATE TABLE teams (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    name            VARCHAR(150) NOT NULL,
    department_id   INT          REFERENCES departments(id),
    badge_emoji     VARCHAR(10),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE team_members (
    id          SERIAL      PRIMARY KEY,
    team_id     INT         NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id     INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (team_id, user_id)
);

CREATE TABLE leaderboard_scores (
    id                      BIGSERIAL    PRIMARY KEY,
    campus_id               INT          NOT NULL REFERENCES campus(id),
    entity_type             VARCHAR(15)  NOT NULL
                                CHECK (entity_type IN ('team','department','building','hostel')),
    entity_id               INT          NOT NULL,
    period_label            VARCHAR(30),
    period_start            DATE,
    period_end              DATE,
    total_points            INT          NOT NULL DEFAULT 0,
    energy_reduction_pct    NUMERIC(5,2),
    carbon_reduction_pct    NUMERIC(5,2),
    participation_pct       NUMERIC(5,2),
    waste_diversion_pct     NUMERIC(5,2),
    streak_days             SMALLINT     NOT NULL DEFAULT 0,
    rank                    SMALLINT,
    trend                   VARCHAR(5)   NOT NULL DEFAULT 'same'
                                CHECK (trend IN ('up','down','same')),
    hall_of_fame            BOOLEAN      NOT NULL DEFAULT FALSE,
    computed_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leaderboard_campus_period ON leaderboard_scores (campus_id, period_label);

CREATE TABLE eco_challenges (
    id                  SERIAL       PRIMARY KEY,
    campus_id           INT          NOT NULL REFERENCES campus(id),
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    category            VARCHAR(80),
    duration_label      VARCHAR(50),
    target_label        VARCHAR(200),
    max_participants    INT,
    reward_points       INT,
    reward_badge        VARCHAR(100),
    carbon_potential_t  NUMERIC(6,2),
    impact_score        SMALLINT     CHECK (impact_score BETWEEN 0 AND 100),
    status              VARCHAR(15)  NOT NULL DEFAULT 'upcoming'
                            CHECK (status IN ('upcoming','active','completed','cancelled')),
    start_date          DATE,
    end_date            DATE         NOT NULL,
    created_by          INT          REFERENCES users(id),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_challenges_campus_status ON eco_challenges (campus_id, status, end_date);

CREATE TABLE challenge_participants (
    id              BIGSERIAL    PRIMARY KEY,
    challenge_id    INT          NOT NULL REFERENCES eco_challenges(id),
    user_id         INT          NOT NULL REFERENCES users(id),
    team_id         INT          REFERENCES teams(id),
    department_id   INT          REFERENCES departments(id),
    joined_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    completed       BOOLEAN      NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    points_earned   INT          NOT NULL DEFAULT 0,
    UNIQUE (challenge_id, user_id)
);

CREATE TABLE challenge_department_stats (
    id                  SERIAL       PRIMARY KEY,
    challenge_id        INT          NOT NULL REFERENCES eco_challenges(id) ON DELETE CASCADE,
    department_id       INT          NOT NULL REFERENCES departments(id),
    participation_pct   NUMERIC(5,2),
    UNIQUE (challenge_id, department_id)
);

CREATE TABLE community_events (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    title           VARCHAR(200) NOT NULL,
    event_date      DATE         NOT NULL,
    location        VARCHAR(200),
    event_type      VARCHAR(50),
    max_attendees   INT,
    created_by      INT          REFERENCES users(id),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE event_rsvps (
    id          BIGSERIAL    PRIMARY KEY,
    event_id    INT          NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
    user_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rsvped_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    attended    BOOLEAN      NOT NULL DEFAULT FALSE,
    UNIQUE (event_id, user_id)
);

CREATE TABLE badges (
    id              SERIAL       PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    icon_emoji      VARCHAR(10),
    requirement     VARCHAR(300),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE user_badges (
    id              BIGSERIAL    PRIMARY KEY,
    user_id         INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id        INT          NOT NULL REFERENCES badges(id),
    challenge_id    INT          REFERENCES eco_challenges(id),
    awarded_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, badge_id)
);


-- =============================================================================
-- 13. ADMIN PANEL
-- Pages: Admin (Users, Configuration, Data Sources, ML Models, Audit Logs)
-- =============================================================================

-- Key-value store for Admin > Configuration tab inputs/toggles
-- Example config_key values:
--   overconsumption_alert_pct, peak_demand_limit_kw, min_solar_target_pct,
--   carbon_price_inr_ton, netzero_target_year, grid_emission_factor,
--   maintenance_mode, ai_autonomous_actions, realtime_streaming, external_api_access
CREATE TABLE platform_config (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    config_key      VARCHAR(100) NOT NULL,
    config_value    VARCHAR(500) NOT NULL,
    config_group    VARCHAR(80),
    label           VARCHAR(200),
    updated_by      INT          REFERENCES users(id),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (campus_id, config_key)
);

CREATE TABLE alert_config (
    id                      SERIAL      PRIMARY KEY,
    campus_id               INT         NOT NULL UNIQUE REFERENCES campus(id),
    critical_auto_escalate  BOOLEAN     NOT NULL DEFAULT TRUE,
    email_on_warning        BOOLEAN     NOT NULL DEFAULT TRUE,
    sms_on_critical         BOOLEAN     NOT NULL DEFAULT FALSE,
    auto_acknowledge_info   BOOLEAN     NOT NULL DEFAULT TRUE,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE data_sources (
    id              SERIAL       PRIMARY KEY,
    campus_id       INT          NOT NULL REFERENCES campus(id),
    name            VARCHAR(200) NOT NULL,
    source_type     VARCHAR(80),
    endpoint_url    VARCHAR(500),
    api_key_hash    VARCHAR(255),
    status          VARCHAR(15)  NOT NULL DEFAULT 'offline'
                        CHECK (status IN ('connected','degraded','offline')),
    latency_ms      SMALLINT,
    uptime_pct      NUMERIC(5,2),
    last_sync_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id          BIGSERIAL    PRIMARY KEY,
    campus_id   INT          NOT NULL REFERENCES campus(id),
    user_id     INT          REFERENCES users(id),
    user_label  VARCHAR(150),
    action      TEXT         NOT NULL,
    log_type    VARCHAR(10)  NOT NULL DEFAULT 'action'
                    CHECK (log_type IN ('alert','config','action','system','report')),
    metadata    JSONB,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_campus_time ON audit_logs (campus_id, created_at);
CREATE INDEX idx_audit_logs_type        ON audit_logs (log_type, created_at);


-- =============================================================================
-- 14. MISSION CONTROL
-- Pages: MissionControl (decisions, trajectory, what-if simulator)
-- =============================================================================

CREATE TABLE mission_decisions (
    id                      SERIAL       PRIMARY KEY,
    campus_id               INT          NOT NULL REFERENCES campus(id),
    decision_key            VARCHAR(80)  NOT NULL,
    label                   VARCHAR(250) NOT NULL,
    emission_reduction_pct  NUMERIC(5,2),
    cost_saving_lakhs_yr    NUMERIC(8,2),
    years_accelerated       NUMERIC(4,2),
    icon_name               VARCHAR(50),
    sort_order              SMALLINT     NOT NULL DEFAULT 0,
    UNIQUE (campus_id, decision_key)
);

CREATE TABLE mission_simulations (
    id                      BIGSERIAL    PRIMARY KEY,
    campus_id               INT          NOT NULL REFERENCES campus(id),
    user_id                 INT          REFERENCES users(id),
    simulation_name         VARCHAR(200),
    time_range_yrs          SMALLINT     NOT NULL DEFAULT 20,
    decisions_json          JSONB        NOT NULL,
    optimized_year          SMALLINT,
    emission_reduction_pct  NUMERIC(5,2),
    cost_saving_lakhs_yr    NUMERIC(8,2),
    years_accelerated       NUMERIC(4,2),
    confidence_pct          SMALLINT     CHECK (confidence_pct BETWEEN 0 AND 100),
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE mission_insights (
    id          SERIAL       PRIMARY KEY,
    campus_id   INT          NOT NULL REFERENCES campus(id),
    insight     TEXT         NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order  SMALLINT     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 15. LIVE METRICS STRIP & LANDING PAGE
-- Pages: Landing page metrics strip, Header live counters
-- =============================================================================

CREATE TABLE live_metrics (
    id                  BIGSERIAL    PRIMARY KEY,
    campus_id           INT          NOT NULL REFERENCES campus(id),
    recorded_at         TIMESTAMPTZ  NOT NULL,
    energy_saved_kwh    NUMERIC(12,2),
    carbon_reduced_kg   NUMERIC(12,2),
    solar_generated_kwh NUMERIC(12,2),
    cost_saved_inr      NUMERIC(14,2)
);
CREATE INDEX idx_live_metrics_time ON live_metrics (campus_id, recorded_at);


-- =============================================================================
-- SEED DATA
-- =============================================================================

INSERT INTO roles (name, description) VALUES
    ('Admin',            'Full system access'),
    ('Facility Manager', 'Manages buildings and equipment'),
    ('Finance',          'Access to financial dashboards'),
    ('Faculty',          'Read access + community features'),
    ('Student Lead',     'Community and challenge management'),
    ('System',           'Automated system/bot user');

INSERT INTO departments (name, type) VALUES
    ('Sustainability Office',   'administrative'),
    ('Facilities',              'operational'),
    ('Finance Office',          'administrative'),
    ('Environmental Science',   'academic'),
    ('Student Council',         'administrative'),
    ('AI Engine',               'operational'),
    ('Physics',                 'academic'),
    ('Mechanical Engineering',  'academic'),
    ('Chemistry',               'academic'),
    ('Architecture',            'academic'),
    ('Biology',                 'academic'),
    ('Civil Engineering',       'academic'),
    ('Electrical Engineering',  'academic'),
    ('IT',                      'operational');

INSERT INTO report_templates (code, name, standard, section_count) VALUES
    ('gri',    'GRI Standards Report',   'GRI 2021',  12),
    ('cdp',    'CDP Climate Disclosure', 'CDP 2024',   8),
    ('stars',  'AASHE STARS Report',     'STARS 2.2',  6),
    ('tcfd',   'TCFD Disclosure',        'TCFD 2023',  4),
    ('custom', 'Custom Monthly Report',  'Internal',  10);

INSERT INTO report_kpi_definitions (name, unit, period_label, category) VALUES
    ('Total Energy Consumption', 'MWh',   'FY 2024-25', 'Energy'),
    ('Renewable Energy Share',   '%',     'FY 2024-25', 'Energy'),
    ('Total GHG Emissions',      'tCO2e', 'FY 2024-25', 'Carbon'),
    ('Energy Cost',              'INR',   'FY 2024-25', 'Finance'),
    ('Water Consumption',        'ML',    'FY 2024-25', 'Water'),
    ('Waste Diverted',           '%',     'FY 2024-25', 'Waste');

INSERT INTO badges (name, icon_emoji, requirement) VALUES
    ('Carbon Warrior',   '🌍', 'Reduce 100kg CO2'),
    ('Solar Champion',   '☀️', 'Promote solar adoption'),
    ('Zero Waste Hero',  '♻️', 'Complete Zero Waste Week'),
    ('Green Commuter',   '🚲', '30 bike commute days'),
    ('Energy Detective', '🔍', 'Report 10+ waste points'),
    ('Tree Guardian',    '🌳', 'Plant & adopt a tree');

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
