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
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                Psychrometric &amp; Environmental Telemetry
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                1 Hz Real-Time Loop
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Coupled thermodynamic air-state curves · Temperature (°C), Relative Humidity (% RH) and Psychrometric Dew Point
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 px-4 rounded-xl bg-slate-50 border border-slate-200/80 text-right">
            <span className="text-slate-500 text-xs font-mono font-medium">Cleanroom Dew Point</span>
            <div className="text-xl font-bold font-mono text-blue-600 mt-0.5 tabular-nums">
              {dewPointC.toFixed(1)} <span className="text-xs font-normal text-slate-400 font-sans">°C Td</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
          <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider font-semibold mb-1">
            Room Space Temp
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {temps.current_c.toFixed(1)} <span className="text-xs font-normal text-slate-400 font-sans">°C</span>
          </div>
          <div className="text-[11px] text-blue-600 font-mono mt-1 font-medium">
            Target Setpoint: {temps.set_point_c.toFixed(1)}°C
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
          <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider font-semibold mb-1">
            Supply Discharge
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 tabular-nums">
            {temps.supply_c.toFixed(1)} <span className="text-xs font-normal text-slate-400 font-sans">°C</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Return Air: <span className="text-amber-600 font-bold">{temps.return_c.toFixed(1)}°C</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
          <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider font-semibold mb-1">
            Relative Humidity
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600 tabular-nums">
            {humidity.current_rh.toFixed(1)} <span className="text-xs font-normal text-slate-400 font-sans">%</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-mono mt-1 font-medium">
            Target Envelope: {humidity.set_point_rh.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
          <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider font-semibold mb-1">
            Vapor Pressure
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            1.48 <span className="text-xs font-normal text-slate-400 font-sans">kPa</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1 font-medium">
            Standard Atmospheric Equilibrium
          </div>
        </div>
      </div>

      <TemperatureTrendGraph />
    </div>
  );
}
