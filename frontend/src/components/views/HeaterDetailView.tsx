'use client';

import React, { useState } from 'react';
import { 
  Flame, 
  Zap, 
  Activity, 
  Thermometer, 
  Gauge, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu,
  Power
} from 'lucide-react';
import { SystemState } from '@/types/hvac';
import { toggleHeaterState } from '@/lib/api';

interface HeaterDetailViewProps {
  systemState: SystemState | null;
}

export function HeaterDetailView({ systemState }: HeaterDetailViewProps) {
  const [localStates, setLocalStates] = useState<Record<string, 'ON' | 'OFF'>>({});

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

  const runningCount = units.filter(u => (localStates[u.id] ?? u.state) === 'ON').length;
  const totalPower = units.reduce((acc, u) => acc + ((localStates[u.id] ?? u.state) === 'ON' ? u.power_kw : 0), 0);
  const totalCurrent = units.reduce((acc, u) => acc + ((localStates[u.id] ?? u.state) === 'ON' ? (u.current_a || 12.8) : 0), 0);
  const avgTemp = units.length > 0 
    ? (units.reduce((acc, u) => acc + (u.temp_c || 52.0), 0) / units.length).toFixed(1)
    : '52.0';

  const handleToggle = async (id: string, current: 'ON' | 'OFF') => {
    const next = current === 'ON' ? 'OFF' : 'ON';
    setLocalStates(prev => ({ ...prev, [id]: next }));
    try {
      await toggleHeaterState(id, next);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAll = async (target: 'ON' | 'OFF') => {
    const updates: Record<string, 'ON' | 'OFF'> = {};
    units.forEach(u => { updates[u.id] = target; });
    setLocalStates(prev => ({ ...prev, ...updates }));
    for (const u of units) {
      toggleHeaterState(u.id, target).catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with System Overview & Batch Controls */}
      <div className="rounded-2xl p-6 bg-white border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-amber-500">
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

        {/* Batch Actions & Global Summary */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleAll('ON')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center space-x-1"
            >
              <Power className="w-3 h-3" />
              <span>All Stages ON</span>
            </button>
            <button
              onClick={() => handleAll('OFF')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              All OFF
            </button>
          </div>

          <div className="p-2.5 px-4 rounded-xl bg-amber-50 border border-amber-300 text-right">
            <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-wider">Active Duty</span>
            <div className="text-lg font-bold font-mono-numbers text-amber-800">
              {totalPower.toFixed(1)} <span className="text-xs font-medium text-slate-500">kW</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Stages Card */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-xs border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Active Heating Stages</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1.5">
            {runningCount} <span className="text-sm font-medium text-slate-500">/ 8 Stages</span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-600 mt-3 pt-1 border-t border-slate-100 font-mono-numbers">
            <span>Staging Mode:</span>
            <span className="font-semibold text-emerald-800">Auto PID Modulated</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Zero-cross thyristor PWM cycling
          </div>
        </div>

        {/* Total Heat Output Card */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-xs border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Total Thermal Output</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-amber-700 mt-1.5">
            {totalPower.toFixed(1)} <span className="text-sm font-medium text-slate-500">kW</span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-600 mt-3 pt-1 border-t border-slate-100 font-mono-numbers">
            <span>Design Rating:</span>
            <span className="font-semibold text-slate-800">24.0 kW (8x 3kW)</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Capacity Utilization: {((totalPower / 24.0) * 100).toFixed(0)}%
          </div>
        </div>

        {/* Total Phase Current Card */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-xs border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Phase Current (415V 3-Ph)</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1.5">
            {totalCurrent.toFixed(1)} <span className="text-sm font-medium text-slate-500">A</span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-600 mt-3 pt-1 border-t border-slate-100 font-mono-numbers">
            <span>Feeder Breaker:</span>
            <span className="font-semibold text-slate-800">63A 4-Pole MCB</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Overcurrent Protection Normal
          </div>
        </div>

        {/* Element Core Temp Card */}
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-xs border-l-4 border-l-emerald-500">
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

      {/* 3. 8 Stage Cards with Interactive ON/OFF Switches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {units.map((unit, idx) => {
          const effectiveState = localStates[unit.id] ?? unit.state;
          const isOn = effectiveState === 'ON';
          return (
            <div 
              key={unit.id}
              className={`rounded-2xl p-5 border transition-all duration-200 bg-white shadow-xs ${
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

                <button
                  onClick={() => handleToggle(unit.id, effectiveState)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono-numbers uppercase font-bold flex items-center space-x-1 transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
                    isOn 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
                  }`}
                >
                  <Power className="w-2.5 h-2.5" />
                  <span>{isOn ? 'Energized' : 'Standby'}</span>
                </button>
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

                {/* Capacity Gradient Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div 
                    className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-amber-400 to-amber-600"
                    style={{ width: isOn ? `${(unit.power_kw / 3.0) * 100}%` : '0%' }}
                  />
                </div>

                {/* Core Temperature */}
                <div className="flex justify-between items-center pt-1 font-mono-numbers">
                  <span className="text-slate-600 font-medium">Core Temp</span>
                  <span className="font-bold text-slate-900">
                    {isOn ? unit.temp_c : 24.0} <span className="text-slate-500 font-normal">°C</span>
                  </span>
                </div>

                {/* Phase Current */}
                <div className="flex justify-between items-center font-mono-numbers">
                  <span className="text-slate-600 font-medium">Phase Current</span>
                  <span className="font-bold text-slate-800">
                    {isOn ? (unit.current_a || 13.0) : 0.0} <span className="text-slate-500 font-normal">A</span>
                  </span>
                </div>

                {/* Duty Cycle Badge */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Modulation:</span>
                  <span className={`font-mono-numbers font-semibold ${isOn ? 'text-amber-800' : 'text-slate-400'}`}>
                    {isOn ? 'SCR PWM 100%' : 'OFF (0%)'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
