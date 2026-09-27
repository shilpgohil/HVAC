from fastapi import APIRouter
from typing import Dict, Any, List
from app.services.simulator_service import simulator

router = APIRouter(prefix="/topology", tags=["System Topology"])


@router.get("/tree")
async def get_system_topology_tree() -> Dict[str, Any]:
    tick_data = simulator.tick()
    alarms = tick_data["active_alarms"]
    alarm_map = {a["component_code"]: a["severity"] for a in alarms}
    
    def resolve_status(code: str, default: str = "NORMAL") -> str:
        if code in alarm_map:
            return alarm_map[code]
        if code == "PLC-01" and not simulator.plc_connected:
            return "OFFLINE"
        return default

    tree = {
        "id": "site_a12",
        "name": "Site A-12 — Critical Facilities",
        "type": "site",
        "status": "NORMAL",
        "children": [
            {
                "id": "bldg_01",
                "name": "Production Building 01",
                "type": "building",
                "status": "NORMAL",
                "children": [
                    {
                        "id": "gateway_01",
                        "name": "Industrial Edge Gateway (BACnet/MQTT)",
                        "type": "gateway",
                        "status": resolve_status("PLC-01"),
                        "children": [
                            {
                                "id": "plc_01",
                                "name": "PLC-01 Main Automation Controller",
                                "type": "plc",
                                "status": resolve_status("PLC-01"),
                                "ip_address": "192.168.10.50",
                                "scan_rate_ms": simulator.plc_latency_ms,
                                "children": [
                                    {
                                        "id": "pnl_01",
                                        "name": "PNL-01 Motor Control Center & VFDs",
                                        "type": "panel",
                                        "status": "NORMAL",
                                        "children": [
                                            {
                                                "id": "vfd_sf01",
                                                "name": "VFD-01 Supply Fan Drive",
                                                "type": "vfd",
                                                "status": resolve_status("SF-01"),
                                                "frequency_hz": simulator.supply_fan_speed_hz
                                            },
                                            {
                                                "id": "vfd_rf01",
                                                "name": "VFD-02 Return Fan Drive",
                                                "type": "vfd",
                                                "status": "NORMAL",
                                                "frequency_hz": 48.0
                                            }
                                        ]
                                    },
                                    {
                                        "id": "pnl_02",
                                        "name": "PNL-02 Thermal Staging & Instrumentation",
                                        "type": "panel",
                                        "status": resolve_status("HTR-BANK-01"),
                                        "children": [
                                            {
                                                "id": "htr_bank_01",
                                                "name": "HTR-BANK-01 9-Unit Heater Stage Bank",
                                                "type": "heater_bank",
                                                "status": resolve_status("HTR-BANK-01"),
                                                "active_stages": simulator.heater_bank_stages_active,
                                                "total_units": 9
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "id": "sys_air_01",
                        "name": "Air Handling & Zone Distribution System",
                        "type": "hvac_system",
                        "status": "NORMAL",
                        "children": [
                            {
                                "id": "ahu_01",
                                "name": "AHU-01 Cleanroom Air Handling Unit",
                                "type": "ahu",
                                "status": resolve_status("AHU-01"),
                                "airflow_cfm": simulator.supply_airflow_cfm,
                                "children": [
                                    {"id": "dmp_oa", "name": "Outside Air Damper", "type": "damper", "position_pct": simulator.oa_damper_pct},
                                    {"id": "flt_pre", "name": "Pre-Filter Bank", "type": "filter", "dp_pa": simulator.filter_pre_dp_pa},
                                    {"id": "flt_hepa", "name": "HEPA Filter Bank", "type": "filter", "status": resolve_status("FLT-HEPA-01"), "dp_pa": simulator.filter_hepa_dp_pa},
                                    {"id": "coil_cool", "name": "Chilled Water Cooling Coil", "type": "coil", "valve_pct": simulator.cooling_valve_pct},
                                    {"id": "fan_supply", "name": "SF-01 Supply Fan", "type": "fan", "status": resolve_status("SF-01"), "airflow_cfm": simulator.supply_airflow_cfm}
                                ]
                            },
                            {
                                "id": "duct_supply",
                                "name": "Supply Air Distribution Header",
                                "type": "duct",
                                "status": resolve_status("DUCT-SUPPLY-MAIN"),
                                "pressure_pa": simulator.duct_static_pressure_pa
                            },
                            {
                                "id": "vav_101",
                                "name": "VAV-101 Pressure Independent Terminal",
                                "type": "vav",
                                "status": "NORMAL"
                            },
                            {
                                "id": "zone_101",
                                "name": "Cleanroom Zone 101 (ISO-7)",
                                "type": "zone",
                                "status": "NORMAL",
                                "temp_c": simulator.zone_101_temp_c,
                                "pressure_pa": simulator.zone_101_pressure_pa
                            }
                        ]
                    }
                ]
            }
        ]
    }
    return tree
