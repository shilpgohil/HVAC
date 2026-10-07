export interface OduUnit {
  id: string;
  name: string;
  state: 'ON' | 'OFF';
  power_kw: number;
  fan_rpm: number;
  temp_c: number;
  circuit?: number;
  pressure_mpa?: number;
}

export interface HeaterUnit {
  id: string;
  name: string;
  state: 'ON' | 'OFF';
  power_kw: number;
  temp_c: number;
  stage?: number;
  current_a?: number;
}

export interface AhuUnit {
  id: string;
  name: string;
  state: 'ON' | 'OFF';
  airflow_cfm: number;
  fan_vfd_hz: number;
  filter_dp_pa: number;
  humidifier_active?: boolean;
  dehumidifier_active?: boolean;
}

export interface Temperatures {
  current_c: number;
  set_point_c: number;
  supply_c: number;
  return_c: number;
  unit: string;
}

export interface Humidity {
  current_rh: number;
  set_point_rh: number;
  unit: string;
  humidifier_active: boolean;
  dehumidifier_active: boolean;
}

export interface SystemInfo {
  total_ahu: number;
  total_odu: number;
  total_heater: number;
  total_power_kw: number;
  system_mode: string;
  plc_online: boolean;
  status_text: string;
}

export interface AlarmItem {
  id: string;
  component_code: string;
  severity: 'WARNING' | 'CRITICAL' | 'INFO';
  state: 'ACTIVE' | 'ACKNOWLEDGED' | 'CLEARED';
  condition: string;
  message: string;
  triggered_at: string;
  acknowledged_by?: string | null;
}

export interface SystemState {
  timestamp: string;
  ahu: AhuUnit;
  odu_summary: {
    running: number;
    total: number;
    standby: number;
    units: OduUnit[];
  };
  heater_summary: {
    running: number;
    total: number;
    standby: number;
    units: HeaterUnit[];
  };
  temperatures: Temperatures;
  humidity?: Humidity;
  system_info: SystemInfo;
  alarms: AlarmItem[];
}

export interface ElectricalPanel {
  id: string;
  name: string;
  color: string;
  status: string;
  voltage_ll_v: number;
  voltage_ln_v: number;
  current_avg_a: number;
  active_power_kw: number;
  apparent_power_kva: number;
  reactive_power_kvar: number;
  power_factor: number;
  frequency_hz: number;
  energy_today_kwh: number;
  load_pct: number;
}

export interface ElectricalState {
  timestamp: string;
  date_str: string;
  online: boolean;
  kpis: {
    total_plant_power_kw: number;
    total_current_a: number;
    avg_power_factor: number;
    total_energy_today_kwh: number;
  };
  panels: ElectricalPanel[];
  power_trend: { time: string; power_kw: number }[];
}

export interface HomeIotDevice {
  id: string;
  name: string;
  type: 'light' | 'climate' | 'appliance' | 'charger' | 'cover' | 'fan' | 'plug' | 'valve' | 'inverter' | 'battery';
  state: boolean;
  level?: number;
  power_w: number;
  speed?: string;
}

export interface HomeIotRoom {
  id: string;
  name: string;
  area_sqm: number;
  temp_c: number;
  target_temp_c?: number;
  humidity_rh?: number;
  ambient_lux?: number;
  motion?: boolean;
  water_leak_detected?: boolean;
  garage_door_closed?: boolean;
  ev_connected?: boolean;
  ev_charging?: boolean;
  ev_battery_soc?: number;
  solar_pv_kw?: number;
  battery_flow_kw?: number;
  battery_soc_pct?: number;
  ac_mode?: string;
  devices: HomeIotDevice[];
}

export interface HomeIotActivity {
  id: string;
  time: string;
  category: string;
  room: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
}

export interface HomeIotScene {
  id: string;
  name: string;
  active: boolean;
}

export interface HomeIotState {
  timestamp: string;
  online: boolean;
  security_mode: 'ARMED_AWAY' | 'ARMED_HOME' | 'DISARMED';
  active_scene: string;
  kpis: {
    total_power_kw: number;
    solar_generation_kw: number;
    grid_net_kw: number;
    battery_soc_pct: number;
    avg_indoor_temp_c: number;
    avg_indoor_humidity_rh: number;
    active_devices_count: number;
    total_devices_count: number;
    air_quality_iaq: string;
    water_leak_status: string;
  };
  rooms: HomeIotRoom[];
  scenes: HomeIotScene[];
  activities: HomeIotActivity[];
}
