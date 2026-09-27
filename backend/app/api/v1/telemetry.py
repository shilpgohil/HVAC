import math
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter
from app.services.simulator_service import simulator

router = APIRouter(prefix="/telemetry", tags=["Telemetry & Trends"])


@router.get("/current")
async def get_current_telemetry() -> Dict[str, Any]:
    tick_data = simulator.tick()
    return {
        "timestamp": tick_data["timestamp"],
        "plc_connected": tick_data["plc_connected"],
        "plc_latency_ms": tick_data["plc_latency_ms"],
        "points": tick_data["telemetry"]
    }


@router.get("/trends/{point_id}")
async def get_point_trends(point_id: str, minutes: int = 60) -> List[Dict[str, Any]]:
    tick_data = simulator.tick()
    telemetry = tick_data["telemetry"]
    
    current_val = telemetry.get(point_id, {}).get("val", 21.5)
    unit = telemetry.get(point_id, {}).get("unit", "")
    
    trends = []
    now = datetime.now(timezone.utc)
    steps = min(minutes, 60)
    for i in range(steps, 0, -1):
        ts = now - timedelta(minutes=i)
        val = current_val + 0.3 * math.sin(i * 0.15)
        trends.append({
            "timestamp": ts.isoformat(),
            "value": round(val, 2),
            "unit": unit,
            "quality": "GOOD"
        })
    trends.append({
        "timestamp": now.isoformat(),
        "value": round(current_val, 2),
        "unit": unit,
        "quality": telemetry.get(point_id, {}).get("q", "GOOD")
    })
    return trends
