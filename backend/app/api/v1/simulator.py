from fastapi import APIRouter
from typing import List
from app.schemas.domain import SimulatorScenarioResponse
from app.services.simulator_service import simulator

router = APIRouter(prefix="/simulator", tags=["Thermodynamic Simulator"])


@router.get("/scenarios", response_model=List[SimulatorScenarioResponse])
async def list_simulator_scenarios():
    scenarios = []
    for sc_id, data in simulator.scenario_definitions.items():
        scenarios.append(SimulatorScenarioResponse(
            scenario_id=sc_id,
            name=data["name"],
            description=data["desc"],
            active=(sc_id == simulator.active_scenario)
        ))
    return scenarios


@router.post("/scenarios/{scenario_id}")
async def activate_simulator_scenario(scenario_id: int):
    return simulator.set_scenario(scenario_id)
