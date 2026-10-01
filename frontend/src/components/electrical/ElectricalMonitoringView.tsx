'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  Leaf, 
  Gauge, 
  CheckCircle2, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';
import { ElectricalState } from '@/types/hvac';
import { fetchElectricalState } from '@/lib/api';

export function ElectricalMonitoringView() {
  const [data, setData] = useState<ElectricalState | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const state = await fetchElectricalState();
        setData(state);
      } catch {
      }
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const kpis = data?.kpis || {
    total_plant_power_kw: 846.5,
    total_current_a: 1245,
    avg_power_factor: 0.92,
    total_energy_today_kwh: 5842
  };

  const panels = data?.panels || [
    { id: 'p1', name: 'Panel 1', color: '#2563EB', status: 'Online', voltage_ll_v: 415, voltage_ln_v: 240, current_avg_a: 182, active_power_kw: 142.8, apparent_power_kva: 160.5, reactive_power_kvar: 72.3, power_factor: 0.89, frequency_hz: 50.02, energy_today_kwh: 986, load_pct: 16.9 },
    { id: 'p2', name: 'Panel 2', color: '#059669', status: 'Online', voltage_ll_v: 418, voltage_ln_v: 246, current_avg_a: 156, active_power_kw: 121.4, apparent_power_kva: 138.7, reactive_power_kvar: 61.2, power_factor: 0.88, frequency_hz: 50.01, energy_today_kwh: 864, load_pct: 14.3 },
    { id: 'p3', name: 'Panel 3', color: '#D97706', status: 'Online', voltage_ll_v: 416, voltage_ln_v: 242, current_avg_a: 134, active_power_kw: 98.7, apparent_power_kva: 112.6, reactive_power_kvar: 68.9, power_factor: 0.87, frequency_hz: 50.00, energy_today_kwh: 712, load_pct: 11.7 },
    { id: 'p4', name: 'Panel 4', color: '#7C3AED', status: 'Online', voltage_ll_v: 420, voltage_ln_v: 242, current_avg_a: 168, active_power_kw: 132.6, apparent_power_kva: 150.8, reactive_power_kvar: 66.7, power_factor: 0.88, frequency_hz: 50.02, energy_today_kwh: 925, load_pct: 15.7 },
    { id: 'p5', name: 'Panel 5', color: '#DC2626', status: 'Online', voltage_ll_v: 417, voltage_ln_v: 240, current_avg_a: 145, active_power_kw: 110.2, apparent_power_kva: 126.4, reactive_power_kvar: 57.8, power_factor: 0.87, frequency_hz: 50.01, energy_today_kwh: 801, load_pct: 13.0 },
    { id: 'p6', name: 'Panel 6', color: '#0891B2', status: 'Online', voltage_ll_v: 419, voltage_ln_v: 242, current_avg_a: 121, active_power_kw: 89.6, apparent_power_kva: 103.2, reactive_power_kvar: 42.5, power_factor: 0.87, frequency_hz: 50.00, energy_today_kwh: 658, load_pct: 10.6 },
    { id: 'p7', name: 'Panel 7', color: '#DB2777', status: 'Online', voltage_ll_v: 421, voltage_ln_v: 244, current_avg_a: 134, active_power_kw: 101.7, apparent_power_kva: 116.9, reactive_power_kvar: 52.9, power_factor: 0.87, frequency_hz: 50.02, energy_today_kwh: 701, load_pct: 12.0 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex items-center space-x-4 border-l-4 border-l-blue-600">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Plant Power</div>
            <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight mt-0.5 tabular-nums">
              {kpis.total_plant_power_kw.toFixed(1)} <span className="text-xs font-normal text-slate-400 font-sans">kW</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex items-center space-x-4 border-l-4 border-l-emerald-600">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Current</div>
            <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight mt-0.5 tabular-nums">
              {kpis.total_current_a.toLocaleString()} <span className="text-xs font-normal text-slate-400 font-sans">A</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex items-center space-x-4 border-l-4 border-l-purple-600">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
            <Gauge className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Power Factor</div>
            <div className="text-2xl font-bold font-mono text-purple-700 tracking-tight mt-0.5 tabular-nums">
              {kpis.avg_power_factor.toFixed(2)} <span className="text-xs font-normal text-slate-400 font-sans">cos φ</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex items-center space-x-4 border-l-4 border-l-blue-600">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Leaf className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Energy (Today)</div>
            <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight mt-0.5 tabular-nums">
              {kpis.total_energy_today_kwh.toLocaleString()} <span className="text-xs font-normal text-slate-400 font-sans">kWh</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-sans">
                Main Low-Voltage (415V) Single-Line Power Distribution
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                11kV Utility Grid Incomer · 2.5 MVA Dyn11 Step-Down · 415V MLV Main Bus
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              All 7 Incomers Closed &amp; Synchronized
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              50.02 Hz Grid Lock
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto py-2">
          <svg viewBox="0 0 980 230" className="w-full min-w-[850px] h-auto font-sans select-none rounded-xl">
            <defs>
              <linearGradient id="busGradLight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#B45309" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="980" height="230" rx="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />

            <rect x="25" y="20" width="160" height="52" rx="8" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5" />
            <text x="40" y="42" fill="#0F172A" fontSize="12" fontWeight="800">11 kV Utility Grid</text>
            <text x="40" y="58" fill="#64748B" fontSize="10" fontWeight="600" fontFamily="monospace">Incomer Substation #1</text>
            <circle cx="165" cy="46" r="4.5" fill="#10B981" />

            <line x1="185" y1="46" x2="250" y2="46" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="5 3" />

            <rect x="250" y="16" width="170" height="60" rx="8" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.5" />
            <text x="265" y="38" fill="#1E40AF" fontSize="12" fontWeight="800">Transformer TX-01</text>
            <text x="265" y="52" fill="#475569" fontSize="10" fontWeight="600" fontFamily="monospace">2500 kVA · 11kV / 415V</text>
            <text x="265" y="65" fill="#059669" fontSize="9" fontWeight="700" fontFamily="monospace">Dyn11 · Impedance 5.8%</text>

            <line x1="335" y1="76" x2="335" y2="115" stroke="#F59E0B" strokeWidth="3" />
            <circle cx="335" cy="115" r="4.5" fill="#F59E0B" />

            <rect x="40" y="112" width="900" height="8" rx="4" fill="url(#busGradLight)" stroke="#B45309" strokeWidth="1" />
            <text x="50" y="105" fill="#92400E" fontSize="11" fontWeight="800" fontFamily="monospace">
              MAIN 415V COPPER BUSBAR (MLV-1) · 3-PHASE 4-WIRE
            </text>
            <text x="810" y="105" fill="#0F172A" fontSize="10" fontWeight="800" fontFamily="monospace">
              Total 1,245 A
            </text>

            {panels.map((p, idx) => {
              const xPos = 80 + idx * 125;
              return (
                <g key={p.id}>
                  <line x1={xPos + 35} y1="120" x2={xPos + 35} y2="140" stroke="#94A3B8" strokeWidth="2" />

                  <rect x={xPos + 22} y="140" width="26" height="20" rx="4" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5" />
                  <line x1={xPos + 35} y1="145" x2={xPos + 35} y2="155" stroke="#059669" strokeWidth="2.5" />
                  <circle cx={xPos + 35} cy="150" r="3" fill="#059669" />

                  <line x1={xPos + 35} y1="160" x2={xPos + 35} y2="180" stroke="#94A3B8" strokeWidth="2" />

                  <rect
                    x={xPos}
                    y="180"
                    width="70"
                    height="42"
                    rx="8"
                    fill="#FFFFFF"
                    stroke={p.color}
                    strokeWidth="1.5"
                  />
                  <text x={xPos + 35} y="196" fill="#0F172A" fontSize="11" fontWeight="800" textAnchor="middle">
                    {p.name}
                  </text>
                  <text x={xPos + 35} y="210" fill={p.color} fontSize="10" fontWeight="800" fontFamily="monospace" textAnchor="middle">
                    {p.active_power_kw} kW
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {panels.map((panel) => (
          <div 
            key={panel.id} 
            className="rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:border-slate-300 transition-all duration-200"
          >
            <div 
              className="px-4 py-2.5 flex items-center justify-between"
              style={{ backgroundColor: `${panel.color}15`, borderBottom: `2px solid ${panel.color}` }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded flex items-center justify-center text-white" style={{ backgroundColor: panel.color }}>
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="font-bold text-sm tracking-wide text-slate-900">{panel.name}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online</span>
              </div>
            </div>

            <div className="p-4 space-y-2 text-xs divide-y divide-slate-100 font-sans">
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 font-medium flex items-center space-x-1.5">
                  <Activity className="w-3 h-3 text-blue-600" />
                  <span>Voltage (L-L)</span>
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{panel.voltage_ll_v} V</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-medium flex items-center space-x-1.5">
                  <Gauge className="w-3 h-3 text-emerald-600" />
                  <span>Voltage (L-N)</span>
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{panel.voltage_ln_v} V</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-medium flex items-center space-x-1.5">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>Current (Avg)</span>
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{panel.current_avg_a} A</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-medium">Active Power</span>
                <span className="font-mono font-bold text-blue-700 text-sm tabular-nums">{panel.active_power_kw} kW</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-medium">Apparent Power</span>
                <span className="font-mono text-slate-700 font-semibold tabular-nums">{panel.apparent_power_kva} kVA</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-medium">Reactive Power</span>
                <span className="font-mono text-slate-700 font-semibold tabular-nums">{panel.reactive_power_kvar} kVAR</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-medium">Power Factor</span>
                <span className="font-mono text-emerald-700 font-bold tabular-nums">{panel.power_factor}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-medium">Frequency</span>
                <span className="font-mono text-slate-700 font-semibold tabular-nums">{panel.frequency_hz} Hz</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-medium">Energy (Today)</span>
                <span className="font-mono font-bold text-amber-700 tabular-nums">{panel.energy_today_kwh} kWh</span>
              </div>
            </div>
          </div>
        ))}

        <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Panel Load Distribution</span>
            <span className="text-xs text-slate-500 font-mono font-bold">7 Feeders</span>
          </div>

          <div className="relative flex items-center justify-center py-3">
            <svg viewBox="0 0 160 160" className="w-36 h-36">
              <circle cx="80" cy="80" r="55" fill="none" stroke="#2563EB" strokeWidth="22" strokeDasharray="58 288" strokeDashoffset="0" />
              <circle cx="80" cy="80" r="55" fill="none" stroke="#059669" strokeWidth="22" strokeDasharray="49 297" strokeDashoffset="-58" />
              <circle cx="80" cy="80" r="55" fill="none" stroke="#D97706" strokeWidth="22" strokeDasharray="40 306" strokeDashoffset="-107" />
              <circle cx="80" cy="80" r="55" fill="none" stroke="#7C3AED" strokeWidth="22" strokeDasharray="54 292" strokeDashoffset="-147" />
              <circle cx="80" cy="80" r="55" fill="none" stroke="#DC2626" strokeWidth="22" strokeDasharray="45 301" strokeDashoffset="-201" />
              <circle cx="80" cy="80" r="55" fill="none" stroke="#0891B2" strokeWidth="22" strokeDasharray="36 310" strokeDashoffset="-246" />
              <circle cx="80" cy="80" r="55" fill="none" stroke="#DB2777" strokeWidth="22" strokeDasharray="41 305" strokeDashoffset="-282" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-500 font-medium">Total</span>
              <span className="text-sm font-bold font-mono text-slate-900">846.5 kW</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] divide-y divide-slate-100 pt-1">
            {panels.map((p) => (
              <div key={p.id} className="flex justify-between items-center pt-1">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-700 font-semibold">{p.name}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-slate-900 font-bold">{p.active_power_kw} kW</span>
                  <span className="text-slate-500 font-medium">{p.load_pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between border-t-4 border-t-blue-600">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-sm">Total Plant Power Trend</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold border border-blue-200">
              846.5 kW
            </span>
          </div>

          <div className="relative pt-4">
            <svg viewBox="0 0 400 160" className="w-full h-auto">
              <defs>
                <linearGradient id="elecTrendGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="30" y1="30" x2="390" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="30" y1="70" x2="390" y2="70" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="30" y1="110" x2="390" y2="110" stroke="#E2E8F0" strokeDasharray="3 3" />

              <text x="5" y="34" fill="#94A3B8" fontSize="9" fontFamily="monospace" fontWeight="600">1200</text>
              <text x="5" y="74" fill="#94A3B8" fontSize="9" fontFamily="monospace" fontWeight="600">900</text>
              <text x="5" y="114" fill="#94A3B8" fontSize="9" fontFamily="monospace" fontWeight="600">600</text>
              <text x="5" y="148" fill="#94A3B8" fontSize="9" fontFamily="monospace" fontWeight="600">300</text>

              <polygon
                points="30,140 30,115 75,118 120,110 165,85 210,75 255,70 300,68 345,67 390,65 390,140"
                fill="url(#elecTrendGradLight)"
              />
              <polyline
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                points="30,115 75,118 120,110 165,85 210,75 255,70 300,68 345,67 390,65"
              />
              <circle cx="390" cy="65" r="4.5" fill="#2563EB" />

              <text x="30" y="155" fill="#94A3B8" fontSize="9" fontFamily="monospace" fontWeight="600">00:00</text>
              <text x="120" y="155" fill="#94A3B8" fontSize="9" fontFamily="monospace" fontWeight="600">06:00</text>
              <text x="210" y="155" fill="#94A3B8" fontSize="9" fontFamily="monospace" fontWeight="600">12:00</text>
              <text x="300" y="155" fill="#94A3B8" fontSize="9" fontFamily="monospace" fontWeight="600">18:00</text>
              <text x="380" y="155" fill="#94A3B8" fontSize="9" fontFamily="monospace" fontWeight="600">21:00</text>
            </svg>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between border-t-4 border-t-indigo-600">
          <div className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Panel Power (kW)</span>
            <span className="text-xs text-slate-500 font-mono font-bold">Real Power P</span>
          </div>

          <div className="relative pt-4">
            <svg viewBox="0 0 300 160" className="w-full h-auto">
              {panels.map((p, i) => {
                const x = 30 + i * 38;
                const maxKw = 160;
                const barH = (p.active_power_kw / maxKw) * 105;
                const y = 130 - barH;
                return (
                  <g key={p.id}>
                    <rect
                      x={x}
                      y={y}
                      width="26"
                      height={barH}
                      fill={p.color}
                      rx="4"
                      className="transition-all duration-200 hover:opacity-85"
                    />
                    <text x={x + 13} y={y - 4} fill="#0F172A" fontSize="9" fontWeight="800" fontFamily="monospace" textAnchor="middle">
                      {p.active_power_kw}
                    </text>
                    <text x={x + 13} y="145" fill="#64748B" fontSize="9" fontWeight="800" fontFamily="monospace" textAnchor="middle">
                      P{i + 1}
                    </text>
                  </g>
                );
              })}
              <line x1="20" y1="130" x2="295" y2="130" stroke="#CBD5E1" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between border-t-4 border-t-emerald-600">
          <div className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Substation Status</span>
          </div>

          <div className="space-y-2.5 py-2 text-xs font-sans">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Active Demand</span>
              <span className="font-bold font-mono text-slate-900">{kpis.total_plant_power_kw} kW</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Phase Current</span>
              <span className="font-bold font-mono text-slate-900">{kpis.total_current_a} A</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Power Factor</span>
              <span className="font-bold font-mono text-emerald-700">{kpis.avg_power_factor}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Daily Accumulation</span>
              <span className="font-bold font-mono text-amber-700">{kpis.total_energy_today_kwh} kWh</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">7 Feeders Synchronized · 0 Tripped</span>
          </div>
        </div>
      </div>
    </div>
  );
}
