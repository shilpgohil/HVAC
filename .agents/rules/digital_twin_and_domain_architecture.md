# HVAC Digital Twin — Domain Architecture & Data Modeling
**Target Workspace:** `c:\Users\BAPS\Documents\space\HVAC`  
**Classification:** Core Domain Modeling & Architectural Invariants  
**Last Updated:** September 2026

---

## 1. The Fundamental Invariant: Never Hard-Code Equipment

The platform is an extensible HVAC Digital Twin Engine. Equipment instances, connection topologies, sensor points, and spatial schematic layouts are instantiated dynamically from database models and configuration files. Never hard-code equipment names, point mappings, or fixed component counts into React components or API routes.

---

## 2. Three-Way Architectural Separation

The system strictly decouples physical connectivity, visual layout, and live telemetry:

```
[ Physical Topology ] <---> [ Canonical Component ] <---> [ Visual Layout ]
 (Equipment & Pipes)               ^ (Point Model)              (SVG x, y, rot)
                                   |
                          [ Live Telemetry ]
                        (Quality, Value, Timestamp)
```

1. **Physical Topology:** Defines what is connected to what (e.g., `Chiller-01` -> `CHWP-01` -> `CoolingCoil-01` -> `ReturnPipe-01`).
2. **Visual Layout:** Defines spatial coordinates on the digital twin canvas (`x`, `y`, `width`, `height`, `rotation`, `layer`, `scale`, `parent_group`). Moving an element on the canvas has zero impact on physical topology.
3. **Live Telemetry:** Defines dynamic point values, engineering units, quality flags, and timestamps. Changing point tags or sensor hardware does not modify visual layouts or React component structures.

---

## 3. Component Model

Every physical or logical asset is modeled as a `Component`:

```typescript
interface Component {
  id: string;
  site_id: string;
  building_id?: string;
  system_id?: string;
  parent_id?: string;
  name: string;
  display_name: string;
  component_type: ComponentType;
  model_number?: string;
  serial_number?: string;
  manufacturer?: string;
  rated_capacity?: number;
  capacity_unit?: string;
  installed_at?: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
}
```

### Component Types
- **Plants & Packages:** `site`, `building`, `hvac_system`, `chiller_plant`, `boiler_plant`
- **Primary Equipment:** `chiller`, `boiler`, `cooling_tower`, `ahu` (Air Handling Unit), `rtu` (Rooftop Unit), `fcu` (Fan Coil Unit), `erv` (Energy Recovery Ventilator)
- **Moving Machinery:** `pump`, `fan`, `compressor`, `vfd` (Variable Frequency Drive)
- **Control Elements:** `control_valve`, `balancing_valve`, `isolation_valve`, `damper`, `variable_air_volume` (VAV box)
- **Thermal & Filtration:** `cooling_coil`, `heating_coil`, `air_filter`, `humidifier`, `heat_exchanger`
- **Distribution:** `duct_segment`, `pipe_segment`, `header`, `diffuser`, `grille`
- **Automation & Space:** `plc`, `control_panel`, `gateway`, `zone`, `room`

---

## 4. Point Metadata Schema

Every sensor, control point, or calculated metric follows the canonical point schema:

```typescript
type PointType = 
  | "sensor"
  | "status"
  | "command"
  | "setpoint"
  | "meter"
  | "counter"
  | "alarm"
  | "mode"
  | "state"
  | "calculated";

type DataQuality = 
  | "GOOD"
  | "UNCERTAIN"
  | "STALE"
  | "BAD"
  | "DISCONNECTED"
  | "UNKNOWN";

interface Point {
  point_id: string;
  component_id: string;
  name: string;
  display_name: string;
  point_type: PointType;
  engineering_unit: string;
  display_unit: string;
  min_value?: number;
  max_value?: number;
  precision: number;
  is_readable: boolean;
  is_writable: boolean;
  source_protocol: "mqtt" | "bacnet" | "modbus" | "simulation" | "calculated";
  source_address: string;
  current_value: number | string | boolean | null;
  quality: DataQuality;
  timestamp: string;
  stale_threshold_seconds: number;
}
```

---

## 5. Data Quality Lifecycles

Telemetry without a quality flag is incomplete:
- **`GOOD`:** Fresh data received within the expected heartbeat window with valid CRC/range.
- **`UNCERTAIN`:** Out of normal calibrated range or sensor drifting warning.
- **`STALE`:** No update received within `stale_threshold_seconds`. UI must clearly display `STALE` with muted gray badges (`#94A3B8`). Never show stale data as live green.
- **`BAD`:** Parity error, out-of-bounds electrical reading (e.g. 4-20mA open loop), or sensor fault.
- **`DISCONNECTED` / `OFFLINE`:** PLC, gateway, or MQTT broker unreachable.
- **`UNKNOWN`:** Initial state prior to first telemetry transmission.

---

## 6. Standardized Equipment States & Control Modes

### Equipment Operating States
- `NORMAL` / `RUNNING`: Operating within nominal design limits (Green `#22C55E`).
- `STOPPED`: Commanded off or standby (Slate `#64748B`).
- `STARTING` / `STOPPING`: Transient state awaiting physical confirmation (Amber `#F59E0B`).
- `WARNING`: Running but experiencing out-of-spec parameters, e.g. high filter DP (Amber `#F59E0B`).
- `FAULT`: Tripped or interlocked on safety condition (Red `#EF4444`).
- `OFFLINE`: Communication path interrupted (Muted `#94A3B8`).
- `UNKNOWN`: Uninitialized state.

### Control Modes
- `AUTO`: Governed by PLC scheduling and PID loop logic.
- `MANUAL`: Operator override via supervisory command (Cyan `#06B6D4`).
- `REMOTE` / `LOCAL`: Local physical selector switch position on the control panel.
- `LOCKED` / `OFF`: Safety lockout or lock-out tag-out (LOTO).

---

## 7. Units & Engineering Precision

1. Internal database storage retains full floating-point precision received from the source.
2. Presentation displays round according to `point.precision` (e.g., `17.83 °C` displayed as `17.8 °C` if precision is 1).
3. Monospace fonts (`JetBrains Mono`) are mandatory for all numeric values and engineering units to prevent tabular layout jitter during live updates.
