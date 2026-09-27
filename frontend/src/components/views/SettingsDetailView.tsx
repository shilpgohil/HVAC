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
  Sliders
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
      {/* 1. Header (Crisp Light Mode) */}
      <div className="rounded-2xl p-6 bg-white/95 border border-slate-300/80 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
            <SettingsIcon className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Supervisory &amp; Engineering Settings</h1>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono-numbers font-medium uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200">
                Admin Role (Supervisory Lock)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-mono-numbers">
              Setpoint safety clamps · Control loop PID deadbands · PLC Modbus/BACnet telemetry bus
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all flex items-center space-x-2"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Applied!' : 'Save & Apply Parameters'}</span>
        </button>
      </div>

      {/* 2. Settings Grid (Crisp White Cards with Slate Contrast) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Bounds & Deadbands */}
        <div className="rounded-2xl p-6 bg-white/95 border border-slate-300/80 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2.5">
              <Thermometer className="w-5 h-5 text-sky-600" />
              <h2 className="font-bold text-slate-900 text-sm">Thermal Engineering Clamps</h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 font-mono-numbers font-medium">
              °C Setpoints
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1.5 font-medium">
                <span>Minimum Setpoint Clamp</span>
                <span className="font-mono-numbers font-bold text-sky-700 text-sm">{minTemp.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="20"
                step="0.5"
                value={minTemp}
                onChange={(e) => setMinTemp(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1.5 font-medium">
                <span>Maximum Setpoint Clamp</span>
                <span className="font-mono-numbers font-bold text-amber-700 text-sm">{maxTemp.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="24"
                max="35"
                step="0.5"
                value={maxTemp}
                onChange={(e) => setMaxTemp(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1.5 font-medium">
                <span>Control Loop Hysteresis Deadband</span>
                <span className="font-mono-numbers font-bold text-blue-700 text-sm">±{tempDeadband.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={tempDeadband}
                onChange={(e) => setTempDeadband(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Relative Humidity Bounds & Deadbands */}
        <div className="rounded-2xl p-6 bg-white/95 border border-slate-300/80 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2.5">
              <Droplets className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm">Psychrometric RH Clamps</h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono-numbers font-medium">
              % RH Setpoints
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1.5 font-medium">
                <span>Minimum RH Limit</span>
                <span className="font-mono-numbers font-bold text-emerald-700 text-sm">{minRh.toFixed(0)}% RH</span>
              </div>
              <input
                type="range"
                min="20"
                max="45"
                step="1"
                value={minRh}
                onChange={(e) => setMinRh(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1.5 font-medium">
                <span>Maximum RH Limit</span>
                <span className="font-mono-numbers font-bold text-teal-700 text-sm">{maxRh.toFixed(0)}% RH</span>
              </div>
              <input
                type="range"
                min="55"
                max="85"
                step="1"
                value={maxRh}
                onChange={(e) => setMaxRh(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1.5 font-medium">
                <span>Humidifier / Dehumidifier Deadband</span>
                <span className="font-mono-numbers font-bold text-sky-700 text-sm">±{rhDeadband.toFixed(1)}% RH</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={rhDeadband}
                onChange={(e) => setRhDeadband(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>
          </div>
        </div>

        {/* Industrial PLC Communications */}
        <div className="rounded-2xl p-6 bg-white/95 border border-slate-300/80 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] backdrop-blur-md space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-200">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm">Industrial Fieldbus Gateway</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">PLC Gateway Protocol</span>
              <span className="font-mono-numbers font-bold text-slate-900">Modbus TCP / BACnet IP</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Target IP Address</span>
              <span className="font-mono-numbers text-emerald-700 font-bold">192.168.10.120:502</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Polling Interval</span>
              <span className="font-mono-numbers text-slate-900 font-semibold">500 ms (Realtime)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600 font-medium">Safety Watchdog Timeout</span>
              <span className="font-mono-numbers text-slate-900 font-semibold">3,000 ms</span>
            </div>
          </div>
        </div>

        {/* Simulation Engine Controls */}
        <div className="rounded-2xl p-6 bg-white/95 border border-slate-300/80 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] backdrop-blur-md space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-200">
            <Gauge className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-slate-900 text-sm">Thermodynamic Physics Simulator</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="text-slate-700 font-medium">Simulation Clock Multiplier</div>
            <div className="grid grid-cols-4 gap-2">
              {(['1x', '2x', '5x', '10x'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  className={`py-2 rounded-xl font-bold font-mono-numbers transition-all ${
                    simSpeed === s
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div>Coupled ODE Solver: Runge-Kutta 4th Order</div>
              <div>Thermal Inertia Time Constant: 120 seconds</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
