import { SystemState, ElectricalState, HomeIotState } from '@/types/hvac';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface HistoryPoint {
  time: string;
  timestamp: string;
  supply_c: number;
  return_c: number;
  set_point_c: number;
  current_c: number;
  rh_pct?: number;
  rh_setpoint_pct?: number;
}

export async function fetchSystemState(): Promise<SystemState> {
  const res = await fetch(`${API_BASE}/control/state`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch system state');
  return res.json();
}

export async function toggleAhuState(state: 'ON' | 'OFF'): Promise<any> {
  const res = await fetch(`${API_BASE}/control/ahu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state })
  });
  if (!res.ok) throw new Error('Failed to update AHU state');
  return res.json();
}

export async function toggleOduState(oduId: string, state: 'ON' | 'OFF'): Promise<any> {
  const res = await fetch(`${API_BASE}/control/odu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ odu_id: oduId, state })
  });
  if (!res.ok) throw new Error('Failed to update ODU state');
  return res.json();
}

export async function toggleHeaterState(heaterId: string, state: 'ON' | 'OFF'): Promise<any> {
  const res = await fetch(`${API_BASE}/control/heater`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ heater_id: heaterId, state })
  });
  if (!res.ok) throw new Error('Failed to update Heater state');
  return res.json();
}

export async function updateTemperatureSetpoint(targetC: number): Promise<any> {
  const res = await fetch(`${API_BASE}/control/setpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_c: targetC })
  });
  if (!res.ok) throw new Error('Failed to update setpoint');
  return res.json();
}

export async function updateHumiditySetpoint(targetRh: number): Promise<any> {
  const res = await fetch(`${API_BASE}/control/rh-setpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_rh: targetRh })
  });
  if (!res.ok) throw new Error('Failed to update humidity setpoint');
  return res.json();
}

export async function fetchTemperatureHistory(range: string = '12H'): Promise<HistoryPoint[]> {
  const res = await fetch(`${API_BASE}/control/history?range=${encodeURIComponent(range)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch temperature history');
  return res.json();
}

export async function fetchElectricalState(): Promise<ElectricalState> {
  const res = await fetch(`${API_BASE}/control/electrical/state`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch electrical state');
  return res.json();
}

export async function updateSystemMode(mode: string): Promise<any> {
  const res = await fetch(`${API_BASE}/control/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!res.ok) throw new Error('Failed to update system mode');
  return res.json();
}

export async function acknowledgeAlarm(alarmId: string, user: string = 'admin'): Promise<any> {
  const res = await fetch(`${API_BASE}/control/alarm/ack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alarm_id: alarmId, user })
  });
  if (!res.ok) throw new Error('Failed to acknowledge alarm');
  return res.json();
}

export async function clearAlarm(alarmId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/control/alarm/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alarm_id: alarmId })
  });
  if (!res.ok) throw new Error('Failed to clear alarm');
  return res.json();
}

export interface ScenarioItem {
  scenario_id: number;
  name: string;
  description: string;
  active: boolean;
}

export async function fetchScenarios(): Promise<ScenarioItem[]> {
  const res = await fetch(`${API_BASE}/simulator/scenarios`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  return res.json();
}

export async function switchScenario(scenarioId: number): Promise<any> {
  const res = await fetch(`${API_BASE}/simulator/scenarios/${scenarioId}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to activate scenario');
  return res.json();
}

export async function fetchHomeIotState(): Promise<HomeIotState> {
  const res = await fetch(`${API_BASE}/control/home-iot/state`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch home iot state');
  return res.json();
}

export async function toggleHomeIotDevice(roomId: string, deviceId: string, state?: boolean): Promise<any> {
  const res = await fetch(`${API_BASE}/control/home-iot/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id: roomId, device_id: deviceId, state })
  });
  if (!res.ok) throw new Error('Failed to toggle home device');
  return res.json();
}

export async function updateHomeIotRoomTemp(roomId: string, targetC: number): Promise<any> {
  const res = await fetch(`${API_BASE}/control/home-iot/setpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id: roomId, target_c: targetC })
  });
  if (!res.ok) throw new Error('Failed to update room temperature');
  return res.json();
}

export async function activateHomeIotScene(sceneName: string): Promise<any> {
  const res = await fetch(`${API_BASE}/control/home-iot/scene`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scene: sceneName })
  });
  if (!res.ok) throw new Error('Failed to activate scene');
  return res.json();
}

export async function updateHomeIotSecurityMode(mode: string): Promise<any> {
  const res = await fetch(`${API_BASE}/control/home-iot/security`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!res.ok) throw new Error('Failed to update security mode');
  return res.json();
}

export async function activateHomeIotScenario(scenarioId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/control/home-iot/scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId })
  });
  if (!res.ok) throw new Error('Failed to activate scenario');
  return res.json();
}

export async function setHomeIotDeviceLevel(roomId: string, deviceId: string, level: number): Promise<any> {
  const res = await fetch(`${API_BASE}/control/home-iot/dimmer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id: roomId, device_id: deviceId, level })
  });
  if (!res.ok) throw new Error('Failed to set device level');
  return res.json();
}

