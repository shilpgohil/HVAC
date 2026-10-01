# HVAC Digital Twin — Logo Animation & Kinetic Brand Motion Framework
**Target Workspace:** `c:\Users\BAPS\Documents\space\HVAC`  
**Classification:** Brand Identity Motion System, Vector Decomposition & Kinetic Interaction  
**Benchmark:** Apple keynote brand reveals, Stripe radar motion, Linear brand dynamics  
**Last Updated:** September 2026

---

## 1. Vision: A Living, Kinetic Digital Twin Identity

The platform logo must NOT be a static graphic or a boring image. It must be an **engineered, living brand asset** that reflects the cutting-edge physical engineering of the HVAC Digital Twin.

When the user provides their existing logo (raster or vector), the system decomposes it into semantic vector layers and brings it to life through a multi-stage kinetic motion system.

---

## 2. The 4-Stage Kinetic Motion Choreography

```
[ Stage 1: Power-On / Reveal ] 
       │ (Path drawing, glowing core expansion, wordmark glide)
       ▼
[ Stage 2: Living Ambient Idle ] <───┐ (Continuous smooth turbine spin, thermal breathing glow)
       │                              │
       ├───> [ Stage 3: Interactive Hover ] ──┤ (Magnetic 3D tilt, speed ramp, specular sheen)
       │                              │
       └───> [ Stage 4: Telemetry Reactive ] ─┘ (Color & pulse synchronized to real-time plant state)
```

### Stage 1: Initial Reveal / Boot Sequence
- **Vector Path Drawing:** Outer contours and aerodynamic curves draw themselves using animated SVG `stroke-dasharray` and `stroke-dashoffset` with cubic-bezier easing (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Core Luminescence:** The internal thermal or mechanical core expands outward with a soft radial glow (`filter: drop-shadow(...)`).
- **Wordmark Stagger:** Typography letters slide into place with a subtle forward kerning expansion and opacity fade.

### Stage 2: Living Ambient Idle
- **Aerodynamic / Turbine Motion:** Rotating elements (fans, compressor impellers, vortex swirls) maintain a continuous, ultra-smooth 60fps rotation.
- **Thermal Convective Pulse:** Gradients subtly shift between cool cyan/blue (`#06B6D4` / `#38BDF8`) and warm amber (`#F59E0B`), visualizing active heat exchange.
- **Subtle Breathing:** A slow 4-second breathing cycle of ambient glow ensures the logo never appears frozen or dead.

### Stage 3: Interactive Hover & Magnetic Response
- **Cursor Magnetic Follow:** The logo subtly tilts along the X and Y axes based on mouse position (`transform: perspective(600px) rotateX(...) rotateY(...)`).
- **Kinetic RPM Acceleration:** Turbine or impeller elements accelerate smoothly to a higher rotational speed with natural mechanical inertia, then decelerate with damped spring physics on mouse leave.
- **Specular Light Sweep:** A 45-degree linear light sheen sweeps across the logo surface on hover:
  ```css
  background: linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.45) 50%, transparent 60%);
  ```

### Stage 4: Telemetry-Reactive Plant Coupling
The logo is connected to the real-time operational state of the facility:
- **Normal Operation:** Balanced cyan and emerald green pulse.
- **High Cooling Demand:** Fast-moving dynamic particle flow around the emblem.
- **Active Warning / Threshold Trip:** Ambient amber breathing frequency increases.
- **Critical Facility Alarm:** High-contrast laser-red heartbeat flare.
- **Communication Offline:** Logo transitions to a cool, desaturated slate-gray standby hum.

---

## 3. Logo Ingestion & Vectorization Protocol

When the user provides their logo (image, SVG, or screenshot):
1. **Decomposition:** Isolate Emblem Geometry, Wordmark, and Accents into discrete SVG `<path>` and `<g>` nodes.
2. **Layer Naming Convention:**
   - `#logo-chassis`: Structural outer frame / enclosure.
   - `#logo-rotor`: Rotating mechanical blades / fan impellers.
   - `#logo-flow`: Air / water convective stream curves.
   - `#logo-core`: Central luminescent energy node.
   - `#logo-text`: Brand wordmark and technical subtitle.
3. **GPU Acceleration Optimization:**
   - Apply `will-change: transform` and `transform: translateZ(0)` to all moving SVG elements.
   - Ensure the SVG has a normalized `viewBox="0 0 100 100"` for infinite resolution scaling.

---

## 4. Multi-Scale Delivery

| Scale | Dimensions | Context | Animation Density |
| :--- | :--- | :--- | :--- |
| **Micro (Favicon / Header Mark)** | 24px – 32px | Navigation bar, browser tab | Simplified icon, subtle 3s ambient pulse, zero tiny details. |
| **Standard (Dashboard Header)** | 40px – 48px | Top application header | Full vector emblem with smooth turbine spin and hover reaction. |
| **Hero / Splash (Presentation)** | 120px – 320px | Welcome screen, login, about modal | Complete multi-layer motion: path drawing, light sweep, particle field, and telemetry reactivity. |
