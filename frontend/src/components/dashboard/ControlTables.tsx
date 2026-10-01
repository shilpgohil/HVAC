'use client';

import React, { useState } from 'react';
import { Fan, Snowflake, Flame, Power } from 'lucide-react';
import { SystemState } from '@/types/hvac';
import { toggleAhuState, toggleOduState, toggleHeaterState, updateSystemMode } from '@/lib/api';
import { TwoStepConfirmModal } from '@/components/common/TwoStepConfirmModal';

interface ControlTablesProps {
  systemState: SystemState | null;
}

export function ControlTables({ systemState }: ControlTablesProps) {
  const [localAhuState, setLocalAhuState] = useState<'ON' | 'OFF' | null>(null);
  const [localOduStates, setLocalOduStates] = useState<Record<string, 'ON' | 'OFF'>>({});
  const [localHeaterStates, setLocalHeaterStates] = useState<Record<string, 'ON' | 'OFF'>>({});
  const [vfdFrequency, setVfdFrequency] = useState<number>(50.0);
  const [damperPosition, setDamperPosition] = useState<number>(35);
  const [controlMode, setControlMode] = useState<'AUTO' | 'MANUAL'>('AUTO');

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

  const requestConfirmation = (
    title: string,
    targetComponent: string,
    actionDescription: string,
    requestedValue: string,
    action: () => Promise<void>
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      targetComponent,
      actionDescription,
      requestedValue,
      action,
    });
  };

  const executeConfirmedAction = async () => {
    const act = confirmModal.action;
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    await act();
  };

  const ahu = systemState?.ahu || {
    id: 'AHU-01',
    name: 'AHU-01',
    state: 'ON' as const,
    airflow_cfm: 14500,
    fan_vfd_hz: 50.0,
    filter_dp_pa: 120
  };

  const odus = systemState?.odu_summary?.units || [
    { id: 'ODU-01', name: 'ODU-01', state: 'ON' as const, power_kw: 18.2, fan_rpm: 820, temp_c: 32.5 },
    { id: 'ODU-02', name: 'ODU-02', state: 'ON' as const, power_kw: 17.8, fan_rpm: 810, temp_c: 32.1 },
    { id: 'ODU-03', name: 'ODU-03', state: 'ON' as const, power_kw: 18.5, fan_rpm: 830, temp_c: 33.0 },
    { id: 'ODU-04', name: 'ODU-04', state: 'OFF' as const, power_kw: 0.0, fan_rpm: 0, temp_c: 28.0 },
    { id: 'ODU-05', name: 'ODU-05', state: 'ON' as const, power_kw: 18.0, fan_rpm: 815, temp_c: 32.4 },
    { id: 'ODU-06', name: 'ODU-06', state: 'ON' as const, power_kw: 18.4, fan_rpm: 825, temp_c: 32.8 }
  ];

  const heaters = systemState?.heater_summary?.units || [
    { id: 'HTR-01', name: 'HTR-01', state: 'ON' as const, power_kw: 3.0, temp_c: 52.5, current_a: 13.0 },
    { id: 'HTR-02', name: 'HTR-02', state: 'ON' as const, power_kw: 2.9, temp_c: 51.8, current_a: 12.8 },
    { id: 'HTR-03', name: 'HTR-03', state: 'ON' as const, power_kw: 3.0, temp_c: 53.0, current_a: 13.1 },
    { id: 'HTR-04', name: 'HTR-04', state: 'ON' as const, power_kw: 2.8, temp_c: 50.4, current_a: 12.4 },
    { id: 'HTR-05', name: 'HTR-05', state: 'ON' as const, power_kw: 3.0, temp_c: 52.2, current_a: 13.0 },
    { id: 'HTR-06', name: 'HTR-06', state: 'ON' as const, power_kw: 2.9, temp_c: 51.5, current_a: 12.7 },
    { id: 'HTR-07', name: 'HTR-07', state: 'ON' as const, power_kw: 3.0, temp_c: 52.8, current_a: 13.1 },
    { id: 'HTR-08', name: 'HTR-08', state: 'ON' as const, power_kw: 2.8, temp_c: 50.9, current_a: 12.5 }
  ];

  const currentAhuState = localAhuState ?? ahu.state;

  const handleToggleAhu = () => {
    const next = currentAhuState === 'ON' ? 'OFF' : 'ON';
    requestConfirmation(
      'AHU Blower Interlock',
      'AHU-01',
      `Command blower fan ${next}`,
      next,
      async () => {
        setLocalAhuState(next);
        try {
          await toggleAhuState(next);
        } catch {
          setLocalAhuState(currentAhuState);
        }
      }
    );
  };

  const handleToggleOdu = (oduId: string, currentState: 'ON' | 'OFF') => {
    const next = currentState === 'ON' ? 'OFF' : 'ON';
    requestConfirmation(
      'Compressor Stage Change',
      oduId,
      `Modulate condensing circuit ${oduId} to ${next}`,
      next,
      async () => {
        setLocalOduStates((prev) => ({ ...prev, [oduId]: next }));
        try {
          await toggleOduState(oduId, next);
        } catch {
          setLocalOduStates((prev) => ({ ...prev, [oduId]: currentState }));
        }
      }
    );
  };

  const handleToggleHeater = (heaterId: string, currentState: 'ON' | 'OFF') => {
    const next = currentState === 'ON' ? 'OFF' : 'ON';
    requestConfirmation(
      'SCR Reheat Element Cutout',
      heaterId,
      `Command electric trim stage ${heaterId} to ${next}`,
      next,
      async () => {
        setLocalHeaterStates((prev) => ({ ...prev, [heaterId]: next }));
        try {
          await toggleHeaterState(heaterId, next);
        } catch {
          setLocalHeaterStates((prev) => ({ ...prev, [heaterId]: currentState }));
        }
      }
    );
  };

  const handleAllOdus = (targetState: 'ON' | 'OFF') => {
    requestConfirmation(
      `Batch ODU ${targetState}`,
      'All 6 Inverter ODUs',
      `Command all 6 DX outdoor units to ${targetState}`,
      targetState,
      async () => {
        const updates: Record<string, 'ON' | 'OFF'> = {};
        odus.forEach((o) => {
          updates[o.id] = targetState;
          toggleOduState(o.id, targetState).catch(() => {});
        });
        setLocalOduStates((prev) => ({ ...prev, ...updates }));
      }
    );
  };

  const handleAllHeaters = (targetState: 'ON' | 'OFF') => {
    requestConfirmation(
      `Batch Heater ${targetState}`,
      'All 8 Reheat Stages',
      `Command all 8 electric reheat stages to ${targetState}`,
      targetState,
      async () => {
        const updates: Record<string, 'ON' | 'OFF'> = {};
        heaters.forEach((h) => {
          updates[h.id] = targetState;
          toggleHeaterState(h.id, targetState).catch(() => {});
        });
        setLocalHeaterStates((prev) => ({ ...prev, ...updates }));
      }
    );
  };

  const activeOdusCount = odus.filter((o) => (localOduStates[o.id] ?? o.state) === 'ON').length;
  const activeHeatersCount = heaters.filter((h) => (localHeaterStates[h.id] ?? h.state) === 'ON').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card-lift bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Fan className={`w-4 h-4 ${currentAhuState === 'ON' ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">AHU-01 CORE</h3>
                <span className="text-[10px] text-slate-500 font-mono">Blower &amp; Damper VFD</span>
              </div>
            </div>

            <div className="p-0.5 bg-slate-100 border border-slate-200 rounded-lg flex items-center text-[10px] font-mono">
              <button
                onClick={() => {
                  setControlMode('AUTO');
                  updateSystemMode('Auto').catch(() => {});
                }}
                className={`btn-press px-2 py-0.5 rounded transition-all cursor-pointer ${
                  controlMode === 'AUTO' ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/80' : 'text-slate-500'
                }`}
              >
                AUTO
              </button>
              <button
                onClick={() => {
                  setControlMode('MANUAL');
                  updateSystemMode('Manual').catch(() => {});
                }}
                className={`btn-press px-2 py-0.5 rounded transition-all cursor-pointer ${
                  controlMode === 'MANUAL' ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/80' : 'text-slate-500'
                }`}
              >
                MANUAL
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Primary Power:</span>
                <button
                  onClick={handleToggleAhu}
                  className={`btn-press px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    currentAhuState === 'ON'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 border border-slate-300'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  {currentAhuState === 'ON' ? 'ONLINE' : 'STANDBY'}
                </button>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Airflow Rate:</span>
                <span className="text-slate-900 font-bold">{currentAhuState === 'ON' ? ahu.airflow_cfm.toLocaleString() : 0} CFM</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">HEPA Differential DP:</span>
                <span className="text-blue-600 font-bold">{currentAhuState === 'ON' ? ahu.filter_dp_pa : 0} Pa</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">VFD Frequency Target:</span>
                <span className="text-blue-600 font-bold">{vfdFrequency.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="0.5"
                value={vfdFrequency}
                onChange={(e) => setVfdFrequency(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>20 Hz (Min)</span>
                <span>50 Hz (Rated)</span>
                <span>60 Hz (Max)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Outdoor Damper Position:</span>
                <span className="text-sky-600 font-bold">{damperPosition}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={damperPosition}
                onChange={(e) => setDamperPosition(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>0% (Closed)</span>
                <span>35% (Econ)</span>
                <span>100% (Purge)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Interlock: CLOSED</span>
          <span className="text-emerald-600 font-bold">READY</span>
        </div>
      </div>

      <div className="card-lift bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <Snowflake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">ODU INVERTERS</h3>
                <span className="text-[10px] text-slate-500 font-mono">VRF Condenser Bank</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAllOdus('ON')}
                className="btn-press px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
              >
                ALL ON
              </button>
              <button
                onClick={() => handleAllOdus('OFF')}
                className="btn-press px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
              >
                ALL OFF
              </button>
            </div>
          </div>

          <div className="mb-3 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500">Active Staging:</span>
            <span className="text-blue-700 font-bold">{activeOdusCount} / {odus.length} Active</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {odus.map((odu) => {
              const effective = localOduStates[odu.id] ?? odu.state;
              const isOn = effective === 'ON';
              return (
                <div
                  key={odu.id}
                  className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isOn ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="font-bold text-slate-900">{odu.name}</span>
                    <span className="text-[10px] text-slate-500">{isOn ? `${odu.power_kw} kW` : '0 kW'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{isOn ? `${odu.fan_rpm} RPM` : '0 RPM'}</span>
                    <button
                      onClick={() => handleToggleOdu(odu.id, odu.state)}
                      className={`btn-press px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        isOn
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isOn ? 'RUN' : 'OFF'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Head Pressure: 1.85 MPa</span>
          <span className="text-blue-600 font-bold">NOMINAL</span>
        </div>
      </div>

      <div className="card-lift bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">8-STAGE REHEAT</h3>
                <span className="text-[10px] text-slate-500 font-mono">SCR Duct Bank</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAllHeaters('ON')}
                className="btn-press px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
              >
                ALL ON
              </button>
              <button
                onClick={() => handleAllHeaters('OFF')}
                className="btn-press px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
              >
                ALL OFF
              </button>
            </div>
          </div>

          <div className="mb-3 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500">Energized Stages:</span>
            <span className="text-amber-700 font-bold">{activeHeatersCount} / {heaters.length} Active</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {heaters.map((htr) => {
              const effective = localHeaterStates[htr.id] ?? htr.state;
              const isOn = effective === 'ON';
              return (
                <div
                  key={htr.id}
                  className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isOn ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="font-bold text-slate-900">{htr.name}</span>
                    <span className="text-[10px] text-slate-500">{isOn ? `${htr.power_kw} kW` : '0 kW'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{isOn ? `${htr.temp_c}°C` : '24°C'}</span>
                    <button
                      onClick={() => handleToggleHeater(htr.id, htr.state)}
                      className={`btn-press px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        isOn
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isOn ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>High Limit Cutout: 85°C</span>
          <span className="text-amber-600 font-bold">ARMED</span>
        </div>
      </div>

      <TwoStepConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        targetComponent={confirmModal.targetComponent}
        actionDescription={confirmModal.actionDescription}
        requestedValue={confirmModal.requestedValue}
        onConfirm={executeConfirmedAction}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
