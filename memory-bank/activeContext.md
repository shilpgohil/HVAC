# Active Context — HVAC Digital Twin

## Current Architecture & Scope
Refactored and streamlined the platform to match the user's operational specifications and reference schematics:
1. **Scope Clarification & Equipment Isolation:**
   - **Chiller Plant Excluded:** Zero chillers, cooling towers, or chiller plant components.
   - **Target Configuration:** Exactly **1 AHU (`AHU-01`)**, **6 Outdoor Condensing Units (`ODU-01` to `ODU-06`)** with spinning condensing fans and active outdoor telemetry, **8 Heater Bank Stages (`HTR-01` to `HTR-08`)**, and a **Conditioned Cleanroom Space**.
   - **Engineering Units:** All temperatures strictly displayed and calculated in **Celsius (`°C`)** (Current Room Temp `24.4 °C`, Setpoint `22.5 °C`, Supply `21.2 °C`, Return `26.7 °C`).

2. **Apple & Fora-Grade Frosted Glass UI/UX (`https://fora.so/` Inspired):**
   - Luminous, translucent frosted glass aesthetic (`bg-white/78 backdrop-blur-2xl border border-white/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)]`).
   - Soft ambient radial mesh lighting in ice blue, lavender, and mint.
   - Clean, standard typography (`Inter` for UI labels, `JetBrains Mono` for tabular numerals) with zero AI boilerplate styling.
   - **Interactive Hover Zoom & Floating Inspector:** Hovering over equipment (ODU 1-6, AHU, Heaters, Filters, Coils, Cleanroom) smoothly zooms with spring easing (`scale-105..108`) and opens a floating frosted glass detail card with live physical telemetry and quick actions.
   - **100% Functional Real-Time Temperature Trend Graph:** Directly connected to the backend telemetry buffer via `/api/v1/control/history?range={range}` with live continuous streaming, multi-range filtering (`1H`, `6H`, `12H`, `24H`), and magnetic hover inspector.
   - **Functional Alarm & Mode Engine:** Real-time alarm clearing/acknowledging, dynamic equipment fault triggering, and operating mode switching (`Auto`, `Eco`, `Boost`).

3. **Backend Services & Simulation:**
   - FastAPI backend running on `http://127.0.0.1:8000`.
   - Lightweight, coupled thermodynamic balance simulation running without cluttering the operator with complex scenario switchers.
   - Direct control endpoints: `/api/v1/control/ahu`, `/control/odu`, `/control/heater`, `/control/setpoint`, and `/control/state`.
