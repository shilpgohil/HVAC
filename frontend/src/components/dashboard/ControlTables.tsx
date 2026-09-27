'use client';

import React from 'react';
import { Fan, Snowflake, Flame } from 'lucide-react';
import { SystemState } from '@/types/hvac';

interface ControlTablesProps {
  systemState: SystemState | null;
}

export function ControlTables({ systemState }: ControlTablesProps) {
  const ahu = systemState?.ahu || {
    id: 'AHU-01',
    name: 'AHU-01',
    state: 'ON' as const,
    airflow_cfm: 8450,
    fan_vfd_hz: 50.0,
    filter_dp_pa: 120
  };

  const odus = systemState?.odu_summary?.units || [
    { id: 'ODU-01', name: 'ODU-01', state: 'ON' as const, power_kw: 6.8, fan_rpm: 850, temp_c: 18.2 },
    { id: 'ODU-02', name: 'ODU-02', state: 'ON' as const, power_kw: 7.1, fan_rpm: 870, temp_c: 18.5 },
    { id: 'ODU-03', name: 'ODU-03', state: 'ON' as const, power_kw: 6.5, fan_rpm: 830, temp_c: 18.0 },
    { id: 'ODU-04', name: 'ODU-04', state: 'OFF' as const, power_kw: 0.0, fan_rpm: 0, temp_c: 24.0 },
    { id: 'ODU-05', name: 'ODU-05', state: 'ON' as const, power_kw: 6.2, fan_rpm: 810, temp_c: 17.8 },
    { id: 'ODU-06', name: 'ODU-06', state: 'ON' as const, power_kw: 6.9, fan_rpm: 860, temp_c: 18.3 }
  ];

  const heaters = systemState?.heater_summary?.units || [
    { id: 'HTR-01', name: 'HTR-01', state: 'ON' as const, power_kw: 3.0, temp_c: 52.5 },
    { id: 'HTR-02', name: 'HTR-02', state: 'ON' as const, power_kw: 2.9, temp_c: 51.8 },
    { id: 'HTR-03', name: 'HTR-03', state: 'ON' as const, power_kw: 3.0, temp_c: 53.0 },
    { id: 'HTR-04', name: 'HTR-04', state: 'ON' as const, power_kw: 2.8, temp_c: 50.4 },
    { id: 'HTR-05', name: 'HTR-05', state: 'ON' as const, power_kw: 3.0, temp_c: 52.2 },
    { id: 'HTR-06', name: 'HTR-06', state: 'ON' as const, power_kw: 2.9, temp_c: 51.5 },
    { id: 'HTR-07', name: 'HTR-07', state: 'ON' as const, power_kw: 3.0, temp_c: 52.8 },
    { id: 'HTR-08', name: 'HTR-08', state: 'ON' as const, power_kw: 2.8, temp_c: 50.9 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. AHU Telemetry Table */}
      <div className="rounded-2xl overflow-hidden bg-white/90 border border-slate-200/80 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] backdrop-blur-md flex flex-col justify-between">
        <div className="px-4.5 py-3.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Fan className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">AHU Air Handler</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono-numbers font-medium">
            1 Unit
          </span>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider text-[10px] font-semibold">
                <th className="pb-2 pl-1">Unit</th>
                <th className="pb-2">Airflow</th>
                <th className="pb-2">VFD</th>
                <th className="pb-2 text-right pr-1">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-numbers">
              <tr>
                <td className="py-2.5 pl-1 font-bold text-slate-900">{ahu.name}</td>
                <td className="py-2.5 text-slate-700">{ahu.airflow_cfm.toLocaleString()} CFM</td>
                <td className="py-2.5 text-sky-700 font-semibold">{ahu.fan_vfd_hz.toFixed(1)} Hz</td>
                <td className="py-2.5 text-right pr-1">
                  <span className={`inline-flex items-center space-x-1.5 font-semibold text-[10px] uppercase ${
                    ahu.state === 'ON' ? 'text-emerald-700' : 'text-slate-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      ahu.state === 'ON' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`} />
                    <span>{ahu.state}</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-mono-numbers text-slate-500 flex justify-between">
            <span>Filter Differential:</span>
            <span className="text-emerald-700 font-semibold">{ahu.filter_dp_pa} Pa (Clean)</span>
          </div>
        </div>
      </div>

      {/* 2. ODU Inverter Bank Table */}
      <div className="rounded-2xl overflow-hidden bg-white/90 border border-slate-200/80 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] backdrop-blur-md flex flex-col justify-between">
        <div className="px-4.5 py-3.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Snowflake className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">ODU Inverter Bank</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono-numbers font-medium">
            {odus.filter(o => o.state === 'ON').length} / {odus.length} Active
          </span>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="max-h-48 overflow-y-auto pr-1">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="pb-2 pl-1">Unit</th>
                  <th className="pb-2">Power</th>
                  <th className="pb-2">Fan</th>
                  <th className="pb-2 text-right pr-1">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {odus.map((odu) => (
                  <tr key={odu.id}>
                    <td className="py-2 pl-1 font-bold text-slate-900">{odu.name}</td>
                    <td className="py-2 text-slate-700">
                      {odu.state === 'ON' ? `${odu.power_kw} kW` : '--'}
                    </td>
                    <td className="py-2 text-sky-700">
                      {odu.state === 'ON' ? `${odu.fan_rpm} RPM` : '--'}
                    </td>
                    <td className="py-2 text-right pr-1">
                      <span className={`inline-flex items-center space-x-1.5 text-[10px] uppercase font-semibold ${
                        odu.state === 'ON' ? 'text-sky-700' : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          odu.state === 'ON' ? 'bg-sky-500' : 'bg-slate-300'
                        }`} />
                        <span>{odu.state}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-mono-numbers text-slate-500 flex justify-between">
            <span>Inverter Total:</span>
            <span className="text-sky-700 font-semibold">
              {odus.filter(o => o.state === 'ON').reduce((acc, o) => acc + o.power_kw, 0).toFixed(1)} kW
            </span>
          </div>
        </div>
      </div>

      {/* 3. Reheat Bank Table */}
      <div className="rounded-2xl overflow-hidden bg-white/90 border border-slate-200/80 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] backdrop-blur-md flex flex-col justify-between">
        <div className="px-4.5 py-3.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">Reheat Bank</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-mono-numbers font-medium border border-amber-200">
            {heaters.filter(h => h.state === 'ON').length} / {heaters.length} Energized
          </span>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="max-h-48 overflow-y-auto pr-1">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="pb-2 pl-1">Stage</th>
                  <th className="pb-2">Load</th>
                  <th className="pb-2">Temp</th>
                  <th className="pb-2 text-right pr-1">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {heaters.map((heater) => (
                  <tr key={heater.id}>
                    <td className="py-2 pl-1 font-bold text-slate-900">{heater.name}</td>
                    <td className="py-2 text-slate-700">
                      {heater.state === 'ON' ? `${heater.power_kw} kW` : '--'}
                    </td>
                    <td className="py-2 text-amber-700">
                      {heater.state === 'ON' ? `${heater.temp_c}°C` : '--'}
                    </td>
                    <td className="py-2 text-right pr-1">
                      <span className={`inline-flex items-center space-x-1.5 text-[10px] uppercase font-semibold ${
                        heater.state === 'ON' ? 'text-amber-800' : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          heater.state === 'ON' ? 'bg-amber-500' : 'bg-slate-300'
                        }`} />
                        <span>{heater.state}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-mono-numbers text-slate-500 flex justify-between">
            <span>Thermal Output:</span>
            <span className="text-amber-700 font-semibold">
              {heaters.filter(h => h.state === 'ON').reduce((acc, h) => acc + h.power_kw, 0).toFixed(1)} kW
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
