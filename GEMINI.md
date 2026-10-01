# HVAC Digital Twin — Antigravity Agent Master Context & Operational Blueprint

> **Read `memory-bank/activeContext.md` and `memory-bank/progress.md` FIRST before every session.**
> Inspect relevant domain rules in `.agents/rules/` before writing or modifying any UI component or backend service.
> **Continuous Context Sync Mandate:** Update `memory-bank/activeContext.md` and `progress.md` whenever UI/UX decisions, logo designs, or component structures evolve.

---

## 1. Product Identity & Design Vision

**HVAC Digital Twin & Supervisory Control Platform** is an industrial-grade, configuration-driven software digital twin for mission-critical mechanical systems (commercial air handlers, 9-unit heater banks, VAV networks, ventilation loops, and clean space climate systems).

### The Quality Benchmark: GPT Astra, Claude, Fable, Linear, Apple
- **Think Big, Build Real:** Rejects generic "AI-generated" templates, flat lifeless cards, and fake placeholder numbers.
- **World-Class Craftsmanship:** Precision down to the subpixel — 1px machined borders, multi-layered liquid glassmorphism, 60fps/120fps hardware-accelerated animations, organic spring physics, and zero-jitter tabular telemetry.
- **Living Brand Identity:** Master framework for ingesting and animating the platform logo with vector path drawing, glowing energy cores, kinetic turbine rotation, and real-time telemetry reactivity.
- **No Boilerplate Comments:** Clean, self-documenting code with expressive engineering nomenclature (`chilled_water_delta_t_k`, `supply_air_static_pressure_pa`). Zero trivial comments.

```
VISUALIZE (Interactive SVG Twin) ---> MONITOR (Live Telemetry & Alarms) ---> ANALYZE (Energy, Airflow, Trends) ---> CONTROL (Supervisory Two-Step Commands)
```

---

## 2. Technology Stack & Topology

| Layer | Technology | Primary Responsibility |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript (`strict: true`), Tailwind CSS v4, Lucide | High-density industrial control room UI, interactive SVG digital twin, diagnostic drawers, kinetic animations |
| **Typography** | `Plus Jakarta Sans` / `Inter` (UI/Labels) + `JetBrains Mono` (Telemetry/Numbers) | Tabular alignment (`tnum`, `zero`), zero layout jitter |
| **Animation** | Hardware-accelerated CSS keyframes, SVG path manipulation, Spring physics | 60fps/120fps GPU motion (`transform`, `opacity`), fluid particles |
| **Backend** | Python 3.12+, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2 | Canonical domain state, telemetry normalization, command authorization, REST & WebSocket APIs |
| **Database** | PostgreSQL 16+ (asyncpg) | Equipment topology, point definitions, historical telemetry, alarms, command audit log |
| **Ingestion** | MQTT Client (`paho-mqtt` / `asyncio-mqtt`), BACnet/Modbus adapters | Protocol isolation, broker ingestion, translation to canonical points |
| **Real-Time** | WebSockets (native FastAPI) | Low-latency, granular live point and equipment state event broadcasting |
| **Simulation** | Thermodynamic Physics Simulator | Coupled thermal & pressure simulation, 12 test failure scenarios |

---

## 3. Core Architectural Invariants

1. **Never Hardcode the HVAC System:** Equipment, components, sensor lists, PLC registers, and schematic coordinates are 100% dynamic, instantiated from metadata and database configurations.
2. **Strict Three-Way Separation:** Physical Topology (what connects to what), Visual Layout (SVG coordinates $x, y, \theta$), and Telemetry (points, quality, values) are completely decoupled.
3. **No Direct Browser-to-PLC/MQTT Connections:** The browser communicates exclusively with the backend via authenticated REST and WebSocket endpoints.
4. **Command Safety & Two-Step Confirmations:** Commands require backend authorization and payload validation. Critical actions require two-step confirmation. The UI waits for physical telemetry confirmation before indicating success.
5. **No Fake Data in Production:** In development, the physical simulator generates realistic thermodynamic data. In production, if telemetry is missing, the UI honestly displays `UNKNOWN`, `NO DATA`, `STALE`, or `OFFLINE`.
6. **No Comments Rule:** Code must be clean, self-documenting, and type-safe. Zero redundant, trivial, or explanatory boilerplate comments in code.
7. **Continuous Context Auto-Sync:** Context is automatically refreshed and recorded in `memory-bank/` as user conversations unfold.

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

## 5. Active Workspace Rules Catalog (`.agents/rules/`)

Antigravity automatically loads all 10 specialized rule files into its active context:

1. **[conversation_context_auto_sync.md](.agents/rules/conversation_context_auto_sync.md)**: Continuous context synchronization protocol ensuring zero loss of user creative intent, design decisions, and tasks across conversations.
2. **[world_class_ui_ux_and_animation_craft.md](.agents/rules/world_class_ui_ux_and_animation_craft.md)**: GPT Astra / Fable / Linear grade design craft, organic spring physics, cubic-bezier curves, 60fps/120fps GPU acceleration, and micro-interactions.
3. **[logo_animation_and_brand_motion_system.md](.agents/rules/logo_animation_and_brand_motion_system.md)**: Living kinetic brand framework — vector path drawing, glowing energy cores, turbine rotation, 3D magnetic hover, and real-time plant telemetry coupling.
4. **[design_tokens_and_micro_craft.md](.agents/rules/design_tokens_and_micro_craft.md)**: Subpixel 1px machined borders, custom trackless scrollbars, accessible cyan focus rings, and zero-jitter tabular numeric typography.
5. **[full_codebase_deep_dive_protocol.md](.agents/rules/full_codebase_deep_dive_protocol.md)**: 12-Point Total Context Protocol triggered whenever you ask the agent to go through the whole code in depth.
6. **[digital_twin_and_domain_architecture.md](.agents/rules/digital_twin_and_domain_architecture.md)**: Decoupled component model, point metadata schema, data quality lifecycles, equipment states, control modes, and engineering precision.
7. **[mqtt_websocket_and_safety_controls.md](.agents/rules/mqtt_websocket_and_safety_controls.md)**: Network boundary, configuration-driven MQTT, WebSocket event taxonomy, two-step safety controls, and command audit trail.
8. **[simulator_and_thermodynamic_scenarios.md](.agents/rules/simulator_and_thermodynamic_scenarios.md)**: Coupled physics simulation, 12 operational test scenarios, and zero fake data in production.
9. **[ui_ux_industrial_design_system.md](.agents/rules/ui_ux_industrial_design_system.md)**: Control room aesthetic, color tokens, typography, interactive SVG digital twin, and responsive desktop-to-mobile layouts.
10. **[code_craft_and_anti_ai_rules.md](.agents/rules/code_craft_and_anti_ai_rules.md)**: Non-negotiable No-Comments rule, anti-AI-code standards, strong typing, and modular architectures.

---


---

## 6. Specialized Workspace Skills Catalog (.agents/skills/)

Antigravity loads specialized workflow skills from .agents/skills/ (and global customizations at C:\Users\BAPS\.gemini\config\skills\):

1. **[ui-ux-design-pro](.agents/skills/ui-ux-design-pro/SKILL.md)**:
   - Senior-level AI design intelligence engine for data-driven, production-grade UI/UX across industrial dashboards and web platforms.
   - **Knowledge Base**: 107+ UI styles, 127+ color palettes, 107+ font pairings, 150+ reasoning rules, 150+ UX guidelines, 16 tech stacks, 1,875+ rows across 28 CSV databases.
   - **Mandatory References**: 12 craft reference files in .agents/skills/ui-ux-design-pro/references/ (Design Directions, Token Architecture, Color System, Typography, Spacing & Layout, Depth & Elevation, Component Patterns, Animation & Motion, Real-World Patterns, Accessibility WCAG 2.2, Cognitive Principles, Critique Protocol).
   - **Integrated CLI**: 
px -y tsx .agents/skills/ui-ux-design-pro/cli/index.ts (or scripts/design-cli.bat) with subcommands:
     - generate <query> --stack nextjs --output design.md: Generates complete 50-950 architectural scales, 80+ CSS custom properties, modular type scales, and production-ready React/Tailwind snippets.
     - search <query>: BM25 / Orama search across styles, colors, typography, charts, and reasoning rules.
     - udit <files...>: 12-rule UI code quality, accessibility, and anti-pattern auditor.
     - icons <query>: Top icon library search and CDN resolution.

---

## 7. Frontend Design System & Schematic Execution

- **Live System Schematic Screen**: Implemented based on main documents/stitch_hvac_operational_command/live_system_schematic_9_unit_heater_bank/ and system_schematic_screen_plan.txt.
- **Design Tokens**: Standardized via ui-ux-design-pro token architecture and design_tokens_and_micro_craft.md.
- **Interactive SVG Digital Twin**: Decoupled visual layer rendering 9-unit heater bank, supply/return loops, chilled water, and dynamic telemetry overlays.
- **Convenient CLI Shortcut**: Run scripts/design-cli.bat <command> from the HVAC repository root.

---

Workspace: c:\Users\BAPS\Documents\space\HVAC  
Last updated: October 2026
