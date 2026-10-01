'use client';

import React, { useState } from 'react';
import { Snowflake, Activity, Zap, Gauge, Fan, Power } from 'lucide-react';
import { SystemState } from '@/types/hvac';
import { toggleOduState } from '@/lib/api';

interface OduDetailViewProps {
  systemState: SystemState | null;
}

export function OduDetailView({ systemState }: OduDetailViewProps) {
  const [localStates, setLocalStates] = useState<Record<string, 'ON' | 'OFF'>>({});

  const units = systemState?.odu_summary?.units || [
    { id: 'ODU-01', name: 'ODU-01', state: 'ON' as const, power_kw: 18.2, fan_rpm: 820, temp_c: 32.5, circuit: 1, pressure_mpa: 1.85 },
    { id: 'ODU-02', name: 'ODU-02', state: 'ON' as const, power_kw: 17.8, fan_rpm: 810, temp_c: 32.1, circuit: 1, pressure_mpa: 1.82 },
    { id: 'ODU-03', name: 'ODU-03', state: 'ON' as const, power_kw: 18.5, fan_rpm: 830, temp_c: 33.0, circuit: 2, pressure_mpa: 1.88 },
    { id: 'ODU-04', name: 'ODU-04', state: 'OFF' as const, power_kw: 0.0, fan_rpm: 0, temp_c: 28.0, circuit: 2, pressure_mpa: 0.95 },
    { id: 'ODU-05', name: 'ODU-05', state: 'ON' as const, power_kw: 18.0, fan_rpm: 815, temp_c: 32.4, circuit: 3, pressure_mpa: 1.84 },
    { id: 'ODU-06', name: 'ODU-06', state: 'ON' as const, power_kw: 18.4, fan_rpm: 825, temp_c: 32.8, circuit: 3, pressure_mpa: 1.86 }
  ];

  const runningCount = units.filter((u) => (localStates[u.id] ?? u.state) === 'ON').length;
  const totalPower = units.reduce((acc, u) => acc + ((localStates[u.id] ?? u.state) === 'ON' ? u.power_kw : 0), 0);

  const handleToggle = async (id: string, current: 'ON' | 'OFF') => {
    const next = current === 'ON' ? 'OFF' : 'ON';
    setLocalStates((prev) => ({ ...prev, [id]: next }));
    try {
      await toggleOduState(id, next);
    } catch {}
  };

  const handleAll = async (target: 'ON' | 'OFF') => {
    const updates: Record<string, 'ON' | 'OFF'> = {};
    units.forEach((u) => { updates[u.id] = target; });
    setLocalStates((prev) => ({ ...prev, ...updates }));
    for (const u of units) {
      toggleOduState(u.id, target).catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      <div className="surface-panel rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
            <Snowflake className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight font-sans">ODU Inverter Condenser Bank</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30">
                {runningCount} / {units.length} Inverters Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Variable Refrigerant Flow (VRF) scroll inverter condensing modules · Total DX cooling capacity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAll('ON')}
            className="px-3.5 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs font-mono transition-colors shadow-md active:scale-95"
          >
            All Inverters ON
          </button>
          <button
            onClick={() => handleAll('OFF')}
            className="px-3.5 py-1.5 rounded-xl surface-well hover:bg-slate-800 text-slate-300 border border-white/10 font-bold text-xs font-mono transition-colors active:scale-95"
          >
            All Inverters OFF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => {
          const effectiveState = localStates[unit.id] ?? unit.state;
          const isRunning = effectiveState === 'ON';

          return (
            <div 
              key={unit.id}
              className={`surface-panel rounded-2xl p-5 border transition-all duration-200 ${
                isRunning 
                  ? 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.12)]' 
                  : 'border-white/5 opacity-65'
              }`}
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    isRunning 
                      ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' 
                      : 'surface-well border-white/5 text-slate-500'
                  }`}>
                    <Fan className={`w-4.5 h-4.5 ${isRunning ? 'spin-fast text-blue-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">{unit.name}</h3>
                    <div className="text-[10px] text-slate-400 font-mono">Circuit {unit.circuit || 1}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(unit.id, unit.state)}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                    isRunning 
                      ? 'bg-blue-500 text-slate-950 shadow-md' 
                      : 'surface-well text-slate-400 border border-white/10'
                  }`}
                >
                  <Power className="w-2.5 h-2.5" />
                  <span>{isRunning ? 'RUN' : 'OFF'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 py-4 border-b border-white/5 text-xs font-mono">
                <div className="surface-well p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase">Power Draw</div>
                  <div className="text-base font-bold text-white mt-0.5 tabular-nums">
                    {isRunning ? unit.power_kw.toFixed(1) : '0.0'} <span className="text-[10px] font-normal text-slate-400">kW</span>
                  </div>
                </div>

                <div className="surface-well p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase">Fan Speed</div>
                  <div className="text-base font-bold text-blue-400 mt-0.5 tabular-nums">
                    {isRunning ? unit.fan_rpm : 0} <span className="text-[10px] font-normal text-slate-400">RPM</span>
                  </div>
                </div>

                <div className="surface-well p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase">Head Press.</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5 tabular-nums">
                    {unit.pressure_mpa ? unit.pressure_mpa.toFixed(2) : '1.85'} <span className="text-[10px] font-normal text-slate-400">MPa</span>
                  </div>
                </div>

                <div className="surface-well p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase">Coil Temp</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5 tabular-nums">
                    {unit.temp_c.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">°C</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Circuit Protection:</span>
                <span className={isRunning ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {isRunning ? 'CLOSED / NORMAL' : 'STANDBY LOCKOUT'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
