import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from app.schemas.domain import SupervisoryCommandRequest, SupervisoryCommandResponse, CommandStatus
from app.services.simulator_service import simulator

router = APIRouter(prefix="/commands", tags=["Supervisory Commands"])

command_audit_log = []


@router.post("/execute", response_model=SupervisoryCommandResponse)
async def execute_supervisory_command(payload: SupervisoryCommandRequest):
    if simulator.active_scenario == 12:
        cmd_id = str(uuid.uuid4())
        resp = SupervisoryCommandResponse(
            id=cmd_id,
            component_id=payload.component_id,
            point_id=payload.point_id,
            command_type=payload.command_type,
            requested_value=payload.requested_value,
            previous_value=0.0,
            requested_by=payload.requested_by,
            requested_at=datetime.now(timezone.utc),
            status=CommandStatus.TIMED_OUT,
            failure_reason="Safety interlock lockout active on target component."
        )
        command_audit_log.append(resp.model_dump())
        return resp
        
    cmd_id = str(uuid.uuid4())
    prev_val = 0.0
    
    if payload.command_type == "SET_FAN_SPEED":
        prev_val = simulator.supply_fan_speed_hz
        simulator.supply_fan_speed_hz = max(20.0, min(60.0, payload.requested_value))
    elif payload.command_type == "SET_HEATER_STAGES":
        prev_val = float(simulator.heater_bank_stages_active)
        target_stages = int(max(0, min(9, payload.requested_value)))
        simulator.heater_bank_stages_active = target_stages
        for i, u in enumerate(simulator.heater_units_state):
            u["state"] = "RUNNING" if i < target_stages else "STOPPED"
            u["power_kw"] = 14.2 if i < target_stages else 0.0
    elif payload.command_type == "SET_FAN_MODE":
        simulator.supply_fan_mode = payload.command_type
    
    resp = SupervisoryCommandResponse(
        id=cmd_id,
        component_id=payload.component_id,
        point_id=payload.point_id,
        command_type=payload.command_type,
        requested_value=payload.requested_value,
        previous_value=prev_val,
        requested_by=payload.requested_by,
        requested_at=datetime.now(timezone.utc),
        status=CommandStatus.CONFIRMED,
        confirmed_at=datetime.now(timezone.utc)
    )
    command_audit_log.append(resp.model_dump())
    return resp


@router.get("/audit", response_model=list[SupervisoryCommandResponse])
async def get_command_audit_log():
    return command_audit_log
