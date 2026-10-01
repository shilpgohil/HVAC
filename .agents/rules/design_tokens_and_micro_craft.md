# HVAC Digital Twin — Design Tokens, Micro-Craft & Token Polish
**Target Workspace:** `c:\Users\BAPS\Documents\space\HVAC`  
**Classification:** Micro-Detail Styling, Subpixel Borders, Glassmorphism & Tokens  
**Last Updated:** September 2026

---

## 1. The Micro-Detail Imperative: Every Pixel Matters

In high-end industrial and aerospace interfaces, quality is communicated through the smallest details: the razor-sharpness of a 1px border, the subtle gradient across a panel header, the exact tactile travel of a button, and the zero-jitter stability of monospaced telemetry readouts.

---

## 2. Advanced Surface & Border Tokens

### 2.1 Subpixel Machined Borders
```css
/* Dark Mode Machined Bezel */
.border-machined-dark {
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.12),
    0 1px 2px 0 rgba(0, 0, 0, 0.4);
}

/* Light Mode Liquid Glass Bezel */
.border-machined-light {
  border: 1px solid rgba(203, 213, 225, 0.85);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.9),
    0 10px 25px -4px rgba(15, 23, 42, 0.06),
    0 2px 6px -1px rgba(15, 23, 42, 0.04);
}
```

### 2.2 Custom Industrial Scrollbars
Thick browser default scrollbars ruin high-density control panels. All scrolling containers must use the sleek, trackless industrial scrollbar:
```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 9999px;
  transition: background 150ms ease;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
```

### 2.3 Keyboard Accessibility & Cyan Focus Rings
In mission-critical monitoring, keyboard navigation must be instantly recognizable:
```css
*:focus-visible {
  outline: 2px solid #06B6D4 !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.4) !important;
}
```

---

## 3. Numeric Formatting & Font Feature Flags

To prevent numbers from vibrating or shifting column widths as telemetry streams at 10 Hz:
```css
.font-telemetry {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums slashed-zero;
  font-feature-settings: "tnum" 1, "zero" 1;
}
```
Every temperature, pressure, flow rate, and electrical power display must enforce `.font-telemetry`.

---

## 4. Tactile Button & Toggle Micro-States

1. **Resting:** Smooth 1px border with muted background.
2. **Hover:** Specular top edge highlight illuminates; background shifts 5% lighter with `--ease-snappy`.
3. **Active / Pressed:** `transform: scale(0.97)` with instant 80ms depression.
4. **Disabled:** Opacity 40% with cursor `not-allowed`, zero pointer events.
5. **Pending / Confirming:** Subdued pulse animation with animated indeterminate spinner.
