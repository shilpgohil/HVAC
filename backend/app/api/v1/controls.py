from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.services.simulator_service import simulator

router = APIRouter(prefix="/control", tags=["Interactive Controls"])


class AhuControlRequest(BaseModel):
    state: str


class OduControlRequest(BaseModel):
    odu_id: str
    state: str


class HeaterControlRequest(BaseModel):
    heater_id: str
    state: str


class SetpointRequest(BaseModel):
    target_c: float


class HumiditySetpointRequest(BaseModel):
    target_rh: float


class ModeRequest(BaseModel):
    mode: str


class AlarmAckRequest(BaseModel):
    alarm_id: str
    user: Optional[str] = "admin"


class AlarmClearRequest(BaseModel):
    alarm_id: str


@router.post("/ahu")
async def control_ahu(payload: AhuControlRequest) -> Dict[str, Any]:
    new_state = simulator.set_ahu_state(payload.state)
    return {"ahu": "AHU-01", "state": new_state}


@router.post("/odu")
async def control_odu(payload: OduControlRequest) -> Dict[str, Any]:
    res = simulator.set_odu_state(payload.odu_id, payload.state)
    return {"updated": res}


@router.post("/heater")
async def control_heater(payload: HeaterControlRequest) -> Dict[str, Any]:
    res = simulator.set_heater_state(payload.heater_id, payload.state)
    return {"updated": res}


@router.post("/setpoint")
async def update_setpoint(payload: SetpointRequest) -> Dict[str, Any]:
    target = simulator.set_target_temperature(payload.target_c)
    return {"set_point_c": target, "unit": "°C"}


@router.post("/rh-setpoint")
async def update_humidity_setpoint(payload: HumiditySetpointRequest) -> Dict[str, Any]:
    target = simulator.set_target_humidity(payload.target_rh)
    return {"set_point_rh": target, "unit": "% RH"}


@router.post("/mode")
async def update_mode(payload: ModeRequest) -> Dict[str, Any]:
    mode = simulator.set_system_mode(payload.mode)
    return {"system_mode": mode}


@router.post("/alarm/ack")
async def ack_alarm(payload: AlarmAckRequest) -> Dict[str, Any]:
    success = simulator.acknowledge_alarm(payload.alarm_id, payload.user or "admin")
    return {"acknowledged": success, "alarm_id": payload.alarm_id}


@router.post("/alarm/clear")
async def clear_alarm(payload: AlarmClearRequest) -> Dict[str, Any]:
    success = simulator.clear_alarm(payload.alarm_id)
    return {"cleared": success, "alarm_id": payload.alarm_id}


@router.get("/history")
async def get_temperature_history(range: str = Query("12H", description="1H, 6H, 12H, 24H")) -> List[Dict[str, Any]]:
    return simulator.get_history(range)


@router.get("/electrical/state")
async def get_electrical_state() -> Dict[str, Any]:
    return simulator.get_electrical_state()


@router.get("/state")
async def get_system_state() -> Dict[str, Any]:
    return simulator.tick()
