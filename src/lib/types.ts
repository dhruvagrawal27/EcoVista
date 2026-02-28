// ============================================================
// EcoVista — Database Row Types (mirrors schema.sql exactly)
// ============================================================

export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  type: "academic" | "administrative" | "operational";
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  phone: string | null;
  employee_id: string | null;
  avatar_url: string | null;
  role_id: number;
  department_id: number | null;
  status: "active" | "inactive" | "suspended";
  two_fa_enabled: boolean;
  two_fa_secret: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: number;
  user_id: number;
  token_hash: string;
  device: string | null;
  location: string | null;
  ip_address: string | null;
  is_current: boolean;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
}

export interface UserNotificationPreferences {
  id: number;
  user_id: number;
  email_critical_alerts: boolean;
  email_daily_summary: boolean;
  email_weekly_report: boolean;
  email_monthly_brief: boolean;
  email_ai_recommendations: boolean;
  push_critical_alerts: boolean;
  push_equipment_warnings: boolean;
  push_challenge_milestones: boolean;
  push_community_activity: boolean;
  updated_at: string;
}

export interface UserDisplayPreferences {
  id: number;
  user_id: number;
  data_density: "compact" | "comfortable" | "spacious";
  executive_mode: boolean;
  operational_mode: boolean;
  show_confidence_indicators: boolean;
  animate_chart_transitions: boolean;
  default_time_range: "1h" | "24h" | "7d" | "30d";
  updated_at: string;
}

export interface UserAIPreferences {
  id: number;
  user_id: number;
  recommendation_aggressiveness: number;
  automation_suggestions: boolean;
  autonomous_hvac_control: boolean;
  predictive_maintenance_alerts: boolean;
  auto_optimize_solar: boolean;
  smart_load_balancing: boolean;
  preferred_forecast_model: "lstm" | "xgboost" | "ensemble";
  confidence_threshold: number;
  updated_at: string;
}

export interface Campus {
  id: number;
  name: string;
  net_zero_progress: number | null;
  target_year: number | null;
  total_buildings: number | null;
  total_students: number | null;
  solar_capacity_mw: number | null;
  campus_area_acres: number | null;
  baseline_emissions: number | null;
  current_emissions: number | null;
  reduction_rate: number | null;
  on_track: boolean;
  updated_at: string;
}

export interface Building {
  id: number;
  campus_id: number;
  code: string | null;
  name: string;
  building_type: "academic" | "lab" | "admin" | "residential" | "sports" | "library" | "it" | "utility";
  floors: number | null;
  area_sqm: number | null;
  year_built: number | null;
  eui: number | null;
  hvac_score: number | null;
  carbon_score: number | null;
  maintenance_score: number | null;
  occupancy_rate: number | null;
  is_green_certified: boolean;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface Hostel {
  id: number;
  campus_id: number;
  name: string;
  capacity: number | null;
  created_at: string;
}

export interface EnergyReading {
  id: number;
  campus_id: number;
  building_id: number | null;
  recorded_at: string;
  actual_kw: number | null;
  predicted_kw: number | null;
  solar_kw: number | null;
  wind_kw: number | null;
  battery_kw: number | null;
  grid_import_kw: number | null;
  total_demand_kw: number | null;
}

export interface EnergyDailySummary {
  id: number;
  campus_id: number;
  building_id: number | null;
  summary_date: string;
  total_kwh: number | null;
  solar_kwh: number | null;
  wind_kwh: number | null;
  grid_kwh: number | null;
  battery_charged_kwh: number | null;
  peak_demand_kw: number | null;
  cost_inr: number | null;
  carbon_kg: number | null;
}

export interface EnergyCostDaily {
  id: number;
  campus_id: number;
  cost_date: string;
  cost_inr: number;
  weekday: string | null;
}

export interface Equipment {
  id: number;
  building_id: number;
  name: string;
  equipment_type: string | null;
  capacity_kw: number | null;
  installed_at: string | null;
  is_smart: boolean;
  created_at: string;
}

export interface EquipmentLoadReading {
  id: number;
  equipment_id: number;
  recorded_at: string;
  load_kw: number;
  status: "normal" | "medium" | "high" | "fault";
}

export interface EnergyRiskScore {
  id: number;
  campus_id: number;
  recorded_date: string;
  overall_score: number | null;
  grid_dependency: number | null;
  peak_volatility: number | null;
  weather_exposure: number | null;
  overconsumption_freq: number | null;
  equipment_age: number | null;
  stability_index: number | null;
  thirty_day_variance: number | null;
}

export interface BenchmarkData {
  id: number;
  campus_id: number;
  metric_name: string;
  campus_value: number | null;
  national_avg: number | null;
  recorded_year: number;
}

export interface LoadProfile {
  id: number;
  campus_id: number;
  profile_date: string;
  day_type: "weekday" | "weekend" | "holiday";
  hour: number;
  load_kw: number | null;
}

export interface EnergyForecast {
  id: number;
  campus_id: number;
  forecast_from: string;
  forecast_at: string;
  predicted_kw: number | null;
  upper_bound_kw: number | null;
  lower_bound_kw: number | null;
  actual_kw: number | null;
  model_version: string | null;
}

export interface ForecastAccuracyDaily {
  id: number;
  campus_id: number;
  report_date: string;
  accuracy: number | null;
  drift: number | null;
}

export interface RetrofitSuggestion {
  id: number;
  campus_id: number;
  building_id: number | null;
  action: string;
  estimated_cost: number | null;
  annual_saving: number | null;
  payback_years: number | null;
  carbon_reduction_tons: number | null;
  ai_generated: boolean;
  status: "proposed" | "approved" | "in-progress" | "completed" | "rejected";
  created_at: string;
}

export interface GridState {
  id: number;
  campus_id: number;
  recorded_at: string;
  solar_current_kw: number | null;
  solar_capacity_kw: number | null;
  wind_current_kw: number | null;
  wind_capacity_kw: number | null;
  battery_charge_pct: number | null;
  battery_capacity_kwh: number | null;
  battery_status: "idle" | "charging" | "discharging";
  grid_import_kw: number | null;
  is_grid_importing: boolean;
  total_demand_kw: number | null;
  predicted_demand_kw: number | null;
}

export interface CarbonScopeReading {
  id: number;
  campus_id: number;
  recorded_month: string;
  scope: 1 | 2 | 3;
  source_name: string;
  value_tco2e: number;
  trend_pct: number | null;
}

export interface CarbonMonthlyTrend {
  id: number;
  campus_id: number;
  trend_month: string;
  actual_tco2e: number | null;
  target_tco2e: number | null;
  forecast_tco2e: number | null;
}

export interface NetzeroMilestone {
  id: number;
  campus_id: number;
  milestone_year: number;
  target_tco2e: number | null;
  actual_tco2e: number | null;
  status: "achieved" | "on-track" | "planned" | "at-risk";
}

export interface CarbonScenario {
  id: number;
  campus_id: number;
  name: string;
  impact_tco2e_yr: number;
  timeline_months: number | null;
  cost_inr: number | null;
  feasibility_pct: number | null;
  status: "proposed" | "approved" | "in-progress" | "completed" | "rejected";
  created_by: number | null;
  created_at: string;
}

export interface CarbonDaily {
  id: number;
  campus_id: number;
  reading_date: string;
  total_kg_co2e: number;
  scope1_kg: number | null;
  scope2_kg: number | null;
  scope3_kg: number | null;
}

export interface SolarArray {
  id: number;
  building_id: number;
  name: string;
  panel_count: number | null;
  capacity_kw: number | null;
  installed_at: string | null;
  manufacturer: string | null;
  status: "optimal" | "degraded" | "offline" | "maintenance";
  created_at: string;
}

export interface SolarArrayReading {
  id: number;
  array_id: number;
  recorded_at: string;
  efficiency_pct: number | null;
  generation_kw: number | null;
  temperature_c: number | null;
  irradiance: number | null;
}

export interface WindTurbine {
  id: number;
  campus_id: number;
  name: string;
  capacity_kw: number | null;
  hub_height_m: number | null;
  installed_at: string | null;
  status: "active" | "offline" | "maintenance";
}

export interface BatterySystem {
  id: number;
  campus_id: number;
  name: string;
  capacity_kwh: number | null;
  max_power_kw: number | null;
  chemistry: string | null;
  installed_at: string | null;
  status: "active" | "offline" | "maintenance";
}

export interface BatteryReading {
  id: number;
  battery_id: number;
  recorded_at: string;
  charge_pct: number | null;
  power_kw: number | null;
  temperature_c: number | null;
}

export interface RenewableMonthlyGeneration {
  id: number;
  campus_id: number;
  gen_month: string;
  solar_kwh: number | null;
  wind_kwh: number | null;
  total_kwh: number | null;
  grid_offset_pct: number | null;
}

export interface FinanceSnapshot {
  id: number;
  campus_id: number;
  snapshot_date: string;
  total_investment: number | null;
  annual_savings: number | null;
  npv_10yr: number | null;
  irr_pct: number | null;
  payback_years: number | null;
  carbon_credits_inr: number | null;
  subsidies_inr: number | null;
}

export interface Investment {
  id: number;
  campus_id: number;
  name: string;
  cost_cr: number | null;
  impact_score: number | null;
  roi_pct: number | null;
  status: "proposed" | "approved" | "in-progress" | "completed" | "rejected";
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
}

export interface CapitalProjection {
  id: number;
  campus_id: number;
  projection_year: number;
  investment_inr: number | null;
  savings_inr: number | null;
  cumulative_inr: number | null;
}

export interface Subsidy {
  id: number;
  campus_id: number;
  name: string;
  amount_inr: number;
  status: "eligible" | "applied" | "approved" | "active" | "expired" | "rejected";
  deadline: string | null;
  deadline_text: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CarbonCreditForecast {
  id: number;
  campus_id: number;
  forecast_year: number;
  credits_inr: number;
}

export interface SustainabilityScore {
  id: number;
  campus_id: number;
  score_date: string;
  overall_score: number | null;
  energy_efficiency: number | null;
  carbon_reduction: number | null;
  renewable_share: number | null;
  water_conservation: number | null;
  waste_management: number | null;
  biodiversity: number | null;
  energy_trend: number | null;
  carbon_trend: number | null;
  renewable_trend: number | null;
  water_trend: number | null;
  waste_trend: number | null;
  biodiversity_trend: number | null;
}

export interface SdgScore {
  id: number;
  campus_id: number;
  score_date: string;
  sdg_number: number;
  sdg_name: string | null;
  score: number | null;
}

export interface KpiRiskIndicator {
  id: number;
  campus_id: number;
  kpi_name: string;
  current_value: number;
  target_value: number;
  unit: string | null;
  status: "on-track" | "at-risk" | "critical" | "achieved";
  deadline_label: string | null;
  deadline_date: string | null;
  updated_at: string;
}

export interface KpiIndicator {
  id: number;
  campus_id: number;
  name: string;
  indicator_type: "leading" | "lagging";
  description: string | null;
}

export interface AIRecommendation {
  id: number;
  campus_id: number;
  title: string;
  description: string | null;
  category: string | null;
  roi_pct: number | null;
  carbon_impact: number | null;
  ease_score: number | null;
  confidence_pct: number | null;
  status: "new" | "in-review" | "approved" | "implemented" | "rejected";
  adoption_rate: number | null;
  impact_cost: string | null;
  impact_carbon: string | null;
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export interface AIRecommendationAction {
  id: number;
  recommendation_id: number;
  user_id: number;
  action: "approved" | "rejected" | "implemented" | "deferred";
  notes: string | null;
  acted_at: string;
}

export interface MLModel {
  id: number;
  name: string;
  version: string;
  accuracy_pct: number | null;
  last_trained_at: string | null;
  status: "staging" | "production" | "deprecated" | "archived";
  total_predictions: number;
  model_type: string | null;
  deployed_at: string | null;
  created_at: string;
}

export interface MLModelPerformance {
  id: number;
  model_id: number;
  report_date: string;
  accuracy: number | null;
  predictions: number | null;
}

export interface AITrustScore {
  id: number;
  campus_id: number;
  score_date: string;
  overall_score: number | null;
  prediction_accuracy: number | null;
  data_quality: number | null;
  model_stability: number | null;
  recommendation_relevance: number | null;
}

export interface Alert {
  id: number;
  campus_id: number;
  building_id: number | null;
  equipment_id: number | null;
  alert_type: "critical" | "warning" | "info";
  title: string;
  description: string | null;
  location_label: string | null;
  status: "active" | "acknowledged" | "resolved" | "auto-resolved";
  acknowledged_by: number | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface RoadmapPhase {
  id: number;
  campus_id: number;
  phase_number: number;
  name: string;
  start_date: string;
  end_date: string;
  progress_pct: number;
  budget_inr: number | null;
  spent_inr: number;
  risk_level: "low" | "medium" | "high" | "critical";
  created_at: string;
  updated_at: string;
}

export interface RoadmapMilestone {
  id: number;
  phase_id: number;
  name: string;
  target_date: string;
  is_done: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface RiskRegister {
  id: number;
  campus_id: number;
  phase_id: number | null;
  risk_description: string;
  impact: "low" | "medium" | "high" | "critical";
  probability: "low" | "medium" | "high";
  mitigation: string | null;
  owner_label: string | null;
  owner_user_id: number | null;
  status: "open" | "mitigated" | "closed";
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  campus_id: number;
  name: string;
  summary: string | null;
  category: string | null;
  status: "Planned" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
  budget_inr: number | null;
  spent_inr: number;
  carbon_reduction_t_yr: number | null;
  roi_pct: number | null;
  timeline_pct: number;
  risk_level: "Low" | "Medium" | "High";
  ai_score: number | null;
  npv_inr: number | null;
  irr_pct: number | null;
  payback_years: number | null;
  start_date: string | null;
  end_date: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  name: string;
  is_done: boolean;
  completed_at: string | null;
  sort_order: number;
}

export interface ProjectDependency {
  id: number;
  project_id: number;
  depends_on_label: string;
  depends_on_project_id: number | null;
}

export interface ProjectEmissionProjection {
  id: number;
  project_id: number;
  projection_year: number;
  emissions_tons: number | null;
  savings_inr: number | null;
}

export interface ReportTemplate {
  id: number;
  code: string;
  name: string;
  standard: string | null;
  section_count: number | null;
  created_at: string;
}

export interface ReportKpiDefinition {
  id: number;
  name: string;
  unit: string | null;
  period_label: string | null;
  category: string | null;
}

export interface Report {
  id: number;
  campus_id: number;
  template_id: number;
  generated_by: number | null;
  period_label: string | null;
  file_path: string | null;
  file_size_kb: number | null;
  status: "pending" | "generating" | "completed" | "failed";
  scheduled_at: string | null;
  generated_at: string | null;
  created_at: string;
}

export interface ReportKpiInclusion {
  id: number;
  report_id: number;
  kpi_id: number;
  value_text: string | null;
  change_pct: number | null;
}

export interface ReportSchedule {
  id: number;
  campus_id: number;
  template_id: number;
  created_by: number | null;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  next_run_at: string | null;
  recipients: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface Team {
  id: number;
  campus_id: number;
  name: string;
  department_id: number | null;
  badge_emoji: string | null;
  created_at: string;
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  joined_at: string;
}

export interface LeaderboardScore {
  id: number;
  campus_id: number;
  entity_type: "team" | "department" | "building" | "hostel";
  entity_id: number;
  period_label: string | null;
  period_start: string | null;
  period_end: string | null;
  total_points: number;
  energy_reduction_pct: number | null;
  carbon_reduction_pct: number | null;
  participation_pct: number | null;
  waste_diversion_pct: number | null;
  streak_days: number;
  rank: number | null;
  trend: "up" | "down" | "same";
  hall_of_fame: boolean;
  computed_at: string;
}

export interface EcoChallenge {
  id: number;
  campus_id: number;
  title: string;
  description: string | null;
  category: string | null;
  duration_label: string | null;
  target_label: string | null;
  max_participants: number | null;
  reward_points: number | null;
  reward_badge: string | null;
  carbon_potential_t: number | null;
  impact_score: number | null;
  status: "upcoming" | "active" | "completed" | "cancelled";
  start_date: string | null;
  end_date: string;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengeParticipant {
  id: number;
  challenge_id: number;
  user_id: number;
  team_id: number | null;
  department_id: number | null;
  joined_at: string;
  completed: boolean;
  completed_at: string | null;
  points_earned: number;
}

export interface ChallengeDepartmentStat {
  id: number;
  challenge_id: number;
  department_id: number;
  participation_pct: number | null;
}

export interface CommunityEvent {
  id: number;
  campus_id: number;
  title: string;
  event_date: string;
  location: string | null;
  event_type: string | null;
  max_attendees: number | null;
  created_by: number | null;
  created_at: string;
}

export interface EventRsvp {
  id: number;
  event_id: number;
  user_id: number;
  rsvped_at: string;
  attended: boolean;
}

export interface Badge {
  id: number;
  name: string;
  icon_emoji: string | null;
  requirement: string | null;
  created_at: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  challenge_id: number | null;
  awarded_at: string;
}

export interface PlatformConfig {
  id: number;
  campus_id: number;
  config_key: string;
  config_value: string;
  config_group: string | null;
  label: string | null;
  updated_by: number | null;
  updated_at: string;
}

export interface AlertConfig {
  id: number;
  campus_id: number;
  critical_auto_escalate: boolean;
  email_on_warning: boolean;
  sms_on_critical: boolean;
  auto_acknowledge_info: boolean;
  updated_at: string;
}

export interface DataSource {
  id: number;
  campus_id: number;
  name: string;
  source_type: string | null;
  endpoint_url: string | null;
  api_key_hash: string | null;
  status: "connected" | "degraded" | "offline";
  latency_ms: number | null;
  uptime_pct: number | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  campus_id: number;
  user_id: number | null;
  user_label: string | null;
  action: string;
  log_type: "alert" | "config" | "action" | "system" | "report";
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface MissionDecision {
  id: number;
  campus_id: number;
  decision_key: string;
  label: string;
  emission_reduction_pct: number | null;
  cost_saving_lakhs_yr: number | null;
  years_accelerated: number | null;
  icon_name: string | null;
  sort_order: number;
}

export interface MissionSimulation {
  id: number;
  campus_id: number;
  user_id: number | null;
  simulation_name: string | null;
  time_range_yrs: number;
  decisions_json: Record<string, boolean>;
  optimized_year: number | null;
  emission_reduction_pct: number | null;
  cost_saving_lakhs_yr: number | null;
  years_accelerated: number | null;
  confidence_pct: number | null;
  created_at: string;
}

export interface MissionInsight {
  id: number;
  campus_id: number;
  insight: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface LiveMetric {
  id: number;
  campus_id: number;
  recorded_at: string;
  energy_saved_kwh: number | null;
  carbon_reduced_kg: number | null;
  solar_generated_kwh: number | null;
  cost_saved_inr: number | null;
}
