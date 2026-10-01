'use client';

import React, { useState } from 'react';
import { SystemState } from '@/types/hvac';
import { 
  Fan, 
  Flame, 
  Wind, 
  Thermometer, 
  Activity, 
  Layers, 
  CheckCircle2, 
  Eye, 
  Gauge, 
  ChevronRight, 
  X 
} from 'lucide-react';
import { toggleAhuState, toggleOduState, toggleHeaterState } from '@/lib/api';
import { TwoStepConfirmModal } from '@/components/common/TwoStepConfirmModal';

interface SystemOverviewProps {
  systemState: SystemState | null;
  onToggleAhu?: (state: 'ON' | 'OFF') => void;
  onToggleOdu?: (id: string, state: 'ON' | 'OFF') => void;
  onToggleHeater?: (id: string, state: 'ON' | 'OFF') => void;
}

export function SystemOverview({
  systemState,
  onToggleAhu,
  onToggleOdu,
  onToggleHeater
}: SystemOverviewProps) {
  const [viewMode, setViewMode] = useState<'connected' | 'schematic'>('schematic');
  const [localAhuState, setLocalAhuState] = useState<'ON' | 'OFF' | null>(null);
  const [localOduStates, setLocalOduStates] = useState<Record<string, 'ON' | 'OFF'>>({});
  const [localHeaterBankState, setLocalHeaterBankState] = useState<'ON' | 'OFF' | null>(null);

  const [activeDrawer, setActiveDrawer] = useState<{
    id: string;
    title: string;
    subtitle: string;
    status: 'ON' | 'OFF';
    quality?: 'GOOD' | 'UNCERTAIN' | 'STALE' | 'BAD';
    metrics: { label: string; value: string; unit?: string }[];
    type: 'ahu' | 'odu' | 'heater' | 'filter' | 'coil' | 'fan' | 'room';
  } | null>(null);

  const [confirmModalState, setConfirmModalState] = useState<{
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

  const rawAhuOnline = systemState?.ahu?.state === 'ON';
  const ahuOnline = localAhuState !== null ? localAhuState === 'ON' : rawAhuOnline;

  const odus = systemState?.odu_summary?.units ?? [];
  const rawAnyHeaterRunning = (systemState?.heater_summary?.running ?? 0) > 0;
  const anyHeaterRunning = localHeaterBankState !== null ? localHeaterBankState === 'ON' : rawAnyHeaterRunning;

  const requestConfirmation = (
    title: string,
    targetComponent: string,
    actionDescription: string,
    requestedValue: string,
    action: () => Promise<void>
  ) => {
    setConfirmModalState({
      isOpen: true,
      title,
      targetComponent,
      actionDescription,
      requestedValue,
      action,
    });
  };

  const executeConfirmedAction = async () => {
    const act = confirmModalState.action;
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    await act();
  };

  const handleToggleAhu = () => {
    const nextState = ahuOnline ? 'OFF' : 'ON';
    requestConfirmation(
      `AHU Supply Fan ${nextState}`,
      'AHU-01 Centrifugal Fan',
      `Command primary 14,500 CFM cleanroom air handler to ${nextState}`,
      nextState,
      async () => {
        setLocalAhuState(nextState);
        if (onToggleAhu) onToggleAhu(nextState);
        try {
          await toggleAhuState(nextState);
        } catch {
          setLocalAhuState(ahuOnline ? 'ON' : 'OFF');
        }
      }
    );
  };

  const handleToggleOdu = (oduId: string, currentState: 'ON' | 'OFF', e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = currentState === 'ON' ? 'OFF' : 'ON';
    requestConfirmation(
      `ODU Compressor Stage ${nextState}`,
      oduId,
      `Modulate direct expansion condensing unit circuit to ${nextState}`,
      nextState,
      async () => {
        setLocalOduStates((prev) => ({ ...prev, [oduId]: nextState }));
        if (onToggleOdu) onToggleOdu(oduId, nextState);
        try {
          await toggleOduState(oduId, nextState);
        } catch {
          setLocalOduStates((prev) => ({ ...prev, [oduId]: currentState }));
        }
      }
    );
  };

  const handleToggleHeaterBank = () => {
    const nextState = anyHeaterRunning ? 'OFF' : 'ON';
    requestConfirmation(
      `8-Stage Reheat Bank ${nextState}`,
      'HTR-01..08 Reheat Coils',
      `Command all 8 SCR electric trim stages (24.0 kW) to ${nextState}`,
      nextState,
      async () => {
        setLocalHeaterBankState(nextState);
        for (let i = 1; i <= 8; i++) {
          const hId = `HTR-0${i}`;
          if (onToggleHeater) onToggleHeater(hId, nextState);
          toggleHeaterState(hId, nextState).catch(() => {});
        }
      }
    );
  };

  const handleAllSystemsOn = () => {
    requestConfirmation(
      'Full Plant Energization',
      'All Subsystems',
      'Command AHU-01, all 6 ODUs, and 8 heater stages to active duty',
      'ALL ON',
      async () => {
        setLocalAhuState('ON');
        toggleAhuState('ON').catch(() => {});
        const oduUpdates: Record<string, 'ON' | 'OFF'> = {};
        odus.forEach((o) => {
          oduUpdates[o.id] = 'ON';
          toggleOduState(o.id, 'ON').catch(() => {});
        });
        setLocalOduStates((prev) => ({ ...prev, ...oduUpdates }));
        setLocalHeaterBankState('ON');
        for (let i = 1; i <= 8; i++) {
          toggleHeaterState(`HTR-0${i}`, 'ON').catch(() => {});
        }
      }
    );
  };

  const handleSafeStandby = () => {
    requestConfirmation(
      'System Safe Standby Transition',
      'All Subsystems',
      'Transition plant to low-load standby mode (AHU ON, 2 ODUs, 2 HTR)',
      'SAFE STANDBY',
      async () => {
        setLocalAhuState('ON');
        toggleAhuState('ON').catch(() => {});
        const oduUpdates: Record<string, 'ON' | 'OFF'> = {};
        odus.forEach((o, i) => {
          const st = i < 2 ? 'ON' : 'OFF';
          oduUpdates[o.id] = st;
          toggleOduState(o.id, st).catch(() => {});
        });
        setLocalOduStates((prev) => ({ ...prev, ...oduUpdates }));
        setLocalHeaterBankState('ON');
        for (let i = 1; i <= 8; i++) {
          const st = i <= 2 ? 'ON' : 'OFF';
          toggleHeaterState(`HTR-0${i}`, st).catch(() => {});
        }
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] overflow-hidden relative">
      <div className="p-4 md:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-bold font-sans text-slate-900 tracking-tight">
              HVAC Digital Twin &amp; Live Schematic
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              CLEANROOM DECK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Decoupled thermodynamic topology: VRF condensers, HEPA air handler &amp; 8-stage SCR reheat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center gap-1">
            <button
              onClick={() => setViewMode('schematic')}
              className={`btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                viewMode === 'schematic'
                  ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vector Schematic</span>
            </button>
            <button
              onClick={() => setViewMode('connected')}
              className={`btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                viewMode === 'connected'
                  ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Block Flow</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Supervisory Staging:</span>
          <button
            onClick={handleAllSystemsOn}
            className="btn-press px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors font-bold cursor-pointer"
          >
            All Systems Active
          </button>
          <button
            onClick={handleSafeStandby}
            className="btn-press px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            Safe Standby (Eco)
          </button>
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> Liquid Refrigerant
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" /> Conditioned Air
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Duct Reheat
          </span>
        </div>
      </div>

      <div className="p-4 md:p-6 relative bg-slate-50/40 overflow-hidden min-h-[500px]">
        {viewMode === 'connected' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div 
              onClick={() => setActiveDrawer({
                id: 'AHU-01',
                title: 'AHU-01 Supply Air Handler',
                subtitle: 'Centrifugal Backward-Curved Fan Unit',
                status: ahuOnline ? 'ON' : 'OFF',
                quality: 'GOOD',
                type: 'ahu',
                metrics: [
                  { label: 'Airflow Delivery', value: `${systemState?.ahu?.airflow_cfm ?? 14500}`, unit: 'CFM' },
                  { label: 'VFD Speed', value: `${systemState?.ahu?.fan_vfd_hz ?? 50.0}`, unit: 'Hz' },
                  { label: 'HEPA Differential Pressure', value: `${systemState?.ahu?.filter_dp_pa ?? 120}`, unit: 'Pa' },
                  { label: 'Humidifier Active', value: systemState?.ahu?.humidifier_active ? 'YES' : 'NO' }
                ]
              })}
              className={`rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md bg-white ${
                ahuOnline ? 'border-blue-400 shadow-sm' : 'border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Fan className={`w-5 h-5 ${ahuOnline ? 'animate-spin' : ''}`} />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                  ahuOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {ahuOnline ? '50 Hz ONLINE' : 'STOPPED'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">AHU-01 SUPPLY BLOWER</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">VFD Centrifugal Unit</p>
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Airflow Rate:</span>
                  <span className="text-slate-900 font-bold">{ahuOnline ? (systemState?.ahu?.airflow_cfm ?? 14500).toLocaleString() : 0} CFM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">HEPA DP:</span>
                  <span className="text-blue-600 font-bold">{ahuOnline ? (systemState?.ahu?.filter_dp_pa ?? 120) : 0} Pa</span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setActiveDrawer({
                id: 'ODU-BANK',
                title: 'VRF Condenser Bank',
                subtitle: '6 Modular Direct Expansion Circuits',
                status: (systemState?.odu_summary?.running ?? 5) > 0 ? 'ON' : 'OFF',
                quality: 'GOOD',
                type: 'odu',
                metrics: [
                  { label: 'Running Compressors', value: `${systemState?.odu_summary?.running ?? 5}/6` },
                  { label: 'Condenser Head Pressure', value: '1.85', unit: 'MPa' },
                  { label: 'Condensing Fan Speed', value: '820', unit: 'RPM' },
                  { label: 'Refrigerant Saturation', value: '42.5', unit: '°C' }
                ]
              })}
              className="rounded-2xl p-5 border border-slate-200 bg-white cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  {systemState?.odu_summary?.running ?? 5}/6 ACTIVE
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">VRF CONDENSER BANK</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">6 Direct Expansion Units</p>
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Load:</span>
                  <span className="text-slate-900 font-bold">{((systemState?.odu_summary?.running ?? 5) * 18.2).toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Circuits:</span>
                  <span className="text-sky-700 font-bold">R-410A DX Loops</span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setActiveDrawer({
                id: 'HTR-BANK',
                title: 'Electric Duct Reheat Bank',
                subtitle: '8 SCR Staged Reheat Elements',
                status: anyHeaterRunning ? 'ON' : 'OFF',
                quality: 'GOOD',
                type: 'heater',
                metrics: [
                  { label: 'Energized Stages', value: `${anyHeaterRunning ? (systemState?.heater_summary?.running ?? 8) : 0}/8` },
                  { label: 'Heating Output', value: `${anyHeaterRunning ? '24.0' : '0.0'}`, unit: 'kW' },
                  { label: 'SCR Demand', value: `${anyHeaterRunning ? '100' : '0'}`, unit: '%' },
                  { label: 'Core Temp', value: `${anyHeaterRunning ? '52.5' : '22.0'}`, unit: '°C' }
                ]
              })}
              className="rounded-2xl p-5 border border-slate-200 bg-white cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Flame className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                  anyHeaterRunning ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {anyHeaterRunning ? '8 STAGES ACTIVE' : 'OFF'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">8-STAGE REHEAT</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Duct Trim Heaters</p>
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Stages:</span>
                  <span className="text-slate-900 font-bold">{anyHeaterRunning ? (systemState?.heater_summary?.running ?? 8) : 0}/8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duty Thermal:</span>
                  <span className="text-amber-700 font-bold">{anyHeaterRunning ? '24.0 kW' : '0.0 kW'}</span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setActiveDrawer({
                id: 'CLEANROOM',
                title: 'Cleanroom Suite 101',
                subtitle: 'ISO Class 7 Controlled Environment',
                status: 'ON',
                quality: 'GOOD',
                type: 'room',
                metrics: [
                  { label: 'Space Temperature', value: `${systemState?.temperatures?.current_c ?? 24.4}`, unit: '°C' },
                  { label: 'Relative Humidity', value: `${systemState?.humidity?.current_rh ?? 48.5}`, unit: '%' },
                  { label: 'Positive Pressure DP', value: '+24.8', unit: 'Pa' },
                  { label: 'CO2 Concentration', value: '485', unit: 'ppm' }
                ]
              })}
              className="rounded-2xl p-5 border border-slate-200 bg-white cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Gauge className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  +25 Pa CASCADE
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">CLEANROOM 101</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Target Conditioned Space</p>
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Room Temp:</span>
                  <span className="text-slate-900 font-bold">{systemState?.temperatures?.current_c ?? 24.4}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Relative Humidity:</span>
                  <span className="text-emerald-700 font-bold">{systemState?.humidity?.current_rh ?? 48.5}%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <svg 
              viewBox="0 0 1000 480" 
              className="w-full h-auto min-w-[900px] select-none" 
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="pipeCyanGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0284C7" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
                <linearGradient id="pipeWarmGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>

              <g id="grid-background" opacity="0.6">
                <path d="M 0 60 L 1000 60 M 0 120 L 1000 120 M 0 180 L 1000 180 M 0 240 L 1000 240 M 0 300 L 1000 300 M 0 360 L 1000 360 M 0 420 L 1000 420" stroke="#F1F5F9" strokeWidth="1" />
                <path d="M 100 0 L 100 480 M 200 0 L 200 480 M 300 0 L 300 480 M 400 0 L 400 480 M 500 0 L 500 480 M 600 0 L 600 480 M 700 0 L 700 480 M 800 0 L 800 480 M 900 0 L 900 480" stroke="#F1F5F9" strokeWidth="1" />
              </g>

              <g id="odu-condenser-bank" transform="translate(20, 30)">
                <text x="80" y="10" fill="#64748B" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                  VRF CONDENSER BANK (6 UNITS)
                </text>

                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const col = idx % 2;
                  const row = Math.floor(idx / 2);
                  const x = col * 82;
                  const y = 20 + row * 95;
                  const odu = odus[idx];
                  const effectiveState = localOduStates[odu?.id ?? `ODU-0${idx + 1}`] ?? (odu?.state ?? 'OFF');
                  const isOn = effectiveState === 'ON';

                  return (
                    <g 
                      key={idx} 
                      transform={`translate(${x}, ${y})`}
                      className="cursor-pointer transition-transform duration-200 hover:scale-105"
                      onClick={(e) => handleToggleOdu(odu?.id ?? `ODU-0${idx + 1}`, effectiveState, e)}
                    >
                      <rect 
                        x="0" 
                        y="0" 
                        width="74" 
                        height="82" 
                        rx="8" 
                        fill={isOn ? '#F0F9FF' : '#F8FAFC'} 
                        stroke={isOn ? '#0284C7' : '#E2E8F0'} 
                        strokeWidth="1.5" 
                      />
                      <circle cx="37" cy="38" r="22" fill={isOn ? '#E0F2FE' : '#F1F5F9'} stroke={isOn ? '#0284C7' : '#CBD5E1'} strokeWidth="1" />
                      <g 
                        transform="translate(37, 38)" 
                        className={isOn ? "spin-fast" : ""}
                        style={{ transformOrigin: '0px 0px' }}
                      >
                        <path d="M 0 0 C 8 -16, 20 -8, 0 0" fill={isOn ? '#0284C7' : '#94A3B8'} />
                        <path d="M 0 0 C 16 8, 8 20, 0 0" fill={isOn ? '#0284C7' : '#94A3B8'} />
                        <path d="M 0 0 C -8 16, -20 8, 0 0" fill={isOn ? '#0284C7' : '#94A3B8'} />
                        <path d="M 0 0 C -16 -8, -8 -20, 0 0" fill={isOn ? '#0284C7' : '#94A3B8'} />
                        <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
                      </g>
                      <text x="37" y="14" fill="#0F172A" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                        ODU-0{idx + 1}
                      </text>
                      <text x="37" y="74" fill={isOn ? '#059669' : '#94A3B8'} fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                        {isOn ? '18.2 kW' : 'STANDBY'}
                      </text>
                    </g>
                  );
                })}
              </g>

              <g id="dx-refrigerant-headers">
                <path d="M 180 80 L 260 80 L 260 180 L 350 180" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinejoin="round" />
                <path d="M 180 80 L 260 80 L 260 180 L 350 180" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeDasharray="6 4" className="flow-anim" />

                <path d="M 180 180 L 260 180" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeDasharray="6 4" className="flow-anim" />
                <path d="M 180 270 L 260 270 L 260 180" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeDasharray="6 4" className="flow-anim" />

                <rect x="220" y="165" width="55" height="28" rx="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
                <text x="247" y="177" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono" textAnchor="middle">HEAD PRESS</text>
                <text x="247" y="188" fill="#0284C7" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">1.85 MPa</text>
              </g>

              <g id="ahu-main-casing" transform="translate(350, 90)">
                <rect 
                  x="0" 
                  y="0" 
                  width="380" 
                  height="170" 
                  rx="12" 
                  fill="#F8FAFC" 
                  stroke={ahuOnline ? '#2563EB' : '#CBD5E1'} 
                  strokeWidth="2" 
                />
                <text x="190" y="22" fill="#0F172A" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                  AHU-01 CLEANROOM AIR HANDLER
                </text>

                <g transform="translate(20, 40)">
                  <rect x="0" y="0" width="30" height="100" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                  <path d="M 5 10 L 25 25 M 5 35 L 25 50 M 5 60 L 25 75 M 5 85 L 25 95" stroke="#94A3B8" strokeWidth="2" />
                  <text x="15" y="115" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">PRE-FLT</text>
                  <rect x="0" y="122" width="30" height="16" rx="3" fill="#ECFDF5" stroke="#10B981" strokeWidth="1" />
                  <text x="15" y="133" fill="#059669" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">45 Pa</text>
                </g>

                <g transform="translate(70, 40)">
                  <rect x="0" y="0" width="45" height="100" rx="4" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                  <path d="M 10 10 L 35 10 L 10 30 L 35 30 L 10 50 L 35 50 L 10 70 L 35 70 L 10 90 L 35 90" fill="none" stroke="#0284C7" strokeWidth="2" />
                  <text x="22" y="115" fill="#0284C7" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">DX COIL</text>
                  <text x="22" y="133" fill="#0F172A" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">12.8°C</text>
                </g>

                <g transform="translate(135, 40)">
                  <rect x="0" y="0" width="35" height="100" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                  <path d="M 5 5 L 30 15 L 5 25 L 30 35 L 5 45 L 30 55 L 5 65 L 30 75 L 5 85 L 30 95" stroke="#3B82F6" strokeWidth="1.5" />
                  <text x="17" y="115" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">HEPA</text>
                  <rect x="2" y="122" width="31" height="16" rx="3" fill="#ECFDF5" stroke="#10B981" strokeWidth="1" />
                  <text x="17" y="133" fill="#059669" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">120 Pa</text>
                </g>

                <g transform="translate(195, 40)">
                  <rect 
                    x="0" 
                    y="0" 
                    width="55" 
                    height="100" 
                    rx="4" 
                    fill={anyHeaterRunning ? '#FFFBEB' : '#FFFFFF'} 
                    stroke={anyHeaterRunning ? '#F59E0B' : '#CBD5E1'} 
                    strokeWidth="1.5" 
                  />
                  {[15, 35, 55, 75].map((yPos, i) => (
                    <path 
                      key={i} 
                      d={`M 8 ${yPos} Q 27 ${yPos - 8} 47 ${yPos}`} 
                      fill="none" 
                      stroke={anyHeaterRunning ? '#D97706' : '#CBD5E1'} 
                      strokeWidth="2.5" 
                    />
                  ))}
                  <text x="27" y="115" fill="#B45309" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">8-STAGE</text>
                  <rect x="5" y="122" width="45" height="16" rx="3" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1" />
                  <text x="27" y="133" fill="#B45309" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">24.0 kW</text>
                </g>

                <g 
                  transform="translate(275, 40)" 
                  className="cursor-pointer"
                  onClick={handleToggleAhu}
                >
                  <circle cx="45" cy="50" r="42" fill="#FFFFFF" stroke={ahuOnline ? '#2563EB' : '#CBD5E1'} strokeWidth="2" />
                  <g 
                    transform="translate(45, 50)" 
                    className={ahuOnline ? "spin-fast" : ""}
                    style={{ transformOrigin: '0px 0px' }}
                  >
                    <path d="M 0 0 C 12 -30, 35 -12, 0 0" fill={ahuOnline ? '#2563EB' : '#94A3B8'} opacity="0.9" />
                    <path d="M 0 0 C 30 12, 12 35, 0 0" fill={ahuOnline ? '#2563EB' : '#94A3B8'} opacity="0.9" />
                    <path d="M 0 0 C -12 30, -35 12, 0 0" fill={ahuOnline ? '#2563EB' : '#94A3B8'} opacity="0.9" />
                    <path d="M 0 0 C -30 -12, -12 -35, 0 0" fill={ahuOnline ? '#2563EB' : '#94A3B8'} opacity="0.9" />
                    <circle cx="0" cy="0" r="8" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.5" />
                  </g>
                  <text x="45" y="115" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">SUPPLY FAN</text>
                  <text x="45" y="133" fill={ahuOnline ? '#059669' : '#94A3B8'} fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                    {ahuOnline ? '50 Hz' : 'OFF'}
                  </text>
                </g>
              </g>

              <g id="supply-ductwork-to-suite">
                <path d="M 730 175 L 810 175 L 810 130 L 840 130" fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinejoin="round" />
                <path d="M 730 175 L 810 175 L 810 130 L 840 130" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="6 4" className={ahuOnline ? "flow-anim" : ""} />

                <path d="M 730 175 L 810 175 L 810 260 L 840 260" fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinejoin="round" />
                <path d="M 730 175 L 810 175 L 810 260 L 840 260" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="6 4" className={ahuOnline ? "flow-anim" : ""} />

                <rect x="798" y="118" width="18" height="24" rx="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.5" />
                <text x="807" y="133" fill="#2563EB" fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">VCD</text>

                <rect x="798" y="248" width="18" height="24" rx="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.5" />
                <text x="807" y="263" fill="#2563EB" fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">VCD</text>
              </g>

              <g id="cleanroom-suite" transform="translate(840, 80)">
                <rect 
                  x="0" 
                  y="0" 
                  width="140" 
                  height="260" 
                  rx="12" 
                  fill="#F0FDF4" 
                  stroke="#10B981" 
                  strokeWidth="1.5"
                />
                <text x="70" y="24" fill="#0F172A" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                  CLEANROOM 101
                </text>
                <text x="70" y="38" fill="#059669" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
                  ISO CLASS 7
                </text>

                <g transform="translate(20, 50)">
                  <polygon points="0,0 24,0 18,10 6,10" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
                  <path d="M 4 12 L 0 20 M 12 12 L 12 22 M 20 12 L 24 20" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="2 2" />
                </g>
                <g transform="translate(95, 50)">
                  <polygon points="0,0 24,0 18,10 6,10" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
                  <path d="M 4 12 L 0 20 M 12 12 L 12 22 M 20 12 L 24 20" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="2 2" />
                </g>

                <g transform="translate(10, 85)">
                  <rect x="0" y="0" width="120" height="160" rx="8" fill="#FFFFFF" stroke="#D1FAE5" strokeWidth="1" />
                  <text x="60" y="18" fill="#64748B" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                    ROOM SENSORS
                  </text>

                  <text x="10" y="42" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono">TEMP:</text>
                  <text x="110" y="42" fill="#0F172A" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="end">
                    {systemState?.temperatures?.current_c ?? 24.4}°C
                  </text>

                  <text x="10" y="68" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono">TARGET:</text>
                  <text x="110" y="68" fill="#2563EB" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="end">
                    {systemState?.temperatures?.set_point_c ?? 22.0}°C
                  </text>

                  <text x="10" y="94" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono">RH %:</text>
                  <text x="110" y="94" fill="#0284C7" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="end">
                    {systemState?.humidity?.current_rh ?? 48.5}%
                  </text>

                  <text x="10" y="120" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono">PRESSURE:</text>
                  <text x="110" y="120" fill="#059669" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="end">
                    +24.8 Pa
                  </text>

                  <text x="10" y="146" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono">CO2:</text>
                  <text x="110" y="146" fill="#D97706" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="end">
                    485 ppm
                  </text>
                </g>
              </g>

              <g id="return-air-duct">
                <path d="M 910 340 L 910 420 L 360 420 L 360 260" fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinejoin="round" />
                <path d="M 910 340 L 910 420 L 360 420 L 360 260" fill="none" stroke="#64748B" strokeWidth="2" strokeDasharray="6 4" className={ahuOnline ? "flow-anim" : ""} />
                <text x="635" y="414" fill="#64748B" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                  RECIRCULATION RETURN DUCT · 26.7°C
                </text>
              </g>
            </svg>
          </div>
        )}

        {activeDrawer && (
          <div className="absolute right-4 top-4 w-80 bg-white/95 backdrop-blur-xl rounded-2xl p-5 border border-slate-200 shadow-xl z-20 animate-in fade-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold">
                  {activeDrawer.id} DIAGNOSTICS
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                  {activeDrawer.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">{activeDrawer.subtitle}</p>
              </div>
              <button 
                onClick={() => setActiveDrawer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Operating Status:</span>
                <span className={`font-bold ${activeDrawer.status === 'ON' ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {activeDrawer.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Point Quality:</span>
                <span className="font-bold text-emerald-700">GOOD (100%)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Communication:</span>
                <span className="text-blue-600 font-bold">BACnet/IP</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {activeDrawer.metrics.map((m, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{m.label}:</span>
                  <span className="text-slate-900 font-bold">{m.value} {m.unit}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  if (activeDrawer.type === 'ahu') handleToggleAhu();
                  else if (activeDrawer.type === 'heater') handleToggleHeaterBank();
                }}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-mono transition-colors cursor-pointer"
              >
                Override State
              </button>
            </div>
          </div>
        )}
      </div>

      <TwoStepConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        targetComponent={confirmModalState.targetComponent}
        actionDescription={confirmModalState.actionDescription}
        requestedValue={confirmModalState.requestedValue}
        onConfirm={executeConfirmedAction}
        onCancel={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
