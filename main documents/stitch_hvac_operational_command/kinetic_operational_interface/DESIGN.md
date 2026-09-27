---
name: Kinetic Operational Interface
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#c5c6cd'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
  outline: '#8f9097'
  outline-variant: '#45474c'
  surface-tint: '#bcc7de'
  primary: '#bcc7de'
  on-primary: '#263143'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#545f73'
  secondary: '#bec6e0'
  on-secondary: '#283044'
  secondary-container: '#3f465c'
  on-secondary-container: '#adb4ce'
  tertiary: '#ddc39d'
  on-tertiary: '#3e2e13'
  tertiary-container: '#35260c'
  on-tertiary-container: '#a38c6a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#fadfb8'
  tertiary-fixed-dim: '#ddc39d'
  on-tertiary-fixed: '#271902'
  on-tertiary-fixed-variant: '#564427'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
  status-healthy: '#22C55E'
  status-warning: '#F59E0B'
  status-critical: '#EF4444'
  status-stale: '#94A3B8'
  status-manual: '#06B6D4'
  surface-panel: '#0F172A'
  surface-well: '#020617'
  border-subtle: '#334155'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  data-display-lg:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
  data-display-md:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  data-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  panel-gap: 12px
---

## Brand & Style
The brand personality is **technical, precise, and stoic**. It is designed for engineers and control room operators who require high-confidence data visualization and zero-distraction interfaces. The design avoids the "SaaS-lite" aesthetic in favor of an **Industrial/Modern** style—prioritizing clarity, density, and professional utility.

The visual narrative is built on the concept of "Data Integrity." Every pixel must serve a functional purpose. We employ a **High-Contrast / Precision** approach:
- **Zero Decorative Elements:** No gradients, glows, or glassmorphism.
- **Architectural Layout:** Rigid grid structures that mimic the physical panels and SCADA systems they represent.
- **Functional Density:** High information density that respects visual hierarchy to prevent cognitive overload.
- **Controlled Palette:** A restrained use of color, reserving chromaticity strictly for semantic status and operational alerts.

## Colors
The system utilizes a **Control-Room Dark** theme as its default mode to reduce eye strain during long shifts and to make semantic status colors "pop" against a neutral background.

### Semantic Logic
- **Primary (Deep Slate):** Used for structural chrome and navigation.
- **Surface Strategy:** We use three tiers of dark neutrals—`#020617` (Deepest/Background), `#0F172A` (Panel/Card), and `#1E293B` (Elevated/Header).
- **Operational Semantics:** These are non-negotiable and must be used with high contrast. 
    - **Forest Green:** Normal operation.
    - **Amber:** Non-critical warnings/threshold breaches.
    - **Operational Red:** Alarms requiring immediate intervention.
    - **Cyan:** Manual overrides (distinguishes from automated logic).
    - **Silver/Muted Grey:** Offline or stale telemetry (indicates data quality issues).

## Typography
The system uses a dual-font approach to maximize readability and technical clarity.

- **Inter (UI & Labels):** Chosen for its exceptional legibility in small-scale UI controls and property labels. 
- **JetBrains Mono (Numeric/Telemetry):** Used for all live data, power readings (kW, Voltage, Amperage), and timestamps. The monospaced nature ensures that jumping digits do not cause visual "jitter" in live-updating dashboards.

### Usage Guidance
- **Headline-LG:** Reserved for Facility names or critical full-screen alerts.
- **Data-Display:** For primary KPI values within cards.
- **Label-Caps:** For secondary metadata and table headers to provide clear separation from the data itself.

## Layout & Spacing
The layout follows a **Rigid Grid** philosophy. It uses a 4px baseline shift to ensure all elements align to a technical rhythmic scale.

### Grid Model
- **12-Column Fluid Grid:** On desktop, the layout utilizes a 12-column grid with fixed 16px gutters.
- **Panel-Based Architecture:** Elements are grouped into "Panels" rather than "Cards." Panels should span the full width of their column container to maintain a clean, architectural line.
- **Hierarchy of Space:** 
  - **Facility > System:** Sidebar navigation or top-level breadcrumb.
  - **PLC > Equipment:** Content area split into primary telemetry (top) and detailed point-lists (bottom).

### Breakpoints
- **Mobile (<768px):** Single column. Charts collapse to sparklines. Data tables become vertical "summary cards."
- **Tablet (768px - 1280px):** 2-column layout for side-by-side equipment comparison.
- **Desktop (>1280px):** Full operational view with persistent system tree navigation on the left.

## Elevation & Depth
This design system rejects the use of soft shadows and ambient blurs. Depth is communicated strictly through **Tonal Layering** and **Structural Outlines**.

- **Background:** The base layer is the darkest (`#020617`).
- **Surface Panels:** Equipment containers use a slightly lighter slate (`#0F172A`) with a subtle 1px border (`#334155`).
- **Interactive Elements:** Buttons and dropdowns use a lighter fill to signify hover/active states.
- **Focus:** No shadows on focus; use a high-contrast 2px solid outline in `status-manual` (Cyan) to indicate keyboard focus.
- **Z-Index:** Modals and critical safety overrides occupy the highest tier, utilizing a solid dimming overlay (80% opacity) to kill background noise.

## Shapes
We use a **Soft-Precision** radius (4px). This provides just enough visual comfort to differentiate UI from a raw terminal while maintaining the "engineered" feel of hardware control panels.

- **Primary Radius:** 4px for buttons, input fields, and panels.
- **Status Badges:** 2px or square for a more "industrial tag" look.
- **Interactive Controls:** All interactive areas must have clearly defined borders; avoid "borderless" ghost buttons to ensure the user knows exactly where the safety-critical touch targets are.

## Components

### Buttons & Safety Controls
- **Standard Action:** Solid slate with clear white text.
- **Safety Action:** Controls that affect equipment state (e.g., "STOP," "OVERRIDE") must use a specific `warning` or `critical` border and require a 2-step interaction (click-to-confirm or long-press).
- **Manual Override:** Distinctive Cyan styling to show the system is not in "Auto" mode.

### KPI Cards (Compact)
- **Structure:** Title (Label-Caps), Primary Value (Data-Display-MD), Unit (Body-SM), and Trend Indicator (Small Sparkline).
- **Alert State:** If a value is in alarm, the card border changes to the semantic color of the alarm (Red/Amber), and the value text matches.

### Information-Dense Tables
- **Header:** Sticky headers with 1px bottom border.
- **Cells:** Monospaced fonts for all numeric columns. 
- **Striping:** Subtle zebra-striping to guide the eye across wide telemetry rows.
- **Status Column:** Always the leftmost column, utilizing a high-contrast status badge.

### Status Badges
- Not just a dot. Badges must contain a text label (e.g., "OK", "ALRM", "STALE") and a high-contrast background to ensure accessibility for colorblind operators.

### Breadcrumbs
- Facility > System > Main PLC > Sub-Panel > Equipment.
- Use a chevron separator. The current level should be bolded and non-interactive to anchor the user's location.

### Input Fields
- Dark background fields with persistent 1px borders. 
- Labels must never disappear (no floating labels). Labels sit above the field in `Label-Caps`.