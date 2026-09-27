# Technical Context & Environment

## Core Tech Stack
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2, asyncpg, asyncio-mqtt
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React
- **Database:** PostgreSQL 16+ (Docker locally / Managed Cloud in production)
- **Message Broker:** MQTT (EMQX / Eclipse Mosquitto)
- **Real-Time:** WebSockets (native FastAPI)
- **Fonts:** `Inter` (UI/Labels) & `JetBrains Mono` (Telemetry/Numbers/Timestamps)

## Ports & Endpoints (Development Target)
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- WebSocket Server: `ws://localhost:8000/ws/telemetry`
- PostgreSQL: `localhost:5432`
- MQTT Broker: `localhost:1883` (or configured dev broker `broker.emqx.io:1883`)
