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
  AlertCircle,
  Eye,
  Sliders,
  Zap,
  Gauge,
  Power,
  RefreshCw,
  ShieldAlert,
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

  const handleToggleAhu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextState = ahuOnline ? 'OFF' : 'ON';
    requestConfirmation(
      'AHU Primary Blower Control',
      'AHU-01 Cleanroom Air Handler',
      `Command blower fan state transition to ${nextState}`,
      nextState,
      async () => {
        setLocalAhuState(nextState);
        if (onToggleAhu) onToggleAhu(nextState);
        try {
          await toggleAhuState(nextState);
        } catch {}
      }
    );
  };

  const handleToggleOdu = (oduId: string, current: 'ON' | 'OFF', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const effective = localOduStates[oduId] ?? current;
    const nextState = effective === 'ON' ? 'OFF' : 'ON';
    requestConfirmation(
      'Condenser Inverter Stage Control',
      oduId,
      `Command outdoor condensing unit to ${nextState}`,
      nextState,
      async () => {
        setLocalOduStates((prev) => ({ ...prev, [oduId]: nextState }));
        if (onToggleOdu) onToggleOdu(oduId, nextState);
        try {
          await toggleOduState(oduId, nextState);
        } catch {}
      }
    );
  };

  const handleToggleHeaterBank = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextState = anyHeaterRunning ? 'OFF' : 'ON';
    requestConfirmation(
      'SCR Reheat Bank Supervisory Cutout',
      'HTR-BANK-01 (8 Stages)',
      `Command all 8 electric reheat stages to ${nextState}`,
      nextState,
      async () => {
        setLocalHeaterBankState(nextState);
        for (let i = 1; i <= 8; i++) {
          const id = `HTR-0${i}`;
          toggleHeaterState(id, nextState).catch(() => {});
        }
      }
    );
  };

  const handleAllSystemsOn = () => {
    requestConfirmation(
      'Emergency Full Plant Energize',
      'All Production Subsystems',
      'Energize AHU-01, all 6 ODUs, and 8 reheat stages',
      'ALL ONLINE',
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
    <div className="surface-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
      <div className="p-4 md:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold font-sans text-white tracking-tight uppercase">
              HVAC Digital Twin & Live Schematic
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              CLEANROOM DECK
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Decoupled thermodynamic topology: VRF condensers, HEPA air handler & 8-stage SCR reheat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl surface-well border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode('schematic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                viewMode === 'schematic'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vector Schematic</span>
            </button>
            <button
              onClick={() => setViewMode('connected')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                viewMode === 'connected'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Block Flow</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3 text-slate-300">
          <span className="text-slate-500 uppercase tracking-wider text-[10px]">Supervisory Staging:</span>
          <button
            onClick={handleAllSystemsOn}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors font-bold"
          >
            All Systems Active
          </button>
          <button
            onClick={handleSafeStandby}
            className="px-2.5 py-1 rounded-lg surface-well hover:bg-slate-800 text-slate-300 border border-white/10 transition-colors"
          >
            Safe Standby (Eco)
          </button>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Liquid Refrigerant
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Conditioned Air
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Duct Reheat
          </span>
        </div>
      </div>

      <div className="p-4 md:p-6 relative bg-[#020617] overflow-hidden min-h-[500px]">
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
              className={`surface-panel rounded-2xl p-5 border cursor-pointer transition-all hover:scale-[1.02] ${
                ahuOnline ? 'border-cyan-500/40 shadow-[0_0_24px_rgba(6,182,212,0.15)]' : 'border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Fan className={`w-5 h-5 ${ahuOnline ? 'spin-fast' : ''}`} />
                </div>
                <button
                  onClick={handleToggleAhu}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all ${
                    ahuOnline ? 'bg-cyan-500 text-slate-950 shadow-md' : 'surface-well text-slate-400 border border-white/10'
                  }`}
                >
                  {ahuOnline ? 'RUNNING' : 'STANDBY'}
                </button>
              </div>
              <h3 className="text-sm font-bold text-white font-mono">AHU-01 BLOWER</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Supply Delivery Fan</p>
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Airflow:</span>
                  <span className="text-white font-bold">{ahuOnline ? (systemState?.ahu?.airflow_cfm ?? 14500) : 0} CFM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VFD Drive:</span>
                  <span className="text-cyan-400 font-bold">{ahuOnline ? (systemState?.ahu?.fan_vfd_hz ?? 50.0) : 0} Hz</span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setActiveDrawer({
                id: 'ODU-BANK',
                title: 'VRF Inverter Condenser Bank',
                subtitle: '6-Circuit Modular Scroll Chillers',
                status: 'ON',
                quality: 'GOOD',
                type: 'odu',
                metrics: [
                  { label: 'Active Inverters', value: `${systemState?.odu_summary?.running ?? 5}/6` },
                  { label: 'Total Power Draw', value: `${(systemState?.odu_summary?.running ?? 5) * 18.2}`, unit: 'kW' },
                  { label: 'Refrigerant Head Pressure', value: '1.85', unit: 'MPa' },
                  { label: 'Condenser Fan Avg RPM', value: '820', unit: 'RPM' }
                ]
              })}
              className="surface-panel rounded-2xl p-5 border border-white/10 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {systemState?.odu_summary?.running ?? 5}/6 RUN
                </span>
              </div>
              <h3 className="text-sm font-bold text-white font-mono">ODU INVERTERS</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">6x DX Condensing Units</p>
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Inverter Load:</span>
                  <span className="text-white font-bold">84.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Power:</span>
                  <span className="text-blue-400 font-bold">{((systemState?.odu_summary?.running ?? 5) * 18.2).toFixed(1)} kW</span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setActiveDrawer({
                id: 'HTR-BANK',
                title: 'Electric Duct Reheat Bank',
                subtitle: '8-Stage SCR Silicon Trim Heaters',
                status: anyHeaterRunning ? 'ON' : 'OFF',
                quality: 'GOOD',
                type: 'heater',
                metrics: [
                  { label: 'Active Stages', value: `${systemState?.heater_summary?.running ?? 8}/8` },
                  { label: 'Total Reheat Power', value: `${(systemState?.heater_summary?.running ?? 8) * 3.0}`, unit: 'kW' },
                  { label: 'SCR Thermal Coils', value: '52.4', unit: '°C' },
                  { label: 'High Limit Thermostat', value: 'NOMINAL (<85°C)' }
                ]
              })}
              className={`surface-panel rounded-2xl p-5 border cursor-pointer transition-all hover:scale-[1.02] ${
                anyHeaterRunning ? 'border-amber-500/40 shadow-[0_0_24px_rgba(245,158,11,0.15)]' : 'border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className={`w-5 h-5 ${anyHeaterRunning ? 'animate-pulse' : ''}`} />
                </div>
                <button
                  onClick={handleToggleHeaterBank}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all ${
                    anyHeaterRunning ? 'bg-amber-500 text-slate-950 shadow-md' : 'surface-well text-slate-400 border border-white/10'
                  }`}
                >
                  {anyHeaterRunning ? 'ENERGIZED' : 'OFF'}
                </button>
              </div>
              <h3 className="text-sm font-bold text-white font-mono">8-STAGE REHEAT</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Duct Trim Heaters</p>
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Stages:</span>
                  <span className="text-white font-bold">{anyHeaterRunning ? (systemState?.heater_summary?.running ?? 8) : 0}/8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duty Thermal:</span>
                  <span className="text-amber-400 font-bold">{anyHeaterRunning ? '24.0 kW' : '0.0 kW'}</span>
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
              className="surface-panel rounded-2xl p-5 border border-white/10 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Gauge className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  +25 Pa CASCADE
                </span>
              </div>
              <h3 className="text-sm font-bold text-white font-mono">CLEANROOM 101</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Target Conditioned Space</p>
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Room Temp:</span>
                  <span className="text-white font-bold">{systemState?.temperatures?.current_c ?? 24.4}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Relative Humidity:</span>
                  <span className="text-emerald-400 font-bold">{systemState?.humidity?.current_rh ?? 48.5}%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto surface-well rounded-2xl p-4 border border-white/10 shadow-inner">
            <svg 
              viewBox="0 0 1000 480" 
              className="w-full h-auto min-w-[900px] select-none" 
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="pipeCyanGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0891B2" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
                <linearGradient id="pipeWarmGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
                <filter id="sapphireGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <g id="grid-background" opacity="0.15">
                <path d="M 0 60 L 1000 60 M 0 120 L 1000 120 M 0 180 L 1000 180 M 0 240 L 1000 240 M 0 300 L 1000 300 M 0 360 L 1000 360 M 0 420 L 1000 420" stroke="#334155" strokeWidth="1" />
                <path d="M 100 0 L 100 480 M 200 0 L 200 480 M 300 0 L 300 480 M 400 0 L 400 480 M 500 0 L 500 480 M 600 0 L 600 480 M 700 0 L 700 480 M 800 0 L 800 480 M 900 0 L 900 480" stroke="#334155" strokeWidth="1" />
              </g>

              <g id="odu-condenser-bank" transform="translate(20, 30)">
                <text x="80" y="10" fill="#94A3B8" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
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
                        fill={isOn ? '#0F172A' : '#020617'} 
                        stroke={isOn ? '#06B6D4' : '#334155'} 
                        strokeWidth="1.5" 
                      />
                      <circle cx="37" cy="38" r="22" fill="#020617" stroke={isOn ? '#06B6D4' : '#475569'} strokeWidth="1" />
                      <g 
                        transform="translate(37, 38)" 
                        className={isOn ? "spin-fast" : ""}
                        style={{ transformOrigin: '0px 0px' }}
                      >
                        <path d="M 0 0 C 8 -16, 20 -8, 0 0" fill={isOn ? '#06B6D4' : '#64748B'} />
                        <path d="M 0 0 C 16 8, 8 20, 0 0" fill={isOn ? '#06B6D4' : '#64748B'} />
                        <path d="M 0 0 C -8 16, -20 8, 0 0" fill={isOn ? '#06B6D4' : '#64748B'} />
                        <path d="M 0 0 C -16 -8, -8 -20, 0 0" fill={isOn ? '#06B6D4' : '#64748B'} />
                        <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
                      </g>
                      <text x="37" y="14" fill="#E2E8F0" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                        ODU-0{idx + 1}
                      </text>
                      <text x="37" y="74" fill={isOn ? '#22C55E' : '#94A3B8'} fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                        {isOn ? '18.2 kW' : 'STANDBY'}
                      </text>
                    </g>
                  );
                })}
              </g>

              <g id="dx-refrigerant-headers">
                <path d="M 180 80 L 260 80 L 260 180 L 350 180" fill="none" stroke="#0F172A" strokeWidth="10" strokeLinejoin="round" />
                <path d="M 180 80 L 260 80 L 260 180 L 350 180" fill="none" stroke="#06B6D4" strokeWidth="3" strokeDasharray="6 4" className="flow-anim" />

                <path d="M 180 180 L 260 180" fill="none" stroke="#06B6D4" strokeWidth="3" strokeDasharray="6 4" className="flow-anim" />
                <path d="M 180 270 L 260 270 L 260 180" fill="none" stroke="#06B6D4" strokeWidth="3" strokeDasharray="6 4" className="flow-anim" />

                <rect x="220" y="165" width="55" height="28" rx="6" fill="#0F172A" stroke="#06B6D4" strokeWidth="1" />
                <text x="247" y="178" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono" textAnchor="middle">HEAD PRESS</text>
                <text x="247" y="188" fill="#06B6D4" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">1.85 MPa</text>
              </g>

              <g id="ahu-main-casing" transform="translate(350, 90)">
                <rect 
                  x="0" 
                  y="0" 
                  width="380" 
                  height="170" 
                  rx="12" 
                  fill="#0B132B" 
                  stroke="#38BDF8" 
                  strokeWidth="2" 
                  strokeDasharray="none"
                  filter="url(#sapphireGlow)"
                />
                <text x="190" y="22" fill="#E2E8F0" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                  AHU-01 CLEANROOM AIR HANDLER
                </text>

                <g transform="translate(20, 40)">
                  <rect x="0" y="0" width="30" height="100" rx="4" fill="#020617" stroke="#475569" strokeWidth="1" />
                  <path d="M 5 10 L 25 25 M 5 35 L 25 50 M 5 60 L 25 75 M 5 85 L 25 95" stroke="#94A3B8" strokeWidth="2" />
                  <text x="15" y="115" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">PRE-FLT</text>
                  <rect x="0" y="122" width="30" height="16" rx="3" fill="#0F172A" stroke="#22C55E" strokeWidth="1" />
                  <text x="15" y="133" fill="#22C55E" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">45 Pa</text>
                </g>

                <g transform="translate(70, 40)">
                  <rect x="0" y="0" width="45" height="100" rx="4" fill="#020617" stroke="#06B6D4" strokeWidth="1.5" />
                  <path d="M 10 10 L 35 10 L 10 30 L 35 30 L 10 50 L 35 50 L 10 70 L 35 70 L 10 90 L 35 90" fill="none" stroke="#06B6D4" strokeWidth="2" />
                  <text x="22" y="115" fill="#06B6D4" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">DX COIL</text>
                  <text x="22" y="133" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">12.8°C</text>
                </g>

                <g transform="translate(135, 40)">
                  <rect x="0" y="0" width="35" height="100" rx="4" fill="#020617" stroke="#475569" strokeWidth="1" />
                  <path d="M 5 5 L 30 15 L 5 25 L 30 35 L 5 45 L 30 55 L 5 65 L 30 75 L 5 85 L 30 95" stroke="#38BDF8" strokeWidth="1.5" />
                  <text x="17" y="115" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">HEPA</text>
                  <rect x="2" y="122" width="31" height="16" rx="3" fill="#0F172A" stroke="#22C55E" strokeWidth="1" />
                  <text x="17" y="133" fill="#22C55E" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">120 Pa</text>
                </g>

                <g transform="translate(195, 40)">
                  <rect 
                    x="0" 
                    y="0" 
                    width="55" 
                    height="100" 
                    rx="4" 
                    fill={anyHeaterRunning ? '#1E1B18' : '#020617'} 
                    stroke={anyHeaterRunning ? '#F59E0B' : '#475569'} 
                    strokeWidth="1.5" 
                  />
                  {[15, 35, 55, 75].map((yPos, i) => (
                    <path 
                      key={i} 
                      d={`M 8 ${yPos} Q 27 ${yPos - 8} 47 ${yPos}`} 
                      fill="none" 
                      stroke={anyHeaterRunning ? '#EF4444' : '#64748B'} 
                      strokeWidth="2.5" 
                    />
                  ))}
                  <text x="27" y="115" fill="#F59E0B" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">8-STAGE</text>
                  <rect x="5" y="122" width="45" height="16" rx="3" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
                  <text x="27" y="133" fill="#F59E0B" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">24.0 kW</text>
                </g>

                <g 
                  transform="translate(275, 40)" 
                  className="cursor-pointer"
                  onClick={handleToggleAhu}
                >
                  <circle cx="45" cy="50" r="42" fill="#020617" stroke={ahuOnline ? '#06B6D4' : '#475569'} strokeWidth="2" />
                  <g 
                    transform="translate(45, 50)" 
                    className={ahuOnline ? "spin-fast" : ""}
                    style={{ transformOrigin: '0px 0px' }}
                  >
                    <path d="M 0 0 C 12 -30, 35 -12, 0 0" fill={ahuOnline ? '#06B6D4' : '#64748B'} opacity="0.9" />
                    <path d="M 0 0 C 30 12, 12 35, 0 0" fill={ahuOnline ? '#06B6D4' : '#64748B'} opacity="0.9" />
                    <path d="M 0 0 C -12 30, -35 12, 0 0" fill={ahuOnline ? '#06B6D4' : '#64748B'} opacity="0.9" />
                    <path d="M 0 0 C -30 -12, -12 -35, 0 0" fill={ahuOnline ? '#06B6D4' : '#64748B'} opacity="0.9" />
                    <circle cx="0" cy="0" r="8" fill="#FFFFFF" />
                  </g>
                  <text x="45" y="115" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">SUPPLY FAN</text>
                  <text x="45" y="133" fill={ahuOnline ? '#22C55E' : '#94A3B8'} fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                    {ahuOnline ? '50 Hz' : 'OFF'}
                  </text>
                </g>
              </g>

              <g id="supply-ductwork-to-suite">
                <path d="M 730 175 L 810 175 L 810 130 L 840 130" fill="none" stroke="#0F172A" strokeWidth="12" strokeLinejoin="round" />
                <path d="M 730 175 L 810 175 L 810 130 L 840 130" fill="none" stroke="#06B6D4" strokeWidth="3" strokeDasharray="6 4" className={ahuOnline ? "flow-anim" : ""} />

                <path d="M 730 175 L 810 175 L 810 260 L 840 260" fill="none" stroke="#0F172A" strokeWidth="12" strokeLinejoin="round" />
                <path d="M 730 175 L 810 175 L 810 260 L 840 260" fill="none" stroke="#06B6D4" strokeWidth="3" strokeDasharray="6 4" className={ahuOnline ? "flow-anim" : ""} />

                <rect x="798" y="118" width="18" height="24" rx="4" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
                <text x="807" y="133" fill="#06B6D4" fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">VCD</text>

                <rect x="798" y="248" width="18" height="24" rx="4" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
                <text x="807" y="263" fill="#06B6D4" fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">VCD</text>
              </g>

              <g id="cleanroom-suite" transform="translate(840, 80)">
                <rect 
                  x="0" 
                  y="0" 
                  width="140" 
                  height="260" 
                  rx="12" 
                  fill="#0A1128" 
                  stroke="#22C55E" 
                  strokeWidth="1.5"
                  filter="url(#sapphireGlow)"
                />
                <text x="70" y="24" fill="#E2E8F0" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                  CLEANROOM 101
                </text>
                <text x="70" y="38" fill="#22C55E" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
                  ISO CLASS 7
                </text>

                <g transform="translate(20, 50)">
                  <polygon points="0,0 24,0 18,10 6,10" fill="#020617" stroke="#06B6D4" strokeWidth="1" />
                  <path d="M 4 12 L 0 20 M 12 12 L 12 22 M 20 12 L 24 20" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="2 2" />
                </g>
                <g transform="translate(95, 50)">
                  <polygon points="0,0 24,0 18,10 6,10" fill="#020617" stroke="#06B6D4" strokeWidth="1" />
                  <path d="M 4 12 L 0 20 M 12 12 L 12 22 M 20 12 L 24 20" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="2 2" />
                </g>

                <g transform="translate(10, 85)">
                  <rect x="0" y="0" width="120" height="160" rx="8" fill="#020617" stroke="#1E293B" strokeWidth="1" />
                  <text x="60" y="18" fill="#94A3B8" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                    ROOM SENSORS
                  </text>

                  <text x="10" y="42" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono">TEMP:</text>
                  <text x="110" y="42" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="end">
                    {systemState?.temperatures?.current_c ?? 24.4}°C
                  </text>

                  <text x="10" y="68" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono">TARGET:</text>
                  <text x="110" y="68" fill="#06B6D4" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="end">
                    {systemState?.temperatures?.set_point_c ?? 22.0}°C
                  </text>

                  <text x="10" y="94" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono">RH %:</text>
                  <text x="110" y="94" fill="#38BDF8" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="end">
                    {systemState?.humidity?.current_rh ?? 48.5}%
                  </text>

                  <text x="10" y="120" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono">PRESSURE:</text>
                  <text x="110" y="120" fill="#22C55E" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="end">
                    +24.8 Pa
                  </text>

                  <text x="10" y="146" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono">CO2:</text>
                  <text x="110" y="146" fill="#F59E0B" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="end">
                    485 ppm
                  </text>
                </g>
              </g>

              <g id="return-air-duct">
                <path d="M 910 340 L 910 420 L 360 420 L 360 260" fill="none" stroke="#0F172A" strokeWidth="12" strokeLinejoin="round" />
                <path d="M 910 340 L 910 420 L 360 420 L 360 260" fill="none" stroke="#64748B" strokeWidth="2.5" strokeDasharray="6 4" className={ahuOnline ? "flow-anim" : ""} />
                <text x="635" y="414" fill="#94A3B8" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                  RECIRCULATION RETURN DUCT · 26.7°C
                </text>
              </g>
            </svg>
          </div>
        )}

        {activeDrawer && (
          <div className="absolute right-4 top-4 w-80 surface-panel rounded-2xl p-5 border border-cyan-500/40 shadow-2xl z-20 animate-in fade-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  {activeDrawer.id} DIAGNOSTICS
                </span>
                <h4 className="text-sm font-bold text-white font-mono mt-0.5">
                  {activeDrawer.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{activeDrawer.subtitle}</p>
              </div>
              <button 
                onClick={() => setActiveDrawer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="surface-well rounded-xl p-3 border border-white/5 space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Operating Status:</span>
                <span className={`font-bold ${activeDrawer.status === 'ON' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {activeDrawer.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Point Quality:</span>
                <span className="font-bold text-emerald-400">GOOD (100%)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Communication:</span>
                <span className="text-cyan-400">BACnet/IP</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {activeDrawer.metrics.map((m, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">{m.label}:</span>
                  <span className="text-white font-bold">{m.value} {m.unit}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex gap-2">
              <button
                onClick={() => {
                  if (activeDrawer.type === 'ahu') handleToggleAhu();
                  else if (activeDrawer.type === 'heater') handleToggleHeaterBank();
                }}
                className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-colors"
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
