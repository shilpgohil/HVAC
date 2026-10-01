# Active Context - HVAC Digital Twin & UI/UX Light Craft Core

## Current Focus & Vision
- **World-Class Light UI Design System Transformation:** Complete overhaul of the frontend design system to match high-end modern interfaces (Stripe, Linear, Apple, ui-ux-design-pro "With Skill" showcase) in Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS v4.
- **Luminous Pearl & Pure White Canvas:** Canvas base `#F8FAFC`, elevated panels and cards `#FFFFFF`, hairline borders `#E2E8F0` / `border-slate-200/90`, soft organic multi-layer drop shadows (`shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]`), and zero dark-mode AI artifacts.
- **High-Contrast Typographic Craft:** Deep slate headings and numerals (`#0F172A`), balanced label hierarchy (`#475569`, `#64748B`), and tabular numeric alignment (`JetBrains Mono` with `tabular-nums` and `slashed-zero`).
- **Harmonious Accents:** Professional industrial engineering palette: Royal Blue (`#2563EB`), Emerald (`#059669`), Warm Amber (`#D97706`), Crimson (`#DC2626`). Zero neon cyan glowing sci-fi borders.
- **Living Brand Kinetic Logo:** Light container `#F0F9FF`, border `#BAE6FD`, wordmark in `text-slate-900`, 4-stage kinetic brand motion framework with real-time turbine rotor and telemetry reactivity.
- **Subsystem Sub-Views Completely Renovated:**
  - `AlarmsDetailView.tsx`: Clean white cards, clear severity badges (`CRITICAL`, `WARNING`, `INFO`), acknowledge and clear event controls.
  - `AhuDetailView.tsx`: High-contrast fan and VFD indicators, direct-drive blower controls, intake dampers, and mechanical interlocks.
  - `OduDetailView.tsx`: 6 VRF inverter condensing circuit cards, power draw, fan speed, head pressure, and coil telemetry.
  - `HeaterDetailView.tsx`: 8 SCR electric duct reheat stage cards, thermal duty, and solid state modulation.
  - `TemperatureGraphView.tsx`: Psychrometric dew point telemetry and 24h thermal equilibrium curves.
  - `SettingsDetailView.tsx`: Supervisory setpoint clamps, deadbands, and fieldbus gateway configuration.
  - `ElectricalMonitoringView.tsx`: 4 KPI summary cards, single-line power distribution diagram (SLD), 7 feeder panels, and power factor telemetry.
- **Safety Interlocks & Controls Preserved:** Two-step confirmation modal with slide-to-confirm, auto-timeout rollback, and supervisory operator authorization.
- **Strict No-Comments Invariant:** Authored code contains zero boilerplate, narrative, or explanatory comments.

## Validation Status
- Next.js 16.3.6 Turbopack production build: Passed with 0 errors.
- UI/UX Design Pro CLI audit: Passed with 0 errors and 0 warnings.
- Real-Time Integration: Direct WebSocket tick synchronization via `useHvacWebSocket` with fallback polling.
