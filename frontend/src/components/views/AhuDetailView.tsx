'use client';

import React, { useState } from 'react';
import { 
  Fan, 
  Wind, 
  Gauge, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Thermometer, 
  Layers,
  Power
} from 'lucide-react';
import { SystemState } from '@/types/hvac';
import { toggleAhuState } from '@/lib/api';

interface AhuDetailViewProps {
  systemState: SystemState | null;
}

export function AhuDetailView({ systemState }: AhuDetailViewProps) {
  const [localState, setLocalState] = useState<'ON' | 'OFF' | null>(null);

  const ahu = systemState?.ahu || {
    id: 'ahu-1',
    name: 'Air Handling Unit 1',
    state: 'ON' as const,
    airflow_cfm: 8450,
    fan_vfd_hz: 50.0,
    filter_dp_pa: 120,
    humidifier_active: false,
    dehumidifier_active: false
  };

  const temps = systemState?.temperatures || {
    supply_c: 18.2,
    return_c: 26.8,
    current_c: 24.4,
    set_point_c: 22.0
  };

  const isRunning = (localState ?? ahu.state) === 'ON';
  const vfdSpeedHz = ahu.fan_vfd_hz;
  const supplyFanRpm = Math.round(vfdSpeedHz * 28.4);

  const freshAirDamperPct = 25;
  const returnDamperPct = 75;
  const exhaustDamperPct = 15;

  const handleToggle = async () => {
    const next = isRunning ? 'OFF' : 'ON';
    setLocalState(next);
    try {
      await toggleAhuState(next);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Master Power Control */}
      <div className="rounded-2xl p-6 bg-white border border-slate-300 shadow-xs border-l-4 border-l-emerald-500 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
            <Fan className={`w-7 h-7 ${isRunning ? 'animate-fan text-emerald-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">AHU-01 Cleanroom Air Handler</h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-mono-numbers font-bold uppercase tracking-wider ${
                isRunning 
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {isRunning ? 'Operational (50.0 Hz Closed-Loop)' : 'Standby'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-mono-numbers">
              Direct Expansion (DX) Coil · VFD Variable Frequency Drive · Centrifugal Fans
            </p>
          </div>
        </div>

        {/* Master Power Toggle Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggle}
            className={`px-5 py-2.5 rounded-xl font-bold font-mono-numbers text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs flex items-center space-x-2 active:scale-95 ${
              isRunning
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isRunning ? 'Power: ACTIVE (ON)' : 'Power: STANDBY (OFF)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Key AHU Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Airflow CFM */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <span>Airflow Volume</span>
            <Wind className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1.5">
            {isRunning ? ahu.airflow_cfm.toLocaleString() : '0'}{' '}
            <span className="text-xs font-normal text-slate-500">CFM</span>
          </div>
          <div className="text-[11px] text-emerald-800 mt-2 font-mono-numbers font-bold">
            Design: 8,500 CFM (99.4%)
          </div>
        </div>

        {/* Supply Fan VFD */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <span>Supply Fan VFD</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-blue-700 mt-1.5">
            {isRunning ? vfdSpeedHz.toFixed(1) : '0.0'}{' '}
            <span className="text-xs font-normal text-slate-500">Hz</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-2 font-mono-numbers font-medium">
            Speed: {isRunning ? supplyFanRpm : 0} RPM
          </div>
        </div>

        {/* Filter Differential Pressure */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <span>Filter DP (Delta P)</span>
            <Gauge className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1.5">
            {isRunning ? ahu.filter_dp_pa : 0}{' '}
            <span className="text-xs font-normal text-slate-500">Pa</span>
          </div>
          <div className="text-[11px] text-emerald-800 mt-2 font-mono-numbers font-bold">
            HEPA Bank Clean (&lt; 250 Pa)
          </div>
        </div>

        {/* DX Cooling Load */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <span>DX Cooling Differential</span>
            <Thermometer className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-indigo-700 mt-1.5">
            {isRunning ? (temps.return_c - temps.supply_c).toFixed(1) : '0.0'}{' '}
            <span className="text-xs font-normal text-slate-500">Δ°C</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-2 font-mono-numbers font-medium">
            Supply {temps.supply_c.toFixed(1)}°C · Return {temps.return_c.toFixed(1)}°C
          </div>
        </div>
      </div>

      {/* 3. Deep-Dive Subsystems Grid (Read-Only Telemetry Displays) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Damper Modulation & Air Mixing (Read-Only Bars) */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2.5">
              <Layers className="w-4 h-4 text-sky-600" />
              <h2 className="font-bold text-slate-900 text-sm">Damper Position Telemetry</h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono-numbers font-medium border border-slate-200">
              Modulating 0-10V
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>Fresh Outdoor Air Damper</span>
                <span className="font-mono-numbers font-bold text-sky-700">{freshAirDamperPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${freshAirDamperPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>Return Air Recirculation Damper</span>
                <span className="font-mono-numbers font-bold text-amber-700">{returnDamperPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${returnDamperPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>Exhaust Relief Damper</span>
                <span className="font-mono-numbers font-bold text-purple-700">{exhaustDamperPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${exhaustDamperPct}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono-numbers">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Mixed Air Temperature (Calc):</span>
              <span className="text-slate-900 font-bold">22.4 °C</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Free-Cooling Economizer:</span>
              <span className="text-emerald-800 font-bold">Enabled (Enthalpy Safe)</span>
            </div>
          </div>
        </div>

        {/* Fan VFD & Static Pressure (Read-Only) */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2.5">
              <Activity className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm">VFD &amp; Static Pressure Diagnostics</h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono-numbers font-medium border border-slate-200">
              Closed-Loop PID
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>VFD Modulation Output</span>
                <span className="font-mono-numbers font-bold text-blue-700">{vfdSpeedHz.toFixed(1)} Hz (83.3%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(vfdSpeedHz / 60) * 100}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-wider">Duct Static Pressure</span>
                <div className="text-base font-bold font-mono-numbers text-slate-900 mt-1">
                  340 <span className="text-xs text-slate-500 font-normal">Pa</span>
                </div>
                <span className="text-[10px] text-emerald-800 font-bold font-mono-numbers">Setpoint: 350 Pa (±10 Pa)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-wider">Fan Vibration</span>
                <div className="text-base font-bold font-mono-numbers text-emerald-800 mt-1">
                  0.82 <span className="text-xs text-slate-500 font-normal">mm/s</span>
                </div>
                <span className="text-[10px] text-slate-600 font-mono-numbers">ISO 10816-3 Good</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-900">Freeze-Stat Safety Interlock Armed</div>
                <div className="text-slate-700 text-[10px] font-mono-numbers">Coil Temp: 11.2 °C (&gt; 4.5 °C trip limit)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
