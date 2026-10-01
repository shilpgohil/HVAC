# HVAC Digital Twin — Continuous Conversation Context Auto-Sync Protocol
**Target Workspace:** `c:\Users\BAPS\Documents\space\HVAC`  
**Classification:** Persistent Session Memory & Zero-Context-Loss Synchronization  
**Last Updated:** September 2026

---

## 1. The Continuity Invariant: Never Forget User Intent

As the user collaborates, provides creative feedback, uploads assets, specifies logo animations, and tunes micro-interactions, **context must be continuously captured and permanently synchronized into the workspace**.

The agent must NEVER:
- Rely on fleeting in-memory conversational context that resets between turns or compactions.
- Forget user aesthetic guidelines, logo requirements, or component decisions.
- Revert or overwrite custom styling, animations, or token refinements in subsequent code edits.

---

## 2. Conversation Auto-Sync Workflow

At the conclusion of every substantive interaction involving UI/UX modifications, logo design, or feature implementation, the agent must:

1. **Extract Key Signals:**
   - **User Creative Direction:** Explicit stylistic preferences (e.g. glassmorphism opacity, motion stiffness, particle density, color nuances).
   - **Asset Ingestion & Logo Specs:** Logo paths, SVG geometries, brand colors, motion choreography, and keyframes.
   - **Component State & Navigation:** New views added, tabs rearranged, routing updates, or responsive breakpoint tweaks.
   - **Backlog & Pending Tasks:** Unfinished animations, user-requested tweaks, upcoming screens.

2. **Synchronize Memory Bank (`memory-bank/`):**
   - **`activeContext.md`:** Update active creative focus, current animation state, and latest user design instructions.
   - **`progress.md`:** Check off completed UI components/animations; add new sub-tasks requested by the user.
   - **`systemPatterns.md`:** Record newly established animation utilities, keyframe tokens, SVG helpers, or reusable UI hooks.

3. **Validate Against Code Quality & No-Comments Rule:**
   - Ensure all newly authored UI and animation code strictly complies with the **No-Comments Invariant** (self-documenting, clean code without boilerplate explanatory text).
   - Ensure 60fps/120fps GPU performance, zero layout shift (CLS), and accessible high-contrast tokens.

---

## 3. Persistent Memory Mapping

```
User Turn / Prompt
      │
      ▼
[ Execution of UI / Animation Task ]
      │
      ▼
[ Extract Design & Component Decisions ]
      │
      ├──> memory-bank/activeContext.md (Current focus & immediate next steps)
      ├──> memory-bank/progress.md      (Milestones & component checklist)
      └──> memory-bank/systemPatterns.md (Animation patterns & design tokens)
```

---

## 4. Verification Check Before Concluding Any Turn
Before concluding a response to the user, verify:
- Did this interaction modify or establish new UI patterns? If yes, are they recorded in `systemPatterns.md`?
- Did the user express a specific preference for animation timing, logo treatment, or component layout? If yes, is it recorded in `activeContext.md`?
- Is all authored code completely free of trivial boilerplate comments?
