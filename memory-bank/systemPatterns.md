# System Patterns & UI/UX Animation Invariants

## 1. High-Performance Motion System
- **GPU Acceleration:** All animated elements enforce `transform: translateZ(0)` or `will-change: transform`.
- **Zero Reflow Motion:** Only animate composited properties (`transform`, `opacity`, `filter`). Never animate `width`, `height`, `top`, or `margin`.
- **Physics Easing:** Snappy response (`cubic-bezier(0.16, 1, 0.3, 1)`), fluid glide (`cubic-bezier(0.22, 1, 0.36, 1)`), tactile spring (`cubic-bezier(0.34, 1.56, 0.64, 1)`).

## 2. Dynamic Logo Animation Architecture
- Layer decomposition: `#logo-chassis` (frame), `#logo-rotor` (turbines/fans), `#logo-flow` (vortices/convection), `#logo-core` (energy node).
- 4-Stage State Machine: Reveal -> Ambient Idle -> 3D Magnetic Hover -> Plant Telemetry Reactive.

## 3. Subpixel Surface & Border Tokens
- Dark mode machined borders: `1px solid rgba(255, 255, 255, 0.08)` with inner specular highlight `inset 0 1px 0 0 rgba(255, 255, 255, 0.12)`.
- Light mode liquid glass: `rgba(255, 255, 255, 0.95)` with `backdrop-filter: blur(20px)` and subtle ambient shadow.
- Custom trackless industrial scrollbars (6px width, transparent track, smooth rounded thumb).

## 4. UI/UX Design Pro Architecture (`.agents/skills/ui-ux-design-pro/references/`)
- **Token Architecture (`token-architecture.md`):** Strict 4-tier token hierarchy (Primitves -> Semantic -> Component -> State).
- **Color System (`color-system.md`):** 11-step architectural palettes (50-950) with APCA contrast and WCAG 2.2 compliance.
- **Component Patterns (`component-patterns.md`):** Default, Hover, Active, Focus-Visible, Disabled, Loading Skeleton, Empty, Error states on every widget.
- **Cognitive Principles (`cognitive-principles.md`):** Fitts's law, Hick's law, Miller's 7±2 chunking, and Gestalt proximity grouping for complex HVAC schematics.

## 5. Code Craft Standards
- Absolute ban on trivial, redundant, or explanatory comments in code.
- Strict TypeScript types (`strict: true`, zero `any`), Pydantic v2 schemas on backend.
- High operational density with `Plus Jakarta Sans` / `Inter` and `JetBrains Mono`.
