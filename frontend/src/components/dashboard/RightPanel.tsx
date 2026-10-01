'use client';

import React, { useState } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Bell, 
  CheckCircle2, 
  Cpu, 
  Plus, 
  Minus, 
  Check, 
  PowerOff 
} from 'lucide-react';
import { SystemState } from '@/types/hvac';
import { updateTemperatureSetpoint, updateHumiditySetpoint, updateSystemMode, acknowledgeAlarm } from '@/lib/api';
import { TwoStepConfirmModal } from '@/components/common/TwoStepConfirmModal';

interface RightPanelProps {
  systemState: SystemState | null;
}

export function RightPanel({ systemState }: RightPanelProps) {
  const [localSetPointC, setLocalSetPointC] = useState<number | null>(null);
  const [localSetPointRh, setLocalSetPointRh] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('Auto');

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    targetComponent: string;
    actionDescription: string;
    requestedValue: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    targetComponent: '',
    actionDescription: '',
    requestedValue: '',
    action: async () => {},
  });

  const temps = systemState?.temperatures || {
    current_c: 24.4,
    set_point_c: 22.0,
    supply_c: 18.2,
    return_c: 26.8,
    unit: '°C'
  };

  const humidity = systemState?.humidity || {
    current_rh: 48.5,
    set_point_rh: 50.0,
    unit: '%',
    humidifier_active: false,
    dehumidifier_active: false
  };

  const sysInfo = systemState?.system_info || {
    total_ahu: 1,
    total_odu: 6,
    total_heater: 8,
    total_power_kw: 132.8,
    system_mode: 'Auto',
    plc_online: true,
    status_text: 'Optimal'
  };

  const alarms = systemState?.alarms || [];
  const activeAlarms = alarms.filter((a) => a.state !== 'CLEARED');

  const currentEffectiveTemp = localSetPointC ?? temps.set_point_c;
  const currentEffectiveRh = localSetPointRh ?? humidity.set_point_rh;

  const tempDelta = temps.current_c - currentEffectiveTemp;
  const rhDelta = humidity.current_rh - currentEffectiveRh;

  const handleAdjustTemp = (delta: number) => {
    const next = Math.round((currentEffectiveTemp + delta) * 10) / 10;
    if (next < 16.0 || next > 30.0) return;
    setLocalSetPointC(next);
    updateTemperatureSetpoint(next).catch(() => {});
  };

  const handleAdjustRh = (delta: number) => {
    const next = Math.round(currentEffectiveRh + delta);
    if (next < 30 || next > 75) return;
    setLocalSetPointRh(next);
    updateHumiditySetpoint(next).catch(() => {});
  };

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    updateSystemMode(mode).catch(() => {});
  };

  const handleAcknowledgeAlarm = (alarmId: string) => {
    acknowledgeAlarm(alarmId, 'operator-console').catch(() => {});
  };

  const handleEmergencyStop = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Facility Emergency Stop',
      targetComponent: 'All Active Subsystems',
      actionDescription: 'Initiate emergency de-energization sequence and safety isolation',
      requestedValue: 'SHUTDOWN',
      action: async () => {
        updateSystemMode('EMERGENCY_STOP').catch(() => {});
      },
    });
  };

  return (
    <div className="space-y-4 flex flex-col">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] relative overflow-hidden hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight font-sans">Thermal Target</span>
              <div className="text-[10px] text-slate-500 font-mono">Cleanroom Suite 101</div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
            Active PID
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3.5 border-b border-slate-100">
          <div>
            <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Current Temp</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
              {temps.current_c.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Target Setpoint</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="text-2xl font-bold font-mono text-blue-600 tabular-nums">
                {currentEffectiveTemp.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAdjustTemp(-0.5)}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors active:scale-95 cursor-pointer"
                  title="Decrease Setpoint (-0.5°C)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleAdjustTemp(+0.5)}
                  className="w-6 h-6 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 transition-colors active:scale-95 cursor-pointer"
                  title="Increase Setpoint (+0.5°C)"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Supply Air</div>
            <div className="text-sm font-bold text-blue-600 mt-0.5 tabular-nums">
              {temps.supply_c.toFixed(1)} °C
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Return Air</div>
            <div className="text-sm font-bold text-amber-600 mt-0.5 tabular-nums">
              {temps.return_c.toFixed(1)} °C
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] font-mono">
          <span className="text-slate-500">Thermal Offset:</span>
          <span className={Math.abs(tempDelta) > 1.0 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
            {tempDelta >= 0 ? `+${tempDelta.toFixed(1)}` : tempDelta.toFixed(1)} °C deviation
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] relative overflow-hidden hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight font-sans">Psychrometric Envelope</span>
              <div className="text-[10px] text-slate-500 font-mono">Relative Humidity Control</div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-mono font-bold border border-sky-200">
            50% TARGET
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3.5 border-b border-slate-100">
          <div>
            <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Measured RH</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
              {humidity.current_rh.toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Target Setpoint</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="text-2xl font-bold font-mono text-sky-600 tabular-nums">
                {currentEffectiveRh.toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAdjustRh(-1)}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors active:scale-95 cursor-pointer"
                  title="Decrease RH Target (-1%)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleAdjustRh(+1)}
                  className="w-6 h-6 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 transition-colors active:scale-95 cursor-pointer"
                  title="Increase RH Target (+1%)"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] font-mono">
          <span className="text-slate-500">Psychrometric Delta:</span>
          <span className="text-sky-700 font-bold">
            {rhDelta >= 0 ? `+${rhDelta.toFixed(1)}` : rhDelta.toFixed(1)}% RH
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] relative overflow-hidden hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight font-sans">Live Alarm Console</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono font-bold border border-rose-200 animate-pulse">
              {activeAlarms.length} ACTIVE
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Supervised Feed</span>
        </div>

        <div className="divide-y divide-slate-100 mt-1 max-h-52 overflow-y-auto">
          {activeAlarms.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 font-mono flex flex-col items-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1.5" />
              <span className="text-slate-900 font-semibold">All Systems Nominal</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Zero unacknowledged alarms</span>
            </div>
          ) : (
            activeAlarms.map((alarm) => (
              <div key={alarm.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-mono">{alarm.component_code}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{alarm.triggered_at}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-sans truncate mt-0.5">{alarm.message}</div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                      alarm.severity === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {alarm.severity}
                  </span>
                  {alarm.state !== 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => handleAcknowledgeAlarm(alarm.id)}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                      title="Acknowledge Alarm"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card-lift bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] space-y-3 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-900 text-sm font-sans">Supervisory Mode</span>
          </div>
          <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-mono font-bold">
            {['Auto', 'Manual', 'Eco'].map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`btn-press px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedMode === m
                    ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
            <span>Air Handler</span>
            <span className="text-slate-900 font-semibold">{sysInfo.total_ahu} Online</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
            <span>Condenser Bank</span>
            <span className="text-sky-700 font-semibold">{sysInfo.total_odu} Inverters</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
            <span>Reheat Stages</span>
            <span className="text-amber-700 font-semibold">{sysInfo.total_heater} Stages</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
            <span>Plant Energy COP</span>
            <span className="text-emerald-700 font-semibold">5.40</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleEmergencyStop}
            className="btn-press w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-mono font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <PowerOff className="w-3.5 h-3.5 text-rose-600" />
            EMERGENCY CUTOUT
          </button>
        </div>
      </div>

      <TwoStepConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        targetComponent={confirmModal.targetComponent}
        actionDescription={confirmModal.actionDescription}
        requestedValue={confirmModal.requestedValue}
        onConfirm={async () => {
          const act = confirmModal.action;
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await act();
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
