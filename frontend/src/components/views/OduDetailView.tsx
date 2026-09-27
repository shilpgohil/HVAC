'use client';

import React from 'react';
import { Snowflake, Activity, Zap, Gauge, Fan } from 'lucide-react';
import { SystemState } from '@/types/hvac';

interface OduDetailViewProps {
  systemState: SystemState | null;
}

export function OduDetailView({ systemState }: OduDetailViewProps) {
  const units = systemState?.odu_summary?.units || [
    { id: 'odu-1', name: 'ODU-01', state: 'ON' as const, power_kw: 6.8, fan_rpm: 850, temp_c: 18.2, circuit: 1, pressure_mpa: 2.85 },
    { id: 'odu-2', name: 'ODU-02', state: 'ON' as const, power_kw: 7.1, fan_rpm: 870, temp_c: 18.5, circuit: 2, pressure_mpa: 2.90 },
    { id: 'odu-3', name: 'ODU-03', state: 'ON' as const, power_kw: 6.5, fan_rpm: 830, temp_c: 18.0, circuit: 3, pressure_mpa: 2.80 },
    { id: 'odu-4', name: 'ODU-04', state: 'ON' as const, power_kw: 7.4, fan_rpm: 890, temp_c: 18.9, circuit: 4, pressure_mpa: 2.95 },
    { id: 'odu-5', name: 'ODU-05', state: 'ON' as const, power_kw: 6.2, fan_rpm: 810, temp_c: 17.8, circuit: 5, pressure_mpa: 2.75 },
    { id: 'odu-6', name: 'ODU-06', state: 'ON' as const, power_kw: 6.9, fan_rpm: 860, temp_c: 18.3, circuit: 6, pressure_mpa: 2.88 }
  ];

  const runningCount = units.filter(u => u.state === 'ON').length;
  const totalPower = units.reduce((acc, u) => acc + (u.state === 'ON' ? u.power_kw : 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header with System Overview (Read-Only) */}
      <div className="rounded-2xl p-6 bg-white border border-slate-300 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] border-l-4 border-l-sky-500 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-13 h-13 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 shadow-xs">
            <Snowflake className="w-7 h-7 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">ODU Inverter Condenser Bank</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono-numbers font-bold uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300">
                {runningCount} / {units.length} Inverters Operating
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-mono-numbers">
              Direct-coupled multi-circuit refrigerant DX cooling · Inverter scroll modulation
            </p>
          </div>
        </div>

        {/* Global Summary Badge */}
        <div className="p-3.5 px-6 rounded-xl bg-sky-50 border border-sky-200 text-right">
          <span className="text-slate-600 text-[11px] font-semibold uppercase tracking-wider">Combined DX Power</span>
          <div className="text-2xl font-bold font-mono-numbers text-sky-800 mt-0.5">
            {totalPower.toFixed(1)} <span className="text-xs font-medium text-slate-500">kW</span>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <span>Active Compressors</span>
            <Snowflake className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1.5">
            {runningCount} <span className="text-sm font-medium text-slate-500">/ 6 Units</span>
          </div>
          <div className="text-[11px] text-emerald-800 mt-2 font-mono-numbers font-bold">
            Lead-Lag Rotation: Balanced
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <span>Total Electric Power</span>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-blue-800 mt-1.5">
            {totalPower.toFixed(1)} <span className="text-sm font-medium text-slate-500">kW</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-2 font-mono-numbers font-medium">
            Avg: {(totalPower / (runningCount || 1)).toFixed(1)} kW / running unit
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <span>Refrigerant Pressure</span>
            <Gauge className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-amber-700 mt-1.5">
            2.85 <span className="text-sm font-medium text-slate-500">MPa</span>
          </div>
          <div className="text-[11px] text-emerald-800 mt-2 font-bold">
            R-410A High-Side Safe (&lt; 3.8 MPa)
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white border border-slate-300 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <span>COP Efficiency</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-emerald-800 mt-1.5">
            4.12
          </div>
          <div className="text-[11px] text-slate-600 mt-2 font-mono-numbers font-medium">
            Inverter Scroll Class A+++
          </div>
        </div>
      </div>

      {/* 3. Dedicated 6 ODU Matrix (Read-Only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit, idx) => {
          const isOn = unit.state === 'ON';
          return (
            <div 
              key={unit.id}
              className={`rounded-2xl p-5 border transition-all duration-200 bg-white shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] ${
                isOn 
                  ? 'border-slate-300 border-t-4 border-t-sky-500 hover:border-sky-400' 
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono-numbers text-[11px] font-bold text-slate-700 border border-slate-200">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm tracking-tight">{unit.name}</div>
                    <div className="text-[10px] text-slate-600 font-mono-numbers font-medium">Circuit DX-{idx + 1}</div>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-numbers uppercase font-bold flex items-center space-x-1 ${
                  isOn 
                    ? 'bg-sky-100 text-sky-900 border border-sky-300' 
                    : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isOn ? 'bg-sky-600 animate-pulse' : 'bg-slate-400'}`} />
                  {isOn ? 'Operating' : 'Standby'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-wider">Power Load</span>
                  <div className="text-base font-bold font-mono-numbers text-slate-900 mt-1">
                    {unit.power_kw} <span className="text-xs font-normal text-slate-500">kW</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-wider">Fan RPM</span>
                  <div className="text-base font-bold font-mono-numbers text-sky-800 mt-1">
                    {unit.fan_rpm} <span className="text-xs font-normal text-slate-500">RPM</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-wider">Condenser Coil</span>
                  <div className="text-base font-bold font-mono-numbers text-slate-900 mt-1">
                    {unit.temp_c} <span className="text-xs font-normal text-slate-500">°C</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-wider">Pressure</span>
                  <div className="text-base font-bold font-mono-numbers text-amber-700 mt-1">
                    {unit.pressure_mpa ?? 2.85} <span className="text-xs font-normal text-slate-500">MPa</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
