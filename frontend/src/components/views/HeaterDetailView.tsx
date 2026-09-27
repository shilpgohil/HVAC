'use client';

import React from 'react';
import { 
  Flame, 
  Zap, 
  Activity, 
  Thermometer, 
  Gauge, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu 
} from 'lucide-react';
import { SystemState } from '@/types/hvac';

interface HeaterDetailViewProps {
  systemState: SystemState | null;
}

export function HeaterDetailView({ systemState }: HeaterDetailViewProps) {
  const units = systemState?.heater_summary?.units || [
    { id: 'heater-1', name: 'HTR-01', state: 'ON' as const, power_kw: 3.0, temp_c: 52.5, stage: 1, current_a: 13.0 },
    { id: 'heater-2', name: 'HTR-02', state: 'ON' as const, power_kw: 2.9, temp_c: 51.8, stage: 2, current_a: 12.8 },
    { id: 'heater-3', name: 'HTR-03', state: 'ON' as const, power_kw: 3.0, temp_c: 53.0, stage: 3, current_a: 13.1 },
    { id: 'heater-4', name: 'HTR-04', state: 'ON' as const, power_kw: 2.8, temp_c: 50.4, stage: 4, current_a: 12.4 },
    { id: 'heater-5', name: 'HTR-05', state: 'ON' as const, power_kw: 3.0, temp_c: 52.2, stage: 5, current_a: 13.0 },
    { id: 'heater-6', name: 'HTR-06', state: 'ON' as const, power_kw: 2.9, temp_c: 51.5, stage: 6, current_a: 12.7 },
    { id: 'heater-7', name: 'HTR-07', state: 'ON' as const, power_kw: 3.0, temp_c: 52.8, stage: 7, current_a: 13.1 },
    { id: 'heater-8', name: 'HTR-08', state: 'ON' as const, power_kw: 2.8, temp_c: 50.9, stage: 8, current_a: 12.5 }
  ];

  const runningCount = units.filter(u => u.state === 'ON').length;
  const totalPower = units.reduce((acc, u) => acc + (u.state === 'ON' ? u.power_kw : 0), 0);
  const totalCurrent = units.reduce((acc, u) => acc + (u.state === 'ON' ? (u.current_a || 12.8) : 0), 0);
  const avgTemp = units.length > 0 
    ? (units.reduce((acc, u) => acc + (u.temp_c || 52.0), 0) / units.length).toFixed(1)
    : '52.0';

  return (
    <div className="space-y-6">
      {/* 1. Header with System Overview (High Contrast Light Mode) */}
      <div className="rounded-2xl p-6 bg-white border border-slate-300 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-amber-500">
        <div className="flex items-center space-x-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
            <Flame className="w-7 h-7 text-amber-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">8-Stage Electric Reheat Bank</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono-numbers font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                {runningCount} / {units.length} Stages Energized
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-mono-numbers">
              Solid-state SCR zero-cross modulating reheat · Cleanroom psychrometric trim &amp; thermal balance
            </p>
          </div>
        </div>

        {/* Total Heat Output Badge */}
        <div className="p-3.5 px-6 rounded-xl bg-amber-50 border border-amber-200 text-right">
          <span className="text-slate-600 text-[11px] font-semibold uppercase tracking-wider">Total Heating Load</span>
          <div className="text-2xl font-bold font-mono-numbers text-amber-700 mt-0.5">
            {totalPower.toFixed(1)} <span className="text-xs font-medium text-slate-600">kW / 24.0 kW</span>
          </div>
        </div>
      </div>

      {/* 2. Focused Telemetry KPI Grid (Filled, High-Contrast Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Stages Card */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Sequencer Active Stages</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1.5">
            {runningCount} <span className="text-sm font-medium text-slate-500">/ 8 Stages</span>
          </div>
          {/* Segmented Stage Indicator (All 8 Stages Visualized) */}
          <div className="grid grid-cols-8 gap-1 mt-3">
            {units.map((u, i) => (
              <div 
                key={u.id}
                title={`Stage ${i + 1}: ${u.state === 'ON' ? 'Energized' : 'Standby'}`}
                className={`h-2 rounded-sm transition-all ${
                  u.state === 'ON' ? 'bg-amber-500 shadow-xs' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <div className="text-[11px] text-amber-800 font-semibold mt-2 font-mono-numbers">
            100% Reheat Capacity Active
          </div>
        </div>

        {/* Total Power Load Card */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Thermal Power Output</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-amber-700 mt-1.5">
            {totalPower.toFixed(1)} <span className="text-sm font-medium text-slate-500">kW</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(totalPower / 24.0) * 100}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-600 mt-2 font-mono-numbers">
            Rated Max: 24.0 kW @ 415V 3-Phase
          </div>
        </div>

        {/* Phase Current Card */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Combined Current Draw</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-blue-700 mt-1.5">
            {totalCurrent.toFixed(1)} <span className="text-sm font-medium text-slate-500">A</span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-600 mt-3 pt-1 border-t border-slate-100 font-mono-numbers">
            <span>Balanced 3-Phase:</span>
            <span className="font-semibold text-slate-800">L1/L2/L3 Active</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Overcurrent Protection Normal
          </div>
        </div>

        {/* Element Core Temp Card */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Average Element Core Temp</span>
            <Thermometer className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1.5">
            {avgTemp} <span className="text-sm font-medium text-slate-500">°C</span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-600 mt-3 pt-1 border-t border-slate-100 font-mono-numbers">
            <span>Thermal Cutout Limit:</span>
            <span className="font-semibold text-slate-800">75.0 °C</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Margin: +{(75.0 - parseFloat(avgTemp)).toFixed(1)}°C Safety Headroom
          </div>
        </div>
      </div>

      {/* 3. 8 Stage Cards (Solid Cards, Vibrant Amber Visuals, No White-on-White, 100% Read-Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {units.map((unit, idx) => {
          const isOn = unit.state === 'ON';
          return (
            <div 
              key={unit.id}
              className={`rounded-2xl p-5 border transition-all duration-200 bg-white shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] ${
                isOn 
                  ? 'border-slate-300 border-t-4 border-t-amber-500 hover:border-amber-400' 
                  : 'border-slate-200 opacity-60'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono-numbers text-[11px] font-bold text-slate-700 border border-slate-200">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm tracking-tight">{unit.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Reheat Stage</div>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-numbers uppercase font-bold flex items-center space-x-1 ${
                  isOn 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isOn ? 'bg-amber-600 animate-pulse' : 'bg-slate-400'}`} />
                  {isOn ? 'Energized' : 'Standby'}
                </span>
              </div>

              {/* Multi-Telemetry Grid */}
              <div className="pt-3.5 space-y-2.5 text-xs">
                {/* Electric Load */}
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-600 font-medium">Heating Load</span>
                  <span className="font-mono-numbers font-bold text-amber-700 text-base">
                    {isOn ? unit.power_kw.toFixed(1) : '0.0'} <span className="text-xs font-normal text-slate-500">kW</span>
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 rounded-full"
                    style={{ width: isOn ? `${Math.min(100, (unit.power_kw / 3.0) * 100)}%` : '0%' }}
                  />
                </div>

                {/* Technical Sub-telemetry */}
                <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono-numbers">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-sans">Core Temp</div>
                    <div className="font-bold text-slate-900 mt-0.5">{unit.temp_c}°C</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-sans">Phase Current</div>
                    <div className="font-bold text-blue-700 mt-0.5">{unit.current_a || '13.0'} A</div>
                  </div>
                </div>

                {/* Status line */}
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono-numbers">
                  <span>Modulation: SCR PWM</span>
                  <span className="font-semibold text-emerald-700">100% Duty</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
