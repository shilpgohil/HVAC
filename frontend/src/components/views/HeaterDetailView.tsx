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
    { id: 'HTR-01', name: 'HTR-01', state: 'ON' as const, power_kw: 3.0, temp_c: 52.5, stage: 1, current_a: 13.0 },
    { id: 'HTR-02', name: 'HTR-02', state: 'ON' as const, power_kw: 2.9, temp_c: 51.8, stage: 2, current_a: 12.8 },
    { id: 'HTR-03', name: 'HTR-03', state: 'ON' as const, power_kw: 3.0, temp_c: 53.0, stage: 3, current_a: 13.1 },
    { id: 'HTR-04', name: 'HTR-04', state: 'ON' as const, power_kw: 2.8, temp_c: 50.4, stage: 4, current_a: 12.4 },
    { id: 'HTR-05', name: 'HTR-05', state: 'ON' as const, power_kw: 3.0, temp_c: 52.2, stage: 5, current_a: 13.0 },
    { id: 'HTR-06', name: 'HTR-06', state: 'ON' as const, power_kw: 2.9, temp_c: 51.5, stage: 6, current_a: 12.7 },
    { id: 'HTR-07', name: 'HTR-07', state: 'ON' as const, power_kw: 3.0, temp_c: 52.8, stage: 7, current_a: 13.1 },
    { id: 'HTR-08', name: 'HTR-08', state: 'ON' as const, power_kw: 2.8, temp_c: 50.9, stage: 8, current_a: 12.5 }
  ];

  const runningCount = units.filter((u) => (localStates[u.id] ?? u.state) === 'ON').length;
  const totalPower = units.reduce((acc, u) => acc + ((localStates[u.id] ?? u.state) === 'ON' ? u.power_kw : 0), 0);
  const totalCurrent = units.reduce((acc, u) => acc + ((localStates[u.id] ?? u.state) === 'ON' ? (u.current_a || 12.8) : 0), 0);
  const avgTemp = units.length > 0 
    ? (units.reduce((acc, u) => acc + (u.temp_c || 52.0), 0) / units.length).toFixed(1)
    : '52.0';

  const handleToggle = async (id: string, current: 'ON' | 'OFF') => {
    const next = current === 'ON' ? 'OFF' : 'ON';
    setLocalStates((prev) => ({ ...prev, [id]: next }));
    try {
      await toggleHeaterState(id, next);
    } catch {}
  };

  const handleAll = async (target: 'ON' | 'OFF') => {
    const updates: Record<string, 'ON' | 'OFF'> = {};
    units.forEach((u) => { updates[u.id] = target; });
    setLocalStates((prev) => ({ ...prev, ...updates }));
    for (const u of units) {
      toggleHeaterState(u.id, target).catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      <div className="surface-panel rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight font-sans">Electric Duct Reheat Bank</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {runningCount} / {units.length} Stages Energized
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Silicon Controlled Rectifier (SCR) proportional duct reheat battery · Psychrometric humidity trim
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAll('ON')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition-colors shadow-md active:scale-95"
          >
            All Stages ON
          </button>
          <button
            onClick={() => handleAll('OFF')}
            className="px-3.5 py-1.5 rounded-xl surface-well hover:bg-slate-800 text-slate-300 border border-white/10 font-bold text-xs font-mono transition-colors active:scale-95"
          >
            All Stages OFF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
            <span>Reheat Duty</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalPower.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kW</span>
          </div>
          <div className="text-[11px] text-amber-400 font-mono mt-1 font-semibold">
            {runningCount === 8 ? 'Full Capacity Trim' : 'Modulated Staging'}
          </div>
        </div>

        <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
            <span>Phase Current</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {totalCurrent.toFixed(1)} <span className="text-xs text-slate-400 font-normal">A</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            415V 3-Phase Delta
          </div>
        </div>

        <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
            <span>Element Core Temp</span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {avgTemp} <span className="text-xs text-slate-400 font-normal">°C</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Limit: <span className="text-slate-200 font-semibold">&lt; 85°C Safety Cutout</span>
          </div>
        </div>

        <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
            <span>SCR Modulation</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {runningCount > 0 ? '100%' : '0%'} <span className="text-xs text-slate-400 font-normal">Pulse</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1 font-semibold">
            Solid State Relay Synchronized
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {units.map((unit) => {
          const effective = localStates[unit.id] ?? unit.state;
          const isRunning = effective === 'ON';

          return (
            <div 
              key={unit.id}
              className={`surface-panel rounded-2xl p-4 border transition-all duration-200 ${
                isRunning 
                  ? 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.12)]' 
                  : 'border-white/5 opacity-65'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-xs font-bold text-white font-mono">{unit.name}</span>
                </div>

                <button
                  onClick={() => handleToggle(unit.id, unit.state)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                    isRunning 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'surface-well text-slate-400 border border-white/10'
                  }`}
                >
                  <Power className="w-2.5 h-2.5" />
                  <span>{isRunning ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              <div className="space-y-2 py-3 border-b border-white/5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Duty Output:</span>
                  <span className="text-white font-bold">{isRunning ? `${unit.power_kw.toFixed(1)} kW` : '0.0 kW'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Draw:</span>
                  <span className="text-cyan-400 font-bold">{isRunning ? `${unit.current_a ?? 13.0} A` : '0.0 A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Element Temp:</span>
                  <span className="text-amber-400 font-bold">{isRunning ? `${unit.temp_c}°C` : '24.0°C'}</span>
                </div>
              </div>

              <div className="pt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Stage {unit.stage || 1}</span>
                <span className={isRunning ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                  {isRunning ? 'ENERGIZED' : 'STANDBY'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
