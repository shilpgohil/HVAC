'use client';

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Save, 
  Check, 
  Gauge, 
  Thermometer, 
  Droplets,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { SystemState } from '@/types/hvac';

interface SettingsDetailViewProps {
  systemState: SystemState | null;
  onUpdateMode?: (mode: string) => void;
}

export function SettingsDetailView({ systemState }: SettingsDetailViewProps) {
  const [minTemp, setMinTemp] = useState<number>(16.0);
  const [maxTemp, setMaxTemp] = useState<number>(30.0);
  const [tempDeadband, setTempDeadband] = useState<number>(0.5);

  const [minRh, setMinRh] = useState<number>(30.0);
  const [maxRh, setMaxRh] = useState<number>(75.0);
  const [rhDeadband, setRhDeadband] = useState<number>(2.0);

  const [simSpeed, setSimSpeed] = useState<string>('1x');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                Engineering &amp; Supervisory Thresholds
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                Supervisory Lockout Level 3
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-1">
              PID tuning deadbands · Physical setpoint clamps · BACnet/Modbus gateway polling rate
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-mono transition-all duration-200 cursor-pointer shadow-xs flex items-center gap-2 active:scale-95"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'CONFIG PERSISTED' : 'COMMIT THRESHOLDS'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] space-y-4">
          <h2 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-blue-600" />
            Thermal Setpoint Clamps
          </h2>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-500">Minimum Allowed Setpoint:</span>
                <span className="text-slate-900 font-bold">{minTemp.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="12"
                max="20"
                step="0.5"
                value={minTemp}
                onChange={(e) => setMinTemp(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 border border-slate-200/80"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-500">Maximum Allowed Setpoint:</span>
                <span className="text-slate-900 font-bold">{maxTemp.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="24"
                max="34"
                step="0.5"
                value={maxTemp}
                onChange={(e) => setMaxTemp(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 border border-slate-200/80"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-500">Thermal PID Deadband:</span>
                <span className="text-blue-700 font-bold">±{tempDeadband.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={tempDeadband}
                onChange={(e) => setTempDeadband(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 border border-slate-200/80"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] space-y-4">
          <h2 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
            <Droplets className="w-4 h-4 text-indigo-600" />
            Psychrometric Humidity Clamps
          </h2>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-500">Minimum Relative Humidity:</span>
                <span className="text-slate-900 font-bold">{minRh.toFixed(1)} % RH</span>
              </div>
              <input
                type="range"
                min="20"
                max="40"
                step="1"
                value={minRh}
                onChange={(e) => setMinRh(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 border border-slate-200/80"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-500">Maximum Relative Humidity:</span>
                <span className="text-slate-900 font-bold">{maxRh.toFixed(1)} % RH</span>
              </div>
              <input
                type="range"
                min="60"
                max="85"
                step="1"
                value={maxRh}
                onChange={(e) => setMaxRh(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 border border-slate-200/80"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-500">Humidity Control Deadband:</span>
                <span className="text-indigo-700 font-bold">±{rhDeadband.toFixed(1)} %</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={rhDeadband}
                onChange={(e) => setRhDeadband(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 border border-slate-200/80"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] space-y-4">
        <h2 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600" />
          Fieldbus Protocol &amp; Gateway Configuration
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-slate-500 uppercase text-[10px] font-semibold">PLC Primary Host</span>
            <div className="text-slate-900 font-bold text-sm">192.168.10.50:502</div>
            <span className="text-emerald-700 font-semibold block text-[10px]">Modbus TCP / IP Port</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-slate-500 uppercase text-[10px] font-semibold">BACnet Device ID</span>
            <div className="text-slate-900 font-bold text-sm">DEV-48201 (Subnet 3)</div>
            <span className="text-blue-700 font-semibold block text-[10px]">BACnet/IP Annex J</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-slate-500 uppercase text-[10px] font-semibold">Telemetry Polling Cycle</span>
            <div className="text-slate-900 font-bold text-sm">1,000 ms (1 Hz Synchronous)</div>
            <span className="text-emerald-700 font-semibold block text-[10px]">Zero Jitter Pipeline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
