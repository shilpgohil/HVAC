# HVAC Digital Twin — Simulation Engine & Thermodynamic Scenarios
**Target Workspace:** `c:\Users\BAPS\Documents\space\HVAC`  
**Classification:** Development Data Source & Thermodynamic Test Scenarios  
**Last Updated:** September 2026

---

## 1. The Physics Invariant: Realistic Thermodynamics, Never Static JSON

The development environment must operate against a realistic thermodynamic simulation engine rather than static, uncoupled JSON stubs. Variables must exhibit physically plausible relationships:

### 1.1 Hydronic & Thermal Balance
- **Heat Transfer:** $\dot{Q}_{air} = \dot{m}_{air} c_{p,air} (T_{in} - T_{out}) \approx \dot{m}_{chw} c_{p,water} (T_{chw,return} - T_{chw,supply})$
- **Valve Modulation:** When room temperature exceeds setpoint, the cooling PID controller opens the chilled water control valve ($0\% \rightarrow 100\%$).
- **Flow Response:** Increased valve opening increases chilled water flow ($L/s$ or $GPM$).
- **Chiller Response:** Increased thermal load raises return water temperature, causing chiller compressor staging/VFD ramping, raising power draw ($kW$) and modulating COP.

### 1.2 Aerodynamic & Pressure Coupling
- **Fan VFD Ramping:** As fan VFD speed increases ($Hz$ or $\%$), airflow ($CFM$ or $m^3/h$) scales with speed, static pressure ($Pa$) scales quadratically with speed, and electrical power ($kW$) scales cubically with speed (affinity laws).
- **Filter Loading:** Differential pressure across air filters increases with airflow and particulate loading.

---

## 2. The 12 Mandatory Test Scenarios

The simulator must provide runtime switching between 12 discrete operational scenarios via an admin control panel or API endpoint:

| # | Scenario Name | Physical / Network Behavior | Expected System & UI Response |
|---|---|---|---|
| 1 | **Normal Operation** | All equipment healthy, ambient temp nominal, PID loops tracking setpoints. | System green (`NORMAL`), smooth animated SVG flow, zero active alarms. |
| 2 | **High Cooling Demand** | Simulated thermal load step change (+5°C ambient or occupant surge). | Cooling valve modulates to 90%+, CHW flow rises, chiller load increases, supply temp tracks. |
| 3 | **Supply Fan Failure** | Fan commanded `RUN`, but current sensor or differential pressure switch remains open. | `CRITICAL` alarm generated: "Supply Fan Run Failure / Flow Loss"; fan transitions to `FAULT`. |
| 4 | **CHW Pump Trip** | Pump circuit breaker trips; flow drops to 0 GPM while chiller is commanded run. | `CRITICAL` alarm: "Chilled Water Flow Loss"; chiller interlock triggers to protect evaporator. |
| 5 | **High Filter DP** | Dust accumulation simulated; differential pressure exceeds 250 Pa threshold. | `WARNING` alarm: "Air Filter Dirty / High DP"; yellow warning indicator on filter component. |
| 6 | **Low Evaporator Flow** | Balancing valve throttled; flow drops below chiller manufacturer minimum threshold. | `CRITICAL` alarm: "Low Chilled Water Flow"; chiller modulates capacity down to prevent freezing. |
| 7 | **High Supply Air Temp** | Cooling valve seized shut (10%); supply air temp rises to 24°C against 18°C setpoint. | `WARNING` alarm: "Supply Air Temp High"; cooling coil highlighted in schematic. |
| 8 | **Sensor Open Circuit** | Resistance reading on discharge air sensor goes to $\infty$ (open thermocouple). | Point quality transitions to `BAD`; UI renders `BAD VALUE` in red rather than 0°C or NaN. |
| 9 | **Gateway Offline** | Gateway stops publishing MQTT heartbeat; ping timeout occurs after 15 seconds. | Communication status badges red `OFFLINE`; all downstream telemetry points marked `STALE`. |
| 10 | **Stale Telemetry** | Individual sensor stops updating while gateway remains connected. | Individual point timestamp ages past threshold; badge displays `STALE` with muted gray text. |
| 11 | **Manual VFD Override** | Operator sets fan speed manually to 60 Hz overriding building automation. | Mode switches from `AUTO` to `MANUAL`; UI renders bright cyan indicator badge (`#06B6D4`). |
| 12 | **Command Fail / Timeout** | Start command sent to chiller, but oil pressure safety switch prevents compressor start. | Command status displays `COMMAND FAILED / TIMED OUT`; audit log records failure. |

---

## 3. Production Mode Safety: Absolute Ban on Fake Data

- In **Development Mode**, the simulation engine generates live realistic values.
- In **Production Mode**, the application connects ONLY to client protocol gateways.
- **Zero Fallback Fallacy:** If client telemetry is unavailable in production, the software must NEVER silently generate random numbers, static defaults, or dummy strings. The UI must honestly report: `UNKNOWN`, `NO DATA`, `OFFLINE`, or `STALE`.
