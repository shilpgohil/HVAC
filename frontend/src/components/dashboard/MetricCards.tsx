'use client';

import React from 'react';
import { Fan, Snowflake, Flame, Thermometer } from 'lucide-react';
import { SystemState } from '@/types/hvac';

interface MetricCardsProps {
  systemState: SystemState | null;
}

export function MetricCards({ systemState }: MetricCardsProps) {
  const ahuOnline = systemState?.ahu?.state === 'ON';
  const oduRunning = systemState?.odu_summary?.running ?? 5;
  const oduTotal = systemState?.odu_summary?.total ?? 6;
  const oduStandby = oduTotal - oduRunning;
  
  const heaterRunning = systemState?.heater_summary?.running ?? 8;
  const heaterTotal = systemState?.heater_summary?.total ?? 8;
  const heaterOff = heaterTotal - heaterRunning;

  const currentTemp = systemState?.temperatures?.current_c?.toFixed(1) ?? '24.4';
  const setPoint = systemState?.temperatures?.set_point_c?.toFixed(1) ?? '22.0';

  const currentRh = systemState?.humidity?.current_rh?.toFixed(1) ?? '48.5';
  const setPointRh = systemState?.humidity?.set_point_rh?.toFixed(1) ?? '50.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. AHU Card */}
      <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] flex items-center space-x-4 border-l-4 border-l-emerald-500">
        <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
          <Fan className={`w-6 h-6 text-emerald-600 ${ahuOnline ? 'animate-fan' : ''}`} />
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider">AHU Operating</div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 tracking-tight mt-0.5">
            {ahuOnline ? '1 / 1' : '0 / 1'}
          </div>
          <div className="text-[11px] text-emerald-800 font-bold mt-1 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{ahuOnline ? 'Online (VFD 50Hz)' : 'AHU Standby'}</span>
          </div>
        </div>
      </div>

      {/* 2. ODU Card */}
      <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] flex items-center space-x-4 border-l-4 border-l-sky-500">
        <div className="w-13 h-13 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0 shadow-xs">
          <Snowflake className="w-6 h-6 text-sky-600" />
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider">ODU Inverters</div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 tracking-tight mt-0.5">
            {oduRunning} / {oduTotal}
          </div>
          <div className="text-[11px] text-sky-800 font-bold mt-1 font-mono-numbers">
            {oduStandby > 0 ? `${oduStandby} Inverters Standby` : 'Full DX Capacity Active'}
          </div>
        </div>
      </div>

      {/* 3. Heater Card */}
      <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] flex items-center space-x-4 border-l-4 border-l-amber-500">
        <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
          <Flame className="w-6 h-6 text-amber-600" />
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider">Electric Reheat Bank</div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 tracking-tight mt-0.5">
            {heaterRunning} / {heaterTotal}
          </div>
          <div className="text-[11px] text-amber-800 font-bold mt-1 font-mono-numbers">
            {heaterOff > 0 ? `${heaterOff} Stages Standby` : '8 Stages Energized'}
          </div>
        </div>
      </div>

      {/* 4. Temperature & RH Card */}
      <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] flex items-center space-x-4 border-l-4 border-l-indigo-500">
        <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 shadow-xs">
          <Thermometer className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider">Air Temp &amp; RH</div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 tracking-tight mt-0.5 flex items-center space-x-2">
            <span>{currentTemp}°C</span>
            <span className="text-slate-400">·</span>
            <span className="text-blue-700">{currentRh}%</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-1 font-mono-numbers">
            Target: <span className="text-slate-900 font-bold">{setPoint}°C</span> · <span className="text-blue-800 font-bold">{setPointRh}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
