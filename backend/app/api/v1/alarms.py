from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.schemas.domain import AlarmSchema, AlarmAcknowledgeRequest
from app.services.simulator_service import simulator

router = APIRouter(prefix="/alarms", tags=["Alarm Management"])


@router.get("", response_model=List[AlarmSchema])
async def list_alarms(severity: Optional[str] = None, state: Optional[str] = None):
    alarms = list(simulator.active_alarms.values())
    if severity:
        alarms = [a for a in alarms if a["severity"] == severity.upper()]
    if state:
        alarms = [a for a in alarms if a["state"] == state.upper()]
    return alarms


@router.post("/{alarm_id}/acknowledge")
async def acknowledge_alarm(alarm_id: str, payload: AlarmAcknowledgeRequest):
    result = simulator.acknowledge_alarm(alarm_id, payload.acknowledged_by, payload.notes)
    if not result:
        raise HTTPException(status_code=404, detail=f"Alarm '{alarm_id}' not found.")
    return result
