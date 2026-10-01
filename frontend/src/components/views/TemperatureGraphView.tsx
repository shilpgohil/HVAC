'use client';

import React from 'react';
import { 
  TrendingUp, 
  Droplets, 
  Thermometer, 
  BarChart2, 
  CheckCircle2,
  Wind
} from 'lucide-react';
import { TemperatureTrendGraph } from '@/components/dashboard/TemperatureTrendGraph';
import { SystemState } from '@/types/hvac';

interface TemperatureGraphViewProps {
  systemState: SystemState | null;
}

export function TemperatureGraphView({ systemState }: TemperatureGraphViewProps) {
  const temps = systemState?.temperatures || {
    current_c: 24.4,
    set_point_c: 22.0,
    supply_c: 18.2,
    return_c: 26.8
  };

  const humidity = systemState?.humidity || {
    current_rh: 48.5,
    set_point_rh: 50.0
  };

  const dewPointC = temps.current_c - ((100 - humidity.current_rh) / 5);

  return (
    <div className="space-y-6">
      <div className="surface-panel rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
            <TrendingUp className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight font-sans">
                Psychrometric & Environmental Telemetry
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                1 Hz Real-Time Loop
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Coupled thermodynamic air-state curves · Temperature (°C), Relative Humidity (% RH) and Psychrometric Dew Point
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 px-4 rounded-xl surface-well border border-white/10 text-right">
            <span className="text-slate-400 text-xs font-mono">Cleanroom Dew Point</span>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5 tabular-nums">
              {dewPointC.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C Td</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="text-xs text-slate-400 font-mono uppercase mb-1">Room Space Temp</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {temps.current_c.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
          </div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1">
            Target Setpoint: {temps.set_point_c.toFixed(1)}°C
          </div>
        </div>

        <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="text-xs text-slate-400 font-mono uppercase mb-1">Supply Discharge</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {temps.supply_c.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Return Air: <span className="text-amber-400 font-bold">{temps.return_c.toFixed(1)}°C</span>
          </div>
        </div>

        <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="text-xs text-slate-400 font-mono uppercase mb-1">Relative Humidity</div>
          <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
            {humidity.current_rh.toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            Target Envelope: {humidity.set_point_rh.toFixed(1)}%
          </div>
        </div>

        <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="text-xs text-slate-400 font-mono uppercase mb-1">Vapor Pressure</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            1.48 <span className="text-xs font-normal text-slate-400">kPa</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Standard Atmospheric Equilibrium
          </div>
        </div>
      </div>

      <TemperatureTrendGraph />
    </div>
  );
}
