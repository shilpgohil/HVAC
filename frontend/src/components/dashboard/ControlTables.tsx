'use client';

import React, { useState } from 'react';
import { Fan, Snowflake, Flame, Power } from 'lucide-react';
import { SystemState } from '@/types/hvac';
import { toggleAhuState, toggleOduState, toggleHeaterState } from '@/lib/api';

interface ControlTablesProps {
  systemState: SystemState | null;
}

export function ControlTables({ systemState }: ControlTablesProps) {
  const [localAhuState, setLocalAhuState] = useState<'ON' | 'OFF' | null>(null);
  const [localOduStates, setLocalOduStates] = useState<Record<string, 'ON' | 'OFF'>>({});
  const [localHeaterStates, setLocalHeaterStates] = useState<Record<string, 'ON' | 'OFF'>>({});

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

  const currentAhuState = localAhuState ?? ahu.state;

  const handleToggleAhu = async () => {
    const next = currentAhuState === 'ON' ? 'OFF' : 'ON';
    setLocalAhuState(next);
    try {
      await toggleAhuState(next);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleOdu = async (id: string, current: 'ON' | 'OFF') => {
    const effective = localOduStates[id] ?? current;
    const next = effective === 'ON' ? 'OFF' : 'ON';
    setLocalOduStates(prev => ({ ...prev, [id]: next }));
    try {
      await toggleOduState(id, next);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleHeater = async (id: string, current: 'ON' | 'OFF') => {
    const effective = localHeaterStates[id] ?? current;
    const next = effective === 'ON' ? 'OFF' : 'ON';
    setLocalHeaterStates(prev => ({ ...prev, [id]: next }));
    try {
      await toggleHeaterState(id, next);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllOdus = async (target: 'ON' | 'OFF') => {
    const updates: Record<string, 'ON' | 'OFF'> = {};
    odus.forEach(o => { updates[o.id] = target; });
    setLocalOduStates(prev => ({ ...prev, ...updates }));
    for (const o of odus) {
      toggleOduState(o.id, target).catch(() => {});
    }
  };

  const handleAllHeaters = async (target: 'ON' | 'OFF') => {
    const updates: Record<string, 'ON' | 'OFF'> = {};
    heaters.forEach(h => { updates[h.id] = target; });
    setLocalHeaterStates(prev => ({ ...prev, ...updates }));
    for (const h of heaters) {
      toggleHeaterState(h.id, target).catch(() => {});
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. AHU Telemetry & Interactive Control Table */}
      <div className="rounded-2xl overflow-hidden bg-white border border-slate-300 shadow-xs flex flex-col justify-between border-t-4 border-t-emerald-500">
        <div className="px-4.5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Fan className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">AHU Air Handler</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono-numbers font-medium">
            Master Unit
          </span>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <th className="pb-2 pl-1">Unit</th>
                <th className="pb-2">Airflow</th>
                <th className="pb-2">VFD</th>
                <th className="pb-2 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-numbers">
              <tr>
                <td className="py-3 pl-1 font-bold text-slate-900">{ahu.name}</td>
                <td className="py-3 text-slate-700 font-medium">{currentAhuState === 'ON' ? `${ahu.airflow_cfm.toLocaleString()} CFM` : '0 CFM'}</td>
                <td className="py-3 text-sky-700 font-bold">{currentAhuState === 'ON' ? `${ahu.fan_vfd_hz.toFixed(1)} Hz` : '0.0 Hz'}</td>
                <td className="py-3 text-right pr-1">
                  <button
                    onClick={handleToggleAhu}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
                      currentAhuState === 'ON'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
                    }`}
                  >
                    <Power className="w-2.5 h-2.5" />
                    <span>{currentAhuState}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono-numbers text-slate-600 flex justify-between items-center">
            <span className="font-medium">Filter Differential:</span>
            <span className="text-emerald-700 font-bold">{ahu.filter_dp_pa} Pa (Clean)</span>
          </div>
        </div>
      </div>

      {/* 2. ODU Inverter Bank Table with Interactive Toggles */}
      <div className="rounded-2xl overflow-hidden bg-white border border-slate-300 shadow-xs flex flex-col justify-between border-t-4 border-t-sky-500">
        <div className="px-4.5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Snowflake className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">ODU Inverter Bank</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleAllOdus('ON')}
              className="text-[9px] px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold cursor-pointer"
            >
              All ON
            </button>
            <button
              onClick={() => handleAllOdus('OFF')}
              className="text-[9px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-bold cursor-pointer"
            >
              All OFF
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="max-h-52 overflow-y-auto pr-1">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                  <th className="pb-2 pl-1">Unit</th>
                  <th className="pb-2">Power</th>
                  <th className="pb-2">Fan</th>
                  <th className="pb-2 text-right pr-1">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {odus.map((odu) => {
                  const effectiveState = localOduStates[odu.id] ?? odu.state;
                  const isOn = effectiveState === 'ON';
                  return (
                    <tr key={odu.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 pl-1 font-bold text-slate-900">{odu.name}</td>
                      <td className="py-2 text-slate-700 font-medium">
                        {isOn ? `${odu.power_kw} kW` : '--'}
                      </td>
                      <td className="py-2 text-sky-700 font-semibold">
                        {isOn ? `${odu.fan_rpm} RPM` : '--'}
                      </td>
                      <td className="py-2 text-right pr-1">
                        <button
                          onClick={() => handleToggleOdu(odu.id, odu.state)}
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 ${
                            isOn
                              ? 'bg-sky-600 hover:bg-sky-700 text-white'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-600 border border-slate-300'
                          }`}
                        >
                          <Power className="w-2 h-2" />
                          <span>{effectiveState}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono-numbers text-slate-600 flex justify-between items-center">
            <span className="font-medium">Inverter Total Load:</span>
            <span className="text-sky-700 font-bold">
              {odus.filter(o => (localOduStates[o.id] ?? o.state) === 'ON').reduce((acc, o) => acc + o.power_kw, 0).toFixed(1)} kW
            </span>
          </div>
        </div>
      </div>

      {/* 3. Reheat Bank Table with Interactive Toggles */}
      <div className="rounded-2xl overflow-hidden bg-white border border-slate-300 shadow-xs flex flex-col justify-between border-t-4 border-t-amber-500">
        <div className="px-4.5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">Reheat Bank</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleAllHeaters('ON')}
              className="text-[9px] px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold cursor-pointer"
            >
              All ON
            </button>
            <button
              onClick={() => handleAllHeaters('OFF')}
              className="text-[9px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-bold cursor-pointer"
            >
              All OFF
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="max-h-52 overflow-y-auto pr-1">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                  <th className="pb-2 pl-1">Stage</th>
                  <th className="pb-2">Load</th>
                  <th className="pb-2">Temp</th>
                  <th className="pb-2 text-right pr-1">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {heaters.map((heater) => {
                  const effectiveState = localHeaterStates[heater.id] ?? heater.state;
                  const isOn = effectiveState === 'ON';
                  return (
                    <tr key={heater.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 pl-1 font-bold text-slate-900">{heater.name}</td>
                      <td className="py-2 text-slate-700 font-medium">
                        {isOn ? `${heater.power_kw} kW` : '--'}
                      </td>
                      <td className="py-2 text-amber-700 font-semibold">
                        {isOn ? `${heater.temp_c}°C` : '--'}
                      </td>
                      <td className="py-2 text-right pr-1">
                        <button
                          onClick={() => handleToggleHeater(heater.id, heater.state)}
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 ${
                            isOn
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-600 border border-slate-300'
                          }`}
                        >
                          <Power className="w-2 h-2" />
                          <span>{effectiveState}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono-numbers text-slate-600 flex justify-between items-center">
            <span className="font-medium">Thermal Output:</span>
            <span className="text-amber-700 font-bold">
              {heaters.filter(h => (localHeaterStates[h.id] ?? h.state) === 'ON').reduce((acc, h) => acc + h.power_kw, 0).toFixed(1)} kW
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
