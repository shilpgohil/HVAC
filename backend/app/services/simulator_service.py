import math
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional


class ThermodynamicSimulator:
    def __init__(self):
        self.tick_count: int = 0
        
        self.ahu_state: str = "ON"
        self.ahu_airflow_cfm: float = 14500.0
        self.fan_vfd_hz: float = 50.0
        
        self.odus: List[Dict[str, Any]] = [
            {"id": "ODU-01", "name": "ODU-1", "state": "ON", "power_kw": 18.2, "fan_rpm": 820, "temp_c": 32.5, "circuit": 1, "pressure_mpa": 1.85},
            {"id": "ODU-02", "name": "ODU-2", "state": "ON", "power_kw": 17.8, "fan_rpm": 810, "temp_c": 32.1, "circuit": 1, "pressure_mpa": 1.82},
            {"id": "ODU-03", "name": "ODU-3", "state": "ON", "power_kw": 18.5, "fan_rpm": 830, "temp_c": 33.0, "circuit": 2, "pressure_mpa": 1.88},
            {"id": "ODU-04", "name": "ODU-4", "state": "OFF", "power_kw": 0.0, "fan_rpm": 0, "temp_c": 28.0, "circuit": 2, "pressure_mpa": 0.95},
            {"id": "ODU-05", "name": "ODU-5", "state": "ON", "power_kw": 18.0, "fan_rpm": 815, "temp_c": 32.4, "circuit": 3, "pressure_mpa": 1.84},
            {"id": "ODU-06", "name": "ODU-6", "state": "ON", "power_kw": 18.4, "fan_rpm": 825, "temp_c": 32.8, "circuit": 3, "pressure_mpa": 1.86}
        ]
        
        self.heaters: List[Dict[str, Any]] = [
            {"id": "HTR-01", "name": "HTR-01", "state": "ON", "power_kw": 3.0, "temp_c": 52.5, "stage": 1, "current_a": 13.0},
            {"id": "HTR-02", "name": "HTR-02", "state": "ON", "power_kw": 2.9, "temp_c": 51.8, "stage": 2, "current_a": 12.8},
            {"id": "HTR-03", "name": "HTR-03", "state": "ON", "power_kw": 3.0, "temp_c": 53.0, "stage": 3, "current_a": 13.1},
            {"id": "HTR-04", "name": "HTR-04", "state": "ON", "power_kw": 2.8, "temp_c": 50.4, "stage": 4, "current_a": 12.4},
            {"id": "HTR-05", "name": "HTR-05", "state": "ON", "power_kw": 3.0, "temp_c": 52.2, "stage": 5, "current_a": 13.0},
            {"id": "HTR-06", "name": "HTR-06", "state": "ON", "power_kw": 2.9, "temp_c": 51.5, "stage": 6, "current_a": 12.7},
            {"id": "HTR-07", "name": "HTR-07", "state": "ON", "power_kw": 3.0, "temp_c": 52.8, "stage": 7, "current_a": 13.1},
            {"id": "HTR-08", "name": "HTR-08", "state": "ON", "power_kw": 2.8, "temp_c": 50.9, "stage": 8, "current_a": 12.5}
        ]
        
        # Temperature Controls (°C)
        self.set_point_c: float = 22.0
        self.current_temp_c: float = 24.4
        self.supply_temp_c: float = 18.2
        self.return_temp_c: float = 26.7
        
        # Relative Humidity Controls (% RH)
        self.humidity_setpoint_pct: float = 50.0
        self.humidity_current_pct: float = 48.5
        self.humidifier_active: bool = False
        self.dehumidifier_active: bool = False
        
        self.co2_ppm: float = 485.0
        self.duct_dp_pa: float = 120.0
        
        self.system_mode: str = "Auto"
        self.plc_connected: bool = True
        self.plc_latency_ms: float = 14.2
        
        self.alarms: List[Dict[str, Any]] = [
            {
                "id": "ALM-ODU-04",
                "component_code": "ODU-04",
                "severity": "WARNING",
                "state": "ACTIVE",
                "condition": "STANDBY_OFF",
                "message": "ODU standby reserve circuit",
                "triggered_at": "26 Aug 2026 12:32 PM",
                "acknowledged_by": None
            }
        ]
        
        self.live_history: List[Dict[str, Any]] = []
        self._init_history()

    def _init_history(self):
        now = datetime.now()
        for i in range(24, 0, -1):
            t = now - timedelta(hours=i)
            hour_str = t.strftime("%I:00 %p").lstrip("0")
            variation = 0.6 * math.sin(i * 0.45)
            self.live_history.append({
                "time": hour_str,
                "timestamp": t.isoformat(),
                "supply_c": round(17.8 + variation * 0.7, 1),
                "return_c": round(25.8 + variation * 0.9, 1),
                "set_point_c": 22.0,
                "current_c": round(24.2 + variation * 0.5, 1),
                "rh_pct": round(48.5 + variation * 1.5, 1),
                "rh_setpoint_pct": 50.0
            })

    def set_ahu_state(self, state: str) -> str:
        self.ahu_state = "ON" if state.upper() == "ON" else "OFF"
        if self.ahu_state == "OFF":
            self.fan_vfd_hz = 0.0
            self.ahu_airflow_cfm = 0.0
            self.duct_dp_pa = 5.0
        else:
            self.fan_vfd_hz = 50.0
            self.ahu_airflow_cfm = 14500.0
            self.duct_dp_pa = 120.0
        return self.ahu_state

    def set_odu_state(self, odu_id: str, state: str) -> Optional[Dict[str, Any]]:
        target_state = "ON" if state.upper() == "ON" else "OFF"
        for odu in self.odus:
            if odu["id"] == odu_id or odu["name"] == odu_id:
                odu["state"] = target_state
                odu["power_kw"] = 18.0 if target_state == "ON" else 0.0
                odu["fan_rpm"] = 820 if target_state == "ON" else 0
                odu["temp_c"] = 32.5 if target_state == "ON" else 28.0
                odu["pressure_mpa"] = 1.85 if target_state == "ON" else 0.95
                
                alarm_id = f"ALM-{odu['id']}"
                if target_state == "OFF":
                    if not any(a["id"] == alarm_id for a in self.alarms):
                        now_str = datetime.now().strftime("%d %b %Y %I:%M %p")
                        self.alarms.append({
                            "id": alarm_id,
                            "component_code": odu["name"],
                            "severity": "WARNING",
                            "state": "ACTIVE",
                            "condition": "ODU_STOPPED",
                            "message": f"{odu['name']} not running",
                            "triggered_at": now_str,
                            "acknowledged_by": None
                        })
                else:
                    self.alarms = [a for a in self.alarms if a["id"] != alarm_id]
                return odu
        return None

    def set_heater_state(self, heater_id: str, state: str) -> Optional[Dict[str, Any]]:
        target_state = "ON" if state.upper() == "ON" else "OFF"
        for htr in self.heaters:
            if htr["id"] == heater_id or htr["name"] == heater_id:
                htr["state"] = target_state
                htr["power_kw"] = 3.0 if target_state == "ON" else 0.0
                htr["temp_c"] = 52.0 if target_state == "ON" else 24.0
                htr["current_a"] = 13.0 if target_state == "ON" else 0.0
                
                alarm_id = f"ALM-{htr['id']}"
                if target_state == "OFF":
                    if not any(a["id"] == alarm_id for a in self.alarms):
                        now_str = datetime.now().strftime("%d %b %Y %I:%M %p")
                        self.alarms.append({
                            "id": alarm_id,
                            "component_code": htr["name"],
                            "severity": "WARNING",
                            "state": "ACTIVE",
                            "condition": "HEATER_OFF",
                            "message": f"{htr['name']} standby/off status",
                            "triggered_at": now_str,
                            "acknowledged_by": None
                        })
                else:
                    self.alarms = [a for a in self.alarms if a["id"] != alarm_id]
                return htr
        return None

    def set_target_temperature(self, target_c: float) -> float:
        self.set_point_c = round(max(16.0, min(30.0, target_c)), 1)
        return self.set_point_c

    def set_target_humidity(self, target_rh: float) -> float:
        self.humidity_setpoint_pct = round(max(30.0, min(75.0, target_rh)), 1)
        return self.humidity_setpoint_pct

    def set_system_mode(self, mode: str) -> str:
        self.system_mode = mode
        return self.system_mode

    def acknowledge_alarm(self, alarm_id: str, user: str = "admin") -> bool:
        for a in self.alarms:
            if a["id"] == alarm_id:
                a["state"] = "ACKNOWLEDGED"
                a["acknowledged_by"] = user
                return True
        return False

    def clear_alarm(self, alarm_id: str) -> bool:
        initial_len = len(self.alarms)
        self.alarms = [a for a in self.alarms if a["id"] != alarm_id]
        return len(self.alarms) < initial_len

    def get_history(self, range_code: str = "12H") -> List[Dict[str, Any]]:
        counts = {"1H": 6, "6H": 12, "12H": 12, "24H": 24}
        num_points = counts.get(range_code, 12)
        if len(self.live_history) <= num_points:
            return self.live_history
        return self.live_history[-num_points:]

    def get_electrical_state(self) -> Dict[str, Any]:
        t = self.tick_count
        noise = 0.02 * math.sin(t * 0.25)
        
        panels = [
            {
                "id": "panel-1",
                "name": "Panel 1",
                "color": "#2563EB",
                "status": "Online",
                "voltage_ll_v": round(415.0 + noise * 5, 0),
                "voltage_ln_v": round(240.0 + noise * 3, 0),
                "current_avg_a": round(182.0 + noise * 4, 0),
                "active_power_kw": 142.8,
                "apparent_power_kva": 160.5,
                "reactive_power_kvar": 72.3,
                "power_factor": 0.89,
                "frequency_hz": 50.02,
                "energy_today_kwh": 986,
                "load_pct": 16.9
            },
            {
                "id": "panel-2",
                "name": "Panel 2",
                "color": "#10B981",
                "status": "Online",
                "voltage_ll_v": round(418.0 + noise * 4, 0),
                "voltage_ln_v": round(246.0 + noise * 3, 0),
                "current_avg_a": round(156.0 + noise * 3, 0),
                "active_power_kw": 121.4,
                "apparent_power_kva": 138.7,
                "reactive_power_kvar": 61.2,
                "power_factor": 0.88,
                "frequency_hz": 50.01,
                "energy_today_kwh": 864,
                "load_pct": 14.3
            },
            {
                "id": "panel-3",
                "name": "Panel 3",
                "color": "#F59E0B",
                "status": "Online",
                "voltage_ll_v": round(416.0 + noise * 3, 0),
                "voltage_ln_v": round(242.0 + noise * 2, 0),
                "current_avg_a": round(134.0 + noise * 2, 0),
                "active_power_kw": 98.7,
                "apparent_power_kva": 112.6,
                "reactive_power_kvar": 68.9,
                "power_factor": 0.87,
                "frequency_hz": 50.00,
                "energy_today_kwh": 712,
                "load_pct": 11.7
            },
            {
                "id": "panel-4",
                "name": "Panel 4",
                "color": "#8B5CF6",
                "status": "Online",
                "voltage_ll_v": round(420.0 + noise * 4, 0),
                "voltage_ln_v": round(242.0 + noise * 3, 0),
                "current_avg_a": round(168.0 + noise * 3, 0),
                "active_power_kw": 132.6,
                "apparent_power_kva": 150.8,
                "reactive_power_kvar": 66.7,
                "power_factor": 0.88,
                "frequency_hz": 50.02,
                "energy_today_kwh": 925,
                "load_pct": 15.7
            },
            {
                "id": "panel-5",
                "name": "Panel 5",
                "color": "#EF4444",
                "status": "Online",
                "voltage_ll_v": round(417.0 + noise * 3, 0),
                "voltage_ln_v": round(240.0 + noise * 2, 0),
                "current_avg_a": round(145.0 + noise * 2, 0),
                "active_power_kw": 110.2,
                "apparent_power_kva": 126.4,
                "reactive_power_kvar": 57.8,
                "power_factor": 0.87,
                "frequency_hz": 50.01,
                "energy_today_kwh": 801,
                "load_pct": 13.0
            },
            {
                "id": "panel-6",
                "name": "Panel 6",
                "color": "#06B6D4",
                "status": "Online",
                "voltage_ll_v": round(419.0 + noise * 3, 0),
                "voltage_ln_v": round(242.0 + noise * 2, 0),
                "current_avg_a": round(121.0 + noise * 2, 0),
                "active_power_kw": 89.6,
                "apparent_power_kva": 103.2,
                "reactive_power_kvar": 42.5,
                "power_factor": 0.87,
                "frequency_hz": 50.00,
                "energy_today_kwh": 658,
                "load_pct": 10.6
            },
            {
                "id": "panel-7",
                "name": "Panel 7",
                "color": "#EC4899",
                "status": "Online",
                "voltage_ll_v": round(421.0 + noise * 3, 0),
                "voltage_ln_v": round(244.0 + noise * 2, 0),
                "current_avg_a": round(134.0 + noise * 2, 0),
                "active_power_kw": 101.7,
                "apparent_power_kva": 116.9,
                "reactive_power_kvar": 52.9,
                "power_factor": 0.87,
                "frequency_hz": 50.02,
                "energy_today_kwh": 701,
                "load_pct": 12.0
            }
        ]

        total_kw = round(sum(p["active_power_kw"] for p in panels), 1)
        total_current = round(sum(p["current_avg_a"] for p in panels), 0)
        total_energy = sum(p["energy_today_kwh"] for p in panels)
        avg_pf = 0.92

        power_trend = [
            {"time": "00:00", "power_kw": 540.0},
            {"time": "03:00", "power_kw": 520.0},
            {"time": "06:00", "power_kw": 580.0},
            {"time": "09:00", "power_kw": 760.0},
            {"time": "12:00", "power_kw": 810.0},
            {"time": "15:00", "power_kw": 835.0},
            {"time": "18:00", "power_kw": 842.0},
            {"time": "21:00", "power_kw": 846.5}
        ]

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "date_str": "26 Sep 2026 19:42:15",
            "online": True,
            "kpis": {
                "total_plant_power_kw": total_kw,
                "total_current_a": int(total_current),
                "avg_power_factor": avg_pf,
                "total_energy_today_kwh": total_energy
            },
            "panels": panels,
            "power_trend": power_trend
        }

    def tick(self) -> Dict[str, Any]:
        self.tick_count += 1
        t = self.tick_count
        noise = 0.05 * math.sin(t * 0.3)
        
        active_odus = sum(1 for o in self.odus if o["state"] == "ON")
        active_heaters = sum(1 for h in self.heaters if h["state"] == "ON")
        
        if self.ahu_state == "ON":
            cooling_power = active_odus * 18.0
            heating_power = active_heaters * 3.0
            net_thermal_cooling = cooling_power - heating_power
            
            target_supply = 21.0 - (net_thermal_cooling * 0.04)
            self.supply_temp_c = round(target_supply + noise, 1)
            
            temp_diff = self.current_temp_c - self.set_point_c
            rate = 0.02 * temp_diff if temp_diff != 0 else 0
            self.current_temp_c = round(self.current_temp_c - rate + (0.02 * noise), 1)
            self.return_temp_c = round(self.current_temp_c + 2.3 + noise, 1)
            self.ahu_airflow_cfm = round(14500.0 + 100.0 * noise, 1)
            self.duct_dp_pa = round(120.0 + 3.0 * noise, 1)
            
            # Psychrometric Relative Humidity
            rh_diff = self.humidity_current_pct - self.humidity_setpoint_pct
            self.dehumidifier_active = active_odus > 3 and rh_diff > 1.0
            self.humidifier_active = rh_diff < -1.0
            
            rh_adjustment = -0.05 * active_odus if self.dehumidifier_active else (0.1 if self.humidifier_active else 0.0)
            self.humidity_current_pct = round(max(35.0, min(65.0, self.humidity_current_pct + rh_adjustment + 0.02 * noise)), 1)
        else:
            self.supply_temp_c = round(24.0 + noise, 1)
            self.current_temp_c = round(25.5 + noise, 1)
            self.return_temp_c = round(26.0 + noise, 1)
            self.ahu_airflow_cfm = 0.0
            self.duct_dp_pa = 5.0
            self.humidity_current_pct = round(52.0 + noise, 1)
            self.dehumidifier_active = False
            self.humidifier_active = False
            
        total_odu_power = sum(o["power_kw"] for o in self.odus)
        total_htr_power = sum(h["power_kw"] for h in self.heaters)
        ahu_power = 24.5 if self.ahu_state == "ON" else 0.5
        total_power = round(total_odu_power + total_htr_power + ahu_power, 1)

        if self.tick_count % 3 == 0:
            now_str = datetime.now().strftime("%I:%M:%S %p").lstrip("0")
            self.live_history.append({
                "time": now_str,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "supply_c": self.supply_temp_c,
                "return_c": self.return_temp_c,
                "set_point_c": self.set_point_c,
                "current_c": self.current_temp_c,
                "rh_pct": self.humidity_current_pct,
                "rh_setpoint_pct": self.humidity_setpoint_pct
            })
            if len(self.live_history) > 48:
                self.live_history.pop(0)

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ahu": {
                "id": "AHU-01",
                "name": "AHU-01",
                "state": self.ahu_state,
                "airflow_cfm": self.ahu_airflow_cfm,
                "fan_vfd_hz": self.fan_vfd_hz,
                "filter_dp_pa": self.duct_dp_pa,
                "humidifier_active": self.humidifier_active,
                "dehumidifier_active": self.dehumidifier_active
            },
            "odu_summary": {
                "running": active_odus,
                "total": len(self.odus),
                "standby": len(self.odus) - active_odus,
                "units": self.odus
            },
            "heater_summary": {
                "running": active_heaters,
                "total": len(self.heaters),
                "standby": len(self.heaters) - active_heaters,
                "units": self.heaters
            },
            "temperatures": {
                "current_c": self.current_temp_c,
                "set_point_c": self.set_point_c,
                "supply_c": self.supply_temp_c,
                "return_c": self.return_temp_c,
                "unit": "°C"
            },
            "humidity": {
                "current_rh": self.humidity_current_pct,
                "set_point_rh": self.humidity_setpoint_pct,
                "unit": "% RH",
                "humidifier_active": self.humidifier_active,
                "dehumidifier_active": self.dehumidifier_active
            },
            "system_info": {
                "total_ahu": 1,
                "total_odu": len(self.odus),
                "total_heater": len(self.heaters),
                "total_power_kw": total_power,
                "system_mode": self.system_mode,
                "plc_online": self.plc_connected,
                "status_text": "System Running Normally" if len([a for a in self.alarms if a['state'] == 'ACTIVE']) == 0 else f"{len([a for a in self.alarms if a['state'] == 'ACTIVE'])} Active Warnings"
            },
            "alarms": self.alarms
        }


simulator = ThermodynamicSimulator()
