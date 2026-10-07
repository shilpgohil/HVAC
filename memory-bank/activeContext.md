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
- **Open Sans & Google Sans Typographic Standard:** Configured `Open_Sans` from `next/font/google` with fallback to `Google Sans` in `layout.tsx` and `globals.css`, paired with `JetBrains Mono` for tabular telemetry numbers (`tnum`, `zero`).
- **Tactile Button Physics & Motion Transitions:** Implemented `.btn-press` (`active:scale-[0.96]`, subtle hover lift, cubic-bezier spring curves) across all switches, scenario dropdowns, mode buttons, batch controls, and authorization drawers.
- **Mobile First-Class Responsive Alignment & Kinetic Polish:**
  - Header: Subtitle safely hidden on mobile to eliminate vertical wrapping and border collision; touch targets sized to 38px+; animated hamburger icon with 90° rotation and active state.
  - Metric Cards: Replaced vertical stack with a balanced 2x2 bento grid (`grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4`) with compact padding (`p-3 sm:p-5`) and non-truncated titles.
  - MotionTabs: Eliminated `scrollIntoView()` ancestor bubble that caused page jumping to the top on mobile telemetry updates. Replaced with container-scoped horizontal `wrapper.scrollTo({ left, behavior: 'smooth' })` triggered strictly on tab id changes. Memoized `hvacMotionTabs` in `page.tsx`.
  - Mobile Drawer Smooth Hardware Transitions: Replaced abrupt `{isOpen && ...}` conditional unmount with continuously mounted Tailwind v4 hardware-accelerated drawer (`translate-x-0` vs `-translate-x-full`, `duration-300`, `ease-[cubic-bezier(0.16,1,0.3,1)]`) and smooth fading backdrop (`opacity-100` vs `opacity-0 pointer-events-none`) with body scroll lock.
- **Whole-Home IoT Digital Twin Platform (`home_iot`):**
  - **3-System Unified Architecture:** Integrated `HOME` alongside `HVAC` and `GRID` in `Sidebar.tsx` and `TopHeader.tsx`. Dynamic status metrics in `TopHeader.tsx` adapt per system mode.
  - **High-End Architectural CAD Blueprint & Intelligent Flow Twin:**
    * Precision structural double walls, architectural interior partitions, and door swing arcs.
    * Solar PV Microgrid array with 24x 420W bifacial N-type monocrystalline cells, silver busbars, animated solar glare shimmer, 10kW hybrid inverter, 15kWh LFP Powerwall battery bank, and bi-directional utility grid interface.
    * Living Room & Media Lounge (42 m²): Sectional sofa silhouette, 75" 4K OLED TV with animated Ambilight power glow, central chandelier with radial light cone filter, inverter AC split with spinning turbine and cool airflow ripples, and PIR occupancy radar beacon.
    * Master Bedroom Suite (28 m²): King architectural bed with nightstands, dual articulated bedside reading lamps casting warm light cones, whisper-quiet AC unit with spinning blades, and motorized window shades with mechanical slat louvers.
    * Smart Chef Kitchen (24 m²): Quartz counter island, dual induction cooktop with glowing spiral heating coils (orange heat glow), smart French-door inverter refrigerator (130W readout), centrifugal ventilation hood with spinning impeller, and water leak safe detector.
    * Home Office & Studio (18 m²): Dual ultra-wide 4K workstations, architect task light with dimmer (520 Lux), and HEPA air purifier with circular particle vortex.
    * EV Garage & High-Voltage Bay (35 m²): Model 3 Long Range vehicle silhouette connected to Level 2 32A Wallbox charger with animated high-speed electrical conduit flow and kinetic spark beam.
    * Intelligent Multi-Bus Flow Overlays: Selectable conduit filters (`All Conduits`, `Microgrid Bus`, `HVAC Airflow`) with animated flow lines indicating solar PV power generation, EV charging rate, and ducted airflow.
  - **Precision Smooth Sliders & Actuators:**
    * Custom hardware-styled range sliders (`.smooth-slider`) with glowing circular thumbs, track fill transitions, and live numeric percentage readouts for lighting dimmers and motorized window blinds.
    * Interactive thermostat steppers with `.btn-press` spring feedback and real-time setpoint updates.
  - **8 Deep Autonomous Automation Scenarios:**
    * Solar Surplus & EV Fast Charge (8.8 kW rooftop PV channeled to EV Wallbox and LFP battery).
    * Peak Tariff Shaving (Zero Grid import, battery discharging 3.8 kW).
    * Luxury Ambiance & Cinema (Chandelier 100%, cove lights 90%, 4K media active, mini-split at 21.5°C).
    * Silent Sleep & Perimeter Guard (Bedrooms dimmed, silent AC, perimeter armed).
    * Eco Saver & Smart Net-Zero (24.5°C setpoints, shades down 75%).
    * Grid Blackout Microgrid Island (Grid offline, solar & battery powering critical circuits).
    * Vacation Away & Flood Watch (Non-essentials off, security armed away, leak watch).
    * Heatwave Emergency Pre-Cool (Max cooling capacity, 20.5°C setpoints).
  - **Dedicated Vector Equipment & Animated Micro-Icons (Zero Emojis):**
    * Spinning fan blades (`spin-fast`, `spin-slow`), solar shimmers (`shimmer-solar`), and pulsating status rings.
  - **Backend IoT Simulator & REST API:**
    * Full scenario switching and device dimming endpoints: `POST /control/home-iot/scenario`, `POST /control/home-iot/dimmer`.
    * Native FastAPI WebSocket broadcasting live state ticks.
- **Strict No-Comments Invariant:** Authored code contains zero boilerplate, narrative, or explanatory comments.

## Validation Status
- Next.js 16.3.6 Turbopack production build: Passed with 0 errors.
- FastAPI backend Python syntax: Passed with 0 errors.
- Git Repository Sync: Changes pushed to `origin main` on GitHub (commit `c929edc`).
