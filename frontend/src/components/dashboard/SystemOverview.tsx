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
  Gauge
} from 'lucide-react';

interface SystemOverviewProps {
  systemState: SystemState | null;
  onToggleAhu?: (state: 'ON' | 'OFF') => void;
  onToggleOdu?: (id: string, state: 'ON' | 'OFF') => void;
  onToggleHeater?: (id: string, state: 'ON' | 'OFF') => void;
}

export function SystemOverview({
  systemState
}: SystemOverviewProps) {
  const [viewMode, setViewMode] = useState<'connected' | 'schematic'>('connected');
  const [hoveredComponent, setHoveredComponent] = useState<{
    id: string;
    title: string;
    subtitle: string;
    metrics: { label: string; value: string; unit?: string }[];
    status: 'ON' | 'OFF';
    type: 'ahu' | 'odu' | 'heater' | 'filter' | 'coil' | 'fan' | 'room';
  } | null>(null);
  
  const ahuOnline = systemState?.ahu?.state === 'ON';
  const odus = systemState?.odu_summary?.units ?? [];
  const anyHeaterRunning = (systemState?.heater_summary?.running ?? 0) > 0;

  return (
    <div className="rounded-3xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] border border-slate-300 bg-white transition-all duration-300">
      {/* Top Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>System Overview</span>
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
              · Live Interactive Schematic &amp; Kinetic Flow
            </span>
          </h2>
        </div>

        {/* View Switcher Pills */}
        <div className="bg-slate-200/80 p-1 rounded-2xl border border-slate-300 flex text-xs">
          <button
            onClick={() => setViewMode('connected')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all duration-200 ${
              viewMode === 'connected'
                ? 'bg-white text-sky-950 shadow-xs border border-slate-300 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System Flow
          </button>
          <button
            onClick={() => setViewMode('schematic')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all duration-200 ${
              viewMode === 'schematic'
                ? 'bg-white text-sky-950 shadow-xs border border-slate-300 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mechanical Schematic
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 relative bg-slate-50/50">
        {/* Floating Detail Inspector Tooltip on Hover */}
        {hoveredComponent && (
          <div className="absolute top-3 right-5 z-20 rounded-2xl p-4 shadow-xl border border-slate-300 max-w-xs animate-fadeIn text-xs transition-all pointer-events-none backdrop-blur-xl bg-white text-slate-900">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <div className="font-bold text-slate-900 text-sm">{hoveredComponent.title}</div>
                <div className="text-[10px] text-slate-600 font-medium">{hoveredComponent.subtitle}</div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                hoveredComponent.status === 'ON'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-slate-200 text-slate-700 border border-slate-300'
              }`}>
                {hoveredComponent.status}
              </span>
            </div>

            <div className="space-y-1.5 pt-2 text-[11px]">
              {hoveredComponent.metrics.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center py-0.5">
                  <span className="text-slate-600 font-medium">{m.label}</span>
                  <span className="font-mono-numbers font-bold text-slate-900">
                    {m.value} {m.unit || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'connected' ? (
          /* View 1: Interconnected Flow Sequence (High Contrast Light Mode) */
          <div className="w-full overflow-x-auto pb-2 p-3 rounded-2xl bg-white border border-slate-300 shadow-xs scrollbar-thin scrollbar-thumb-slate-300">
            <div className="flex items-center justify-between min-w-[840px] px-2 py-3">
              {/* AHU-01 Card */}
              <div 
                className="flex flex-col items-center shrink-0 group transition-transform duration-300 hover:scale-105"
                onMouseEnter={() => setHoveredComponent({
                  id: 'AHU-01',
                  title: 'Air Handling Unit AHU-01',
                  subtitle: 'Primary Cleanroom Conditioned Air',
                  status: ahuOnline ? 'ON' : 'OFF',
                  type: 'ahu',
                  metrics: [
                    { label: 'Airflow Volume', value: ahuOnline ? '14,500' : '0', unit: 'CFM' },
                    { label: 'Supply Fan VFD', value: ahuOnline ? '50.0' : '0.0', unit: 'Hz' },
                    { label: 'Filter Differential', value: ahuOnline ? '120' : '5', unit: 'Pa (Clean)' }
                  ]
                })}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                <span className="text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">AHU</span>
                <div className="w-26 h-26 rounded-2xl p-2.5 flex flex-col items-center justify-between shadow-xs transition-all duration-300 border-2 bg-emerald-50/30 border-emerald-400 text-slate-900">
                  <div className="w-full flex justify-between items-center text-[9px] text-slate-600 font-mono-numbers">
                    <span>CFM</span>
                    <span className="text-emerald-800 font-bold">{ahuOnline ? '8.45k' : '0'}</span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    ahuOnline 
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs'
                      : 'bg-slate-100 border-slate-300 text-slate-400'
                  }`}>
                    <Fan className={`w-5 h-5 ${ahuOnline ? 'animate-fan' : ''}`} />
                  </div>
                  <div className="text-[11px] font-bold text-slate-900 font-mono-numbers">AHU-01</div>
                </div>
                <div className={`mt-2.5 px-2.5 py-0.5 rounded text-[10px] font-mono-numbers font-bold uppercase tracking-wider ${
                  ahuOnline
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-200 text-slate-600 border border-slate-300'
                }`}>
                  {ahuOnline ? 'RUNNING' : 'STANDBY'}
                </div>
              </div>

              {/* Connecting pipe from AHU to ODU-1 */}
              <div className="flex-1 min-w-4 max-w-8 h-2 bg-slate-200 relative overflow-hidden self-center mx-1 rounded-full border border-slate-300">
                {ahuOnline && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-sky-500 animate-pulse" />
                )}
              </div>

              {/* 6 Outdoor Units */}
              {odus.map((odu, index) => {
                const isOn = odu.state === 'ON';
                return (
                  <React.Fragment key={odu.id}>
                    <div 
                      className="flex flex-col items-center shrink-0 group transition-transform duration-300 hover:scale-108"
                      onMouseEnter={() => setHoveredComponent({
                        id: odu.id,
                        title: `Outdoor Unit ${odu.name}`,
                        subtitle: `Refrigerant Circuit ${(index % 3) + 1}`,
                        status: isOn ? 'ON' : 'OFF',
                        type: 'odu',
                        metrics: [
                          { label: 'Power Draw', value: `${odu.power_kw}`, unit: 'kW' },
                          { label: 'Fan Rotation', value: `${odu.fan_rpm}`, unit: 'RPM' },
                          { label: 'Condenser Coil Temp', value: `${odu.temp_c}`, unit: '°C' }
                        ]
                      })}
                      onMouseLeave={() => setHoveredComponent(null)}
                    >
                      <span className="text-[10px] font-bold text-slate-700 mb-2 uppercase tracking-wider">{odu.name}</span>
                      <div 
                        className={`w-20 h-26 rounded-2xl p-2 flex flex-col items-center justify-between transition-all duration-300 border-2 shadow-xs ${
                          isOn 
                            ? 'border-sky-400 bg-sky-50/40 text-slate-900' 
                            : 'border-slate-300 bg-slate-100 opacity-60 text-slate-500'
                        }`}
                      >
                        <div className="w-full flex justify-between text-[8px] font-mono-numbers text-slate-600 font-semibold">
                          <span>ODU</span>
                          <span className={isOn ? 'text-sky-800 font-bold' : 'text-slate-500'}>{isOn ? 'ACT' : 'STB'}</span>
                        </div>
                        
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                          isOn 
                            ? 'bg-sky-100 border-sky-300 text-sky-700 shadow-xs' 
                            : 'bg-slate-200 border-slate-300 text-slate-400'
                        }`}>
                          <Fan className={`w-5 h-5 ${isOn ? 'animate-fan' : ''}`} />
                        </div>

                        <div className="text-[10px] font-mono-numbers text-slate-900 font-bold truncate">
                          {isOn ? `${odu.power_kw}kW` : '0 kW'}
                        </div>
                      </div>

                      <div className={`mt-2.5 px-2 py-0.5 rounded text-[10px] font-mono-numbers font-bold uppercase tracking-wider ${
                        isOn
                          ? 'bg-sky-100 text-sky-900 border border-sky-300'
                          : 'bg-slate-200 text-slate-600 border border-slate-300'
                      }`}>
                        {isOn ? 'RUN' : 'OFF'}
                      </div>
                    </div>

                    {/* Pipe between units */}
                    {index < odus.length - 1 && (
                      <div className="flex-1 min-w-3 max-w-6 h-2 bg-slate-200 relative overflow-hidden self-center mx-0.5 rounded-full border border-slate-300">
                        {isOn && (
                          <div className="absolute inset-0 bg-sky-500 animate-pulse" />
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Connecting pipe from ODU-6 to Heater Bank */}
              <div className="flex-1 min-w-4 max-w-8 h-2 bg-slate-200 relative overflow-hidden self-center mx-1 rounded-full border border-slate-300">
                {anyHeaterRunning && (
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-amber-500 animate-pulse" />
                )}
              </div>

              {/* Heater Bank Card */}
              <div 
                className="flex flex-col items-center shrink-0 group transition-transform duration-300 hover:scale-105"
                onMouseEnter={() => setHoveredComponent({
                  id: 'HTR-BANK',
                  title: 'Electric Heating Stage Bank',
                  subtitle: '8-Unit Modulating Thermal Elements',
                  status: anyHeaterRunning ? 'ON' : 'OFF',
                  type: 'heater',
                  metrics: [
                    { label: 'Active Stages', value: `${systemState?.heater_summary?.running ?? 8}/8`, unit: '' },
                    { label: 'Total Heat Duty', value: `${((systemState?.heater_summary?.running ?? 8) * 3.0).toFixed(1)}`, unit: 'kW' },
                    { label: 'Average Core Temp', value: '52.5', unit: '°C' }
                  ]
                })}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                <span className="text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">Heater Bank</span>
                <div className={`w-26 h-26 rounded-2xl p-2.5 flex flex-col items-center justify-between shadow-xs transition-all duration-300 border-2 ${
                  anyHeaterRunning 
                    ? 'border-amber-400 bg-amber-50/40 text-slate-900' 
                    : 'border-slate-300 bg-slate-100 opacity-60 text-slate-500'
                }`}>
                  <div className="w-full flex justify-between items-center text-[9px] text-slate-600 font-mono-numbers">
                    <span>STAGES</span>
                    <span className="text-amber-800 font-bold">{systemState?.heater_summary?.running ?? 8}/8</span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    anyHeaterRunning 
                      ? 'bg-amber-100 border-amber-300 text-amber-700 shadow-xs'
                      : 'bg-slate-200 border-slate-300 text-slate-400'
                  }`}>
                    <Flame className={`w-5 h-5 ${anyHeaterRunning ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="text-[11px] font-bold text-slate-900 font-mono-numbers">8-STAGE REHEAT</div>
                </div>
                <div className={`mt-2.5 px-2.5 py-0.5 rounded text-[10px] font-mono-numbers font-bold uppercase tracking-wider ${
                  anyHeaterRunning
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-200 text-slate-600 border border-slate-300'
                }`}>
                  {anyHeaterRunning ? 'ENERGIZED' : 'STANDBY'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* View 2: Detailed Mechanical Engineering Schematic (Light Mode) */
          <div className="relative w-full overflow-x-auto bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 shadow-inner">
            <svg 
              viewBox="0 0 980 440" 
              className="w-full h-auto min-w-[850px] max-h-[500px] select-none" 
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="coolFlowGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0284C7" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
                <linearGradient id="warmFlowGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>

              {/* 6 Outdoor Units on the Left */}
              <g id="odu-bank-group" transform="translate(20, 20)">
                <text x="75" y="10" fill="#475569" fontSize="11" fontWeight="bold" textAnchor="middle">
                  6 OUTDOOR UNITS (ODU 1-6)
                </text>

                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const col = idx % 2;
                  const row = Math.floor(idx / 2);
                  const x = col * 85;
                  const y = 25 + row * 115;
                  const odu = odus[idx];
                  const isOn = odu?.state === 'ON';

                  return (
                    <g 
                      key={idx} 
                      transform={`translate(${x}, ${y})`}
                      className="transition-transform duration-300 hover:scale-105"
                      onMouseEnter={() => setHoveredComponent({
                        id: `ODU-0${idx + 1}`,
                        title: `Outdoor Condenser ODU-${idx + 1}`,
                        subtitle: `Circuit ${(idx % 3) + 1}`,
                        status: isOn ? 'ON' : 'OFF',
                        type: 'odu',
                        metrics: [
                          { label: 'Fan Speed', value: isOn ? '820' : '0', unit: 'RPM' },
                          { label: 'Power Consumption', value: isOn ? '18.0' : '0.0', unit: 'kW' },
                          { label: 'Refrigerant Temp', value: `${odu?.temp_c ?? 32.5}`, unit: '°C' }
                        ]
                      })}
                      onMouseLeave={() => setHoveredComponent(null)}
                    >
                      <rect 
                        x="0" 
                        y="0" 
                        width="76" 
                        height="100" 
                        fill="#FFFFFF" 
                        stroke={isOn ? "#0284C7" : "#CBD5E1"} 
                        strokeWidth="1.5" 
                        rx="10" 
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))"
                      />
                      <rect x="6" y="6" width="64" height="16" fill="#F1F5F9" rx="4" />
                      <text x="38" y="18" fill="#1E293B" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
                        ODU-{idx + 1}
                      </text>
                      
                      {/* Fan Grille */}
                      <circle cx="38" cy="56" r="24" fill="#F8FAFC" stroke={isOn ? "#38BDF8" : "#E2E8F0"} strokeWidth="1.5" />
                      
                      {/* Spinning Fan Blades */}
                      <g 
                        transform="translate(38, 56)" 
                        className={isOn ? "animate-fan" : ""}
                        style={{ transformOrigin: '0px 0px' }}
                      >
                        <circle cx="0" cy="0" r="4" fill={isOn ? "#0284C7" : "#94A3B8"} />
                        <path d="M 0 0 C 6 -10, 15 -8, 14 0 C 12 5, 5 5, 0 0" fill={isOn ? "#0284C7" : "#94A3B8"} />
                        <path d="M 0 0 C 10 6, 8 15, 0 14 C -5 12, -5 5, 0 0" fill={isOn ? "#0284C7" : "#94A3B8"} />
                        <path d="M 0 0 C -6 10, -15 8, -14 0 C -12 -5, -5 -5, 0 0" fill={isOn ? "#0284C7" : "#94A3B8"} />
                        <path d="M 0 0 C -10 -6, -8 -15, 0 -14 C 5 -12, 5 -5, 0 0" fill={isOn ? "#0284C7" : "#94A3B8"} />
                      </g>

                      {/* Status indicator dot */}
                      <circle cx="66" cy="14" r="3.5" fill={isOn ? "#10B981" : "#EF4444"} />
                      <text x="38" y="92" fill={isOn ? "#10B981" : "#64748B"} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
                        {isOn ? "RUNNING" : "STANDBY"}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Refrigerant Manifold Pipes connecting ODUs to AHU */}
              <g id="manifold-lines">
                <path d="M 180 80 L 260 80 L 260 170 L 330 170" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeDasharray="6 4" className={ahuOnline ? "animate-flow" : ""} />
                <path d="M 180 195 L 260 195 L 260 215 L 330 215" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeDasharray="6 4" className={ahuOnline ? "animate-flow" : ""} />
                <path d="M 180 310 L 260 310 L 260 250 L 330 250" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeDasharray="6 4" className={ahuOnline ? "animate-flow" : ""} />

                <circle cx="280" cy="170" r="10" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                <text x="280" y="174" fill="#0284C7" fontSize="8" fontWeight="bold" textAnchor="middle">T</text>
              </g>

              {/* Main AHU Casing Box */}
              <g id="ahu-casing" transform="translate(330, 80)">
                <rect 
                  x="0" 
                  y="0" 
                  width="410" 
                  height="230" 
                  fill="#FFFFFF" 
                  stroke="#94A3B8" 
                  strokeWidth="2" 
                  rx="12" 
                  filter="drop-shadow(0 4px 12px rgba(0,0,0,0.06))"
                />
                
                <text x="205" y="24" fill="#1E293B" fontSize="12" fontWeight="bold" textAnchor="middle">
                  AIR HANDLING UNIT (AHU-01)
                </text>

                {/* Filter Section */}
                <g 
                  transform="translate(20, 45)" 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredComponent({
                    id: 'FILTER',
                    title: 'Air Filtration Section',
                    subtitle: 'Pre-Filter & HEPA Bank',
                    status: 'ON',
                    type: 'filter',
                    metrics: [
                      { label: 'Differential Pressure', value: '120', unit: 'Pa' },
                      { label: 'Efficiency Rating', value: '99.97%', unit: 'DOP' },
                      { label: 'Filter State', value: 'Clean', unit: '' }
                    ]
                  })}
                  onMouseLeave={() => setHoveredComponent(null)}
                >
                  <rect x="0" y="0" width="40" height="150" fill="#F8FAFC" stroke="#CBD5E1" rx="4" />
                  <line x1="8" y1="15" x2="32" y2="35" stroke="#64748B" strokeWidth="2" />
                  <line x1="8" y1="45" x2="32" y2="65" stroke="#64748B" strokeWidth="2" />
                  <line x1="8" y1="75" x2="32" y2="95" stroke="#64748B" strokeWidth="2" />
                  <line x1="8" y1="105" x2="32" y2="125" stroke="#64748B" strokeWidth="2" />
                  <text x="20" y="165" fill="#64748B" fontSize="8" fontWeight="bold" textAnchor="middle">FILTERS</text>

                  <circle cx="20" cy="-14" r="9" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5" />
                  <text x="20" y="-11" fill="#64748B" fontSize="7" fontWeight="bold" textAnchor="middle">DP</text>
                </g>

                {/* Direct Expansion (DX) Cooling Coils */}
                <g 
                  transform="translate(85, 45)" 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredComponent({
                    id: 'COOLING_COIL',
                    title: 'Direct Expansion (DX) Cooling Coils',
                    subtitle: 'Linked to 6 Condensing Units',
                    status: ahuOnline ? 'ON' : 'OFF',
                    type: 'coil',
                    metrics: [
                      { label: 'Active Circuits', value: `${odus.filter(o => o.state === 'ON').length}/6`, unit: '' },
                      { label: 'Supply Leaving Temp', value: `${systemState?.temperatures?.supply_c ?? 18.2}`, unit: '°C' },
                      { label: 'Sensible Cooling Capacity', value: '108.0', unit: 'kW' }
                    ]
                  })}
                  onMouseLeave={() => setHoveredComponent(null)}
                >
                  <rect x="0" y="0" width="55" height="150" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.5" rx="6" />
                  <path d="M 12 15 L 42 15 L 42 45 L 12 45 L 12 75 L 42 75 L 42 105 L 12 105 L 12 135 L 42 135" fill="none" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
                  <text x="27" y="165" fill="#0284C7" fontSize="8" fontWeight="bold" textAnchor="middle">COOL COIL</text>

                  <circle cx="27" cy="-14" r="9" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                  <text x="27" y="-11" fill="#0284C7" fontSize="8" fontWeight="bold" textAnchor="middle">T</text>
                </g>

                {/* Electric Heater Bank Section */}
                <g 
                  transform="translate(165, 45)" 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredComponent({
                    id: 'HEATER_BANK',
                    title: 'Electric Heating Element Bank',
                    subtitle: '8 Staged Reheat Elements',
                    status: anyHeaterRunning ? 'ON' : 'OFF',
                    type: 'heater',
                    metrics: [
                      { label: 'Stages Active', value: `${systemState?.heater_summary?.running ?? 8}/8`, unit: '' },
                      { label: 'Heating Duty', value: `${((systemState?.heater_summary?.running ?? 8) * 3.0).toFixed(1)}`, unit: 'kW' },
                      { label: 'Element Temperature', value: '52.5', unit: '°C' }
                    ]
                  })}
                  onMouseLeave={() => setHoveredComponent(null)}
                >
                  <rect x="0" y="0" width="55" height="150" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" rx="6" />
                  {[18, 48, 78, 108, 132].map((yVal, i) => (
                    <g key={i} transform={`translate(15, ${yVal})`}>
                      <path d="M 0 0 Q 6 -5, 12 0 T 24 0" fill="none" stroke={anyHeaterRunning ? "#EA580C" : "#CBD5E1"} strokeWidth="2.5" />
                      <circle cx="28" cy="-1" r="2" fill={anyHeaterRunning ? "#EA580C" : "#CBD5E1"} />
                    </g>
                  ))}
                  <text x="27" y="165" fill="#D97706" fontSize="8" fontWeight="bold" textAnchor="middle">HEATERS</text>
                </g>

                {/* Supply Air Centrifugal Fan */}
                <g 
                  transform="translate(265, 45)" 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredComponent({
                    id: 'SUPPLY_FAN',
                    title: 'Direct-Drive Supply Blower',
                    subtitle: 'Centrifugal Backward-Curved Fan',
                    status: ahuOnline ? 'ON' : 'OFF',
                    type: 'fan',
                    metrics: [
                      { label: 'Airflow Delivery', value: ahuOnline ? '14,500' : '0', unit: 'CFM' },
                      { label: 'VFD Speed', value: ahuOnline ? '50.0' : '0.0', unit: 'Hz' },
                      { label: 'Static Pressure', value: ahuOnline ? '480' : '0', unit: 'Pa' }
                    ]
                  })}
                  onMouseLeave={() => setHoveredComponent(null)}
                >
                  <circle cx="55" cy="75" r="50" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
                  <g 
                    transform="translate(55, 75)" 
                    className={ahuOnline ? "animate-fan" : ""}
                    style={{ transformOrigin: '0px 0px' }}
                  >
                    <path d="M 0 0 C 15 -35, 40 -15, 0 0" fill="#0284C7" opacity="0.8" />
                    <path d="M 0 0 C 35 15, 15 40, 0 0" fill="#0284C7" opacity="0.8" />
                    <path d="M 0 0 C -15 35, -40 15, 0 0" fill="#0284C7" opacity="0.8" />
                    <path d="M 0 0 C -35 -15, -15 -40, 0 0" fill="#0284C7" opacity="0.8" />
                    <circle cx="0" cy="0" r="10" fill="#0284C7" />
                  </g>
                  <text x="55" y="142" fill="#475569" fontSize="8" fontWeight="bold" textAnchor="middle">SUPPLY FAN</text>
                </g>
              </g>

              {/* Supply Air Ductwork into Cleanroom Suite */}
              <g id="ducts-and-diffusers">
                <path 
                  d="M 700 160 L 770 160 L 770 120 L 810 120" 
                  fill="none" 
                  stroke="#94A3B8" 
                  strokeWidth="14" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M 700 160 L 770 160 L 770 120 L 810 120" 
                  fill="none" 
                  stroke="#0284C7" 
                  strokeWidth="3" 
                  strokeDasharray="6 4" 
                  className={ahuOnline ? "animate-flow" : ""} 
                />

                <path 
                  d="M 700 160 L 770 160 L 770 280 L 810 280" 
                  fill="none" 
                  stroke="#94A3B8" 
                  strokeWidth="14" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M 700 160 L 770 160 L 770 280 L 810 280" 
                  fill="none" 
                  stroke="#0284C7" 
                  strokeWidth="3" 
                  strokeDasharray="6 4" 
                  className={ahuOnline ? "animate-flow" : ""} 
                />

                {/* VCD Dampers */}
                <rect x="735" y="108" width="18" height="24" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" rx="3" />
                <text x="744" y="123" fill="#0284C7" fontSize="7" fontWeight="bold" textAnchor="middle">VCD</text>

                <rect x="735" y="268" width="18" height="24" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" rx="3" />
                <text x="744" y="283" fill="#0284C7" fontSize="7" fontWeight="bold" textAnchor="middle">VCD</text>
              </g>

              {/* Conditioned Cleanroom Suite */}
              <g 
                id="room-conditioned" 
                transform="translate(790, 75)"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredComponent({
                  id: 'CLEANROOM',
                  title: 'Conditioned Cleanroom Suite',
                  subtitle: 'ISO Class 5 Controlled Environment',
                  status: 'ON',
                  type: 'room',
                  metrics: [
                    { label: 'Room Temperature', value: `${systemState?.temperatures?.current_c ?? 24.4}`, unit: '°C' },
                    { label: 'Target Setpoint', value: `${systemState?.temperatures?.set_point_c ?? 22.0}`, unit: '°C' },
                    { label: 'CO2 Concentration', value: '485', unit: 'ppm' },
                    { label: 'Cleanroom Pressure', value: '+25', unit: 'Pa' }
                  ]
                })}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                <rect 
                  x="0" 
                  y="0" 
                  width="170" 
                  height="260" 
                  fill="#FFFFFF" 
                  stroke="#94A3B8" 
                  strokeWidth="2" 
                  rx="12" 
                  filter="drop-shadow(0 4px 12px rgba(0,0,0,0.06))"
                />
                <text x="85" y="24" fill="#1E293B" fontSize="11" fontWeight="bold" textAnchor="middle">
                  CLEANROOM SUITE
                </text>

                {/* Ceiling Diffusers */}
                <g transform="translate(25, 42)">
                  <polygon points="0,0 28,0 20,12 8,12" fill="#F1F5F9" stroke="#0284C7" />
                  <path d="M 5 15 L 0 25 M 14 15 L 14 28 M 23 15 L 28 25" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 2" />
                </g>

                <g transform="translate(115, 42)">
                  <polygon points="0,0 28,0 20,12 8,12" fill="#F1F5F9" stroke="#0284C7" />
                  <path d="M 5 15 L 0 25 M 14 15 L 14 28 M 23 15 L 28 25" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 2" />
                </g>

                {/* Cleanroom Sensor Readout Card */}
                <g transform="translate(15, 105)">
                  <rect x="0" y="0" width="140" height="135" fill="#F8FAFC" stroke="#E2E8F0" rx="8" />
                  <text x="70" y="20" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="middle">
                    CLEANROOM SENSORS
                  </text>
                  
                  <text x="12" y="44" fill="#64748B" fontSize="9">Current Temp:</text>
                  <text x="128" y="44" fill="#0F172A" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="JetBrains Mono">
                    {systemState?.temperatures?.current_c ?? 24.4} °C
                  </text>

                  <text x="12" y="70" fill="#64748B" fontSize="9">Set Point:</text>
                  <text x="128" y="70" fill="#0284C7" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="JetBrains Mono">
                    {systemState?.temperatures?.set_point_c ?? 22.0} °C
                  </text>

                  <text x="12" y="96" fill="#64748B" fontSize="9">Air Purity CO2:</text>
                  <text x="128" y="96" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="end" fontFamily="JetBrains Mono">
                    485 ppm
                  </text>

                  <text x="12" y="120" fill="#64748B" fontSize="9">Occupancy:</text>
                  <text x="128" y="120" fill="#8B5CF6" fontSize="10" fontWeight="bold" textAnchor="end" fontFamily="JetBrains Mono">
                    DETECTED
                  </text>
                </g>
              </g>

              {/* Return Air Recirculation Duct */}
              <path 
                d="M 875 335 L 875 390 L 330 390 L 330 310" 
                fill="none" 
                stroke="#CBD5E1" 
                strokeWidth="14" 
                strokeLinejoin="round" 
              />
              <path 
                d="M 875 335 L 875 390 L 330 390 L 330 310" 
                fill="none" 
                stroke="#64748B" 
                strokeWidth="2.5" 
                strokeDasharray="6 4" 
                className={ahuOnline ? "animate-flow" : ""} 
              />
              <text x="600" y="385" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="middle">
                RETURN AIR RECIRCULATION DUCT
              </text>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
