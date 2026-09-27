# HVAC Digital Twin — Code Craft & Anti-AI Coding Standards
**Target Workspace:** `c:\Users\BAPS\Documents\space\HVAC`  
**Classification:** Software Engineering Standards & Code Quality Invariants  
**Last Updated:** September 2026

---

## 1. Non-Negotiable Invariant: No Boilerplate / Explanatory Comments

As explicitly instructed by the user, **do not write unnecessary, redundant, or obvious comments in code.**

### What is Forbidden:
- ❌ Trivial narrative comments:
  ```python
  # BAD:
  # Loop through all the points and check if quality is good
  for point in points:
      # check if quality is GOOD
      if point.quality == "GOOD":
          # append to list
          good_points.append(point)
  ```
- ❌ Decorative section banners (`// ======== HELPER FUNCTIONS ========`).
- ❌ Docstrings that merely repeat function and variable names (`def get_point(point_id): """Gets a point by point id."""`).

### What is Required:
- ✅ Self-documenting code with precise domain terminology (`cooling_coil_leaving_air_temp_c`, `chilled_water_delta_t_k`).
- ✅ Strict typing in TypeScript (`strict: true`, zero `any`) and Python 3.12+ (type annotations on every parameter and return).
- ✅ Expressive function signatures that make the logic obvious without commentary.

---

## 2. Anti-AI-Code Architectural Principles

1. **Zero Hardcoded Assumptions:** Never branch on specific equipment names (e.g., `if (equipment.name === "Chiller A")`). Equipment behavior is driven by metadata, capabilities, and point maps.
2. **Modular File Sizes:** Avoid monolithic 1,500-line components. Decompose into focused domain components, custom hooks, and pure utility functions.
3. **No Mocks Masquerading as Production Code:** Never write mock fallbacks inside production service handlers. If an external service is down in production mode, raise a typed domain exception and surface an honest error state.
4. **Pydantic v2 & SQLAlchemy 2.0 Invariants:**
   - All backend request payloads and API responses use Pydantic v2 models with strict field validation.
   - All database queries use SQLAlchemy 2.0 async `select()` syntax with scoped session dependencies.
5. **Robust Error Handling:** Every error is typed and mapped to an appropriate HTTP status code (`NotFoundError` -> 404, `SafetyInterlockError` -> 422, `CommunicationTimeoutError` -> 504).
