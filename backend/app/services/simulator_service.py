import math
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional


class ThermodynamicSimulator:
    def __init__(self):
        self.tick_count: int = 0
        self.active_scenario: int = 1
        self.scenario_definitions: Dict[int, Dict[str, str]] = {
            1: {"name": "Normal Operation", "desc": "All equipment healthy, PID loops tracking setpoints."},
            2: {"name": "High Cooling Demand", "desc": "Simulated thermal load step change with peak cooling."},
            3: {"name": "Supply Fan Failure", "desc": "Fan commanded RUN, differential pressure flow loss trip."},
            4: {"name": "Refrigerant Circuit Loss", "desc": "Compressor lock-out and DX cooling loss alarm."},
            5: {"name": "High Filter DP", "desc": "HEPA filter loading exceeds 250 Pa high differential pressure threshold."},
            6: {"name": "Low Evaporator Flow", "desc": "Cooling coil minimum flow rate violation and capacity restriction."},
            7: {"name": "High Supply Air Temp", "desc": "Supply air temperature exceeds high limit threshold (24°C)."},
            8: {"name": "Sensor Open Circuit", "desc": "Discharge air temperature sensor open-circuit fault."},
            9: {"name": "Gateway Offline", "desc": "Modbus/BACnet gateway offline with communication timeout."},
            10: {"name": "Stale Telemetry", "desc": "Point telemetry age exceeds stale threshold (60s)."},
            11: {"name": "Manual VFD Override", "desc": "Local manual VFD override active at 60 Hz."},
            12: {"name": "Command Fail / Timeout", "desc": "Safety interlock lockout active preventing command execution."}
        }
        
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
        self._init_home_iot()

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

    def set_scenario(self, scenario_id: int) -> Dict[str, Any]:
        if scenario_id in self.scenario_definitions:
            self.active_scenario = scenario_id
            if scenario_id == 1:
                self.ahu_state = "ON"
                self.fan_vfd_hz = 50.0
                self.ahu_airflow_cfm = 14500.0
                self.duct_dp_pa = 120.0
                self.plc_connected = True
                self.system_mode = "Auto"
            elif scenario_id == 2:
                self.set_point_c = 20.0
                for o in self.odus:
                    o["state"] = "ON"
                    o["power_kw"] = 18.5
                    o["fan_rpm"] = 830
            elif scenario_id == 3:
                self.ahu_state = "OFF"
                self.fan_vfd_hz = 0.0
                self.ahu_airflow_cfm = 0.0
                self.duct_dp_pa = 0.0
                self.alarms.append({
                    "id": "ALM-FAN-FAIL",
                    "component_code": "AHU-01",
                    "severity": "CRITICAL",
                    "state": "ACTIVE",
                    "condition": "FAN_RUN_FAILURE",
                    "message": "Supply Fan Run Failure / Flow Loss",
                    "triggered_at": datetime.now().strftime("%d %b %Y %I:%M %p"),
                    "acknowledged_by": None
                })
            elif scenario_id == 4:
                self.alarms.append({
                    "id": "ALM-REF-LOSS",
                    "component_code": "DX-CIRCUIT-1",
                    "severity": "CRITICAL",
                    "state": "ACTIVE",
                    "condition": "REFRIGERANT_LOSS",
                    "message": "Refrigerant circuit pressure collapse",
                    "triggered_at": datetime.now().strftime("%d %b %Y %I:%M %p"),
                    "acknowledged_by": None
                })
            elif scenario_id == 5:
                self.duct_dp_pa = 295.0
                self.alarms.append({
                    "id": "ALM-FILTER-DP",
                    "component_code": "HEPA-01",
                    "severity": "WARNING",
                    "state": "ACTIVE",
                    "condition": "HIGH_FILTER_DP",
                    "message": "Air Filter Dirty / High DP (>250 Pa)",
                    "triggered_at": datetime.now().strftime("%d %b %Y %I:%M %p"),
                    "acknowledged_by": None
                })
            elif scenario_id == 7:
                self.supply_temp_c = 24.5
                self.alarms.append({
                    "id": "ALM-HIGH-SUPPLY",
                    "component_code": "AHU-01",
                    "severity": "WARNING",
                    "state": "ACTIVE",
                    "condition": "HIGH_SUPPLY_TEMP",
                    "message": "Supply Air Temp High (24.5°C > 22.0°C)",
                    "triggered_at": datetime.now().strftime("%d %b %Y %I:%M %p"),
                    "acknowledged_by": None
                })
            elif scenario_id == 9:
                self.plc_connected = False
            elif scenario_id == 11:
                self.system_mode = "MANUAL"
                self.fan_vfd_hz = 60.0
            return {
                "status": "SUCCESS",
                "scenario_id": scenario_id,
                "name": self.scenario_definitions[scenario_id]["name"]
            }
        return {"status": "ERROR", "message": "Unknown scenario ID"}

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

    def _init_home_iot(self):
        self.home_iot_security_mode: str = "ARMED_HOME"
        self.home_iot_active_scene: str = "Home"
        self.home_iot_rooms: List[Dict[str, Any]] = [
            {
                "id": "living_room",
                "name": "Living Room",
                "area_sqm": 42.0,
                "temp_c": 23.4,
                "target_temp_c": 22.5,
                "humidity_rh": 48.0,
                "ambient_lux": 320,
                "motion": True,
                "ac_mode": "COOL",
                "ac_fan_speed": "AUTO",
                "devices": [
                    {"id": "lr_chandelier", "name": "Main Chandelier", "type": "light", "state": True, "level": 80, "power_w": 65},
                    {"id": "lr_led_cove", "name": "Ambient Cove Lights", "type": "light", "state": True, "level": 60, "power_w": 28},
                    {"id": "lr_media_center", "name": "4K Cinema & Audio", "type": "appliance", "state": True, "level": 100, "power_w": 240},
                    {"id": "lr_ac_split", "name": "Inverter Mini-Split", "type": "climate", "state": True, "level": 75, "power_w": 850},
                ]
            },
            {
                "id": "master_bedroom",
                "name": "Master Suite",
                "area_sqm": 28.0,
                "temp_c": 22.8,
                "target_temp_c": 22.0,
                "humidity_rh": 50.0,
                "ambient_lux": 110,
                "motion": False,
                "ac_mode": "COOL",
                "ac_fan_speed": "LOW",
                "devices": [
                    {"id": "mbr_ceiling_light", "name": "Ceiling Pendant", "type": "light", "state": False, "level": 0, "power_w": 0},
                    {"id": "mbr_bedside_lamps", "name": "Bedside Lamps", "type": "light", "state": True, "level": 40, "power_w": 18},
                    {"id": "mbr_smart_blinds", "name": "Motorized Blinds", "type": "cover", "state": True, "level": 65, "power_w": 0},
                    {"id": "mbr_ac_split", "name": "Silent Inverter AC", "type": "climate", "state": True, "level": 60, "power_w": 620},
                ]
            },
            {
                "id": "kitchen",
                "name": "Smart Kitchen",
                "area_sqm": 24.0,
                "temp_c": 24.1,
                "target_temp_c": 23.0,
                "humidity_rh": 52.0,
                "ambient_lux": 450,
                "motion": True,
                "water_leak_detected": False,
                "devices": [
                    {"id": "kt_island_spots", "name": "Island Downlights", "type": "light", "state": True, "level": 100, "power_w": 45},
                    {"id": "kt_refrigerator", "name": "Smart Inverter Fridge", "type": "appliance", "state": True, "level": 100, "power_w": 130},
                    {"id": "kt_induction_cooktop", "name": "Induction Cooktop", "type": "appliance", "state": False, "level": 0, "power_w": 0},
                    {"id": "kt_exhaust_hood", "name": "Ventilation Hood", "type": "fan", "state": True, "level": 50, "power_w": 75},
                ]
            },
            {
                "id": "home_office",
                "name": "Home Office",
                "area_sqm": 18.0,
                "temp_c": 23.0,
                "target_temp_c": 22.5,
                "humidity_rh": 47.0,
                "ambient_lux": 520,
                "motion": True,
                "devices": [
                    {"id": "ho_task_light", "name": "Architect Desk Light", "type": "light", "state": True, "level": 85, "power_w": 22},
                    {"id": "ho_workstation", "name": "Workstation Rig & Displays", "type": "plug", "state": True, "level": 100, "power_w": 380},
                    {"id": "ho_purifier", "name": "HEPA Air Purifier", "type": "fan", "state": True, "level": 70, "power_w": 35},
                ]
            },
            {
                "id": "ev_garage",
                "name": "EV Garage & Workshop",
                "area_sqm": 35.0,
                "temp_c": 26.2,
                "target_temp_c": 25.0,
                "humidity_rh": 55.0,
                "ambient_lux": 80,
                "garage_door_closed": True,
                "ev_connected": True,
                "ev_charging": True,
                "ev_battery_soc": 78,
                "devices": [
                    {"id": "gr_overhead_tubes", "name": "Overhead LED Batten", "type": "light", "state": True, "level": 100, "power_w": 50},
                    {"id": "gr_ev_wallbox", "name": "Level 2 EV Wallbox (32A)", "type": "charger", "state": True, "level": 100, "power_w": 7200},
                    {"id": "gr_door_motor", "name": "Smart Garage Opener", "type": "cover", "state": False, "level": 0, "power_w": 0},
                ]
            },
            {
                "id": "outdoor_solar",
                "name": "Rooftop Solar & Garden",
                "area_sqm": 60.0,
                "temp_c": 31.5,
                "solar_radiation_w_m2": 780,
                "solar_pv_kw": 8.4,
                "battery_flow_kw": 2.1,
                "battery_soc_pct": 91,
                "devices": [
                    {"id": "od_garden_bollards", "name": "Landscape Bollards", "type": "light", "state": False, "level": 0, "power_w": 0},
                    {"id": "od_smart_irrigation", "name": "Drip Irrigation Valve", "type": "valve", "state": False, "level": 0, "power_w": 0},
                    {"id": "od_solar_inverter", "name": "10kW Hybrid Inverter", "type": "inverter", "state": True, "level": 100, "power_w": 0},
                    {"id": "od_battery_pack", "name": "15kWh LFP Storage Bank", "type": "battery", "state": True, "level": 91, "power_w": 0},
                ]
            }
        ]
        self.home_iot_activities: List[Dict[str, Any]] = [
            {"id": "act-1", "time": "12:20:04", "category": "climate", "room": "Living Room", "message": "Inverter Mini-Split trimmed to 22.5°C (Eco Comfort)", "severity": "info"},
            {"id": "act-2", "time": "12:18:31", "category": "energy", "room": "EV Garage", "message": "EV Wallbox charging at 7.2 kW (PV Surplus Priority)", "severity": "success"},
            {"id": "act-3", "time": "12:14:10", "category": "solar", "room": "Rooftop Solar", "message": "Solar PV generation peaked at 8.4 kW (Exporting 2.8 kW)", "severity": "info"},
            {"id": "act-4", "time": "12:05:45", "category": "security", "room": "Whole Home", "message": "Perimeter security armed in Home Guard mode", "severity": "success"}
        ]
        self.home_iot_active_scenario: str = "solar_surplus"
        self.home_iot_scenarios: List[Dict[str, Any]] = [
            {"id": "solar_surplus", "name": "Solar Surplus & EV Fast Charge", "description": "8.8 kW rooftop solar PV surplus channeled to Level 2 EV Wallbox and 15kWh LFP bank."},
            {"id": "peak_shaving", "name": "Peak Tariff Shaving (Zero Grid)", "description": "Evening grid peak; 15kWh battery discharges 3.8 kW to power household loads with 0 kW grid import."},
            {"id": "entertainment", "name": "Luxury Ambiance & Cinema", "description": "Living Room chandelier at 100%, ambient coves in violet, 4K media center active, mini-split at 21.5°C."},
            {"id": "night_guard", "name": "Silent Sleep & Perimeter Guard", "description": "All primary lights off, soft bedside lamps at 20%, silent AC in whisper mode, perimeter security fully armed."},
            {"id": "eco_netzero", "name": "Eco Saver & Smart Net-Zero", "description": "Thermostats relaxed to 24.5°C, motorized shades lowered 75% to deflect solar heat gain."},
            {"id": "grid_outage", "name": "Grid Blackout Microgrid Island", "description": "Utility grid supply offline; 10kW hybrid inverter islands residence on solar PV & LFP battery reserves."},
            {"id": "vacation_away", "name": "Vacation Away & Flood Watch", "description": "All non-essential circuits isolated, security armed away, water leak sensors active with main shutoff."},
            {"id": "heatwave_max", "name": "Heatwave Emergency Pre-Cool", "description": "High ambient 38°C; all inverter AC units modulate to max cooling capacity to preserve indoor comfort."}
        ]

    def get_home_iot_state(self) -> Dict[str, Any]:
        t = self.tick_count
        noise = 0.04 * math.sin(t * 0.2)
        
        total_w = sum(dev["power_w"] for r in self.home_iot_rooms for dev in r["devices"] if dev.get("state"))
        total_power_kw = round(total_w / 1000.0, 2)
        solar_kw = round(max(0.0, 8.4 + 0.3 * math.sin(t * 0.08)), 2)
        grid_net_kw = round(total_power_kw - solar_kw, 2)
        
        active_devices = sum(1 for r in self.home_iot_rooms for dev in r["devices"] if dev.get("state"))
        total_devices = sum(len(r["devices"]) for r in self.home_iot_rooms)
        
        indoor_rooms = [r for r in self.home_iot_rooms if r["id"] != "outdoor_solar"]
        avg_temp = round(sum(r["temp_c"] for r in indoor_rooms) / len(indoor_rooms), 1)
        avg_humidity = round(sum(r["humidity_rh"] for r in indoor_rooms) / len(indoor_rooms), 1)
        
        scenes = [
            {"id": "Home", "name": "Normal Home", "active": self.home_iot_active_scene == "Home"},
            {"id": "Away", "name": "Away Guard", "active": self.home_iot_active_scene == "Away"},
            {"id": "Night", "name": "Good Night", "active": self.home_iot_active_scene == "Night"},
            {"id": "Eco", "name": "Eco Saver", "active": self.home_iot_active_scene == "Eco"},
            {"id": "Entertain", "name": "Entertainment", "active": self.home_iot_active_scene == "Entertain"}
        ]
        
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "online": True,
            "security_mode": self.home_iot_security_mode,
            "active_scene": self.home_iot_active_scene,
            "kpis": {
                "total_power_kw": total_power_kw,
                "solar_generation_kw": solar_kw,
                "grid_net_kw": grid_net_kw,
                "battery_soc_pct": 91,
                "avg_indoor_temp_c": avg_temp,
                "avg_indoor_humidity_rh": avg_humidity,
                "active_devices_count": active_devices,
                "total_devices_count": total_devices,
                "air_quality_iaq": "EXCELLENT",
                "water_leak_status": "NORMAL"
            },
            "rooms": self.home_iot_rooms,
            "scenes": scenes,
            "active_scenario": self.home_iot_active_scenario,
            "scenarios": self.home_iot_scenarios,
            "activities": self.home_iot_activities[:15]
        }

    def toggle_home_iot_device(self, room_id: str, device_id: str, target_state: Optional[bool] = None) -> Dict[str, Any]:
        for room in self.home_iot_rooms:
            if room["id"] == room_id:
                for dev in room["devices"]:
                    if dev["id"] == device_id:
                        new_state = (not dev["state"]) if target_state is None else target_state
                        dev["state"] = new_state
                        if dev["type"] == "light":
                            dev["level"] = 80 if new_state else 0
                            dev["power_w"] = 45 if new_state else 0
                        elif dev["type"] == "climate":
                            dev["power_w"] = 750 if new_state else 0
                        elif dev["type"] == "charger":
                            dev["power_w"] = 7200 if new_state else 0
                        elif dev["type"] == "appliance":
                            dev["power_w"] = 150 if new_state else 0
                        
                        now_str = datetime.now().strftime("%H:%M:%S")
                        act_msg = f"{dev['name']} turned {'ON' if new_state else 'OFF'}"
                        self.home_iot_activities.insert(0, {
                            "id": f"act-{len(self.home_iot_activities) + 1}",
                            "time": now_str,
                            "category": dev["type"],
                            "room": room["name"],
                            "message": act_msg,
                            "severity": "info" if new_state else "warning"
                        })
                        return {"success": True, "device": dev, "room_id": room_id}
        return {"success": False, "error": "Device not found"}

    def set_home_iot_room_temp(self, room_id: str, target_temp_c: float) -> Dict[str, Any]:
        for room in self.home_iot_rooms:
            if room["id"] == room_id:
                room["target_temp_c"] = round(target_temp_c, 1)
                now_str = datetime.now().strftime("%H:%M:%S")
                self.home_iot_activities.insert(0, {
                    "id": f"act-{len(self.home_iot_activities) + 1}",
                    "time": now_str,
                    "category": "climate",
                    "room": room["name"],
                    "message": f"Setpoint adjusted to {target_temp_c:.1f}°C",
                    "severity": "info"
                })
                return {"success": True, "room_id": room_id, "target_temp_c": target_temp_c}
        return {"success": False, "error": "Room not found"}

    def set_home_iot_scene(self, scene_name: str) -> Dict[str, Any]:
        self.home_iot_active_scene = scene_name
        now_str = datetime.now().strftime("%H:%M:%S")
        
        if scene_name == "Away":
            self.home_iot_security_mode = "ARMED_AWAY"
            for r in self.home_iot_rooms:
                for d in r["devices"]:
                    if d["type"] == "light":
                        d["state"] = False
                        d["power_w"] = 0
                    elif d["type"] == "climate":
                        d["power_w"] = 200
        elif scene_name == "Night":
            self.home_iot_security_mode = "ARMED_HOME"
            for r in self.home_iot_rooms:
                for d in r["devices"]:
                    if d["id"] != "mbr_bedside_lamps":
                        if d["type"] == "light":
                            d["state"] = False
                            d["power_w"] = 0
        elif scene_name == "Eco":
            for r in self.home_iot_rooms:
                if "target_temp_c" in r:
                    r["target_temp_c"] = 24.5
        elif scene_name == "Home" or scene_name == "Entertain":
            self.home_iot_security_mode = "DISARMED"
            for r in self.home_iot_rooms:
                for d in r["devices"]:
                    if d["type"] == "light":
                        d["state"] = True
                        d["level"] = 80
                        d["power_w"] = 40
        
        self.home_iot_activities.insert(0, {
            "id": f"act-{len(self.home_iot_activities) + 1}",
            "time": now_str,
            "category": "scene",
            "room": "Whole Home",
            "message": f"Smart Scene activated: {scene_name}",
            "severity": "success"
        })
        return {"success": True, "scene": scene_name}

    def set_home_iot_security_mode(self, mode: str) -> Dict[str, Any]:
        self.home_iot_security_mode = mode
        now_str = datetime.now().strftime("%H:%M:%S")
        self.home_iot_activities.insert(0, {
            "id": f"act-{len(self.home_iot_activities) + 1}",
            "time": now_str,
            "category": "security",
            "room": "Security Guard",
            "message": f"Perimeter security set to {mode}",
            "severity": "warning" if "ARMED" in mode else "info"
        })
        return {"success": True, "security_mode": mode}

    def set_home_iot_device_level(self, room_id: str, device_id: str, level: int) -> Dict[str, Any]:
        for room in self.home_iot_rooms:
            if room["id"] == room_id:
                for dev in room["devices"]:
                    if dev["id"] == device_id:
                        clamped = max(0, min(100, level))
                        dev["level"] = clamped
                        dev["state"] = clamped > 0
                        if dev["type"] == "light":
                            dev["power_w"] = round((clamped / 100.0) * 60.0, 1)
                        elif dev["type"] == "cover":
                            dev["power_w"] = 15 if clamped > 0 else 0
                        elif dev["type"] == "climate":
                            dev["power_w"] = round(300 + (clamped / 100.0) * 700, 1)
                        now_str = datetime.now().strftime("%H:%M:%S")
                        self.home_iot_activities.insert(0, {
                            "id": f"act-{len(self.home_iot_activities) + 1}",
                            "time": now_str,
                            "category": dev["type"],
                            "room": room["name"],
                            "message": f"{dev['name']} adjusted to {clamped}%",
                            "severity": "info"
                        })
                        return {"success": True, "device": dev, "room_id": room_id}
        return {"success": False, "error": "Device not found"}

    def set_home_iot_scenario(self, scenario_id: str) -> Dict[str, Any]:
        now_str = datetime.now().strftime("%H:%M:%S")
        self.home_iot_active_scenario = scenario_id
        
        if scenario_id == "solar_surplus":
            self.home_iot_active_scene = "Home"
            self.home_iot_security_mode = "DISARMED"
            for r in self.home_iot_rooms:
                if r["id"] == "ev_garage":
                    for d in r["devices"]:
                        if d["id"] == "gr_ev_wallbox":
                            d["state"] = True
                            d["power_w"] = 7200
                elif r["id"] == "outdoor_solar":
                    r["solar_pv_kw"] = 8.8
                    r["battery_flow_kw"] = 2.4
                    r["battery_soc_pct"] = 92
        elif scenario_id == "peak_shaving":
            self.home_iot_active_scene = "Home"
            for r in self.home_iot_rooms:
                if r["id"] == "outdoor_solar":
                    r["solar_pv_kw"] = 0.5
                    r["battery_flow_kw"] = -3.8
                elif r["id"] == "ev_garage":
                    for d in r["devices"]:
                        if d["id"] == "gr_ev_wallbox":
                            d["state"] = False
                            d["power_w"] = 0
        elif scenario_id == "entertainment":
            self.home_iot_active_scene = "Entertain"
            self.home_iot_security_mode = "DISARMED"
            for r in self.home_iot_rooms:
                if r["id"] == "living_room":
                    r["temp_c"] = 21.8
                    r["target_temp_c"] = 21.5
                    for d in r["devices"]:
                        d["state"] = True
                        if d["id"] == "lr_chandelier":
                            d["level"] = 100
                            d["power_w"] = 75
                        elif d["id"] == "lr_led_cove":
                            d["level"] = 90
                            d["power_w"] = 40
        elif scenario_id == "night_guard":
            self.home_iot_active_scene = "Night"
            self.home_iot_security_mode = "ARMED_HOME"
            for r in self.home_iot_rooms:
                if r["id"] != "master_bedroom":
                    for d in r["devices"]:
                        if d["type"] == "light":
                            d["state"] = False
                            d["level"] = 0
                            d["power_w"] = 0
                else:
                    r["target_temp_c"] = 22.0
                    for d in r["devices"]:
                        if d["id"] == "mbr_bedside_lamps":
                            d["state"] = True
                            d["level"] = 20
                            d["power_w"] = 8
        elif scenario_id == "eco_netzero":
            self.home_iot_active_scene = "Eco"
            for r in self.home_iot_rooms:
                if "target_temp_c" in r:
                    r["target_temp_c"] = 24.5
                for d in r["devices"]:
                    if d["type"] == "cover":
                        d["level"] = 75
        elif scenario_id == "grid_outage":
            self.home_iot_active_scene = "Eco"
            for r in self.home_iot_rooms:
                if r["id"] == "ev_garage":
                    for d in r["devices"]:
                        if d["id"] == "gr_ev_wallbox":
                            d["state"] = False
                            d["power_w"] = 0
                elif r["id"] == "outdoor_solar":
                    r["battery_flow_kw"] = -1.8
        elif scenario_id == "vacation_away":
            self.home_iot_active_scene = "Away"
            self.home_iot_security_mode = "ARMED_AWAY"
            for r in self.home_iot_rooms:
                for d in r["devices"]:
                    if d["type"] == "light":
                        d["state"] = False
                        d["level"] = 0
                        d["power_w"] = 0
                    elif d["type"] == "climate":
                        d["power_w"] = 150
        elif scenario_id == "heatwave_max":
            for r in self.home_iot_rooms:
                if "target_temp_c" in r:
                    r["target_temp_c"] = 20.5
                for d in r["devices"]:
                    if d["type"] == "climate":
                        d["state"] = True
                        d["power_w"] = 1100

        sc_name = next((s["name"] for s in self.home_iot_scenarios if s["id"] == scenario_id), scenario_id)
        self.home_iot_activities.insert(0, {
            "id": f"act-{len(self.home_iot_activities) + 1}",
            "time": now_str,
            "category": "scenario",
            "room": "Whole Home",
            "message": f"Scenario deployed: {sc_name}",
            "severity": "info"
        })
        return {"success": True, "scenario_id": scenario_id}


simulator = ThermodynamicSimulator()
