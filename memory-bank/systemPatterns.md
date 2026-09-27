# System Patterns & Architecture Invariants

## 1. Decoupled Dimension Pattern
- **Physical Topology:** Defined via adjacency/relational tables (`component_relationships`).
- **Visual Layout:** Stored as canvas coordinates (`x`, `y`, `width`, `height`, `rotation`) in `visual_configs`.
- **Telemetry:** Ingested via protocol adapters and normalized into canonical `points`.

## 2. Network Isolation Pattern
- Browser -> REST / WebSocket API -> Backend -> MQTT Broker -> Gateway -> PLC -> Physical Equipment.
- Zero direct browser connections to MQTT brokers, Modbus registers, or BACnet networks.

## 3. Two-Step Safety Command Pattern
- Command requested -> Backend authorization -> Schema validation -> MQTT dispatch -> Gateway ACK -> Physical state confirmation -> WebSocket event -> UI completion.

## 4. Code Craft Standards
- No boilerplate or explanatory comments in code.
- Strict type safety (`strict: true` in TypeScript, full Python type hints).
- High-density control room UI with `Inter` and `JetBrains Mono`.
