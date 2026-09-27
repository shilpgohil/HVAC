from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.simulator_service import simulator

router = APIRouter(prefix="/components", tags=["Digital Twin Components"])


@router.get("/schematic")
async def get_schematic_components() -> Dict[str, Any]:
    tick_data = simulator.tick()
    telemetry = tick_data["telemetry"]
    alarms = tick_data["active_alarms"]
    alarm_map = {a["component_code"]: a for a in alarms}
    
    components = [
        {
            "id": "DMP-OA-01",
            "code": "DMP-OA-01",
            "name": "Outside Air Intake Damper",
            "type": "damper",
            "canvas": {"x": 60, "y": 180, "width": 50, "height": 70, "symbol": "damper_opposed"},
            "telemetry": [
                {"label": "POSITION", "val": telemetry["p_oa_damper"]["val"], "unit": "%", "quality": telemetry["p_oa_damper"]["q"]},
                {"label": "OA TEMP", "val": telemetry["p_oa_temp"]["val"], "unit": "°C", "quality": telemetry["p_oa_temp"]["q"]}
            ],
            "alarm": alarm_map.get("DMP-OA-01")
        },
        {
            "id": "FLT-PRE-01",
            "code": "FLT-PRE-01",
            "name": "Pre-Filter Section (MERV 8)",
            "type": "filter",
            "canvas": {"x": 190, "y": 175, "width": 30, "height": 80, "symbol": "filter_panel"},
            "telemetry": [
                {"label": "DIFF PRESS", "val": telemetry["p_filter_pre_dp"]["val"], "unit": "Pa", "quality": telemetry["p_filter_pre_dp"]["q"]}
            ],
            "alarm": alarm_map.get("FLT-PRE-01")
        },
        {
            "id": "FLT-HEPA-01",
            "code": "FLT-HEPA-01",
            "name": "High Efficiency Particulate Air Filter (HEPA)",
            "type": "filter",
            "canvas": {"x": 235, "y": 175, "width": 35, "height": 80, "symbol": "filter_hepa"},
            "telemetry": [
                {"label": "DIFF PRESS", "val": telemetry["p_filter_hepa_dp"]["val"], "unit": "Pa", "quality": telemetry["p_filter_hepa_dp"]["q"]}
            ],
            "alarm": alarm_map.get("FLT-HEPA-01")
        },
        {
            "id": "COIL-COOL-01",
            "code": "COIL-COOL-01",
            "name": "Hydronic Cooling Coil",
            "type": "coil",
            "canvas": {"x": 285, "y": 175, "width": 45, "height": 80, "symbol": "coil_cooling"},
            "telemetry": [
                {"label": "VALVE POS", "val": simulator.cooling_valve_pct, "unit": "%", "quality": "GOOD"},
                {"label": "CHW TEMP", "val": 7.2, "unit": "°C", "quality": "GOOD"}
            ],
            "alarm": alarm_map.get("COIL-COOL-01")
        },
        {
            "id": "SF-01",
            "code": "SF-01",
            "name": "SF-01 Primary Supply Fan & VFD",
            "type": "fan",
            "canvas": {"x": 355, "y": 170, "width": 85, "height": 90, "symbol": "fan_centrifugal"},
            "state": simulator.supply_fan_state,
            "mode": simulator.supply_fan_mode,
            "telemetry": [
                {"label": "VFD SPEED", "val": telemetry["p_sf_speed"]["val"], "unit": "Hz", "quality": telemetry["p_sf_speed"]["q"]},
                {"label": "POWER", "val": telemetry["p_sf_power"]["val"], "unit": "kW", "quality": telemetry["p_sf_power"]["q"]},
                {"label": "AIRFLOW", "val": telemetry["p_sf_airflow"]["val"], "unit": "CFM", "quality": telemetry["p_sf_airflow"]["q"]}
            ],
            "alarm": alarm_map.get("SF-01")
        },
        {
            "id": "HTR-BANK-01",
            "code": "HTR-BANK-01",
            "name": "9-Unit Industrial Duct Heater Bank",
            "type": "heater_bank",
            "canvas": {"x": 475, "y": 160, "width": 175, "height": 110, "symbol": "heater_bank_9unit"},
            "state": "WARNING" if any(u["state"] == "FAULT" for u in simulator.heater_units_state) else "RUNNING",
            "active_stages": simulator.heater_bank_stages_active,
            "units": simulator.heater_units_state,
            "telemetry": [
                {"label": "ACTIVE STAGES", "val": telemetry["p_htr_stages"]["val"], "unit": "/9", "quality": telemetry["p_htr_stages"]["q"]},
                {"label": "TOTAL POWER", "val": telemetry["p_htr_power"]["val"], "unit": "kW", "quality": telemetry["p_htr_power"]["q"]}
            ],
            "alarm": alarm_map.get("HTR-BANK-01")
        },
        {
            "id": "DUCT-SUPPLY-MAIN",
            "code": "DUCT-SUPPLY-MAIN",
            "name": "Main Cleanroom Supply Duct Segment",
            "type": "duct",
            "canvas": {"x": 665, "y": 195, "width": 75, "height": 40, "symbol": "duct_sensor_station"},
            "telemetry": [
                {"label": "STATIC PRESS", "val": telemetry["p_duct_pressure"]["val"], "unit": "Pa", "quality": telemetry["p_duct_pressure"]["q"]},
                {"label": "SUPPLY TEMP", "val": telemetry["p_sa_temp"]["val"], "unit": "°C", "quality": telemetry["p_sa_temp"]["q"]},
                {"label": "HUMIDITY", "val": telemetry["p_sa_rh"]["val"], "unit": "%", "quality": telemetry["p_sa_rh"]["q"]}
            ],
            "alarm": alarm_map.get("DUCT-SUPPLY-MAIN")
        },
        {
            "id": "VAV-101",
            "code": "VAV-101",
            "name": "VAV-101 Pressure Independent Terminal",
            "type": "vav",
            "canvas": {"x": 755, "y": 185, "width": 55, "height": 60, "symbol": "vav_terminal"},
            "telemetry": [
                {"label": "DAMPER", "val": 85.0, "unit": "%", "quality": "GOOD"},
                {"label": "AIRFLOW", "val": 3200, "unit": "CFM", "quality": "GOOD"}
            ],
            "alarm": alarm_map.get("VAV-101")
        },
        {
            "id": "ZONE-101",
            "code": "ZONE-101",
            "name": "Cleanroom Production Suite 101 (ISO-7)",
            "type": "zone",
            "canvas": {"x": 825, "y": 150, "width": 135, "height": 130, "symbol": "cleanroom_zone"},
            "telemetry": [
                {"label": "TEMP", "val": telemetry["p_z101_temp"]["val"], "unit": "°C", "quality": telemetry["p_z101_temp"]["q"]},
                {"label": "RH", "val": telemetry["p_z101_rh"]["val"], "unit": "%", "quality": telemetry["p_z101_rh"]["q"]},
                {"label": "ROOM DP", "val": telemetry["p_z101_dp"]["val"], "unit": "Pa", "quality": telemetry["p_z101_dp"]["q"]},
                {"label": "CO2", "val": telemetry["p_z101_co2"]["val"], "unit": "ppm", "quality": telemetry["p_z101_co2"]["q"]},
                {"label": "VOC", "val": telemetry["p_z101_voc"]["val"], "unit": "ppb", "quality": telemetry["p_z101_voc"]["q"]}
            ],
            "alarm": alarm_map.get("ZONE-101")
        },
        {
            "id": "RF-01",
            "code": "RF-01",
            "name": "RF-01 Return Air Fan",
            "type": "fan",
            "canvas": {"x": 485, "y": 380, "width": 75, "height": 75, "symbol": "fan_return"},
            "state": "RUNNING",
            "mode": "AUTO",
            "telemetry": [
                {"label": "SPEED", "val": 48.0, "unit": "Hz", "quality": "GOOD"},
                {"label": "FLOW", "val": 11200, "unit": "CFM", "quality": "GOOD"}
            ],
            "alarm": alarm_map.get("RF-01")
        },
        {
            "id": "DMP-RA-01",
            "code": "DMP-RA-01",
            "name": "Return Air Recirculation Damper",
            "type": "damper",
            "canvas": {"x": 130, "y": 300, "width": 55, "height": 55, "symbol": "damper_recirc"},
            "telemetry": [
                {"label": "POSITION", "val": telemetry["p_ra_damper"]["val"], "unit": "%", "quality": telemetry["p_ra_damper"]["q"]}
            ],
            "alarm": alarm_map.get("DMP-RA-01")
        }
    ]
    
    flow_paths = [
        {"id": "flow-oa-in", "medium": "fresh_air", "d": "M 20 215 L 60 215", "color": "#38BDF8"},
        {"id": "flow-ahu-trunk", "medium": "mixed_air", "d": "M 110 215 L 475 215", "color": "#06B6D4"},
        {"id": "flow-heater-thru", "medium": "heated_air", "d": "M 475 215 L 650 215", "color": "#F97316"},
        {"id": "flow-supply-zone", "medium": "conditioned_air", "d": "M 650 215 L 825 215", "color": "#06B6D4"},
        {"id": "flow-return-loop", "medium": "return_air", "d": "M 890 280 L 890 415 L 155 415 L 155 255", "color": "#64748B"}
    ]
    
    return {
        "timestamp": tick_data["timestamp"],
        "flow_rate_cfm": telemetry["p_sf_airflow"]["val"],
        "is_flow_active": telemetry["p_sf_airflow"]["val"] > 100.0 and simulator.supply_fan_state == "RUNNING",
        "components": components,
        "flow_paths": flow_paths
    }
