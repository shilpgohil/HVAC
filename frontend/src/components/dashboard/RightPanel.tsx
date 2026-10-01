'use client';

import React, { useState } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Bell, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
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
      <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight font-sans">Thermal Target</span>
              <div className="text-[10px] text-slate-400 font-mono">Cleanroom Suite 101</div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono font-bold border border-cyan-500/30">
            Active PID
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3.5 border-b border-white/10">
          <div>
            <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Current Temp</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">
              {temps.current_c.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Target Setpoint</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                {currentEffectiveTemp.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAdjustTemp(-0.5)}
                  className="w-6 h-6 rounded-lg surface-well hover:bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 transition-colors active:scale-95"
                  title="Decrease Setpoint (-0.5°C)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleAdjustTemp(+0.5)}
                  className="w-6 h-6 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 transition-colors active:scale-95"
                  title="Increase Setpoint (+0.5°C)"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl surface-well border border-white/5">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Supply Air</div>
            <div className="text-sm font-bold text-cyan-400 mt-0.5 tabular-nums">
              {temps.supply_c.toFixed(1)} °C
            </div>
          </div>
          <div className="p-2.5 rounded-xl surface-well border border-white/5">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Return Air</div>
            <div className="text-sm font-bold text-amber-400 mt-0.5 tabular-nums">
              {temps.return_c.toFixed(1)} °C
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex justify-between text-[11px] font-mono">
          <span className="text-slate-400">Thermal Offset:</span>
          <span className={Math.abs(tempDelta) > 1.0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
            {tempDelta >= 0 ? `+${tempDelta.toFixed(1)}` : tempDelta.toFixed(1)} °C deviation
          </span>
        </div>
      </div>

      <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight font-sans">Psychrometric Envelope</span>
              <div className="text-[10px] text-slate-400 font-mono">Relative Humidity Control</div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-mono font-bold border border-blue-500/30">
            50% TARGET
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3.5 border-b border-white/10">
          <div>
            <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Measured RH</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">
              {humidity.current_rh.toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Target Setpoint</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
                {currentEffectiveRh.toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAdjustRh(-1)}
                  className="w-6 h-6 rounded-lg surface-well hover:bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 transition-colors active:scale-95"
                  title="Decrease RH Target (-1%)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleAdjustRh(+1)}
                  className="w-6 h-6 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 flex items-center justify-center text-blue-300 transition-colors active:scale-95"
                  title="Increase RH Target (+1%)"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex justify-between text-[11px] font-mono">
          <span className="text-slate-400">Psychrometric Delta:</span>
          <span className="text-blue-400 font-bold">
            {rhDelta >= 0 ? `+${rhDelta.toFixed(1)}` : rhDelta.toFixed(1)}% RH
          </span>
        </div>
      </div>

      <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight font-sans">Live Alarm Console</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/40 animate-pulse">
              {activeAlarms.length} ACTIVE
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Supervised Feed</span>
        </div>

        <div className="divide-y divide-white/5 mt-1 max-h-52 overflow-y-auto">
          {activeAlarms.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 font-mono flex flex-col items-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1.5" />
              <span className="text-white font-semibold">All Systems Nominal</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Zero unacknowledged alarms</span>
            </div>
          ) : (
            activeAlarms.map((alarm) => (
              <div key={alarm.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">{alarm.component_code}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{alarm.triggered_at}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{alarm.message}</div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                      alarm.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {alarm.severity}
                  </span>
                  {alarm.state !== 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => handleAcknowledgeAlarm(alarm.id)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10"
                      title="Acknowledge Alarm"
                    >
                      <Check className="w-3 h-3 text-cyan-400" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-2xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white text-sm font-sans">Supervisory Mode</span>
          </div>
          <div className="flex items-center p-0.5 surface-well rounded-xl border border-white/10 text-[10px] font-mono font-bold">
            {['Auto', 'Manual', 'Eco'].map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedMode === m
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-white/5 text-slate-400">
            <span>Air Handler</span>
            <span className="text-white font-semibold">{sysInfo.total_ahu} Online</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5 text-slate-400">
            <span>Condenser Bank</span>
            <span className="text-blue-400 font-semibold">{sysInfo.total_odu} Inverters</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5 text-slate-400">
            <span>Reheat Stages</span>
            <span className="text-amber-400 font-semibold">{sysInfo.total_heater} Stages</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5 text-slate-400">
            <span>Plant Energy COP</span>
            <span className="text-emerald-400 font-semibold">5.40</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleEmergencyStop}
            className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold transition-colors flex items-center justify-center gap-2 active:scale-98"
          >
            <PowerOff className="w-3.5 h-3.5 text-rose-400" />
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
