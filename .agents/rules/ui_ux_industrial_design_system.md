# HVAC Digital Twin — Industrial Design System & UX Standards
**Target Workspace:** `c:\Users\BAPS\Documents\space\HVAC`  
**Classification:** Control Room UI/UX Standards & Component Design System  
**Last Updated:** September 2026

---

## 1. Aesthetic Identity: Industrial Control Room Craft

The platform must feel like high-end, modern industrial supervisory software found in mission-critical facilities (e.g. data centers, semiconductor fabs, district cooling plants).

### Anti-AI-UI Invariants
- ❌ **No SaaS Clichés:** No bubbly rounded cards (`rounded-3xl`), no playful emojis, no generic purple/blue gradients, no frosted glassmorphism, no decorative shadows.
- ❌ **No Static Screenshots:** Never use static PNGs or background images disguised as a digital twin.
- ✅ **Engineered Precision:** High information density, sharp clean borders (`border border-[#1B2B3F]`), technical metadata panels, deliberate hierarchy, and stoic control-room dark themes.

---

## 2. Color Palette & Semantic Tokens

```css
:root {
  /* Surface Foundations */
  --hvac-bg-canvas: #031427;
  --hvac-bg-deep: #020617;
  --hvac-bg-surface: #0F172A;
  --hvac-bg-panel: #102034;
  --hvac-border-subtle: #1B2B3F;
  --hvac-border-active: #26364A;

  /* Typography Colors */
  --hvac-text-primary: #D3E4FE;
  --hvac-text-secondary: #C5C6CD;
  --hvac-text-muted: #64748B;

  /* Operational Semantics */
  --hvac-status-healthy: #22C55E;   /* Green: Normal, Running, Good */
  --hvac-status-warning: #F59E0B;   /* Amber: Warning, Starting, High DP */
  --hvac-status-critical: #EF4444;  /* Red: Fault, Alarm, Tripped */
  --hvac-status-stale: #94A3B8;     /* Gray: Stale, Offline, No Data */
  --hvac-status-manual: #06B6D4;    /* Cyan: Manual Override, Hand Mode */
}
```

---

## 3. Typography Rules

1. **`Inter`:** Used exclusively for user interface elements, section headings, buttons, dialogs, and navigation labels.
2. **`JetBrains Mono`:** Mandatory for all engineering telemetry, numeric values, units, timestamps, Modbus registers, point IDs, and sensor tags. Numerical values must never jitter or wrap when digits change.

---

## 4. Interactive SVG Digital Twin Architecture

The digital twin schematic is rendered as a vector SVG canvas composed of independently addressable, data-driven React components:
- `ChillerNode`, `AHUNode`, `PumpNode`, `FanNode`, `CoolingCoilNode`, `ValveNode`, `DamperNode`, `DuctSegment`, `PipeSegment`.
- **Dynamic Flow Particle Animation:**
  - Water and air flow lines animate SVG stroke-dashoffset or particle markers.
  - Particle velocity is dynamically bound to telemetry: $\text{duration} = f(\text{flow\_rate})$.
  - When $\text{flow} = 0$, animation freezes completely.
- **Component States:** Hovering shows quick telemetry; clicking opens the diagnostic drawer; active alarms pulse with a high-contrast boundary.

---

## 5. Responsive Behavior: Desktop to Mobile

### Desktop (> 1280px)
- 12-column grid, 16px gutters, 32px outer margins.
- Full panoramic interactive digital twin with live overlay telemetry badges.
- Expandable right-hand alarm and diagnostic inspector drawer.

### Tablet (768px – 1280px)
- Adaptive two-column split: digital twin top, telemetry and alarm queue bottom.
- Touch-friendly hit targets (minimum 44x44px) for all controls.

### Mobile (< 768px)
- Industrial mobile view — not a squished desktop interface.
- Sticky top header showing master facility health, active alarm count, and communication status.
- Horizontally pannable and pinch-to-zoom digital twin canvas.
- Dense tabular lists automatically transform into vertical telemetry cards.
- Critical supervisory controls preserve full two-step confirmation dialogs.
