'use client';

import React, { useState } from 'react';
import { 
  Fan, 
  Wind, 
  Gauge, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Thermometer, 
  Layers,
  Power
} from 'lucide-react';
import { SystemState } from '@/types/hvac';
import { toggleAhuState } from '@/lib/api';
import { TwoStepConfirmModal } from '@/components/common/TwoStepConfirmModal';

interface AhuDetailViewProps {
  systemState: SystemState | null;
}

export function AhuDetailView({ systemState }: AhuDetailViewProps) {
  const [localState, setLocalState] = useState<'ON' | 'OFF' | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const ahu = systemState?.ahu || {
    id: 'AHU-01',
    name: 'Air Handling Unit 1',
    state: 'ON' as const,
    airflow_cfm: 14500,
    fan_vfd_hz: 50.0,
    filter_dp_pa: 120,
    humidifier_active: false,
    dehumidifier_active: false
  };

  const temps = systemState?.temperatures || {
    supply_c: 18.2,
    return_c: 26.8,
    current_c: 24.4,
    set_point_c: 22.0
  };

  const isRunning = (localState ?? ahu.state) === 'ON';
  const vfdSpeedHz = ahu.fan_vfd_hz;
  const supplyFanRpm = Math.round(vfdSpeedHz * 28.4);

  const freshAirDamperPct = 35;
  const returnDamperPct = 65;
  const exhaustDamperPct = 15;

  const handleToggleClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmedToggle = async () => {
    const next = isRunning ? 'OFF' : 'ON';
    setLocalState(next);
    setIsConfirmOpen(false);
    try {
      await toggleAhuState(next);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Fan className={`w-6 h-6 ${isRunning ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">AHU-01 Cleanroom Air Handler</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                isRunning 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {isRunning ? 'RUNNING' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Direct-drive backward curved plug fan · ISO Class 7 constant volume recirculating air handling unit
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleClick}
          className={`btn-press px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs flex items-center gap-2 ${
            isRunning 
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' 
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isRunning ? 'STOP BLOWER' : 'START BLOWER'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono uppercase mb-2 font-semibold">
            <span>Airflow Volume</span>
            <Wind className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {isRunning ? ahu.airflow_cfm.toLocaleString('en-US') : 0} <span className="text-xs text-slate-400 font-sans font-normal">CFM</span>
          </div>
          <div className="text-[11px] text-blue-600 font-mono mt-1 font-semibold">
            {isRunning ? Math.round(ahu.airflow_cfm * 1.699) : 0} m³/h nominal
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono uppercase mb-2 font-semibold">
            <span>VFD Frequency</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 tabular-nums">
            {isRunning ? vfdSpeedHz.toFixed(1) : '0.0'} <span className="text-xs text-slate-400 font-sans font-normal">Hz</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Impeller Speed: <span className="text-slate-900 font-bold">{isRunning ? supplyFanRpm : 0} RPM</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono uppercase mb-2 font-semibold">
            <span>HEPA Filter DP</span>
            <Gauge className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {isRunning ? ahu.filter_dp_pa : 0} <span className="text-xs text-slate-400 font-sans font-normal">Pa</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-mono mt-1 font-semibold">
            Status: Clean Filter Core
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono uppercase mb-2 font-semibold">
            <span>Discharge Temp</span>
            <Thermometer className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {temps.supply_c.toFixed(1)} <span className="text-xs text-slate-400 font-sans font-normal">°C</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Return Delta: <span className="text-amber-600 font-bold">{(temps.return_c - temps.supply_c).toFixed(1)} °C</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] space-y-4">
          <h2 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Air Intake &amp; Economizer Dampers
          </h2>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-500">Fresh Air Damper (OAD):</span>
                <span className="text-blue-700 font-bold">{freshAirDamperPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${freshAirDamperPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-500">Return Air Damper (RAD):</span>
                <span className="text-indigo-700 font-bold">{returnDamperPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${returnDamperPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-500">Exhaust Spill Damper (EAD):</span>
                <span className="text-slate-700 font-bold">{exhaustDamperPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                <div className="h-full bg-slate-500 rounded-full" style={{ width: `${exhaustDamperPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] space-y-4">
          <h2 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Mechanical Safety Interlocks
          </h2>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-700 font-medium">Duct Static High-Limit Cutout:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                CLOSED (NORMAL)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-700 font-medium">Differential Flow Proving Switch:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                PROVED (AIRFLOW ACTIVE)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-700 font-medium">Smoke / Ionization Detector:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                NORMAL (NO OBSCURATION)
              </span>
            </div>
          </div>
        </div>
      </div>

      <TwoStepConfirmModal
        isOpen={isConfirmOpen}
        title="AHU-01 Primary Blower Command"
        targetComponent="AHU-01 Cleanroom Air Handler"
        actionDescription={`Command AHU-01 blower power state to ${isRunning ? 'OFF' : 'ON'}`}
        requestedValue={isRunning ? 'STANDBY' : 'RUN'}
        onConfirm={handleConfirmedToggle}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
