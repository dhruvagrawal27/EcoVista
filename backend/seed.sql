-- =============================================================================
-- EcoVista — Full Seed Data
-- Run this AFTER schema.sql to populate all tables for testing.
-- Run in Supabase SQL Editor: paste entire file and click "Run"
-- =============================================================================

-- =============================================================================
-- 1. CAMPUS
-- =============================================================================
INSERT INTO campus (name, net_zero_progress, target_year, total_buildings, total_students, solar_capacity_mw, campus_area_acres, baseline_emissions, current_emissions, reduction_rate, on_track)
VALUES ('IIT Delhi', 67.3, 2035, 12, 8500, 5.0, 320, 12400, 6850, 8.5, true)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 2. ROLES & DEPARTMENTS (already in schema.sql SEED DATA, but safe to re-run)
-- =============================================================================
INSERT INTO roles (name, description) VALUES
  ('Admin',            'Full system access'),
  ('Facility Manager', 'Manages buildings and equipment'),
  ('Finance',          'Access to financial dashboards'),
  ('Faculty',          'Read access + community features'),
  ('Student Lead',     'Community and challenge management'),
  ('System',           'Automated system/bot user')
ON CONFLICT (name) DO NOTHING;

INSERT INTO departments (name, type) VALUES
  ('Sustainability Office',  'administrative'),
  ('Facilities',             'operational'),
  ('Finance Office',         'administrative'),
  ('Environmental Science',  'academic'),
  ('Student Council',        'administrative'),
  ('AI Engine',              'operational'),
  ('Mechanical Engineering', 'academic'),
  ('Electrical Engineering', 'academic'),
  ('IT',                     'operational')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 3. USERS
-- =============================================================================
INSERT INTO users (name, email, password_hash, role_id, department_id, status, last_active_at) VALUES
  ('Dhruv Agrawal',     'dhruv@iitd.ac.in',    'hashed_pw', 1, 1, 'active', NOW() - INTERVAL '5 minutes'),
  ('Priya Sharma',      'priya@iitd.ac.in',    'hashed_pw', 2, 2, 'active', NOW() - INTERVAL '2 hours'),
  ('Rajesh Kumar',      'rajesh@iitd.ac.in',   'hashed_pw', 3, 3, 'active', NOW() - INTERVAL '1 day'),
  ('Ananya Singh',      'ananya@iitd.ac.in',   'hashed_pw', 4, 4, 'active', NOW() - INTERVAL '3 hours'),
  ('Vikram Mehta',      'vikram@iitd.ac.in',   'hashed_pw', 5, 5, 'active', NOW() - INTERVAL '30 minutes'),
  ('AI System Bot',     'system@iitd.ac.in',   'hashed_pw', 6, 6, 'active', NOW()),
  ('Neha Gupta',        'neha@iitd.ac.in',     'hashed_pw', 2, 2, 'active', NOW() - INTERVAL '4 hours'),
  ('Arjun Patel',       'arjun@iitd.ac.in',    'hashed_pw', 4, 7, 'inactive', NOW() - INTERVAL '7 days'),
  ('Sneha Joshi',       'sneha@iitd.ac.in',    'hashed_pw', 4, 8, 'active', NOW() - INTERVAL '6 hours'),
  ('Rohan Verma',       'rohan@iitd.ac.in',    'hashed_pw', 5, 5, 'active', NOW() - INTERVAL '1 hour')
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 4. BUILDINGS
-- =============================================================================
INSERT INTO buildings (campus_id, code, name, building_type, floors, area_sqm, year_built, eui, hvac_score, carbon_score, maintenance_score, occupancy_rate, is_green_certified)
VALUES
  (1, 'SCI-A',  'Science Block A',       'academic',     4, 4200, 2018, 135, 92, 88, 75, 94, true),
  (1, 'LIB',    'Library Complex',       'library',      3, 5800, 2015, 128, 88, 91, 82, 90, true),
  (1, 'ENG-A',  'Engineering Block A',   'lab',          5, 6200, 2010, 165, 78, 72, 65, 85, false),
  (1, 'ADMIN',  'Admin Building',        'admin',        3, 3400, 2020,  98, 95, 94, 88, 70, true),
  (1, 'STUD',   'Student Activity Center','academic',    2, 4800, 2012, 142, 82, 80, 72, 88, false),
  (1, 'HOSB',   'Hostel Block B',        'residential',  4, 7200, 2008, 155, 70, 68, 60, 95, false),
  (1, 'CHEM',   'Chemistry Lab',         'lab',          3, 3600, 2014, 178, 75, 70, 68, 80, false),
  (1, 'IT-BLK', 'IT Block',              'it',           4, 4100, 2016, 145, 85, 82, 78, 88, true),
  (1, 'SPORTS', 'Sports Complex',        'sports',       1, 8500, 2019,  88, 80, 85, 90, 75, true),
  (1, 'PHY',    'Physics Block',         'academic',     3, 3800, 2013, 158, 76, 74, 70, 82, false),
  (1, 'MECH',   'Mechanical Workshop',   'lab',          2, 5100, 2011, 188, 65, 62, 58, 78, false),
  (1, 'UTILITY','Central Utility Plant', 'utility',      1, 2200, 2005, 210, 60, 55, 50, 100, false)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 5. ENERGY DAILY SUMMARY — last 30 days (campus-level: building_id IS NULL)
-- =============================================================================
INSERT INTO energy_daily_summary (campus_id, building_id, summary_date, total_kwh, solar_kwh, wind_kwh, grid_kwh, battery_charged_kwh, peak_demand_kw, cost_inr, carbon_kg)
SELECT
  1,
  NULL,
  CURRENT_DATE - (n || ' days')::INTERVAL,
  ROUND((26000 + RANDOM() * 6000)::numeric, 2),
  ROUND((9000  + RANDOM() * 3000)::numeric, 2),
  ROUND((800   + RANDOM() * 400 )::numeric, 2),
  ROUND((14000 + RANDOM() * 4000)::numeric, 2),
  ROUND((500   + RANDOM() * 300 )::numeric, 2),
  ROUND((2400  + RANDOM() * 800 )::numeric, 2),
  ROUND((720000+ RANDOM()*180000)::numeric, 2),
  ROUND((1100  + RANDOM() * 400 )::numeric, 2)
FROM generate_series(0, 29) AS n
ON CONFLICT (campus_id, building_id, summary_date) DO NOTHING;

-- Building-level summaries (last 7 days, key buildings)
INSERT INTO energy_daily_summary (campus_id, building_id, summary_date, total_kwh, solar_kwh, wind_kwh, grid_kwh, peak_demand_kw, cost_inr, carbon_kg)
SELECT
  1,
  b.id,
  CURRENT_DATE - (n || ' days')::INTERVAL,
  ROUND((b.eui * b.area_sqm / 365 * (0.9 + RANDOM()*0.2))::numeric, 2),
  ROUND((b.eui * b.area_sqm / 365 * 0.35 * (0.8 + RANDOM()*0.4))::numeric, 2),
  0,
  ROUND((b.eui * b.area_sqm / 365 * 0.65 * (0.9 + RANDOM()*0.2))::numeric, 2),
  ROUND((b.eui * b.area_sqm / 365 / 10 * (0.9 + RANDOM()*0.2))::numeric, 2),
  ROUND((b.eui * b.area_sqm / 365 * 8 * (0.9 + RANDOM()*0.2))::numeric, 2),
  ROUND((b.eui * b.area_sqm / 365 * 0.42 * (0.9 + RANDOM()*0.2))::numeric, 2)
FROM buildings b, generate_series(0, 6) AS n
WHERE b.campus_id = 1
ON CONFLICT (campus_id, building_id, summary_date) DO NOTHING;

-- =============================================================================
-- 6. ENERGY READINGS — last 48 hours (15-min intervals)
-- =============================================================================
INSERT INTO energy_readings (campus_id, building_id, recorded_at, actual_kw, predicted_kw, solar_kw, wind_kw, battery_kw, grid_import_kw, total_demand_kw)
SELECT
  1,
  NULL,
  NOW() - (n * INTERVAL '15 minutes'),
  ROUND((2200 + SIN(n::float/8)*700 + RANDOM()*200)::numeric, 2),
  ROUND((2300 + SIN(n::float/8)*650 + RANDOM()*80 )::numeric, 2),
  ROUND(GREATEST(0, 1200 * SIN(((EXTRACT(HOUR FROM NOW() - (n * INTERVAL '15 minutes')) - 6) / 12.0) * PI()) + RANDOM()*100)::numeric, 2),
  ROUND((120  + RANDOM()*60)::numeric, 2),
  ROUND((40   + RANDOM()*30)::numeric, 2),
  ROUND((1100 + RANDOM()*400)::numeric, 2),
  ROUND((2800 + RANDOM()*300)::numeric, 2)
FROM generate_series(0, 191) AS n;

-- =============================================================================
-- 7. ENERGY RISK SCORES — last 30 days
-- =============================================================================
INSERT INTO energy_risk_scores (campus_id, recorded_date, overall_score, grid_dependency, peak_volatility, weather_exposure, overconsumption_freq, equipment_age, stability_index, thirty_day_variance)
SELECT
  1,
  CURRENT_DATE - (n || ' days')::INTERVAL,
  ROUND((65 + RANDOM()*20)::numeric)::smallint,
  ROUND((55 + RANDOM()*25)::numeric)::smallint,
  ROUND((70 + RANDOM()*20)::numeric)::smallint,
  ROUND((75 + RANDOM()*20)::numeric)::smallint,
  ROUND((40 + RANDOM()*30)::numeric)::smallint,
  ROUND((60 + RANDOM()*20)::numeric)::smallint,
  ROUND((80 + RANDOM()*15)::numeric, 2),
  ROUND((5  + RANDOM()*5 )::numeric, 2)
FROM generate_series(0, 29) AS n
ON CONFLICT (campus_id, recorded_date) DO NOTHING;

-- =============================================================================
-- 8. GRID STATE — last 24 hours (hourly)
-- =============================================================================
INSERT INTO grid_state (campus_id, recorded_at, solar_current_kw, solar_capacity_kw, wind_current_kw, wind_capacity_kw, battery_charge_pct, battery_capacity_kwh, battery_status, grid_import_kw, is_grid_importing, total_demand_kw, predicted_demand_kw)
SELECT
  1,
  NOW() - (n || ' hours')::INTERVAL,
  ROUND(GREATEST(0, 1200 * SIN(((EXTRACT(HOUR FROM NOW() - (n || ' hours')::INTERVAL) - 6) / 12.0) * PI()) + RANDOM()*100)::numeric, 2),
  5000,
  ROUND((150 + RANDOM()*80)::numeric, 2),
  500,
  ROUND((60 + RANDOM()*30)::numeric, 2),
  2000,
  CASE WHEN RANDOM() > 0.3 THEN 'charging' ELSE 'discharging' END,
  ROUND((1200 + RANDOM()*600)::numeric, 2),
  true,
  ROUND((2600 + RANDOM()*600)::numeric, 2),
  ROUND((2500 + RANDOM()*400)::numeric, 2)
FROM generate_series(0, 23) AS n;

-- =============================================================================
-- 9. ENERGY FORECASTS — next 72 hours
-- =============================================================================
INSERT INTO energy_forecasts (campus_id, forecast_from, forecast_at, predicted_kw, upper_bound_kw, lower_bound_kw, actual_kw, model_version)
SELECT
  1,
  NOW(),
  NOW() + (n || ' hours')::INTERVAL,
  ROUND((2300 + SIN(n::float/4)*650 + RANDOM()*50)::numeric, 2),
  ROUND((2600 + SIN(n::float/4)*700)::numeric, 2),
  ROUND((2000 + SIN(n::float/4)*600)::numeric, 2),
  CASE WHEN n < 24 THEN ROUND((2200 + SIN(n::float/4)*700 + RANDOM()*200)::numeric, 2) ELSE NULL END,
  'ensemble-v2.1'
FROM generate_series(0, 71) AS n;

-- =============================================================================
-- 10. FORECAST ACCURACY — last 30 days
-- =============================================================================
INSERT INTO forecast_accuracy_daily (campus_id, report_date, accuracy, drift)
SELECT
  1,
  CURRENT_DATE - (n || ' days')::INTERVAL,
  ROUND((88 + RANDOM()*10)::numeric, 2),
  ROUND((RANDOM()*4 - 2)::numeric, 2)
FROM generate_series(0, 29) AS n
ON CONFLICT (campus_id, report_date) DO NOTHING;

-- =============================================================================
-- 11. ENERGY COST DAILY — last 28 days
-- =============================================================================
INSERT INTO energy_cost_daily (campus_id, cost_date, cost_inr, weekday)
SELECT
  1,
  CURRENT_DATE - (n || ' days')::INTERVAL,
  ROUND((18000 + RANDOM()*22000)::numeric, 2),
  to_char(CURRENT_DATE - (n || ' days')::INTERVAL, 'Dy')
FROM generate_series(0, 27) AS n
ON CONFLICT (cost_date) DO NOTHING;

-- =============================================================================
-- 12. BENCHMARK DATA
-- =============================================================================
INSERT INTO benchmark_data (campus_id, metric_name, campus_value, national_avg, recorded_year) VALUES
  (1, 'EUI (kWh/m²)',       142, 168, 2025),
  (1, 'Solar %',              38,  22, 2025),
  (1, 'Carbon Intensity',   0.42, 0.58, 2025),
  (1, 'HVAC Efficiency',      88,  76, 2025),
  (1, 'Cost/Student (INR)', 12400, 15800, 2025)
ON CONFLICT (campus_id, metric_name, recorded_year) DO NOTHING;

-- =============================================================================
-- 13. EQUIPMENT & LOAD READINGS
-- =============================================================================
INSERT INTO equipment (building_id, name, equipment_type, capacity_kw, is_smart)
SELECT b.id, eq.name, eq.etype, eq.cap, true
FROM buildings b,
LATERAL (VALUES
  ('Central HVAC Unit A', 'HVAC',       500),
  ('Chiller Plant',       'Cooling',    450),
  ('LED Lighting Array',  'Lighting',   120),
  ('Server Room UPS',     'UPS',        250)
) AS eq(name, etype, cap)
WHERE b.campus_id = 1
ON CONFLICT DO NOTHING;

INSERT INTO equipment_load_readings (equipment_id, recorded_at, load_kw, status)
SELECT
  e.id,
  NOW() - (n * INTERVAL '30 minutes'),
  ROUND((e.capacity_kw * (0.5 + RANDOM()*0.5))::numeric, 2),
  CASE WHEN RANDOM() > 0.85 THEN 'high'
       WHEN RANDOM() > 0.7  THEN 'medium'
       ELSE 'normal' END
FROM equipment e, generate_series(0, 47) AS n
WHERE e.id IS NOT NULL;

-- =============================================================================
-- 14. RETROFIT SUGGESTIONS
-- =============================================================================
INSERT INTO retrofit_suggestions (campus_id, action, estimated_cost, annual_saving, payback_years, carbon_reduction_tons, status) VALUES
  (1, 'LED Retrofit — All Common Areas',   850000,   320000, 2.7,  42, 'approved'),
  (1, 'Smart HVAC Controls',              1200000,   480000, 2.5,  65, 'in-progress'),
  (1, 'Solar Panel Expansion (2MW)',      8500000,  2400000, 3.5, 180, 'proposed'),
  (1, 'Building Envelope Insulation',     2200000,   560000, 3.9,  38, 'proposed'),
  (1, 'EV Charging Infrastructure',       3500000,   800000, 4.4,  55, 'approved')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 15. LOAD PROFILES
-- =============================================================================
INSERT INTO load_profiles (campus_id, profile_date, day_type, hour, load_kw)
SELECT
  1,
  CURRENT_DATE,
  CASE WHEN EXTRACT(DOW FROM CURRENT_DATE) IN (0,6) THEN 'weekend' ELSE 'weekday' END,
  h,
  ROUND(CASE
    WHEN EXTRACT(DOW FROM CURRENT_DATE) IN (0,6)
      THEN (1200 + SIN((h::float - 10)/5.0)*400 + RANDOM()*100)
    ELSE (1800 + SIN((h::float - 8)/4.0)*900 + CASE WHEN h BETWEEN 8 AND 18 THEN 600 ELSE 0 END + RANDOM()*150)
  END::numeric, 2)
FROM generate_series(0, 23) AS h
ON CONFLICT (campus_id, profile_date, hour) DO NOTHING;

-- =============================================================================
-- 16. CARBON DATA
-- =============================================================================
INSERT INTO carbon_scope_readings (campus_id, recorded_month, scope, source_name, value_tco2e, trend_pct) VALUES
  (1, date_trunc('month', CURRENT_DATE), 1, 'Natural Gas',           680, -8),
  (1, date_trunc('month', CURRENT_DATE), 1, 'Diesel Generators',     320, -12),
  (1, date_trunc('month', CURRENT_DATE), 1, 'Fleet Vehicles',        250, -5),
  (1, date_trunc('month', CURRENT_DATE), 2, 'Purchased Electricity', 2800, -15),
  (1, date_trunc('month', CURRENT_DATE), 2, 'District Heating',      420, -3),
  (1, date_trunc('month', CURRENT_DATE), 2, 'District Cooling',      200, -7),
  (1, date_trunc('month', CURRENT_DATE), 3, 'Student Commute',       980, -4),
  (1, date_trunc('month', CURRENT_DATE), 3, 'Procurement',           650, -2),
  (1, date_trunc('month', CURRENT_DATE), 3, 'Waste',                 320, -18),
  (1, date_trunc('month', CURRENT_DATE), 3, 'Business Travel',       230, -22)
ON CONFLICT (campus_id, recorded_month, scope, source_name) DO NOTHING;

INSERT INTO carbon_monthly_trend (campus_id, trend_month, actual_tco2e, target_tco2e, forecast_tco2e)
SELECT
  1,
  date_trunc('month', CURRENT_DATE) - (n || ' months')::INTERVAL,
  ROUND((580 - n*12 + RANDOM()*40)::numeric, 3),
  ROUND((600 - n*15)::numeric, 3),
  CASE WHEN n < 3 THEN ROUND((500 - n*18 + RANDOM()*20)::numeric, 3) ELSE NULL END
FROM generate_series(0, 11) AS n
ON CONFLICT (campus_id, trend_month) DO NOTHING;

INSERT INTO netzero_milestones (campus_id, milestone_year, target_tco2e, actual_tco2e, status) VALUES
  (1, 2024, 7200, 6850, 'achieved'),
  (1, 2026, 5800, NULL, 'on-track'),
  (1, 2028, 4200, NULL, 'planned'),
  (1, 2030, 2500, NULL, 'planned'),
  (1, 2035,    0, NULL, 'planned')
ON CONFLICT (campus_id, milestone_year) DO NOTHING;

INSERT INTO carbon_scenarios (campus_id, name, impact_tco2e_yr, timeline_months, cost_inr, feasibility_pct, status) VALUES
  (1, 'Electrify Fleet',              180,  18,  4500000, 85, 'proposed'),
  (1, 'Expand Solar to 8MW',          420,  24, 12000000, 78, 'approved'),
  (1, 'Building Insulation',           95,  12,  2200000, 92, 'in-progress'),
  (1, 'Green Procurement Policy',     130,   6,   500000, 95, 'approved'),
  (1, 'Waste-to-Energy Plant',        210,  36, 18000000, 60, 'proposed')
ON CONFLICT DO NOTHING;

INSERT INTO carbon_daily (campus_id, reading_date, total_kg_co2e, scope1_kg, scope2_kg, scope3_kg)
SELECT
  1,
  CURRENT_DATE - (n || ' days')::INTERVAL,
  ROUND((1200 - n*3 + RANDOM()*100)::numeric, 3),
  ROUND((250  + RANDOM()*50)::numeric, 3),
  ROUND((680  + RANDOM()*80)::numeric, 3),
  ROUND((280  + RANDOM()*40)::numeric, 3)
FROM generate_series(0, 29) AS n
ON CONFLICT (campus_id, reading_date) DO NOTHING;

-- =============================================================================
-- 17. RENEWABLES
-- =============================================================================
INSERT INTO solar_arrays (building_id, name, panel_count, capacity_kw, installed_at, manufacturer, status)
VALUES
  (1, 'Rooftop Array A — Science Block',   120, 720,  '2021-03-15', 'Tata Solar',    'optimal'),
  (2, 'Rooftop Array B — Library',          80, 480,  '2020-11-01', 'Adani Solar',   'optimal'),
  (3, 'Rooftop Array C — Engineering',     100, 600,  '2019-06-20', 'Waaree',        'degraded'),
  (4, 'Canopy Array D — Admin',             60, 360,  '2022-08-10', 'Tata Solar',    'optimal'),
  (8, 'Rooftop Array E — IT Block',         90, 540,  '2023-01-05', 'Adani Solar',   'optimal'),
  (9, 'Ground Mount F — Sports Complex',   200, 1200, '2023-09-01', 'RenewSys',      'optimal')
ON CONFLICT DO NOTHING;

INSERT INTO renewable_monthly_generation (campus_id, gen_month, solar_kwh, wind_kwh, total_kwh, grid_offset_pct)
SELECT
  1,
  date_trunc('month', CURRENT_DATE) - (n || ' months')::INTERVAL,
  ROUND((280000 + RANDOM()*80000)::numeric, 2),
  ROUND((18000  + RANDOM()*8000 )::numeric, 2),
  ROUND((298000 + RANDOM()*88000)::numeric, 2),
  ROUND((36      + RANDOM()*12  )::numeric, 2)
FROM generate_series(0, 11) AS n
ON CONFLICT (campus_id, gen_month) DO NOTHING;

-- =============================================================================
-- 18. FINANCE
-- =============================================================================
INSERT INTO finance_snapshots (campus_id, snapshot_date, total_investment, annual_savings, npv_10yr, irr_pct, payback_years, carbon_credits_inr, subsidies_inr) VALUES
  (1, CURRENT_DATE, 45000000, 8400000, 28500000, 18.4, 5.4, 1250000, 3200000)
ON CONFLICT (campus_id, snapshot_date) DO NOTHING;

INSERT INTO investments (campus_id, name, cost_cr, impact_score, roi_pct, status) VALUES
  (1, 'Solar Expansion Phase 2',      4.50, 9.2, 22.8, 'approved'),
  (1, 'Smart Building Controls',      1.20, 7.8, 18.5, 'in-progress'),
  (1, 'EV Fleet Transition',          3.80, 8.5, 15.2, 'proposed'),
  (1, 'Battery Storage System',       2.60, 8.0, 19.4, 'approved'),
  (1, 'Green Roof Initiative',        0.85, 6.2, 12.8, 'in-progress'),
  (1, 'LED Campus-Wide Retrofit',     0.95, 7.5, 28.4, 'completed')
ON CONFLICT DO NOTHING;

INSERT INTO capital_projections (campus_id, projection_year, investment_inr, savings_inr, cumulative_inr)
SELECT
  1,
  2025 + n,
  ROUND((8000000 + RANDOM()*4000000)::numeric, 2),
  ROUND((6000000 + n*800000 + RANDOM()*1000000)::numeric, 2),
  ROUND((-45000000 + n*8400000)::numeric, 2)
FROM generate_series(0, 9) AS n
ON CONFLICT (campus_id, projection_year) DO NOTHING;

INSERT INTO subsidies (campus_id, name, amount_inr, status, deadline_text) VALUES
  (1, 'Ministry of New & Renewable Energy Grant',    5000000, 'approved',  'Expires Dec 2026'),
  (1, 'Delhi Green Building Incentive',              2500000, 'eligible',  'Apply by Mar 2026'),
  (1, 'FAME II EV Fleet Subsidy',                    1800000, 'applied',   'Under Review'),
  (1, 'Carbon Credit Revenue (Projected)',            750000, 'active',    'Ongoing'),
  (1, 'Smart City Mission Technology Fund',          3200000, 'eligible',  'Apply by Jun 2026')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 19. SUSTAINABILITY KPIs
-- =============================================================================
INSERT INTO sustainability_scores (campus_id, score_date, overall_score, energy_efficiency, carbon_reduction, renewable_share, water_conservation, waste_management, biodiversity, energy_trend, carbon_trend, renewable_trend, water_trend, waste_trend, biodiversity_trend)
VALUES (1, CURRENT_DATE, 78, 82, 76, 72, 68, 74, 65, -2.4, -3.1, 4.8, -1.2, 2.5, 1.8)
ON CONFLICT (campus_id, score_date) DO NOTHING;

INSERT INTO sdg_scores (campus_id, score_date, sdg_number, sdg_name, score) VALUES
  (1, CURRENT_DATE,  6, 'Clean Water',        72),
  (1, CURRENT_DATE,  7, 'Clean Energy',        85),
  (1, CURRENT_DATE,  9, 'Innovation',          78),
  (1, CURRENT_DATE, 11, 'Sustainable Cities',  74),
  (1, CURRENT_DATE, 12, 'Responsible Consump', 68),
  (1, CURRENT_DATE, 13, 'Climate Action',      80),
  (1, CURRENT_DATE, 15, 'Life on Land',        62),
  (1, CURRENT_DATE, 17, 'Partnerships',        70)
ON CONFLICT (campus_id, score_date, sdg_number) DO NOTHING;

INSERT INTO kpi_risk_indicators (campus_id, kpi_name, current_value, target_value, unit, status, deadline_label) VALUES
  (1, 'Renewable Energy Share',     38.0, 50.0, '%',     'on-track',  'FY26'),
  (1, 'Carbon Intensity',           0.42,  0.3, 'kgCO2/kWh', 'on-track', 'FY27'),
  (1, 'Energy Use Intensity',      142.0, 120.0, 'kWh/m²', 'at-risk',  'FY26'),
  (1, 'Water Intensity',            1.82,  1.5, 'L/student', 'on-track','FY26'),
  (1, 'Waste Diversion Rate',       64.0,  80.0, '%',    'at-risk',   'FY26'),
  (1, 'Green Certified Buildings',   4.0,   8.0, 'buildings', 'on-track','FY28'),
  (1, 'Solar Capacity',              5.0,   8.0, 'MW',   'on-track',  'FY27'),
  (1, 'Net Zero Progress',          67.3, 100.0, '%',    'on-track',  '2035')
ON CONFLICT (campus_id, kpi_name) DO NOTHING;

-- =============================================================================
-- 20. AI RECOMMENDATIONS
-- =============================================================================
INSERT INTO ai_recommendations (campus_id, title, description, category, roi_pct, carbon_impact, ease_score, confidence_pct, status, priority, impact_cost, impact_carbon) VALUES
  (1, 'HVAC Optimisation — Engineering Block',
     'Reduce HVAC setpoint by 2°C during non-peak hours (10PM–6AM). Current system is running 23% above optimal.',
     'energy', 24.5, 180, 85, 92, 'new', 'high', '₹12,400/mo', '-180 kg CO₂'),
  (1, 'Solar Panel Cleaning — Array C',
     'Rooftop Array C showing 8% efficiency drop due to dust. Scheduled cleaning recovers 340 kWh/day.',
     'renewable', 18.2, 95, 95, 88, 'new', 'medium', '₹8,200/mo', '-95 kg CO₂'),
  (1, 'Peak Load Shifting — Lab Equipment',
     'Shift charging schedules to off-peak (10PM–6AM) to reduce peak demand charges by 15%.',
     'energy', 31.0, 220, 70, 85, 'in-review', 'high', '₹18,700/mo', '-220 kg CO₂'),
  (1, 'LED Retrofit — Hostel Common Areas',
     'Replace 840 fluorescent tubes in Hostel B with LED. Immediate 60% lighting energy reduction.',
     'energy', 42.0, 65, 90, 96, 'approved', 'high', '₹6,800/mo', '-65 kg CO₂'),
  (1, 'Battery Dispatch Optimisation',
     'Adjust battery discharge schedule to target 6–9 PM peak tariff window. Saves ₹22,000/month.',
     'energy', 28.5, 140, 75, 89, 'new', 'medium', '₹22,000/mo', '-140 kg CO₂'),
  (1, 'Green Procurement — Lab Chemicals',
     'Switch to 12 sustainable chemical suppliers. Reduces scope 3 by 45 tCO2e/yr.',
     'carbon', 15.0, 450, 60, 78, 'new', 'low', '₹3,200/mo', '-450 kg CO₂'),
  (1, 'Wind Turbine Maintenance Alert',
     'Turbine WT-2 vibration anomaly detected. Maintenance within 7 days prevents 15% output loss.',
     'renewable', 8.0, 30, 98, 94, 'new', 'high', '₹4,100/mo', '-30 kg CO₂')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 21. AI TRUST SCORES & ML MODELS
-- =============================================================================
INSERT INTO ai_trust_scores (campus_id, score_date, overall_score, prediction_accuracy, data_quality, model_stability, recommendation_relevance)
VALUES (1, CURRENT_DATE, 87, 91, 88, 84, 85)
ON CONFLICT (campus_id, score_date) DO NOTHING;

INSERT INTO ml_models (name, version, accuracy_pct, last_trained_at, status, total_predictions, model_type, deployed_at) VALUES
  ('Energy Demand Forecaster', 'v2.1', 91.4, CURRENT_DATE - INTERVAL '3 days', 'production', 284920, 'LSTM Neural Network',    NOW() - INTERVAL '3 days'),
  ('Carbon Emission Predictor', 'v1.8', 88.7, CURRENT_DATE - INTERVAL '7 days', 'production', 142300, 'XGBoost Ensemble',       NOW() - INTERVAL '7 days'),
  ('Anomaly Detector',          'v3.0', 94.2, CURRENT_DATE - INTERVAL '1 day',  'production',  98450, 'Isolation Forest',       NOW() - INTERVAL '1 day'),
  ('Cost Optimiser',            'v1.5', 85.9, CURRENT_DATE - INTERVAL '14 days','staging',     42100, 'Reinforcement Learning', NOW() - INTERVAL '14 days'),
  ('Solar Generation Forecast', 'v2.0', 89.3, CURRENT_DATE - INTERVAL '5 days', 'production',  76200, 'Prophet + LSTM Hybrid',  NOW() - INTERVAL '5 days')
ON CONFLICT (name, version) DO NOTHING;

-- =============================================================================
-- 22. ALERTS
-- =============================================================================
INSERT INTO alerts (campus_id, building_id, alert_type, title, description, location_label, status) VALUES
  (1, 3, 'critical', 'Overconsumption Detected',
   'Engineering Block A consuming 45% above baseline for 30+ minutes. Possible HVAC fault.',
   'Engineering Block A', 'active'),
  (1, 1, 'warning', 'Solar Panel Efficiency Drop',
   'Array C-7 reporting 0W output. Possible inverter failure or shading issue.',
   'Science Block A — Rooftop', 'active'),
  (1, 2, 'warning', 'HVAC Cycling Anomaly',
   'Library HVAC cycling irregularly. Temperature variance ±3°C. Maintenance recommended.',
   'Library Complex', 'acknowledged'),
  (1, NULL, 'info', 'Scheduled Maintenance Window',
   'Central Utility Plant maintenance scheduled for Sunday 02:00–06:00. Expect 10% capacity reduction.',
   'Central Utility Plant', 'active'),
  (1, 6, 'warning', 'High Consumption — Hostel B',
   'Hostel Block B night consumption 28% above weekend average. Likely overnight study sessions.',
   'Hostel Block B', 'active')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 23. ROADMAP
-- =============================================================================
INSERT INTO roadmap_phases (campus_id, phase_number, name, start_date, end_date, progress_pct, budget_inr, spent_inr, risk_level) VALUES
  (1, 1, 'Energy Baseline & Audit',   '2023-01-01', '2023-12-31', 100, 5000000,  4800000, 'low'),
  (1, 2, 'Renewable Scale-Up',        '2024-01-01', '2025-12-31',  68, 25000000, 17200000,'medium'),
  (1, 3, 'Deep Electrification',      '2026-01-01', '2028-12-31',  12, 40000000,  4800000,'medium'),
  (1, 4, 'Carbon Neutrality',         '2029-01-01', '2032-12-31',   0, 30000000,       0, 'high'),
  (1, 5, 'Net Zero Achievement',      '2033-01-01', '2035-12-31',   0, 15000000,       0, 'high')
ON CONFLICT (campus_id, phase_number) DO NOTHING;

INSERT INTO risk_register (campus_id, risk_description, impact, probability, mitigation, owner_label, status) VALUES
  (1, 'Grid electricity price volatility may delay solar ROI',     'high',   'medium', 'Hedge with 10-year PPA contract', 'Finance Office', 'open'),
  (1, 'Monsoon disruptions to solar generation (Jun–Sep)',         'medium', 'high',   'Battery storage buffer + grid backup SLA', 'Facilities', 'mitigated'),
  (1, 'Technology obsolescence risk for HVAC controls',            'medium', 'low',    'Annual vendor review and upgrade clause', 'IT', 'open'),
  (1, 'Student/faculty resistance to energy behaviour change',     'low',    'medium', 'Gamification via EcoVista challenges', 'Student Council', 'open'),
  (1, 'Supply chain delays for solar panel procurement',           'high',   'low',    'Pre-qualify 3 alternate vendors', 'Facilities', 'open')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 24. PROJECTS
-- =============================================================================
INSERT INTO projects (campus_id, name, summary, category, status, budget_inr, spent_inr, carbon_reduction_t_yr, roi_pct, timeline_pct, risk_level, ai_score, npv_inr, irr_pct, payback_years, start_date, end_date) VALUES
  (1, 'Solar Rooftop Phase 2 — 2MW Expansion',
   'Expand solar capacity from 5MW to 7MW by adding panels on Engineering, Chemistry, and Physics blocks.',
   'Renewable Energy', 'In Progress', 8500000, 2800000, 180, 22.8, 35, 'Medium', 88, 12000000, 18.4, 3.5,
   '2025-06-01', '2026-12-31'),
  (1, 'Smart Building Management System — Phase 1',
   'Deploy IoT sensors and AI-driven HVAC controls across 6 buildings.',
   'Energy Efficiency', 'In Progress', 3200000, 1100000, 65, 18.5, 42, 'Low', 82, 4800000, 15.2, 4.2,
   '2025-03-01', '2026-06-30'),
  (1, 'EV Fleet Transition — 20 Vehicles',
   'Replace diesel fleet with 20 electric vehicles including charging infrastructure.',
   'Transport', 'Planned', 9500000, 0, 120, 15.2, 0, 'Medium', 74, 8200000, 12.8, 5.8,
   '2026-04-01', '2027-09-30'),
  (1, 'LED Campus Retrofit — Phase 2 (Hostels)',
   'Complete LED retrofit for all 4 hostel blocks. Phase 1 (academic) already complete.',
   'Energy Efficiency', 'Planned', 1800000, 0, 35, 28.4, 0, 'Low', 91, 2600000, 24.8, 2.8,
   '2026-01-15', '2026-09-30'),
  (1, 'Battery Energy Storage System — 2MWh',
   'Install 2MWh lithium-ion battery storage to shift solar surplus to peak demand hours.',
   'Renewable Energy', 'Planned', 12000000, 0, 95, 19.4, 0, 'High', 79, 9800000, 16.2, 4.8,
   '2026-07-01', '2027-12-31'),
  (1, 'Green Roof — Library & Admin',
   'Install green roofs on Library Complex and Admin Building. Reduces cooling load by 12%.',
   'Carbon Sequestration', 'Completed', 2200000, 2180000, 28, 12.8, 100, 'Low', 68, 1800000, 10.4, 6.2,
   '2024-03-01', '2024-12-31')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 25. REPORTS (templates already in schema seed)
-- =============================================================================
INSERT INTO report_templates (code, name, standard, section_count) VALUES
  ('gri',    'GRI Standards Report',   'GRI 2021',  12),
  ('cdp',    'CDP Climate Disclosure', 'CDP 2024',   8),
  ('stars',  'AASHE STARS Report',     'STARS 2.2',  6),
  ('tcfd',   'TCFD Disclosure',        'TCFD 2023',  4),
  ('custom', 'Custom Monthly Report',  'Internal',  10)
ON CONFLICT (code) DO NOTHING;

INSERT INTO report_kpi_definitions (name, unit, period_label, category) VALUES
  ('Total Energy Consumption', 'MWh',   'FY 2025-26', 'Energy'),
  ('Renewable Energy Share',   '%',     'FY 2025-26', 'Energy'),
  ('Total GHG Emissions',      'tCO2e', 'FY 2025-26', 'Carbon'),
  ('Energy Cost',              '₹',    'FY 2025-26', 'Finance'),
  ('Water Consumption',        'ML',    'FY 2025-26', 'Water'),
  ('Waste Diverted',           '%',     'FY 2025-26', 'Waste')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 26. COMMUNITY, LEADERBOARD, CHALLENGES
-- =============================================================================
INSERT INTO teams (campus_id, name, department_id, badge_emoji) VALUES
  (1, 'Green Guardians',    1, '🌿'),
  (1, 'Solar Squad',        7, '☀️'),
  (1, 'Carbon Crushers',    4, '💚'),
  (1, 'Eco Warriors',       5, '🌍'),
  (1, 'Energy Ninjas',      8, '⚡')
ON CONFLICT DO NOTHING;

INSERT INTO leaderboard_scores (campus_id, entity_type, entity_id, period_label, period_start, period_end, total_points, energy_reduction_pct, carbon_reduction_pct, participation_pct, streak_days, rank, trend)
SELECT
  1, 'team', t.id,
  'Feb 2026',
  '2026-02-01', '2026-02-28',
  ROUND((800 + RANDOM()*400)::numeric)::int,
  ROUND((8  + RANDOM()*12)::numeric, 2),
  ROUND((6  + RANDOM()*10)::numeric, 2),
  ROUND((70 + RANDOM()*25)::numeric, 2),
  ROUND((5  + RANDOM()*25)::numeric)::smallint,
  ROW_NUMBER() OVER (ORDER BY RANDOM())::smallint,
  (ARRAY['up','down','same'])[FLOOR(RANDOM()*3+1)::int]
FROM teams t WHERE t.campus_id = 1;

INSERT INTO eco_challenges (campus_id, title, description, category, duration_label, target_label, max_participants, reward_points, reward_badge, carbon_potential_t, impact_score, status, start_date, end_date) VALUES
  (1, 'Zero Waste Week',
   'Eliminate single-use plastics across all campus canteens and labs for 7 consecutive days.',
   'Waste', '7 days', 'Zero single-use plastic for 7 days',
   200, 500, '♻️ Zero Waste Hero', 12.5, 88,
   'active', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days'),
  (1, 'Bike to Campus Month',
   'Track bike commute days and earn points for every car trip replaced. App-integrated.',
   'Transport', '30 days', '80% of commuters bike at least 3x/week',
   500, 750, '🚲 Green Commuter', 28.0, 82,
   'active', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days'),
  (1, 'Energy Detectives — Lab Shutdown',
   'Report lights and equipment left on after lab hours. Top reporter wins department award.',
   'Energy', '14 days', 'Find and report 50+ energy waste incidents',
   150, 400, '🔍 Energy Detective', 8.2, 75,
   'active', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '11 days'),
  (1, 'Solar Selfie Campaign',
   'Photograph campus solar panels and share on internal platform. Build awareness of renewable capacity.',
   'Renewable', '7 days', '500+ solar selfies shared on EcoVista',
   300, 250, '☀️ Solar Champion', 0.0, 62,
   'upcoming', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days'),
  (1, 'Plant a Tree Drive',
   'Coordinate the planting of 200 trees in the campus biodiversity zone. Track via GPS tags.',
   'Biodiversity', '1 day', 'Plant 200 trees in campus green zones',
   400, 1000, '🌳 Tree Guardian', 40.0, 95,
   'upcoming', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '15 days'),
  (1, 'January Energy Sprint',
   'Each department competes to reduce energy use the most in January. Monitored via smart meters.',
   'Energy', '31 days', 'Departments achieve 10%+ reduction vs baseline',
   800, 600, '⚡ Energy Ninja', 22.0, 90,
   'completed', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '29 days')
ON CONFLICT DO NOTHING;

INSERT INTO community_events (campus_id, title, event_date, location, event_type, max_attendees) VALUES
  (1, 'Sustainability Summit 2026',         CURRENT_DATE + INTERVAL '10 days', 'LHC Auditorium',         'Conference',  500),
  (1, 'Solar Farm Guided Tour',             CURRENT_DATE + INTERVAL '3 days',  'Main Campus Rooftops',   'Tour',         30),
  (1, 'AI for Climate Workshop',            CURRENT_DATE + INTERVAL '7 days',  'IT Block Seminar Hall',  'Workshop',    100),
  (1, 'Green Careers Fair',                 CURRENT_DATE + INTERVAL '21 days', 'Student Activity Center','Fair',        400),
  (1, 'Carbon Footprint Awareness Session', CURRENT_DATE + INTERVAL '5 days',  'Library Multipurpose',   'Seminar',     200)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 27. ADMIN — DATA SOURCES, AUDIT LOGS
-- =============================================================================
INSERT INTO data_sources (campus_id, name, source_type, status, latency_ms, uptime_pct, last_sync_at) VALUES
  (1, 'Smart Meter Network',        'IoT',       'connected', 42,  99.8, NOW() - INTERVAL '2 minutes'),
  (1, 'SCADA Building Controls',    'SCADA',     'connected', 88,  98.2, NOW() - INTERVAL '5 minutes'),
  (1, 'Solar SCADA (Fronius)',       'API',       'connected', 120, 99.1, NOW() - INTERVAL '1 minute'),
  (1, 'Weather API (IMD)',           'REST API',  'connected', 210, 97.5, NOW() - INTERVAL '10 minutes'),
  (1, 'Finance ERP (SAP)',           'ERP',       'degraded',  850, 92.3, NOW() - INTERVAL '2 hours'),
  (1, 'Waste Management Sensors',   'IoT',       'offline',   0,   78.5, NOW() - INTERVAL '6 hours'),
  (1, 'Water Meters (IoT)',         'IoT',       'connected', 65,  98.8, NOW() - INTERVAL '3 minutes'),
  (1, 'AI Engine API',              'Internal',  'connected', 15,  99.9, NOW() - INTERVAL '30 seconds')
ON CONFLICT DO NOTHING;

INSERT INTO audit_logs (campus_id, user_id, user_label, action, log_type) VALUES
  (1, 1, 'Dhruv Agrawal',  'Updated overconsumption alert threshold to 40%',            'config'),
  (1, 6, 'AI System',      'Generated 7 new AI recommendations for campus_id=1',        'action'),
  (1, 2, 'Priya Sharma',   'Acknowledged critical alert: Engineering Block A overconsumption', 'alert'),
  (1, 1, 'Dhruv Agrawal',  'Approved investment: Solar Expansion Phase 2',              'action'),
  (1, 6, 'AI System',      'Energy Demand Forecaster model retrained — accuracy: 91.4%','system'),
  (1, 3, 'Rajesh Kumar',   'Generated GRI Standards Report for Q3 FY2025',             'report'),
  (1, 2, 'Priya Sharma',   'Added 3 new buildings to smart meter network',              'config'),
  (1, 6, 'AI System',      'Anomaly detected: Hostel B night consumption spike',        'alert'),
  (1, 1, 'Dhruv Agrawal',  'Enabled AI autonomous HVAC control for Engineering Block', 'config'),
  (1, 6, 'AI System',      'Carbon Emission Predictor monthly re-training completed',   'system')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 28. MISSION CONTROL
-- =============================================================================
INSERT INTO mission_decisions (campus_id, decision_key, label, emission_reduction_pct, cost_saving_lakhs_yr, years_accelerated, icon_name, sort_order) VALUES
  (1, 'solar',    '100% Solar by 2028',     12, 450, 4, 'Zap',       1),
  (1, 'ev',       'Full EV Fleet',           6, 280, 2, 'Rocket',    2),
  (1, 'retrofit', 'Deep Building Retrofit',  9, 620, 3, 'Leaf',      3),
  (1, 'demand',   'AI Demand Response',      4, 120, 1, 'Brain',     4),
  (1, 'biomass',  'Biomass Energy',          7, 350, 2, 'TrendingDown', 5),
  (1, 'storage',  '10MWh Battery Storage',   5, 180, 2, 'TrendingUp',  6)
ON CONFLICT (campus_id, decision_key) DO NOTHING;

INSERT INTO mission_insights (campus_id, insight, is_active, sort_order) VALUES
  (1, 'If all 6 decisions are activated at full intensity, net-zero is achievable by 2029 — 6 years ahead of target.', true, 1),
  (1, 'Solar + Deep Retrofit combination delivers 21% emission reduction with ₹10.7 Cr/year in combined savings.', true, 2),
  (1, 'AI Demand Response has the lowest cost but highest adoption speed — ideal as the first lever to activate.', true, 3),
  (1, 'Battery Storage enables time-shifting of solar surplus to peak hours, amplifying all other decisions by 15%.', true, 4),
  (1, 'Full EV Fleet transition eliminates 6% of campus emissions and qualifies for FAME II subsidies of ₹1.8 Cr.', true, 5)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 29. BADGES (already in schema seed — safe to re-run)
-- =============================================================================
INSERT INTO badges (name, icon_emoji, requirement) VALUES
  ('Carbon Warrior',   '🌍', 'Reduce 100kg CO2'),
  ('Solar Champion',   '☀️', 'Promote solar adoption'),
  ('Zero Waste Hero',  '♻️', 'Complete Zero Waste Week'),
  ('Green Commuter',   '🚲', '30 bike commute days'),
  ('Energy Detective', '🔍', 'Report 10+ waste points'),
  ('Tree Guardian',    '🌳', 'Plant & adopt a tree')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- DONE! All tables seeded for campus_id = 1 (IIT Delhi)
-- =============================================================================
