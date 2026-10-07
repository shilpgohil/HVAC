'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  BatteryCharging, 
  Thermometer, 
  ShieldCheck, 
  ShieldAlert, 
  Lightbulb, 
  Wind, 
  Tv, 
  Car, 
  Sun, 
  Home, 
  Moon, 
  Sparkles, 
  Leaf, 
  Maximize2, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Activity, 
  Power,
  Sliders,
  Droplets,
  Layers
} from 'lucide-react';
import { HomeIotState, HomeIotRoom, HomeIotDevice } from '@/types/hvac';
import { 
  fetchHomeIotState, 
  toggleHomeIotDevice, 
  updateHomeIotRoomTemp, 
  activateHomeIotScene, 
  updateHomeIotSecurityMode 
} from '@/lib/api';

export function HomeIotMonitoringView() {
  const [data, setData] = useState<HomeIotState | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('living_room');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const loadState = async () => {
    try {
      const state = await fetchHomeIotState();
      setData(state);
    } catch {}
  };

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleDeviceToggle = async (roomId: string, deviceId: string, currentState: boolean) => {
    if (!data) return;
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map(r => {
          if (r.id !== roomId) return r;
          return {
            ...r,
            devices: r.devices.map(d => {
              if (d.id !== deviceId) return d;
              return { ...d, state: !currentState };
            })
          };
        })
      };
    });

    try {
      await toggleHomeIotDevice(roomId, deviceId, !currentState);
      await loadState();
    } catch {
      await loadState();
    }
  };

  const handleTempAdjust = async (roomId: string, currentTarget: number, delta: number) => {
    const newTarget = Math.round((currentTarget + delta) * 10) / 10;
    if (newTarget < 18 || newTarget > 28) return;

    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map(r => r.id === roomId ? { ...r, target_temp_c: newTarget } : r)
      };
    });

    try {
      await updateHomeIotRoomTemp(roomId, newTarget);
      await loadState();
    } catch {
      await loadState();
    }
  };

  const handleSceneSelect = async (sceneName: string) => {
    setIsUpdating(true);
    try {
      await activateHomeIotScene(sceneName);
      await loadState();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSecurityToggle = async () => {
    if (!data) return;
    const nextMode = data.security_mode === 'DISARMED' ? 'ARMED_HOME' : data.security_mode === 'ARMED_HOME' ? 'ARMED_AWAY' : 'DISARMED';
    try {
      await updateHomeIotSecurityMode(nextMode);
      await loadState();
    } catch {}
  };

  const kpis = data?.kpis || {
    total_power_kw: 8.65,
    solar_generation_kw: 8.4,
    grid_net_kw: 0.25,
    battery_soc_pct: 91,
    avg_indoor_temp_c: 23.2,
    avg_indoor_humidity_rh: 49.0,
    active_devices_count: 14,
    total_devices_count: 22,
    air_quality_iaq: 'EXCELLENT',
    water_leak_status: 'NORMAL'
  };

  const rooms = data?.rooms || [];
  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Smart Residence IoT Mesh
            </span>
            <span className="text-slate-300">/</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Whole-Home Automation Twin</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Matter/Thread mesh topology, solar microgrid, zoned climate control &amp; real-time device telemetry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono">
            {['Home', 'Away', 'Night', 'Eco', 'Entertain'].map(sc => {
              const isActive = data?.active_scene === sc;
              return (
                <button
                  key={sc}
                  onClick={() => handleSceneSelect(sc)}
                  className={`btn-press px-2.5 py-1 rounded-lg transition-all text-xs font-mono cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-emerald-700 font-bold shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sc === 'Home' && <Home className="w-3 h-3 text-emerald-600" />}
                  {sc === 'Away' && <ShieldAlert className="w-3 h-3 text-amber-600" />}
                  {sc === 'Night' && <Moon className="w-3 h-3 text-indigo-600" />}
                  {sc === 'Eco' && <Leaf className="w-3 h-3 text-teal-600" />}
                  {sc === 'Entertain' && <Sparkles className="w-3 h-3 text-purple-600" />}
                  <span>{sc}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSecurityToggle}
            className={`btn-press flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border cursor-pointer ${
              data?.security_mode === 'DISARMED'
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${data?.security_mode === 'DISARMED' ? 'text-slate-400' : 'text-rose-600'}`} />
            <span>{data?.security_mode || 'ARMED_HOME'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] border-l-4 border-l-blue-600 card-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Live Total Power
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight mt-2 tabular-nums">
            {kpis.total_power_kw.toFixed(2)} <span className="text-xs font-normal text-slate-400 font-sans">kW</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            <span>Solar PV: <strong className="text-emerald-700">+{kpis.solar_generation_kw.toFixed(1)} kW</strong></span>
            <span>Net Grid: <strong className="text-blue-700">{kpis.grid_net_kw > 0 ? `+${kpis.grid_net_kw} kW` : `${kpis.grid_net_kw} kW`}</strong></span>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] border-l-4 border-l-emerald-600 card-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Clean Solar &amp; Battery
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <BatteryCharging className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight mt-2 tabular-nums">
            {kpis.battery_soc_pct}% <span className="text-xs font-normal text-slate-400 font-sans">LFP Bank</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            <span>15 kWh Storage</span>
            <span className="text-emerald-700 font-bold">CHARGING (+2.1 kW)</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] border-l-4 border-l-amber-600 card-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Thermal Comfort &amp; IAQ
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Thermometer className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight mt-2 tabular-nums">
            {kpis.avg_indoor_temp_c.toFixed(1)}°C <span className="text-xs font-normal text-slate-400 font-sans">avg</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            <span>RH: <strong className="text-slate-800">{kpis.avg_indoor_humidity_rh.toFixed(0)}%</strong></span>
            <span className="text-emerald-700 font-bold">IAQ: {kpis.air_quality_iaq}</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] border-l-4 border-l-indigo-600 card-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Connected IoT Devices
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight mt-2 tabular-nums">
            {kpis.active_devices_count} <span className="text-xs font-normal text-slate-400 font-sans">/ {kpis.total_devices_count} Online</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            <span>Leak Monitor: <strong className="text-emerald-700">{kpis.water_leak_status}</strong></span>
            <span className="text-emerald-700 font-bold">ALL NOMINAL</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-sans tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Smart Home Interactive Real-Time Digital Twin
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live spatial floorplan with interactive device states, animated energy flows &amp; occupancy sensing
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500" />
              Active Load
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500" />
              Climate Running
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500/30 border border-blue-500" />
              EV Fast Charge
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto bg-[#F8FAFC] rounded-xl border border-slate-200/80 p-2 sm:p-4">
          <svg
            viewBox="0 0 1000 620"
            className="w-full min-w-[760px] h-auto select-none"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            <defs>
              <linearGradient id="solarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="livingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="bedroomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="kitchenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="garageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="officeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.02" />
              </linearGradient>

              <filter id="lightGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <rect x="20" y="20" width="960" height="90" rx="16" fill="url(#solarGrad)" stroke="#BAE6FD" strokeWidth="1.5" />
            <text x="40" y="48" fill="#0369A1" fontSize="12" fontWeight="700" fontFamily="monospace">ROOFTOP SOLAR PV ARRAY &amp; LFP STORAGE BANK</text>
            <text x="40" y="68" fill="#0284C7" fontSize="11" fontFamily="monospace">
              Solar Generation: 8.4 kW · Hybrid Inverter: Online · 15 kWh LFP Bank: 91% SoC (+2.1 kW Charging)
            </text>

            <g transform="translate(680, 36)">
              <rect x="0" y="0" width="130" height="42" rx="8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
              <text x="12" y="18" fill="#64748B" fontSize="9" fontWeight="600" fontFamily="sans-serif">PV GENERATION</text>
              <text x="12" y="34" fill="#0284C7" fontSize="13" fontWeight="700" fontFamily="monospace">+8.4 kW</text>
            </g>
            <g transform="translate(825, 36)">
              <rect x="0" y="0" width="130" height="42" rx="8" fill="#FFFFFF" stroke="#059669" strokeWidth="1" />
              <text x="12" y="18" fill="#64748B" fontSize="9" fontWeight="600" fontFamily="sans-serif">STORAGE BANK</text>
              <text x="12" y="34" fill="#059669" fontSize="13" fontWeight="700" fontFamily="monospace">91% (13.6 kWh)</text>
            </g>

            <path d="M 500 110 L 500 130" stroke="#0284C7" strokeWidth="2" strokeDasharray="4 4" className="flow-anim" />

            <g
              transform="translate(20, 130)"
              onClick={() => setSelectedRoomId('living_room')}
              className="cursor-pointer"
            >
              <rect
                x="0"
                y="0"
                width="460"
                height="230"
                rx="14"
                fill="url(#livingGrad)"
                stroke={selectedRoomId === 'living_room' ? '#2563EB' : '#E2E8F0'}
                strokeWidth={selectedRoomId === 'living_room' ? '2' : '1'}
              />
              <text x="20" y="30" fill="#0F172A" fontSize="13" fontWeight="700" fontFamily="sans-serif">LIVING ROOM &amp; MEDIA LOUNGE</text>
              <text x="20" y="48" fill="#64748B" fontSize="11" fontFamily="monospace">42 m² · 23.4°C · RH 48% · Motion Active</text>

              <circle cx="230" cy="115" r="32" fill="#FEF3C7" opacity="0.6" filter="url(#lightGlow)" />
              <circle cx="230" cy="115" r="14" fill="#F59E0B" />
              <text x="230" y="119" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">💡</text>
              <text x="230" y="142" textAnchor="middle" fill="#78350F" fontSize="10" fontWeight="600" fontFamily="monospace">Chandelier 80%</text>

              <rect x="30" y="80" width="90" height="38" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <text x="40" y="96" fill="#64748B" fontSize="9" fontFamily="sans-serif">4K Media</text>
              <text x="40" y="110" fill="#2563EB" fontSize="11" fontWeight="700" fontFamily="monospace">240 W</text>

              <rect x="330" y="80" width="105" height="44" rx="8" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1" />
              <text x="340" y="96" fill="#0369A1" fontSize="9" fontWeight="600" fontFamily="sans-serif">Inverter AC</text>
              <text x="340" y="112" fill="#0284C7" fontSize="11" fontWeight="700" fontFamily="monospace">COOL 22.5°C</text>
              <path d="M 340 118 Q 365 124 390 118" stroke="#38BDF8" strokeWidth="1.5" fill="none" className="flow-anim" />

              <g transform="translate(20, 185)">
                <rect x="0" y="0" width="75" height="26" rx="6" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1" />
                <text x="8" y="17" fill="#15803D" fontSize="10" fontWeight="700" fontFamily="monospace">OCCUPIED</text>
              </g>
            </g>

            <g
              transform="translate(500, 130)"
              onClick={() => setSelectedRoomId('master_bedroom')}
              className="cursor-pointer"
            >
              <rect
                x="0"
                y="0"
                width="480"
                height="230"
                rx="14"
                fill="url(#bedroomGrad)"
                stroke={selectedRoomId === 'master_bedroom' ? '#2563EB' : '#E2E8F0'}
                strokeWidth={selectedRoomId === 'master_bedroom' ? '2' : '1'}
              />
              <text x="20" y="30" fill="#0F172A" fontSize="13" fontWeight="700" fontFamily="sans-serif">MASTER BEDROOM SUITE</text>
              <text x="20" y="48" fill="#64748B" fontSize="11" fontFamily="monospace">28 m² · 22.8°C · RH 50% · Night Mode Standby</text>

              <rect x="40" y="90" width="140" height="90" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <rect x="50" y="100" width="120" height="30" rx="4" fill="#F1F5F9" />
              <text x="110" y="120" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600" fontFamily="sans-serif">King Bed</text>
              <circle cx="65" cy="148" r="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
              <circle cx="155" cy="148" r="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
              <text x="110" y="165" textAnchor="middle" fill="#78350F" fontSize="9" fontFamily="monospace">Bedside Lamps (40%)</text>

              <rect x="230" y="80" width="105" height="44" rx="8" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1" />
              <text x="240" y="96" fill="#0369A1" fontSize="9" fontWeight="600" fontFamily="sans-serif">Silent AC</text>
              <text x="240" y="112" fill="#0284C7" fontSize="11" fontWeight="700" fontFamily="monospace">COOL 22.0°C</text>

              <rect x="360" y="80" width="95" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <text x="370" y="96" fill="#64748B" fontSize="9" fontFamily="sans-serif">Smart Blinds</text>
              <text x="370" y="112" fill="#7C3AED" fontSize="11" fontWeight="700" fontFamily="monospace">65% Down</text>
            </g>

            <g
              transform="translate(20, 380)"
              onClick={() => setSelectedRoomId('kitchen')}
              className="cursor-pointer"
            >
              <rect
                x="0"
                y="0"
                width="300"
                height="220"
                rx="14"
                fill="url(#kitchenGrad)"
                stroke={selectedRoomId === 'kitchen' ? '#2563EB' : '#E2E8F0'}
                strokeWidth={selectedRoomId === 'kitchen' ? '2' : '1'}
              />
              <text x="20" y="30" fill="#0F172A" fontSize="13" fontWeight="700" fontFamily="sans-serif">SMART KITCHEN</text>
              <text x="20" y="48" fill="#64748B" fontSize="11" fontFamily="monospace">24 m² · 24.1°C · RH 52%</text>

              <rect x="30" y="70" width="110" height="50" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <text x="40" y="88" fill="#64748B" fontSize="9" fontFamily="sans-serif">Inverter Fridge</text>
              <text x="40" y="105" fill="#059669" fontSize="12" fontWeight="700" fontFamily="monospace">130 W</text>

              <rect x="160" y="70" width="110" height="50" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <text x="170" y="88" fill="#64748B" fontSize="9" fontFamily="sans-serif">Ventilation Hood</text>
              <text x="170" y="105" fill="#0284C7" fontSize="12" fontWeight="700" fontFamily="monospace">MED (75 W)</text>

              <g transform="translate(30, 140)">
                <rect x="0" y="0" width="130" height="28" rx="6" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1" />
                <text x="8" y="18" fill="#15803D" fontSize="10" fontWeight="700" fontFamily="monospace">Leak Sensor: SAFE</text>
              </g>
            </g>

            <g
              transform="translate(340, 380)"
              onClick={() => setSelectedRoomId('home_office')}
              className="cursor-pointer"
            >
              <rect
                x="0"
                y="0"
                width="290"
                height="220"
                rx="14"
                fill="url(#officeGrad)"
                stroke={selectedRoomId === 'home_office' ? '#2563EB' : '#E2E8F0'}
                strokeWidth={selectedRoomId === 'home_office' ? '2' : '1'}
              />
              <text x="20" y="30" fill="#0F172A" fontSize="13" fontWeight="700" fontFamily="sans-serif">HOME OFFICE</text>
              <text x="20" y="48" fill="#64748B" fontSize="11" fontFamily="monospace">18 m² · 23.0°C · 520 Lux</text>

              <rect x="30" y="70" width="110" height="50" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <text x="40" y="88" fill="#64748B" fontSize="9" fontFamily="sans-serif">Workstation Rig</text>
              <text x="40" y="105" fill="#2563EB" fontSize="12" fontWeight="700" fontFamily="monospace">380 W</text>

              <rect x="155" y="70" width="110" height="50" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <text x="165" y="88" fill="#64748B" fontSize="9" fontFamily="sans-serif">HEPA Purifier</text>
              <text x="165" y="105" fill="#059669" fontSize="12" fontWeight="700" fontFamily="monospace">AUTO (35 W)</text>

              <circle cx="210" cy="155" r="14" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
              <text x="210" y="159" textAnchor="middle" fill="#78350F" fontSize="10" fontWeight="bold">💡</text>
              <text x="80" y="160" fill="#64748B" fontSize="10" fontFamily="sans-serif">Architect Desk Light: 85%</text>
            </g>

            <g
              transform="translate(650, 380)"
              onClick={() => setSelectedRoomId('ev_garage')}
              className="cursor-pointer"
            >
              <rect
                x="0"
                y="0"
                width="330"
                height="220"
                rx="14"
                fill="url(#garageGrad)"
                stroke={selectedRoomId === 'ev_garage' ? '#2563EB' : '#E2E8F0'}
                strokeWidth={selectedRoomId === 'ev_garage' ? '2' : '1'}
              />
              <text x="20" y="30" fill="#0F172A" fontSize="13" fontWeight="700" fontFamily="sans-serif">EV GARAGE &amp; WORKSHOP</text>
              <text x="20" y="48" fill="#64748B" fontSize="11" fontFamily="monospace">35 m² · Door Closed · Secured</text>

              <rect x="30" y="70" width="180" height="60" rx="10" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.5" />
              <text x="42" y="90" fill="#1E40AF" fontSize="10" fontWeight="700" fontFamily="sans-serif">Level 2 EV Wallbox (32A)</text>
              <text x="42" y="112" fill="#2563EB" fontSize="15" fontWeight="700" fontFamily="monospace">7.20 kW</text>

              <g transform="translate(225, 75)">
                <rect x="0" y="0" width="80" height="50" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
                <text x="10" y="20" fill="#64748B" fontSize="9" fontFamily="sans-serif">EV BATTERY</text>
                <text x="10" y="40" fill="#059669" fontSize="14" fontWeight="700" fontFamily="monospace">78%</text>
              </g>

              <path d="M 210 100 L 225 100" stroke="#2563EB" strokeWidth="3" strokeDasharray="3 3" className="flow-anim" />

              <g transform="translate(30, 150)">
                <rect x="0" y="0" width="275" height="32" rx="6" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
                <text x="12" y="20" fill="#1E40AF" fontSize="10" fontWeight="600" fontFamily="monospace">
                  Solar Surplus Mode: Prioritizing 8.4 kW Rooftop PV
                </text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Zone Controls
                </span>
                <span className="text-slate-300">/</span>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
                  {selectedRoom?.name || 'Zone Devices'}
                </h3>
              </div>

              {selectedRoom?.target_temp_c !== undefined && (
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 font-mono text-xs">
                  <span className="text-slate-500">Thermostat:</span>
                  <button
                    onClick={() => handleTempAdjust(selectedRoom.id, selectedRoom.target_temp_c!, -0.5)}
                    className="btn-press p-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-slate-900 tabular-nums px-1">
                    {selectedRoom.target_temp_c.toFixed(1)}°C
                  </span>
                  <button
                    onClick={() => handleTempAdjust(selectedRoom.id, selectedRoom.target_temp_c!, 0.5)}
                    className="btn-press p-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {selectedRoom?.devices.map(device => {
                const isLight = device.type === 'light';
                const isClimate = device.type === 'climate';
                const isCharger = device.type === 'charger';

                return (
                  <div
                    key={device.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      device.state
                        ? 'bg-blue-50/40 border-blue-200/90 shadow-2xs'
                        : 'bg-slate-50/50 border-slate-200/70 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        device.state
                          ? isLight
                            ? 'bg-amber-50 border-amber-200 text-amber-600'
                            : isClimate
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : isCharger
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}>
                        {isLight && <Lightbulb className="w-4.5 h-4.5" />}
                        {isClimate && <Wind className="w-4.5 h-4.5" />}
                        {isCharger && <Car className="w-4.5 h-4.5" />}
                        {!isLight && !isClimate && !isCharger && <Power className="w-4.5 h-4.5" />}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 font-sans">{device.name}</div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          {device.state ? (
                            <span className="text-emerald-700 font-semibold">
                              ACTIVE {device.power_w > 0 && `· ${device.power_w} W`}
                            </span>
                          ) : (
                            <span className="text-slate-400">STANDBY · 0 W</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeviceToggle(selectedRoom.id, device.id, device.state)}
                      className={`btn-press w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        device.state ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs absolute top-0.75 transition-transform ${
                          device.state ? 'translate-x-5.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] p-4 sm:p-5">
            <h3 className="text-sm font-bold text-slate-900 font-sans tracking-tight mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              All Residence Zones Overview
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {rooms.map(room => {
                const isSelected = room.id === selectedRoomId;
                const activeCount = room.devices.filter(d => d.state).length;

                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`btn-press p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold font-sans truncate">{room.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-1 flex items-center justify-between">
                      <span>{room.temp_c}°C</span>
                      <span className="text-emerald-700 font-semibold">{activeCount} on</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-sans tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
                Live Real-Time Activity Feed
              </h3>
              <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                STREAMING
              </span>
            </div>

            <div className="mt-3 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {data?.activities?.map(act => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs font-sans space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">{act.time}</span>
                    <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      {act.room}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-800 leading-snug">
                    {act.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-4 space-y-2 text-xs text-emerald-950 font-sans">
            <div className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-emerald-600" />
              Net-Zero Solar Microgrid Logic
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
              The rooftop 10kW hybrid inverter automatically prioritizes direct solar PV self-consumption for high-load appliances and the EV Wallbox before storing surplus into the 15kWh LFP bank.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
