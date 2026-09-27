'use client';

import React from 'react';
import { 
  TrendingUp, 
  Droplets, 
  Thermometer, 
  BarChart2, 
  CheckCircle2 
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

  // Calculate psychrometric dew point approx: Td = T - ((100 - RH)/5)
  const dewPointC = temps.current_c - ((100 - humidity.current_rh) / 5);

  return (
    <div className="space-y-6">
      {/* 1. Header with Export and Time Summary */}
      <div className="rounded-2xl p-6 bg-white/90 border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
            <TrendingUp className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Environmental &amp; Psychrometric Telemetry</h1>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono-numbers font-medium uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                High Fidelity Stream
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono-numbers">
              Coupled thermodynamic air-state curves · Temperature (°C) &amp; Relative Humidity (% RH)
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center space-x-3">
          <div className="p-3 px-4 rounded-xl bg-sky-50/60 border border-sky-200/70 text-right">
            <span className="text-slate-500 text-[11px] font-medium">Cleanroom Dew Point</span>
            <div className="text-xl font-bold font-mono-numbers text-sky-700 mt-0.5">
              {dewPointC.toFixed(1)} <span className="text-xs font-normal text-slate-500">°C Td</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Deep-Dive Interactive Graph */}
      <div>
        <TemperatureTrendGraph />
      </div>

      {/* 3. Statistical Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-5 bg-white/90 border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Thermal Setpoint Delta</span>
            <Thermometer className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1">
            {Math.abs(temps.current_c - temps.set_point_c).toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-500">°C</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 font-mono-numbers font-medium">
            Target: {temps.set_point_c.toFixed(1)}°C (Nominal Stability)
          </div>
        </div>

        <div className="rounded-xl p-5 bg-white/90 border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>RH Setpoint Delta</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-blue-600 mt-1">
            {Math.abs(humidity.current_rh - humidity.set_point_rh).toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-500">% RH</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 font-mono-numbers font-medium">
            Target: {humidity.set_point_rh.toFixed(1)}% (ISO Class Standard)
          </div>
        </div>

        <div className="rounded-xl p-5 bg-white/90 border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Supply Air Temperature</span>
            <BarChart2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-amber-700 mt-1">
            {temps.supply_c.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-500">°C</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono-numbers">
            Leaving DX Coil Condition
          </div>
        </div>

        <div className="rounded-xl p-5 bg-white/90 border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Return Air Temperature</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1">
            {temps.return_c.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-500">°C</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono-numbers">
            Zone Recirculation Exhaust
          </div>
        </div>
      </div>
    </div>
  );
}
