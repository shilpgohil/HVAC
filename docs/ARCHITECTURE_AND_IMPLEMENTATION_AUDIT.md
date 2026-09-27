# HVAC Digital Twin — Architecture & Implementation Audit
**Phase 1 Foundation Document**  
**Document Version:** 1.0.0  
**Target:** `c:\Users\BAPS\Documents\space\HVAC`  
**Date:** September 2026

---

## 1. Executive Summary & Purpose

This document delivers the mandatory Phase 1 Architecture & Implementation Audit required by Section 80 of the HVAC Digital Twin Master Specification. It establishes the architectural blueprint, data contracts, simulation physics, security boundaries, and engineering standards necessary to build an industrial-grade digital twin without hard-coding equipment or falling into generic SaaS traps.

---

## 2. Current Repository Status & Technology Baseline

### Current Directory Structure
```
c:\Users\BAPS\Documents\space\HVAC\
├── .agents\
│   └── rules\
│       ├── full_codebase_deep_dive_protocol.md     # 12-point Total Context Protocol
│       ├── digital_twin_and_domain_architecture.md # Component, Point, Quality models
│       ├── mqtt_websocket_and_safety_controls.md   # Network boundary & command safety
│       ├── simulator_and_thermodynamic_scenarios.md# Physics engine & 12 test scenarios
│       ├── ui_ux_industrial_design_system.md      # Control room UI & responsive design
│       └── code_craft_and_anti_ai_rules.md         # No-comments & clean code rules
├── docs\
│   └── ARCHITECTURE_AND_IMPLEMENTATION_AUDIT.md    # This master audit document
├── main documents\
│   └── master prompt                               # Master client prompt specification
├── memory-bank\
│   ├── activeContext.md
│   ├── progress.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   └── productContext.md
└── GEMINI.md                                       # Master agent context & deep-dive triggers
```

### Target Technology Stack
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2, asyncpg, asyncio-mqtt.
- **Database:** PostgreSQL 16+ (timescale/relational hybrid design).
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript (`strict: true`), Tailwind CSS, Lucide React.
- **Message Broker:** MQTT (EMQX / Eclipse Mosquitto).
- **Real-Time Layer:** Native FastAPI WebSockets.

---

## 3. Discovered Stitch Reference Screens & Component Index

The visual reference design establishes 5 core views and 1 kinetic interaction specification:

1. **Operational Overview Screen:**
   - Global facility status, health index, master controller (PLC) communication status.
   - High-level system KPIs (Power draw, Total Cooling Tons, Plant COP, Active Alarms, Chilled Water supply/return $\Delta T$).
   - Quick subsystem status summary (Chiller Plant, Air Handling Units, Pumping Stations).
   - Stale/offline equipment alert banners.

2. **Live System Schematic Screen:**
   - Large interactive vector digital twin canvas.
   - Dynamic fluid flow paths: air loop (Fresh Air -> Filter -> Cooling Coil -> Supply Fan -> Conditioned Space) and hydronic loop (Chiller Evaporator -> Chilled Water Pump -> Cooling Coil -> Return Header).
   - Flow particle animations whose velocity reflects live flow rates ($m^3/h$, $L/s$, $GPM$).
   - Live telemetry overlay badges with quality indicators.
   - Clickable components opening diagnostic inspector drawers.

3. **Equipment Detail & Chiller Detail Template:**
   - Dynamically generated from metadata (not hard-coded per chiller).
   - Real-time operating KPIs, electrical power metrics, runtime hours, stage status.
   - Point trend viewer with selectable time windows (1H, 6H, 24H, 7D, 30D).
   - Two-step supervisory command control panel (Start, Stop, Setpoint Adjustment, Manual Override).
   - Equipment alarm history and specifications sheet.

4. **System Topology View:**
   - Relational tree and network diagram: Site -> Building -> Gateway -> PLC -> Panels -> Systems -> Equipment -> Subcomponents.
   - Dynamic node generation based on database relationships (never a fixed 7-node diagram).
   - Visual health badges on every node showing communication status.

5. **Alarm & Event Center:**
   - Live alarm table filtered by severity (`INFO`, `WARNING`, `CRITICAL`, `EMERGENCY`), state (`ACTIVE`, `ACKNOWLEDGED`, `CLEARED`), and equipment.
   - Right-side slide-over drawer with trigger value, threshold, timestamp, historical occurrences, and recommended operating action.
   - Single and bulk operator acknowledgement with required operator notes.

6. **Kinetic Operational Interface Specification:**
   - Industrial control room dark theme (`#031427` canvas, `#102034` panels).
   - Typography: `Inter` for interface elements; `JetBrains Mono` for telemetry and numerical readings.
   - High-density layout with 4px grid baseline.
   - Cyan semantic highlight (`#06B6D4`) reserved for manual overrides and active focus states.

---

## 4. Proposed Domain Model

The domain architecture decouples the physical asset hierarchy, the sensory points, the spatial layout, and operational state:

```
[ Site ]
   └── [ Building ]
          └── [ HVAC System ]
                 └── [ Component ] (Physical: Chiller, AHU, Pump, Coil, Valve)
                        ├── [ Component Relationship ] (Physical Topology)
                        ├── [ Visual Config ] (Canvas x, y, rotation, scale)
                        ├── [ Point ] (Sensory / Command point)
                        │      ├── [ Telemetry ] (Historical timeseries)
                        │      └── [ Alarm Definition ] ──> [ Alarm Event ]
                        └── [ Command Definition ] ──────> [ Command Execution ]
```

---

## 5. Proposed Database Schema (PostgreSQL 16+)

```sql
-- Sites & Buildings
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    timezone VARCHAR(64) DEFAULT 'UTC' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    total_area_sqm NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(site_id, code)
);

CREATE TABLE hvac_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    system_type VARCHAR(64) NOT NULL, -- chilled_water_plant, ahu_air_system, etc.
    design_capacity_kw NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(building_id, code)
);

-- Components (Physical Equipment & Sub-elements)
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_id UUID NOT NULL REFERENCES hvac_systems(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES components(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    component_type VARCHAR(64) NOT NULL, -- chiller, pump, fan, cooling_coil, valve, damper
    manufacturer VARCHAR(128),
    model_number VARCHAR(128),
    serial_number VARCHAR(128),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(system_id, code)
);

-- Physical Topology Relationships (Piping / Ducting Connectivity)
CREATE TABLE component_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_id UUID NOT NULL REFERENCES hvac_systems(id) ON DELETE CASCADE,
    source_component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    target_component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    medium VARCHAR(32) NOT NULL, -- chilled_water, condenser_water, supply_air, return_air
    flow_direction VARCHAR(16) DEFAULT 'forward' NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    UNIQUE(source_component_id, target_component_id, medium)
);

-- Visual Layout Coordinates (Digital Twin Vector Canvas)
CREATE TABLE visual_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID UNIQUE NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    canvas_x NUMERIC(8,2) NOT NULL,
    canvas_y NUMERIC(8,2) NOT NULL,
    width NUMERIC(8,2) NOT NULL,
    height NUMERIC(8,2) NOT NULL,
    rotation_deg NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    layer_index INT DEFAULT 1 NOT NULL,
    render_symbol VARCHAR(64) NOT NULL, -- chiller_centrifugal, coil_finned, fan_centrifugal
    svg_metadata JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- Points (Sensors, Setpoints, Commands, Modes)
CREATE TABLE points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    point_type VARCHAR(32) NOT NULL, -- sensor, status, command, setpoint, meter, alarm
    engineering_unit VARCHAR(32) NOT NULL, -- degC, kPa, L/s, kW, %, Hz
    display_unit VARCHAR(32) NOT NULL,
    precision INT DEFAULT 1 NOT NULL,
    min_value NUMERIC(12,2),
    max_value NUMERIC(12,2),
    is_writable BOOLEAN DEFAULT FALSE NOT NULL,
    stale_threshold_seconds INT DEFAULT 30 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(component_id, code)
);

-- Current State Cache (Fast in-memory/DB read)
CREATE TABLE current_point_state (
    point_id UUID PRIMARY KEY REFERENCES points(id) ON DELETE CASCADE,
    value NUMERIC(14,4),
    raw_value TEXT,
    quality VARCHAR(32) DEFAULT 'UNKNOWN' NOT NULL, -- GOOD, UNCERTAIN, STALE, BAD, DISCONNECTED, UNKNOWN
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Historical Telemetry (Timeseries)
CREATE TABLE telemetry_history (
    id BIGSERIAL PRIMARY KEY,
    point_id UUID NOT NULL REFERENCES points(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    value NUMERIC(14,4) NOT NULL,
    quality VARCHAR(32) NOT NULL
);
CREATE INDEX ix_telemetry_point_time ON telemetry_history(point_id, timestamp DESC);

-- Alarms
CREATE TABLE alarms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    point_id UUID REFERENCES points(id) ON DELETE SET NULL,
    severity VARCHAR(16) NOT NULL, -- info, warning, critical, emergency
    state VARCHAR(16) DEFAULT 'active' NOT NULL, -- active, acknowledged, cleared
    condition VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    trigger_value NUMERIC(14,4),
    threshold_value NUMERIC(14,4),
    triggered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    acknowledged_by VARCHAR(128),
    acknowledged_at TIMESTAMPTZ,
    cleared_at TIMESTAMPTZ,
    notes TEXT
);
CREATE INDEX ix_alarms_state_sev ON alarms(state, severity, triggered_at DESC);

-- Commands & Audit Log
CREATE TABLE supervisory_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    point_id UUID NOT NULL REFERENCES points(id) ON DELETE CASCADE,
    command_type VARCHAR(64) NOT NULL, -- START, STOP, SET_SETPOINT, MANUAL_OVERRIDE
    requested_value NUMERIC(14,4) NOT NULL,
    previous_value NUMERIC(14,4),
    requested_by VARCHAR(128) NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status VARCHAR(32) DEFAULT 'sent' NOT NULL, -- sent, acked, confirmed, failed, timed_out
    confirmed_at TIMESTAMPTZ,
    failure_reason TEXT
);
```

---

## 6. MQTT Ingestion & Broker Contract

### Topic Architecture
```
hvac/{site_code}/{system_code}/{component_code}/telemetry
hvac/{site_code}/{system_code}/{component_code}/state
hvac/{site_code}/{system_code}/{component_code}/alarm
hvac/{site_code}/{system_code}/{component_code}/cmd/{command_type}
hvac/{site_code}/{system_code}/{component_code}/cmd_ack
hvac/{site_code}/gateway/{gateway_code}/heartbeat
```

### Telemetry Payload Schema
```json
{
  "site": "SITE-01",
  "system": "CHW-PLANT-01",
  "component": "CHILLER-01",
  "timestamp": "2026-09-27T18:30:00.124Z",
  "points": [
    { "code": "chw_supply_temp", "val": 6.8, "q": "GOOD" },
    { "code": "chw_return_temp", "val": 12.4, "q": "GOOD" },
    { "code": "chw_flow_rate", "val": 45.2, "q": "GOOD" },
    { "code": "compressor_power_kw", "val": 182.5, "q": "GOOD" },
    { "code": "cop", "val": 5.4, "q": "GOOD" },
    { "code": "operating_state", "val": "RUNNING", "q": "GOOD" },
    { "code": "control_mode", "val": "AUTO", "q": "GOOD" }
  ]
}
```

### Command Dispatch Payload Schema
```json
{
  "command_id": "8f8b8df2-2615-46aa-b2b9-e1f9859f13c2",
  "component": "CHILLER-01",
  "command": "SET_SETPOINT",
  "point": "chw_setpoint_temp",
  "value": 7.0,
  "requested_by": "operator_jane",
  "timestamp": "2026-09-27T18:31:00Z"
}
```

---

## 7. WebSocket Contract & Granular Event Taxonomy

Endpoint: `ws://localhost:8000/ws/telemetry`

Client subscribes to specific systems or components:
```json
{ "action": "subscribe", "systems": ["CHW-PLANT-01", "AHU-SYSTEM-01"] }
```

### Event Payloads Emitted by Backend
1. **Point Update (`POINT_UPDATED`):**
   ```json
   {
     "event": "POINT_UPDATED",
     "point_id": "7b049d5a-b620-4e36-ba71-e9bf8452ef29",
     "component_id": "3c98d697-a7ea-4f9e-a89b-90f6b4e3a891",
     "value": 6.85,
     "quality": "GOOD",
     "timestamp": "2026-09-27T18:32:00.541Z"
   }
   ```
2. **Equipment State (`EQUIPMENT_STATE_CHANGED`):**
   ```json
   {
     "event": "EQUIPMENT_STATE_CHANGED",
     "component_id": "3c98d697-a7ea-4f9e-a89b-90f6b4e3a891",
     "state": "WARNING",
     "mode": "MANUAL",
     "timestamp": "2026-09-27T18:32:01.000Z"
   }
   ```
3. **Alarm Lifecycle (`ALARM_CREATED`, `ALARM_ACKNOWLEDGED`, `ALARM_CLEARED`):**
   ```json
   {
     "event": "ALARM_CREATED",
     "alarm_id": "2d8f760e-8424-4f24-9b24-b15904d9b23f",
     "component_id": "3c98d697-a7ea-4f9e-a89b-90f6b4e3a891",
     "severity": "CRITICAL",
     "message": "Low Evaporator Chilled Water Flow",
     "triggered_at": "2026-09-27T18:32:05Z"
   }
   ```
4. **Command Feedback (`COMMAND_STATUS_CHANGED`):**
   ```json
   {
     "event": "COMMAND_STATUS_CHANGED",
     "command_id": "8f8b8df2-2615-46aa-b2b9-e1f9859f13c2",
     "status": "CONFIRMED",
     "confirmed_at": "2026-09-27T18:31:04.215Z"
   }
   ```

---

## 8. Physical Simulator Architecture

The simulator is a coupled physical model running as a background service:

```
[ Ambient / Load Conditions ]
             │
             ▼
[ Thermal Space Balance ] ──(Room Temp)──> [ Cooling Coil PID ]
                                                    │
                                         (Valve Position %)
                                                    │
                                                    ▼
[ Chiller Evaporator Heat Load ] <──(CHW Flow)── [ CHW Hydraulic Loop ]
             │
             ▼
[ Compressor Power & COP ]
```

### The 12 Supported Test Scenarios
1. **Normal Operation:** Equilibrium state, normal setpoint tracking.
2. **High Cooling Demand:** Ambient step change + occupancy surge.
3. **Supply Fan Run Failure:** Current switch fails open -> critical alarm.
4. **CHW Pump Trip:** Circuit breaker opens -> flow stops -> interlock trip.
5. **High Filter Differential Pressure:** Filter dust loading > 250 Pa.
6. **Low Evaporator Flow:** Flow throttled below minimum chiller boundary.
7. **High Supply Air Temperature:** Leaving air temperature exceeds setpoint + 4°C.
8. **Sensor Open Circuit:** Thermocouple opens -> `BAD` quality generated.
9. **Gateway Offline:** Ping timeout -> communication red, downstream `STALE`.
10. **Stale Telemetry:** Sensor clock freezes -> `STALE` quality generated.
11. **Manual Override:** VFD speed forced to 60 Hz -> cyan `#06B6D4` mode.
12. **Command Fail / Timeout:** Compressor oil pressure safety inhibits start.

---

## 9. Frontend Component Architecture

```
frontend/src/
├── app/
│   ├── layout.tsx              # Root HTML, Inter & JetBrains Mono font declarations
│   ├── page.tsx                # Facility Operational Overview
│   ├── schematic/              # Live Interactive Digital Twin Schematic
│   ├── equipment/[id]/         # Dynamic Equipment Detail (Chiller, AHU, Pump)
│   ├── topology/               # Network & Automation Topology Tree
│   └── alarms/                 # Alarm & Event Management Center
├── components/
│   ├── digital-twin/           # Vector SVG Digital Twin Canvas
│   │   ├── SvgCanvas.tsx       # Pannable, zoomable SVG container
│   │   ├── nodes/              # Equipment SVG nodes (ChillerNode, AHUNode, FanNode)
│   │   ├── flows/              # Data-driven flow pipes & animated particles
│   │   └── badges/             # Live telemetry overlay badges
│   ├── controls/               # Supervisory Command Modal & 2-Step Confirmations
│   ├── diagnostics/            # Slide-over equipment inspector drawer
│   ├── alarms/                 # Alarm queue & acknowledgement drawer
│   └── common/                 # Header, Sidebar, MetricCard, QualityBadge
├── hooks/
│   ├── useWebSocket.ts         # Live WebSocket connection manager
│   ├── useTelemetryPoint.ts    # Granular subscription hook for individual points
│   └── useAlarms.ts            # Alarm queue store
└── lib/
    ├── api.ts                  # REST API client
    ├── colorTokens.ts          # Semantic color constants
    └── units.ts                # Engineering unit formatting utilities
```

---

## 10. Backend Modular Architecture

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── sites.py        # Site & building CRUD
│   │       ├── systems.py      # System topology
│   │       ├── components.py   # Equipment metadata & visual config
│   │       ├── telemetry.py    # Current state & historical query
│   │       ├── alarms.py       # Alarm queries & operator acknowledgement
│   │       ├── commands.py     # Two-step supervisory command dispatch
│   │       └── simulator.py    # Scenario switching endpoint
│   ├── core/
│   │   ├── config.py           # Pydantic v2 settings (MQTT, DB, JWT)
│   │   ├── errors.py           # Domain typed error definitions
│   │   └── security.py         # RBAC permission evaluation
│   ├── models/                 # SQLAlchemy 2.0 async database models
│   ├── schemas/                # Pydantic v2 validation contracts
│   ├── services/
│   │   ├── telemetry_normalizer.py # Ingestion & quality calculation
│   │   ├── command_supervisor.py   # Command dispatch & confirmation loop
│   │   ├── alarm_evaluator.py      # Threshold crossing & lifecycle engine
│   │   └── websocket_broadcaster.py# Granular event distribution
│   ├── integrations/
│   │   ├── mqtt_client.py      # Background asyncio-mqtt ingestion loop
│   │   └── simulator_engine.py # Physics loop for development mode
│   └── main.py                 # FastAPI application factory
```

---

## 11. Configuration & Security Strategy

1. **Environment Separation:** Dev uses local SQLite/PostgreSQL and the internal simulation engine; production connects to real enterprise MQTT brokers.
2. **Credential Privacy:** MQTT passwords and database secrets reside exclusively in `.env`.
3. **Role-Based Authorization:**
   - `Viewer`: Read-only telemetry, alarms, and trends.
   - `Operator`: Alarm acknowledgement, standard setpoint adjustment within safe limits.
   - `Engineer`: Full command dispatch, manual overrides, tuning PID limits.
   - `Administrator`: User management, site configuration, visual layout editing.
4. **Command Audit Log:** Every setpoint alteration or manual override records operator ID, timestamp, previous value, requested value, and physical confirmation.

---

## 12. Testing Strategy & Verification Order

1. **Unit Testing:** Pydantic schema validation, thermodynamics math functions, unit conversion functions.
2. **Adapter & Normalizer Testing:** Raw MQTT payload decoding into canonical point entities and quality states.
3. **Command Loop Testing:** Dispatch -> Mock Broker -> Confirmation -> Status transition.
4. **WebSocket Propagation Testing:** Granular event broadcast to multiple client mock connections.
5. **End-to-End Simulation Testing:** Trigger scenario 3 (Fan Fail) -> Verify critical alarm -> Verify UI highlight -> Acknowledge -> Clear.

---

## 13. Missing Information (Questions for the Client's HVAC Engineer)

Before final production commissioning against physical plant hardware, the following domain parameters must be confirmed:
1. **Specific Equipment Point Lists:** Modbus registers / BACnet object identifiers for each physical chiller, boiler, and AHU.
2. **Chiller Minimum Evaporator Flow Limits:** Exact low-flow cut-off threshold ($GPM$ or $L/s$) before safety trip.
3. **Filter Differential Pressure Trip Points:** Exact warning threshold (e.g., 200 Pa vs 250 Pa) based on installed filter media.
4. **Control Authorization Levels:** Specific personnel permitted to issue manual overrides on central chillers.

---

## 14. Risks & Mitigations

| Risk | Impact | Architectural Mitigation |
|---|---|---|
| **High WebSocket Telemetry Frequency** | Browser thread lockup / UI lag | Point-level selective subscription, memoized SVG nodes, throttling update rate to 2 Hz max for high-frequency points. |
| **MQTT Broker Disconnection** | Loss of real-time monitoring | Automatic reconnect with exponential backoff; UI instantly transitions telemetry to `STALE` and flags communication `OFFLINE`. |
| **Accidental Equipment Trip via UI** | Costly plant interruption | Mandatory two-step confirmation dialogs for all critical actions; backend safety validation checks setpoint limits. |
| **Inaccurate Thermodynamic Simulation** | Unrealistic development testing | Coupled physical equations for heat transfer, water flow, and fan affinity laws built into the simulator. |
