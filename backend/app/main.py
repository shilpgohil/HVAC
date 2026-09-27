import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.models.database import init_db
from app.services.simulator_service import simulator
from app.services.websocket_manager import ws_manager
from app.api.v1.facility import router as facility_router
from app.api.v1.topology import router as topology_router
from app.api.v1.components import router as components_router
from app.api.v1.telemetry import router as telemetry_router
from app.api.v1.alarms import router as alarms_router
from app.api.v1.commands import router as commands_router
from app.api.v1.simulator import router as simulator_router
from app.api.v1.controls import router as controls_router


async def simulation_loop():
    while True:
        try:
            tick_data = simulator.tick()
            await ws_manager.broadcast_json({
                "type": "SIMULATION_TICK",
                "payload": tick_data
            })
            await asyncio.sleep(1.0 / settings.SIMULATOR_TICK_RATE_HZ)
        except asyncio.CancelledError:
            break
        except Exception:
            await asyncio.sleep(1.0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    sim_task = asyncio.create_task(simulation_loop())
    yield
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(facility_router, prefix=settings.API_V1_PREFIX)
app.include_router(topology_router, prefix=settings.API_V1_PREFIX)
app.include_router(components_router, prefix=settings.API_V1_PREFIX)
app.include_router(telemetry_router, prefix=settings.API_V1_PREFIX)
app.include_router(alarms_router, prefix=settings.API_V1_PREFIX)
app.include_router(commands_router, prefix=settings.API_V1_PREFIX)
app.include_router(simulator_router, prefix=settings.API_V1_PREFIX)
app.include_router(controls_router, prefix=settings.API_V1_PREFIX)


@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


@app.get("/health")
async def health_check():
    return {"status": "HEALTHY", "system": "HVAC_DIGITAL_TWIN"}
