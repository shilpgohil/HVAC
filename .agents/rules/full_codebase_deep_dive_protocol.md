# HVAC Digital Twin — 12-Point Total Context Protocol
**Target Workspace:** `c:\Users\BAPS\Documents\space\HVAC`  
**Classification:** Mandatory Context Synchronization & Anti-Hallucination Protocol  
**Trigger:** Whenever the user asks to "go through the whole codebase", "understand all things in depth", "audit the project", or "sync full context".

---

## The 12-Point Execution Protocol

When triggered, the agent must NEVER give a generic summary or hallucinate features. It must systematically execute and report across these 12 operational pillars:

### 1. Architecture & Metadata Invariant Audit
- Verify that NO equipment names (e.g. "Chiller A", "AHU-01", "Fan-01"), sensor lists, or physical topologies are hard-coded in React components or backend route handlers.
- Confirm all equipment, points, panels, and systems instantiate dynamically from metadata and database configurations.

### 2. Three-Way Separation Audit
Verify that the three core dimensions remain strictly isolated in both code and data:
1. **Physical Topology:** What component is connected to what (e.g. AHU-01 -> Filter-01 -> CoolingCoil-01 -> Fan-01).
2. **Visual Layout:** Where objects render on the digital twin canvas (`x`, `y`, `width`, `height`, `rotation`, `layer`, `scale`). Modifying coordinates must NEVER alter physical connectivity.
3. **Telemetry:** Point definitions, live values, units, quality flags, and timestamps. Changing a point mapping must NEVER require modifying React components.

### 3. Point Model & Data Quality Verification
- Inspect point schemas: `point_id`, `component_id`, `name`, `display_name`, `point_type` (sensor, status, command, setpoint, meter, counter, alarm, mode, state, calculated), `value`, `unit`, `timestamp`, `quality`, `source`, `readable`, `writable`, `min`, `max`, `precision`.
- Verify data quality lifecycle states: `GOOD`, `UNCERTAIN`, `STALE`, `BAD`, `DISCONNECTED`, `UNKNOWN`.
- Confirm stale/offline telemetry is explicitly surfaced in the UI (e.g. `STALE`, `OFFLINE`, `NO DATA`) rather than masquerading as live data.

### 4. Equipment States & Control Modes Matrix
- Verify standardized equipment states: `NORMAL`, `RUNNING`, `STOPPED`, `STARTING`, `STOPPING`, `WARNING`, `FAULT`, `OFFLINE`, `UNKNOWN`.
- Verify control modes: `AUTO`, `MANUAL`, `REMOTE`, `LOCAL`, `LOCKED`, `OFF`.
- Ensure manual/override states are visually prominent (cyan semantic accent `#06B6D4`).
- Confirm communication offline state (`COMMUNICATION: OFFLINE`) is never conflated with equipment failure (`EQUIPMENT: FAULT`).

### 5. MQTT & Protocol Isolation Boundary
- Confirm the browser NEVER connects directly to MQTT brokers, Modbus TCP, BACnet/IP, or physical PLCs.
- Ingestion flow: `Protocol Source -> Adapter -> Canonical State Normalizer -> Database -> WebSocket -> Frontend`.
- Ensure all broker credentials, endpoints, ports, and topic prefixes reside in environment variables (`MQTT_BROKER_HOST`, `MQTT_BROKER_PORT`, etc.).

### 6. Command Safety & Two-Step Confirmation Audit
- Inspect the supervisory command pipeline: `Browser -> Backend Auth/RBAC -> Payload Validation -> Safety Rules -> MQTT Command -> PLC -> Confirmation Telemetry -> Backend -> WebSocket -> UI`.
- Verify UI NEVER assumes a command succeeded upon sending; it must display `WAITING FOR CONFIRMATION` until the physical state is confirmed.
- Confirm critical commands (Stop, E-Stop, Manual Override, Out-of-bounds Setpoint, Fault Reset) mandate two-step confirmation.

### 7. Alarm & Event Lifecycle Audit
- Verify alarm entities: `alarm_id`, `component_id`, `point_id`, `severity` (INFO, WARNING, CRITICAL, EMERGENCY), `condition`, `value_at_trigger`, `threshold`, `timestamp`, `state` (ACTIVE, ACKNOWLEDGED, CLEARED).
- Confirm acknowledging an alarm does NOT clear it (`ACTIVE + ACKNOWLEDGED` remains until the physical fault clears).
- Verify alarms visually highlight physical equipment on the digital twin schematic.

### 8. Physical Simulator & Thermodynamic Scenarios
- Confirm realistic coupled thermodynamics in development mode:
  - Room temp rises -> cooling valve modulates open -> CHW flow rises -> leaving air temp drops -> supply temp changes -> chiller load responds.
  - Fan speed ramps -> airflow increases -> static pressure changes -> power consumption increases.
- Audit all 12 operational scenarios: Normal, High cooling demand, Fan failure, Pump failure, High filter DP, Low CHW flow, High supply temp, Sensor failure, Comms failure, Stale data, Manual override, Command failure.

### 9. Industrial Design System & Anti-AI-UI Standards
- Palette: Control-room dark base (`#031427`, `#020617`, `#0F172A`, `#102034`, `#1B2B3F`, `#26364A`); Technical text (`#D3E4FE`, `#C5C6CD`); Semantic accents (Healthy `#22C55E`, Warning `#F59E0B`, Critical `#EF4444`, Stale `#94A3B8`, Manual `#06B6D4`).
- Typography: `Inter` for UI/headings/labels; `JetBrains Mono` for all telemetry, numbers, timestamps, IDs, engineering values.
- Digital Twin: Real interactive SVG with data-driven flow paths and particles whose velocity maps to actual flow rate (`flow = 0` stops movement).

### 10. Web & Mobile Responsive Execution
- Desktop (>1280px): Full 12-column operational schematic, telemetry overlays, diagnostic drawers.
- Tablet (768–1280px): Adaptive two-column engineered panels.
- Mobile (<768px): Horizontally pannable digital twin, sticky KPI summaries, cards replacing dense tables, preserved two-step safety controls.

### 11. Code Craft & No-Comments Invariant
- **No Boilerplate Comments:** Zero trivial, redundant, or explanatory comments in code. Code must be self-documenting through precise domain naming, typed interfaces, and clean structure.
- **Anti-AI-Code Standards:** No fake fallback numbers, no monolithic files, no invented diagnostic text, no placeholder mocks masquerading as real code.

### 12. End-to-End Verification & Round-Trip Telemetry
- Validate round-trip telemetry propagation: `Simulator/PLC -> MQTT -> Backend -> WebSocket -> Digital Twin UI`.
- Validate supervisory control round-trip: `UI Command -> Backend -> MQTT -> Simulator/PLC -> State Change -> Telemetry Return -> UI Confirmation`.
