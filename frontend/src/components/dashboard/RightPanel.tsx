'use client';

import React, { useState } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Bell, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu,
  Plus,
  Minus,
  SlidersHorizontal
} from 'lucide-react';
import { SystemState } from '@/types/hvac';
import { updateTemperatureSetpoint, updateHumiditySetpoint } from '@/lib/api';

interface RightPanelProps {
  systemState: SystemState | null;
}

export function RightPanel({ systemState }: RightPanelProps) {
  const [localSetPointC, setLocalSetPointC] = useState<number | null>(null);
  const [localSetPointRh, setLocalSetPointRh] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('Auto');

  const temps = systemState?.temperatures || {
    current_c: 24.4,
    set_point_c: 22.0,
    supply_c: 18.2,
    return_c: 26.8,
    unit: '°C'
  };

  const humidity = systemState?.humidity || {
    current_rh: 48.5,
    set_point_rh: 50.0,
    unit: '%',
    humidifier_active: false,
    dehumidifier_active: false
  };

  const sysInfo = systemState?.system_info || {
    total_ahu: 1,
    total_odu: 6,
    total_heater: 8,
    total_power_kw: 62.4,
    system_mode: 'Auto',
    plc_online: true,
    status_text: 'Optimal'
  };

  const alarms = systemState?.alarms || [];
  const activeAlarms = alarms.filter(a => a.state !== 'CLEARED');

  const currentEffectiveTemp = localSetPointC ?? temps.set_point_c;
  const currentEffectiveRh = localSetPointRh ?? humidity.set_point_rh;

  const tempDelta = temps.current_c - currentEffectiveTemp;
  const rhDelta = humidity.current_rh - currentEffectiveRh;

  const handleAdjustTemp = async (delta: number) => {
    const next = Math.round((currentEffectiveTemp + delta) * 10) / 10;
    if (next < 16.0 || next > 30.0) return;
    setLocalSetPointC(next);
    try {
      await updateTemperatureSetpoint(next);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustRh = async (delta: number) => {
    const next = Math.round(currentEffectiveRh + delta);
    if (next < 30 || next > 75) return;
    setLocalSetPointRh(next);
    try {
      await updateHumiditySetpoint(next);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 flex flex-col">
      {/* 1. Temperature Telemetry & Interactive Setpoint Controls */}
      <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-xs border-t-4 border-t-sky-500">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight">Thermal Management</span>
              <div className="text-[10px] text-slate-600 font-mono-numbers font-medium">Zone A Cleanroom</div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-sky-900 font-mono-numbers font-bold border border-sky-300">
            Active PID
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3.5 border-b border-slate-200">
          <div>
            <div className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">Current Temp</div>
            <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-0.5">
              {temps.current_c.toFixed(1)} <span className="text-xs font-normal text-slate-500">°C</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">Target Setpoint</div>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className="text-2xl font-bold font-mono-numbers text-sky-700">
                {currentEffectiveTemp.toFixed(1)} <span className="text-xs font-normal text-slate-500">°C</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleAdjustTemp(-0.5)}
                  className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 transition-colors cursor-pointer active:scale-95"
                  title="Decrease Setpoint (-0.5°C)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleAdjustTemp(+0.5)}
                  className="w-6 h-6 rounded-md bg-sky-100 hover:bg-sky-200 border border-sky-300 flex items-center justify-center text-sky-800 transition-colors cursor-pointer active:scale-95"
                  title="Increase Setpoint (+0.5°C)"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Supply Air</div>
            <div className="text-sm font-bold font-mono-numbers text-sky-800 mt-0.5">
              {temps.supply_c.toFixed(1)} <span className="text-xs font-normal text-slate-500">°C</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Return Air</div>
            <div className="text-sm font-bold font-mono-numbers text-amber-800 mt-0.5">
              {temps.return_c.toFixed(1)} <span className="text-xs font-normal text-slate-500">°C</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-200 flex justify-between text-[11px] font-mono-numbers">
          <span className="text-slate-600 font-medium">Thermal Delta:</span>
          <span className={tempDelta > 0.5 ? 'text-amber-800 font-bold' : 'text-emerald-800 font-bold'}>
            {tempDelta >= 0 ? `+${tempDelta.toFixed(1)}` : tempDelta.toFixed(1)} °C offset
          </span>
        </div>
      </div>

      {/* 2. Relative Humidity (RH) Telemetry & Interactive Setpoint */}
      <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-xs border-t-4 border-t-emerald-500">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight">Psychrometric Humidity</span>
              <div className="text-[10px] text-slate-600 font-mono-numbers font-medium">Cleanroom Envelope</div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono-numbers font-bold border border-emerald-300">
            ISO Class 10k
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3.5 border-b border-slate-200">
          <div>
            <div className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">Actual RH</div>
            <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-0.5">
              {humidity.current_rh.toFixed(1)} <span className="text-xs font-normal text-slate-500">%</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">Target Setpoint</div>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className="text-2xl font-bold font-mono-numbers text-emerald-700">
                {currentEffectiveRh.toFixed(1)} <span className="text-xs font-normal text-slate-500">%</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleAdjustRh(-1)}
                  className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 transition-colors cursor-pointer active:scale-95"
                  title="Decrease RH Target (-1%)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleAdjustRh(+1)}
                  className="w-6 h-6 rounded-md bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 flex items-center justify-center text-emerald-800 transition-colors cursor-pointer active:scale-95"
                  title="Increase RH Target (+1%)"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-200 flex justify-between text-[11px] font-mono-numbers">
          <span className="text-slate-600 font-medium">Humidity Envelope:</span>
          <span className="text-emerald-700 font-bold">
            {rhDelta >= 0 ? `+${rhDelta.toFixed(1)}` : rhDelta.toFixed(1)}% RH
          </span>
        </div>
      </div>

      {/* 3. Active Alarms Console */}
      <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-xs border-t-4 border-t-rose-500">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">Active Alarms</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono-numbers font-bold border border-rose-300">
              {activeAlarms.length}
            </span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono-numbers font-medium">
            Supervised Feed
          </span>
        </div>

        <div className="divide-y divide-slate-100 mt-1">
          {activeAlarms.length === 0 ? (
            <div className="py-5 text-center text-xs text-slate-500 flex flex-col items-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
              <span className="text-slate-800 font-semibold text-xs">All systems nominal</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Zero active fault conditions</span>
            </div>
          ) : (
            activeAlarms.map((alarm) => (
              <div key={alarm.id} className="py-2.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-800 font-mono-numbers">{alarm.component_code}</span>
                    <span className="text-[10px] text-slate-400 font-mono-numbers">{alarm.triggered_at}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 truncate mt-0.5">{alarm.message}</div>
                </div>

                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono-numbers bg-amber-50 text-amber-800 border border-amber-200 shrink-0 font-medium">
                  {alarm.severity}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Supervisory Telemetry Summary & Mode Switcher */}
      <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-900 text-sm">Control Mode</span>
          </div>
          <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
            {['Auto', 'Manual', 'Eco'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMode(m)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  selectedMode === m
                    ? 'bg-white text-sky-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 text-xs font-mono-numbers">
          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
            <span>Air Handling Units</span>
            <span className="text-slate-900 font-semibold">{sysInfo.total_ahu} Active</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
            <span>Inverter Condensers</span>
            <span className="text-slate-900 font-semibold">{sysInfo.total_odu} Units</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
            <span>Reheat Stages</span>
            <span className="text-slate-900 font-semibold">{sysInfo.total_heater} Stages</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
            <span>Active Power Draw</span>
            <span className="text-blue-600 font-semibold">{sysInfo.total_power_kw} kW</span>
          </div>
          <div className="flex justify-between py-1 text-slate-500">
            <span>Fieldbus Gateway</span>
            <span className="text-emerald-700 font-semibold flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Modbus/BACnet Sync</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
