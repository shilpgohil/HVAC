# HVAC Digital Twin — Antigravity Agent Master Context

> **Read `memory-bank/activeContext.md` and `memory-bank/progress.md` FIRST before every session.**
> Then inspect relevant domain rules in `.agents/rules/` before writing or modifying any code.

---

## 1. Product Identity

**HVAC Digital Twin & Supervisory Control Platform** is an industrial-grade, configuration-driven software digital twin for mission-critical HVAC installations (central chilled water plants, air handling systems, variable refrigerant flow, and district cooling).

It is NOT:
- A generic SaaS dashboard.
- A static SVG/screenshot visualization with hard-coded labels.
- A frontend-only prototype.
- A collection of hard-coded equipment pages.

**Core Responsibilities:**
```
VISUALIZE (Interactive SVG Twin) ---> MONITOR (Live Telemetry & Alarms) ---> ANALYZE (Energy, COP, Trends) ---> CONTROL (Supervisory Two-Step Commands)
```

**Key Operational Hierarchy:**
```
Site ---> Building ---> HVAC System ---> Equipment (AHU, Chiller, Pump) ---> Components (Coil, Fan, Valve) ---> Points (Telemetry & Commands)
```

---

## 2. Technology Stack & Topology

| Layer | Technology | Primary Responsibility |
|---|---|---|
| **Backend** | Python 3.12+, FastAPI, SQLAlchemy 2.0 async, Pydantic v2 | Canonical domain state, telemetry normalization, command authorization, REST & WebSocket APIs |
| **Database** | PostgreSQL 16+ (asyncpg) | Equipment topology, point definitions, historical telemetry, alarms, command audit log |
| **Ingestion** | MQTT Client (`paho-mqtt` / `asyncio-mqtt`), BACnet/Modbus adapters | Protocol isolation, broker ingestion, translation to canonical points |
| **Real-Time** | WebSockets (native FastAPI) | Low-latency, granular live point and equipment state event broadcasting |
| **Simulation** | Thermodynamic Physics Simulator | Coupled thermal & pressure simulation, 12 test failure scenarios |
| **Frontend** | Next.js 15 App Router, React 19, TypeScript (`strict: true`), Tailwind CSS | High-density industrial control room UI, interactive SVG digital twin, diagnostic drawers |
| **Typography** | `Inter` (UI/Labels) + `JetBrains Mono` (Telemetry/Numbers) | Tabular alignment, zero-jitter live telemetry |

---

## 3. Core Architectural Invariants

1. **Never Hardcode the HVAC System:** Equipment, components, sensor lists, PLC registers, and schematic coordinates are 100% dynamic, instantiated from metadata and database configurations.
2. **Strict Three-Way Separation:** Physical Topology (what connects to what), Visual Layout (SVG coordinates $x, y, \theta$), and Telemetry (points, quality, values) are completely decoupled.
3. **No Direct Browser-to-PLC/MQTT Connections:** The browser communicates exclusively with the backend via authenticated REST and WebSocket endpoints.
4. **Command Safety & Two-Step Confirmations:** Commands require backend authorization and payload validation. Critical actions require two-step confirmation. The UI waits for physical telemetry confirmation before indicating success.
5. **No Fake Data in Production:** In development, the physical simulator generates realistic thermodynamic data. In production, if telemetry is missing, the UI honestly displays `UNKNOWN`, `NO DATA`, `STALE`, or `OFFLINE`.
6. **No Comments Rule:** Code must be clean, self-documenting, and type-safe. Zero redundant, trivial, or explanatory boilerplate comments in code.

---

## 4. Deep-Dive Trigger Protocol

Whenever you ask the agent:
- *"go through the whole codebase"*
- *"understand all things perfectly in depth"*
- *"make sure you have total context of the whole codebase"*
- *"sync / refresh full context"*
- *"audit the entire project"*

The agent is strictly bound by **[.agents/rules/full_codebase_deep_dive_protocol.md](.agents/rules/full_codebase_deep_dive_protocol.md)** to execute the **12-Point Total Context Protocol**:
1. **Architecture & Metadata Invariant Audit:** Verify no equipment is hard-coded.
2. **Three-Way Separation Audit:** Verify physical topology, visual layout, and telemetry isolation.
3. **Point Model & Data Quality Verification:** Audit quality flags (`GOOD`, `UNCERTAIN`, `STALE`, `BAD`, `DISCONNECTED`, `UNKNOWN`).
4. **Equipment States & Control Modes:** Audit operating states and manual override indicators.
5. **MQTT & Protocol Isolation:** Confirm the browser is isolated from MQTT/PLC.
6. **Command Safety Pipeline:** Audit two-step confirmation and timeout handling.
7. **Alarm & Event Lifecycle:** Verify `ACTIVE`, `ACKNOWLEDGED`, `CLEARED` states and audit logging.
8. **Simulator Physics:** Verify thermodynamic coupling across the 12 scenarios.
9. **Industrial Design Standards:** Enforce dark control room palette and `JetBrains Mono` telemetry.
10. **Web & Mobile Responsive Execution:** Desktop schematic, tablet 2-column, mobile horizontal pan & card transformation.
11. **Code Craft & No-Comments Rule:** Enforce self-documenting code with zero boilerplate comments.
12. **End-to-End Round-Trip Verification:** Validate telemetry ingestion and command confirmation loops.

---

## 5. Active Workspace Rules (`.agents/rules/`)

Antigravity automatically loads all 5 specialized rule files into its active context:

1. **[full_codebase_deep_dive_protocol.md](.agents/rules/full_codebase_deep_dive_protocol.md)**: 12-Point Total Context Protocol triggered whenever you ask the agent to go through the whole code in depth.
2. **[digital_twin_and_domain_architecture.md](.agents/rules/digital_twin_and_domain_architecture.md)**: Component model, point metadata schema, data quality lifecycles, equipment states, control modes, and engineering precision.
3. **[mqtt_websocket_and_safety_controls.md](.agents/rules/mqtt_websocket_and_safety_controls.md)**: Network boundary, configuration-driven MQTT, WebSocket event taxonomy, two-step safety controls, and command audit trail.
4. **[simulator_and_thermodynamic_scenarios.md](.agents/rules/simulator_and_thermodynamic_scenarios.md)**: Coupled physics simulation, 12 operational test scenarios, and zero fake data in production.
5. **[ui_ux_industrial_design_system.md](.agents/rules/ui_ux_industrial_design_system.md)**: Control room aesthetic, color tokens, `Inter` and `JetBrains Mono` typography, interactive SVG digital twin, and responsive desktop-to-mobile layouts.
6. **[code_craft_and_anti_ai_rules.md](.agents/rules/code_craft_and_anti_ai_rules.md)**: Non-negotiable No-Comments rule, anti-AI-code standards, strong typing, and modular architectures.

---

Workspace: `c:\Users\BAPS\Documents\space\HVAC`  
Last updated: September 2026
