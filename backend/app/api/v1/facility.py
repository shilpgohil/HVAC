from fastapi import APIRouter
from typing import Dict, Any
from app.services.simulator_service import simulator

router = APIRouter(prefix="/facility", tags=["Facility Overview"])


@router.get("/overview")
async def get_facility_overview() -> Dict[str, Any]:
    tick_data = simulator.tick()
    return {
        "site_code": "SITE-A12",
        "site_name": "HVAC Control System",
        "system_status": "System Online",
        "ahu": tick_data["ahu"],
        "odu_summary": tick_data["odu_summary"],
        "heater_summary": tick_data["heater_summary"],
        "temperatures": tick_data["temperatures"],
        "system_info": tick_data["system_info"],
        "alarms": tick_data["alarms"]
    }
