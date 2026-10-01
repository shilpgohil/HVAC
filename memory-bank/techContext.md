# Technical Context & Environment

## Core Tech Stack
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2, asyncpg, asyncio-mqtt
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript (`strict: true`), Tailwind CSS v4, Lucide React
- **Design Intelligence & CLI:** `ui-ux-design-pro` skill (.agents/skills/ui-ux-design-pro) with BM25 / Orama search engine, 28 CSV databases, and Node.js/Bun CLI via `scripts/design-cli.bat`
- **Database:** PostgreSQL 16+ (Docker locally / Managed Cloud in production)
- **Message Broker:** MQTT (EMQX / Eclipse Mosquitto)
- **Real-Time:** WebSockets (native FastAPI)
- **Fonts:** `Plus Jakarta Sans` / `Inter` (UI/Labels) & `JetBrains Mono` (Telemetry/Numbers/Timestamps with `tnum` and `zero` OpenType features)

## Design System CLI Commands
- Generate Design System: `scripts\design-cli.bat generate "HVAC Industrial Digital Twin" --stack nextjs --output design.md`
- Search Design Knowledge: `scripts\design-cli.bat search "<pattern>"`
- Audit Frontend Files: `scripts\design-cli.bat audit frontend/src/components/<File>.tsx`
- Search Icon Libraries: `scripts\design-cli.bat icons "<term>"`

## Ports & Endpoints (Development Target)
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- WebSocket Server: `ws://localhost:8000/ws/telemetry`
- PostgreSQL: `localhost:5432`
- MQTT Broker: `localhost:1883` (or configured dev broker `broker.emqx.io:1883`)
