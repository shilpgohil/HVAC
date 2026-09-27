# HVAC Digital Twin — MQTT, WebSocket & Safety Control Pipeline
**Target Workspace:** `c:\Users\BAPS\Documents\space\HVAC`  
**Classification:** Supervisory Control Pipeline & Network Safety Standards  
**Last Updated:** September 2026

---

## 1. Network Boundary Invariant: Browser Never Connects to MQTT or PLC

The browser must NEVER establish a direct TCP or WebSocket connection to the client's MQTT broker, Modbus TCP gateway, or physical PLC:

```
[ Physical PLC / Gateway ]
          |
     (MQTT Broker)
          |
 [ Backend Ingestion Adapter ]
          |
 [ Canonical State & Normalizer ] ---> [ PostgreSQL History & Audit ]
          |
   (WebSocket Server)
          |
 [ Next.js Frontend Digital Twin ]
```

- **Frontend Isolation:** The frontend has zero knowledge of broker IP addresses, Modbus registers, BACnet object IDs, or raw wire payloads.
- **Backend Mediation:** All incoming telemetry is normalized into canonical point entities; all outgoing commands pass through authentication, authorization, payload schema validation, and safety interlocks.

---

## 2. Configuration-Driven MQTT Architecture

MQTT connection parameters reside strictly in environment variables:
```ini
MQTT_BROKER_HOST=broker.emqx.io
MQTT_BROKER_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_USE_TLS=false
MQTT_CLIENT_ID_PREFIX=hvac_twin_backend
MQTT_TOPIC_PREFIX=hvac/site_01/
MQTT_QOS=1
MQTT_KEEPALIVE=60
```

### Standard Topic Hierarchy
- **Telemetry Ingestion:** `hvac/{site_id}/{system_id}/{component_id}/telemetry`
- **Equipment State Changes:** `hvac/{site_id}/{system_id}/{component_id}/state`
- **Alarm Notifications:** `hvac/{site_id}/{system_id}/{component_id}/alarm`
- **Command Dispatch:** `hvac/{site_id}/{system_id}/{component_id}/cmd/{command_type}`
- **Command Feedback / Ack:** `hvac/{site_id}/{system_id}/{component_id}/cmd_ack`
- **Heartbeat / Health:** `hvac/{site_id}/gateway/{gateway_id}/heartbeat`

---

## 3. Real-Time WebSocket Event Taxonomy

Live updates to the frontend are event-driven and granular. Never broadcast the entire HVAC database on every sensor reading:

```typescript
type WebSocketEvent =
  | { type: "POINT_UPDATED"; payload: { point_id: string; value: number | string | boolean; quality: DataQuality; timestamp: string } }
  | { type: "EQUIPMENT_STATE_CHANGED"; payload: { component_id: string; state: EquipmentState; mode: ControlMode; timestamp: string } }
  | { type: "ALARM_CREATED"; payload: Alarm }
  | { type: "ALARM_ACKNOWLEDGED"; payload: { alarm_id: string; acknowledged_by: string; acknowledged_at: string } }
  | { type: "ALARM_CLEARED"; payload: { alarm_id: string; cleared_at: string } }
  | { type: "COMMAND_STATUS_CHANGED"; payload: CommandStatusUpdate }
  | { type: "COMMUNICATION_STATUS_CHANGED"; payload: { gateway_id: string; is_online: boolean; latency_ms: number; last_heartbeat: string } };
```

---

## 4. Supervisory Command Execution & Two-Step Safety

The web platform is a supervisory management layer; the PLC remains the ultimate safety authority.

### 4.1 Command Lifecycle State Machine
```
[ User Action ]
      |
[ 1. Validate & Auth (Backend) ] ---> If invalid: REJECTED (400/403)
      |
[ 2. SENT_TO_BROKER ]
      |
[ 3. ACK_BY_GATEWAY ]
      |
[ 4. CONFIRMED_BY_TELEMETRY ] (Physical state matches requested value)
      |
[ COMPLETED ]
```
If physical confirmation does not arrive within `command_timeout_seconds` (default: 15s), the command transitions to `TIMED_OUT` with alert generation. The UI must NEVER optimistically assume success.

### 4.2 Two-Step Confirmation Mandate
Commands that materially alter physical operation require an explicit confirmation modal or deliberate slide-to-confirm action:
- Equipment `START` / `STOP` / `EMERGENCY_STOP`
- Switching from `AUTO` to `MANUAL` override
- Changing thermal setpoints outside nominal comfort bands (e.g. cooling setpoint < 19°C or > 26°C)
- Safety fault and interlock resets
- Modulating manual control valves or VFD speeds

---

## 5. Comprehensive Audit Trail

Every supervisory interaction produces an immutable audit record in PostgreSQL:
- Operator ID and role
- Exact timestamp (UTC)
- Target component and point
- Previous value vs. requested value
- Authorization check result
- Gateway acknowledgement timestamp
- Physical confirmation timestamp or timeout failure reason
