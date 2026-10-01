# HVAC Digital Twin — Master Frontend Renovation Prompt

Copy and paste the prompt below into your AI coding assistant (Antigravity, Cursor, or Claude) to execute the complete frontend renovation while maintaining 100% backend integrity.

---

```markdown
# MISSION: World-Class Frontend Renovation for HVAC Digital Twin Platform

## Context & Objectives
You are tasked with completely renovating and rebuilding the frontend of the HVAC Digital Twin & Supervisory Control Platform located in `frontend/` (Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4).
The current frontend works logically, but its visual craft, animations, and information hierarchy fall far short of the world-class benchmarks (GPT Astra, Claude, Fable, Linear, Apple, Stripe).
You must transform this interface into an industrial-grade, mission-critical control deck that wows on first glance while preserving 100% of existing backend contracts, WebSocket schemas, API routes, and safety interlocks.

---

## 1. INVIOLABLE INTEGRITY & LOGIC INVARIANTS (Do NOT Break)

1. **Preserve All Backend Contracts**:
   - `frontend/src/lib/api.ts`: Retain all REST endpoints (`/api/v1/telemetry/snapshot`, `/api/v1/commands/send`, `/api/v1/commands/audit`, `/api/v1/scenarios/switch`).
   - `frontend/src/hooks/useHvacWebSocket.ts`: Retain the WebSocket connection lifecycle, auto-reconnection with exponential backoff, and live telemetry normalization.
   - `frontend/src/types/hvac.ts`: Preserve canonical data types, equipment models (`AHU`, `ODU`, `HeaterStage`), and point metadata schemas.
2. **Two-Step Safety Command Protocol**:
   - Any physical equipment state modification (fan speed, heater stage, damper position, setpoint) MUST require deliberate two-step confirmation (slide-to-confirm or explicit modal confirmation with countdown).
   - Optimistic UI updates must rollback automatically if the backend telemetry does not confirm command execution within 5 seconds.
3. **Data Quality Integrity**:
   - Honestly display telemetry quality flags: `GOOD` (emerald), `UNCERTAIN` (amber), `STALE` (slate/dashed), `BAD` / `FAULT` (crimson pulse), `DISCONNECTED` (ghosted). Zero fake data in production.
4. **Strict No-Comments Invariant**:
   - Authored code must contain ZERO explanatory, boilerplate, or narrative comments. Intent must be expressed 100% through expressive domain naming and strict typing.

---

## 2. ACTIVATED SKILLS & RULES TO ENFORCE

You must strictly adhere to the installed skills and workspace rules:
1. **`.agents/skills/ui-ux-design-pro`**:
   - Read and apply the 12 craft references in `.agents/skills/ui-ux-design-pro/references/`:
     - `design-directions.md`: Apply "Precision & Density" combined with "Industrial Control Room".
     - `token-architecture.md`: Enforce 4-tier token hierarchy (Primitives -> Semantic -> Component -> State).
     - `color-system.md`: Use 11-step architectural palettes with WCAG 2.2 AA / APCA contrast.
     - `typography.md`: Modular scale with `Inter` / `Plus Jakarta Sans` for UI and `JetBrains Mono` with `tabular-nums` and `slashed-zero` for all numbers.
     - `depth-and-elevation.md`: 1px subpixel machined borders (`rgba(255, 255, 255, 0.08)`) with specular inner highlights (`inset 0 1px 0 0 rgba(255, 255, 255, 0.12)`).
     - `critique-protocol.md`: Run Squint Test, Swap Test, and Token Test before finishing.
   - Use the CLI tool: Run `scripts/design-cli.bat search`, `generate`, and `audit`.
2. **`.agents/rules/world_class_ui_ux_and_animation_craft.md`**:
   - 60fps/120fps hardware-accelerated motion (GPU compositing: `transform`, `opacity`, `filter` only; zero layout reflow).
   - Organic spring physics (`stiffness: 400`, `damping: 30`, `mass: 0.8`) and custom cubic-bezier curves (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - Zero Layout Shift: CLS = 0; strict pre-allocated bounding shells and skeleton placeholders.
3. **`.agents/rules/logo_animation_and_brand_motion_system.md`**:
   - 4-Stage living brand motion framework: (1) Boot Reveal -> (2) Ambient Living Idle -> (3) 3D Magnetic Cursor Hover -> (4) Plant Telemetry-Reactive Coupling.
4. **`.agents/rules/design_tokens_and_micro_craft.md`**:
   - Custom trackless industrial scrollbars (6px width, transparent track, smooth thumb).
   - Accessible electric cyan (`#06B6D4`) focus rings with 2px offset.

---

## 3. DESIGN SYSTEM & COLOR WORLD

Reference Design: `main documents/stitch_hvac_operational_command/live_system_schematic_9_unit_heater_bank/code.html`
- **Canvas Base**: Deep Space Navy/Obsidian (`#031427`).
- **Surface Panels**: Elevated Sapphire Frosted Glass (`#0F172A` / `#102034` with `backdrop-filter: blur(24px)`).
- **Subtle Borders**: 1px solid `rgba(255, 255, 255, 0.08)` with inner specular highlight `inset 0 1px 0 0 rgba(255, 255, 255, 0.12)`.
- **Primary Typography**: `Plus Jakarta Sans` or `Inter` (`font-sans`).
- **Telemetry Typography**: `JetBrains Mono` (`font-mono tabular-nums slashed-zero`) for all temperatures (°C), static pressures (Pa), airflow (CFM/m³h), power (kW), and frequencies (Hz).
- **Semantics**:
  - Healthy/Operating: `#22C55E` (Emerald glow `rgba(34, 197, 94, 0.15)`)
  - Warning/Caution: `#F59E0B` (Amber glow `rgba(245, 158, 11, 0.15)`)
  - Critical/Alarm: `#EF4444` (Crimson pulse `rgba(239, 68, 68, 0.20)`)
  - Stale/Offline: `#94A3B8` (Slate dashed border)
  - Active Control/Focus: `#06B6D4` (Electric Cyan `rgba(6, 182, 212, 0.20)`)

---

## 4. COMPONENT-BY-COMPONENT RENOVATION BLUEPRINT

### Component 1: `TopHeader.tsx`
- **Living Brand Logo**: Render the 4-stage animated SVG kinetic logo (rotating turbine/impeller, glowing central core, magnetic hover).
- **System Telemetry Pill**: Live pulse dot connected to WebSocket status (`CONNECTED` emerald, `RECONNECTING` amber, `OFFLINE` slate).
- **Scenario Selector**: Refined glass dropdown to switch between the 12 thermodynamic test scenarios with instant badge indicator.
- **Master Quick-Stats**: Aggregate Supply Temp, Return Temp, Total Power (kW), and Cleanroom Static Pressure.

### Component 2: `Sidebar.tsx` & `MotionTabs.tsx`
- **Industrial Navigation**: High-density vertical sidebar with tactile micro-interactions (`scale(0.97)` active press).
- **Views**: System Overview, Live Schematic, AHU-01 Detail, Heater Bank, ODUs, Electrical, Temperature Trends, Alarms & Events, Settings.
- **Motion Tabs**: Animated active pill glide (`layoutId="activeTab"` with spring physics).
- **Badge Indicators**: Unacknowledged alarm count pill with subtle crimson breathing animation.

### Component 3: `SystemOverview.tsx` & `Live System Schematic`
- Implement based on `main documents/stitch_hvac_operational_command/live_system_schematic_9_unit_heater_bank/` and `system_schematic_screen_plan.txt`.
- **Vector Schematic Engine**:
  - Full SVG canvas rendering decoupled mechanical layout: Fresh air intake, Damper actuators, Pre-filter and HEPA filter banks with live differential pressure (DP) gauges.
  - Centrifugal supply fan with impeller rotating at live measured Hz/RPM.
  - 9-Unit Heater Bank staged grid (HTR-01..09) with thermal glow proportional to active heating duty.
  - 6 Outdoor Condensing Units (ODU-01..06) with spinning fans and refrigerant cycle indicators.
  - Supply and return ductwork with kinetic flowing particle dashes moving at speed proportional to measured CFM.
  - Cleanroom Suite 101 target space with live temperature, humidity, and room pressurization readout.
- **Interactive Inspection Drawers**: Clicking any equipment hotspot opens a non-blocking frosted glass diagnostic drawer displaying point telemetry, trends, and manual overrides.

### Component 4: `MetricCards.tsx`
- Bento-grid layout of high-density KPI cards:
  - Supply Air Temperature (°C) with deviation from setpoint.
  - Airflow Rate (CFM / m³/h) with fan speed gauge.
  - Cleanroom Differential Pressure (Pa) with cascade status.
  - Electrical Power & Energy Efficiency (COP / kW).
- Cards feature subpixel machined borders, subtle specular top highlights, micro-sparkline charts, and zero character jitter.

### Component 5: `ControlTables.tsx`
- 3 side-by-side equipment control matrices:
  1. `AHU-01 Core Controls`: VFD frequency slider, damper position %, mode selector (`AUTO` / `MANUAL`).
  2. `Outdoor Units (ODU-01..06)`: Compressor stage toggles, operating status, inverter load %.
  3. `8-Stage / 9-Stage Electric Heater Bank`: Sequential stage energization bars with two-step safety confirmation slider.
- High-contrast states, instant optimistic feedback, and tactile toggle switches.

### Component 6: `TemperatureTrendGraph.tsx`
- High-performance SVG/Canvas real-time trend chart.
- Multi-series plotting: Supply Temp, Return Temp, Ambient Temp, and Setpoint line.
- Smooth mouse scrub crosshair with subpixel guide line and floating glass tooltip displaying exact point values at cursor timestamp.
- Time window selector: `15m`, `1h`, `6h`, `24h`, `Live`.

### Component 7: `RightPanel.tsx` & `AlarmsDetailView.tsx`
- Live Alarm & Event Feed with severity badges (`CRITICAL`, `WARNING`, `INFO`).
- Single-click or two-step alarm acknowledgment with operator audit log logging.
- System activity stream with timestamped telemetry anomalies.

---

## 5. POST-RENOVATION VERIFICATION STEPS

1. **Audit with UI/UX Design Pro CLI**:
   - Run `scripts/design-cli.bat audit frontend/src/components/...` to ensure all 12 quality and accessibility rules pass.
2. **Build Validation**:
   - Run `npm run build` inside `frontend/` to confirm zero TypeScript errors, zero lint warnings, and valid Next.js bundling.
3. **No-Comments Check**:
   - Verify that all newly authored code is 100% self-documenting and completely free of explanatory boilerplate comments.
4. **Telemetry & WebSocket Loop**:
   - Verify that all live WebSocket telemetry streams seamlessly into the newly renovated schematic, gauges, and tables without lag or dropped frames.
```
