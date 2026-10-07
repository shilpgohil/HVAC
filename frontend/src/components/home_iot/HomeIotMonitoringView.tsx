'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Power,
  Sliders,
  Droplets,
  Layers,
  Activity, 
  Fan,
  Radio,
  ChevronRight,
  Gauge,
  Lock,
  Wifi,
  Plus,
  Minus
} from 'lucide-react';
import { HomeIotState, HomeIotRoom, HomeIotDevice } from '@/types/hvac';
import { 
  fetchHomeIotState, 
  toggleHomeIotDevice, 
  updateHomeIotRoomTemp, 
  activateHomeIotScene, 
  updateHomeIotSecurityMode,
  activateHomeIotScenario,
  setHomeIotDeviceLevel
} from '@/lib/api';

export function HomeIotMonitoringView() {
  const [data, setData] = useState<HomeIotState | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('living_room');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('solar_surplus');
  const [isScenarioLoading, setIsScenarioLoading] = useState<boolean>(false);
  const [activeFlowType, setActiveFlowType] = useState<'all' | 'power' | 'climate'>('all');

  const loadState = async () => {
    try {
      const state = await fetchHomeIotState();
      setData(state);
      if (state.active_scenario) {
        setActiveScenarioId(state.active_scenario);
      }
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

  const handleSliderChange = async (roomId: string, deviceId: string, newLevel: number) => {
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
              return { 
                ...d, 
                level: newLevel, 
                state: newLevel > 0,
                power_w: d.type === 'light' ? Math.round((newLevel / 100) * 60) : d.power_w
              };
            })
          };
        })
      };
    });

    try {
      await setHomeIotDeviceLevel(roomId, deviceId, newLevel);
    } catch {}
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
    try {
      await activateHomeIotScene(sceneName);
      await loadState();
    } catch {}
  };

  const handleScenarioDeploy = async (scenarioId: string) => {
    setIsScenarioLoading(true);
    setActiveScenarioId(scenarioId);
    try {
      await activateHomeIotScenario(scenarioId);
      await loadState();
    } finally {
      setIsScenarioLoading(false);
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

  const lrRoom = rooms.find(r => r.id === 'living_room');
  const mbrRoom = rooms.find(r => r.id === 'master_bedroom');
  const kitRoom = rooms.find(r => r.id === 'kitchen');
  const offRoom = rooms.find(r => r.id === 'home_office');
  const grRoom = rooms.find(r => r.id === 'ev_garage');

  const lrChandelier = lrRoom?.devices.find(d => d.id === 'lr_chandelier');
  const lrAc = lrRoom?.devices.find(d => d.id === 'lr_ac_split');
  const lrMedia = lrRoom?.devices.find(d => d.id === 'lr_smart_tv');

  const mbrLamps = mbrRoom?.devices.find(d => d.id === 'mbr_bedside_lamps');
  const mbrAc = mbrRoom?.devices.find(d => d.id === 'mbr_ac_split');
  const mbrBlinds = mbrRoom?.devices.find(d => d.id === 'mbr_smart_blinds');

  const kitFridge = kitRoom?.devices.find(d => d.id === 'kit_fridge');
  const kitHood = kitRoom?.devices.find(d => d.id === 'kit_hood');

  const offPc = offRoom?.devices.find(d => d.id === 'off_workstation');
  const offPurifier = offRoom?.devices.find(d => d.id === 'off_air_purifier');
  const offLight = offRoom?.devices.find(d => d.id === 'off_desk_lamp');

  const evCharger = grRoom?.devices.find(d => d.id === 'gr_ev_wallbox');

  const scenariosList = data?.scenarios || [
    { id: 'solar_surplus', name: 'Solar Surplus & EV Fast Charge', description: '8.8 kW rooftop solar PV surplus channeled to Level 2 EV Wallbox and 15kWh LFP bank.' },
    { id: 'peak_shaving', name: 'Peak Tariff Shaving (Zero Grid)', description: 'Evening grid peak; 15kWh battery discharges 3.8 kW to power household loads with 0 kW grid import.' },
    { id: 'entertainment', name: 'Luxury Ambiance & Cinema', description: 'Living Room chandelier at 100%, ambient coves in violet, 4K media center active, mini-split at 21.5°C.' },
    { id: 'night_guard', name: 'Silent Sleep & Perimeter Guard', description: 'All primary lights off, soft bedside lamps at 20%, silent AC in whisper mode, perimeter security fully armed.' },
    { id: 'eco_netzero', name: 'Eco Saver & Smart Net-Zero', description: 'Thermostats relaxed to 24.5°C, motorized shades lowered 75% to deflect solar heat gain.' },
    { id: 'grid_outage', name: 'Grid Blackout Microgrid Island', description: 'Utility grid supply offline; 10kW hybrid inverter islands residence on solar PV & LFP battery reserves.' },
    { id: 'vacation_away', name: 'Vacation Away & Flood Watch', description: 'All non-essential circuits isolated, security armed away, water leak sensors active with main shutoff.' },
    { id: 'heatwave_max', name: 'Heatwave Emergency Pre-Cool', description: 'High ambient 38°C; all inverter AC units modulate to max cooling capacity to preserve indoor comfort.' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              Matter &amp; Thread Mesh
            </span>
            <span className="text-slate-300">/</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Whole-Home Automation Twin</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Architectural schematic twin, solar microgrid energy bus, zoned climate distribution &amp; bi-directional telemetry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono">
            {['Home', 'Away', 'Night', 'Eco', 'Entertain'].map(sc => {
              const isActive = data?.active_scene === sc;
              return (
                <button
                  key={sc}
                  onClick={() => handleSceneSelect(sc)}
                  className={`btn-press px-2.5 py-1 rounded-lg transition-all text-xs font-mono cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-blue-700 font-bold shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sc === 'Home' && <Home className="w-3 h-3 text-blue-600" />}
                  {sc === 'Away' && <ShieldAlert className="w-3 h-3 text-amber-600" />}
                  {sc === 'Night' && <Moon className="w-3 h-3 text-indigo-600" />}
                  {sc === 'Eco' && <Leaf className="w-3 h-3 text-emerald-600" />}
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
                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
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
            <span>Solar PV: <strong className="text-emerald-700 font-semibold">+{kpis.solar_generation_kw.toFixed(1)} kW</strong></span>
            <span>Net Grid: <strong className={kpis.grid_net_kw <= 0 ? 'text-emerald-700 font-semibold' : 'text-blue-700 font-semibold'}>
              {kpis.grid_net_kw > 0 ? `+${kpis.grid_net_kw} kW` : `${kpis.grid_net_kw} kW`}
            </strong></span>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] border-l-4 border-l-emerald-600 card-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Clean Solar &amp; Storage
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <BatteryCharging className="w-4 h-4 text-emerald-600 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight mt-2 tabular-nums flex items-baseline gap-2">
            <span>{kpis.battery_soc_pct}%</span>
            <span className="text-xs font-normal text-slate-500 font-mono">
              ({((kpis.battery_soc_pct / 100) * 15).toFixed(1)} kWh)
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            <span>15 kWh LFP Pack</span>
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
            <span>RH: <strong className="text-slate-800 font-semibold">{kpis.avg_indoor_humidity_rh.toFixed(0)}%</strong></span>
            <span className="text-emerald-700 font-bold">IAQ: {kpis.air_quality_iaq}</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] border-l-4 border-l-indigo-600 card-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Connected IoT Mesh
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Radio className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight mt-2 tabular-nums">
            {kpis.active_devices_count} <span className="text-xs font-normal text-slate-400 font-sans">/ {kpis.total_devices_count} Online</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            <span>Leak Monitor: <strong className="text-emerald-700 font-semibold">{kpis.water_leak_status}</strong></span>
            <span className="text-emerald-700 font-bold">ALL NOMINAL</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-900 font-sans tracking-tight">
                Architectural Residence Digital Twin &amp; Intelligent Flow Schematic
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Vector CAD floorplan with live multi-bus power distribution, inverter refrigerant loops &amp; active device fields
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
              <button
                onClick={() => setActiveFlowType('all')}
                className={`btn-press px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                  activeFlowType === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Conduits
              </button>
              <button
                onClick={() => setActiveFlowType('power')}
                className={`btn-press px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                  activeFlowType === 'power'
                    ? 'bg-white text-amber-700 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Microgrid Bus
              </button>
              <button
                onClick={() => setActiveFlowType('climate')}
                className={`btn-press px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                  activeFlowType === 'climate'
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                HVAC Airflow
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2.5 text-[11px] font-mono text-slate-500 pl-2 border-l border-slate-200">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Solar/Power
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Cooling Loop
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                EV Conduit
              </span>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto bg-[#F8FAFC] rounded-2xl border border-slate-200/80 p-2 sm:p-4">
          <svg
            viewBox="0 0 1080 700"
            className="w-full min-w-[840px] h-auto select-none"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            <defs>
              <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="0.8" fill="#CBD5E1" opacity="0.6" />
              </pattern>

              <linearGradient id="solarCellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0369A1" />
                <stop offset="50%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#075985" />
              </linearGradient>

              <linearGradient id="inverterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#F1F5F9" />
              </linearGradient>

              <radialGradient id="lightConeGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#FDE047" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="readingLampGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#FDBA74" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FED7AA" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="deskLampGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.8" />
                <stop offset="55%" stopColor="#7DD3FC" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0" />
              </radialGradient>

              <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="powerGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <rect x="0" y="0" width="1080" height="700" fill="#F8FAFC" />
            <rect x="15" y="15" width="1050" height="670" fill="url(#cadGrid)" />

            <g id="rooftop_solar_section" transform="translate(25, 20)">
              <rect x="0" y="0" width="1030" height="105" rx="14" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
              <rect x="0" y="0" width="1030" height="105" rx="14" fill="#0284C7" opacity="0.03" />

              <g transform="translate(20, 15)">
                <text x="0" y="16" fill="#0369A1" fontSize="12" fontWeight="700" fontFamily="monospace" letterSpacing="0.5">
                  ROOFTOP SOLAR MICROGRID ARRAY (24x 420W BIFACIAL N-TYPE)
                </text>
                <text x="0" y="34" fill="#64748B" fontSize="11" fontFamily="sans-serif">
                  Total Capacity: 10.08 kWp · MPPT Efficiency: 98.4% · Sun Azimuth: 182° · Irradiance: 840 W/m²
                </text>
              </g>

              <g transform="translate(20, 48)">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(idx => (
                  <g key={idx} transform={`translate(${idx * 48}, 0)`}>
                    <rect x="0" y="0" width="44" height="42" rx="4" fill="url(#solarCellGrad)" stroke="#38BDF8" strokeWidth="1" />
                    <line x1="22" y1="0" x2="22" y2="42" stroke="#BAE6FD" strokeWidth="0.8" opacity="0.6" />
                    <line x1="0" y1="14" x2="44" y2="14" stroke="#BAE6FD" strokeWidth="0.8" opacity="0.6" />
                    <line x1="0" y1="28" x2="44" y2="28" stroke="#BAE6FD" strokeWidth="0.8" opacity="0.6" />
                    <rect x="2" y="2" width="40" height="38" rx="2" fill="#FFFFFF" className="shimmer-solar" />
                  </g>
                ))}
              </g>

              <g transform="translate(435, 18)">
                <rect x="0" y="0" width="180" height="70" rx="10" fill="url(#inverterGrad)" stroke="#E2E8F0" strokeWidth="1.2" />
                <circle cx="22" cy="22" r="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
                <path d="M 22 14 L 19 22 L 23 22 L 21 30 L 26 21 L 22 21 Z" fill="#D97706" />
                <text x="42" y="20" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="sans-serif">Hybrid Inverter</text>
                <text x="42" y="33" fill="#64748B" fontSize="9" fontFamily="monospace">10 kW DC/AC Pure Sine</text>
                <text x="42" y="52" fill="#0284C7" fontSize="13" fontWeight="700" fontFamily="monospace">
                  +{kpis.solar_generation_kw.toFixed(1)} kW
                </text>
                <circle cx="160" cy="22" r="4" fill="#10B981" />
              </g>

              <g transform="translate(635, 18)">
                <rect x="0" y="0" width="185" height="70" rx="10" fill="url(#inverterGrad)" stroke="#E2E8F0" strokeWidth="1.2" />
                <circle cx="22" cy="22" r="12" fill="#DCFCE7" stroke="#10B981" strokeWidth="1" />
                <rect x="14" y="16" width="16" height="12" rx="2" fill="none" stroke="#059669" strokeWidth="1.2" />
                <rect x="30" y="19" width="2" height="6" rx="1" fill="#059669" />
                <rect x="16" y="18" width={Math.max(2, (kpis.battery_soc_pct / 100) * 12)} height="8" rx="1" fill="#10B981" />
                <text x="42" y="20" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="sans-serif">15 kWh LFP Storage</text>
                <text x="42" y="33" fill="#64748B" fontSize="9" fontFamily="monospace">Powerwall 3 / 48V Bus</text>
                <text x="42" y="52" fill="#059669" fontSize="13" fontWeight="700" fontFamily="monospace">
                  {kpis.battery_soc_pct}% ({((kpis.battery_soc_pct / 100) * 15).toFixed(1)} kWh)
                </text>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">+2.1 kW</span>
              </g>

              <g transform="translate(840, 18)">
                <rect x="0" y="0" width="170" height="70" rx="10" fill="url(#inverterGrad)" stroke="#E2E8F0" strokeWidth="1.2" />
                <circle cx="22" cy="22" r="12" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1" />
                <path d="M 17 26 L 22 15 L 27 26 Z M 22 17 L 22 28" stroke="#1D4ED8" strokeWidth="1.2" fill="none" />
                <text x="42" y="20" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="sans-serif">Bi-Directional Grid</text>
                <text x="42" y="33" fill="#64748B" fontSize="9" fontFamily="monospace">240V Split Phase 200A</text>
                <text x="42" y="52" fill="#2563EB" fontSize="13" fontWeight="700" fontFamily="monospace">
                  {kpis.grid_net_kw > 0 ? `+${kpis.grid_net_kw.toFixed(2)} kW` : `${kpis.grid_net_kw.toFixed(2)} kW`}
                </text>
              </g>
            </g>

            <g id="architectural_floorplan" transform="translate(25, 145)">
              <rect x="0" y="0" width="1030" height="525" rx="16" fill="#FFFFFF" stroke="#475569" strokeWidth="3" />
              <rect x="3" y="3" width="1024" height="519" rx="14" fill="none" stroke="#94A3B8" strokeWidth="1" />

              <g id="room_living" onClick={() => setSelectedRoomId('living_room')} className="cursor-pointer">
                <rect
                  x="6"
                  y="6"
                  width="500"
                  height="260"
                  fill={selectedRoomId === 'living_room' ? '#EFF6FF' : '#FFFFFF'}
                  stroke={selectedRoomId === 'living_room' ? '#2563EB' : '#CBD5E1'}
                  strokeWidth={selectedRoomId === 'living_room' ? 2 : 1}
                  rx="10"
                />

                <rect x="18" y="16" width="300" height="28" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <text x="28" y="34" fill="#0F172A" fontSize="12" fontWeight="700" fontFamily="sans-serif">
                  LIVING ROOM &amp; MEDIA LOUNGE
                </text>
                <text x="328" y="34" fill="#64748B" fontSize="11" fontFamily="monospace">
                  42 m² · {lrRoom?.temp_c || 23.4}°C · RH {lrRoom?.humidity_rh || 48}%
                </text>

                <g transform="translate(60, 80)">
                  <rect x="0" y="0" width="160" height="60" rx="8" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" />
                  <rect x="10" y="10" width="140" height="40" rx="4" fill="#E2E8F0" />
                  <rect x="10" y="45" width="140" height="15" rx="2" fill="#CBD5E1" />
                  <rect x="150" y="10" width="50" height="120" rx="8" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" />
                  <rect x="160" y="20" width="30" height="100" rx="4" fill="#E2E8F0" />
                  <text x="80" y="35" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600" fontFamily="sans-serif">Sectional Lounge</text>
                </g>

                <g transform="translate(290, 75)">
                  <rect
                    x="0"
                    y="0"
                    width="180"
                    height="45"
                    rx="8"
                    fill={lrMedia?.state ? '#0F172A' : '#F8FAFC'}
                    stroke={lrMedia?.state ? '#3B82F6' : '#CBD5E1'}
                    strokeWidth="1.5"
                  />
                  <rect x="8" y="8" width="164" height="29" rx="4" fill={lrMedia?.state ? '#1E293B' : '#E2E8F0'} />
                  {lrMedia?.state && (
                    <line x1="8" y1="36" x2="172" y2="36" stroke="#38BDF8" strokeWidth="2" filter="url(#powerGlow)" />
                  )}
                  <text x="18" y="26" fill={lrMedia?.state ? '#FFFFFF' : '#64748B'} fontSize="10" fontWeight="700" fontFamily="sans-serif">
                    75" 4K OLED Smart TV
                  </text>
                  <text x="135" y="26" fill={lrMedia?.state ? '#60A5FA' : '#94A3B8'} fontSize="10" fontWeight="700" fontFamily="monospace">
                    {lrMedia?.state ? `${lrMedia.power_w} W` : 'OFF'}
                  </text>
                </g>

                <g transform="translate(180, 180)">
                  {lrChandelier?.state && (
                    <circle cx="45" cy="25" r="75" fill="url(#lightConeGrad)" />
                  )}
                  <circle
                    cx="45"
                    cy="25"
                    r="18"
                    fill={lrChandelier?.state ? '#FEF08A' : '#F1F5F9'}
                    stroke={lrChandelier?.state ? '#EAB308' : '#94A3B8'}
                    strokeWidth="1.5"
                    filter={lrChandelier?.state ? 'url(#softGlow)' : undefined}
                  />
                  <circle cx="45" cy="25" r="8" fill={lrChandelier?.state ? '#CA8A04' : '#CBD5E1'} />
                  <line x1="45" y1="7" x2="45" y2="2" stroke="#CA8A04" strokeWidth="1.5" />
                  <line x1="45" y1="43" x2="45" y2="48" stroke="#CA8A04" strokeWidth="1.5" />
                  <line x1="27" y1="25" x2="22" y2="25" stroke="#CA8A04" strokeWidth="1.5" />
                  <line x1="63" y1="25" x2="68" y2="25" stroke="#CA8A04" strokeWidth="1.5" />
                  <text x="45" y="58" textAnchor="middle" fill="#78350F" fontSize="10" fontWeight="700" fontFamily="monospace">
                    Chandelier {lrChandelier?.level ?? 80}%
                  </text>
                </g>

                <g transform="translate(320, 150)">
                  <rect x="0" y="0" width="150" height="55" rx="8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.2" />
                  <g transform="translate(15, 20)">
                    <circle cx="12" cy="12" r="10" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1" />
                    <g className={lrAc?.state ? 'spin-fast' : ''} style={{ transformOrigin: '12px 12px' }}>
                      <path d="M 12 5 Q 16 9 12 12 Q 8 15 12 19" stroke="#0284C7" strokeWidth="1.5" fill="none" />
                      <path d="M 5 12 Q 9 8 12 12 Q 15 16 19 12" stroke="#0284C7" strokeWidth="1.5" fill="none" />
                    </g>
                  </g>
                  <text x="45" y="24" fill="#0369A1" fontSize="10" fontWeight="700" fontFamily="sans-serif">Inverter AC Split</text>
                  <text x="45" y="38" fill="#0284C7" fontSize="11" fontWeight="700" fontFamily="monospace">
                    COOL {lrRoom?.target_temp_c || 22.5}°C
                  </text>
                  {lrAc?.state && (
                    <path d="M 45 44 Q 90 49 135 44" stroke="#38BDF8" strokeWidth="2" fill="none" className="flow-anim" />
                  )}
                </g>

                <g transform="translate(25, 220)">
                  <rect x="0" y="0" width="105" height="28" rx="6" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1" />
                  <circle cx="14" cy="14" r="4" fill="#15803D" />
                  <text x="24" y="18" fill="#15803D" fontSize="10" fontWeight="700" fontFamily="monospace">PIR OCCUPIED</text>
                </g>
              </g>

              <g id="room_bedroom" onClick={() => setSelectedRoomId('master_bedroom')} className="cursor-pointer">
                <rect
                  x="514"
                  y="6"
                  width="510"
                  height="260"
                  fill={selectedRoomId === 'master_bedroom' ? '#F5F3FF' : '#FFFFFF'}
                  stroke={selectedRoomId === 'master_bedroom' ? '#7C3AED' : '#CBD5E1'}
                  strokeWidth={selectedRoomId === 'master_bedroom' ? 2 : 1}
                  rx="10"
                />

                <rect x="526" y="16" width="280" height="28" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <text x="536" y="34" fill="#0F172A" fontSize="12" fontWeight="700" fontFamily="sans-serif">
                  MASTER BEDROOM SUITE
                </text>
                <text x="816" y="34" fill="#64748B" fontSize="11" fontFamily="monospace">
                  28 m² · {mbrRoom?.temp_c || 22.8}°C · Silent Mode
                </text>

                <g transform="translate(540, 80)">
                  <rect x="0" y="0" width="150" height="130" rx="8" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.2" />
                  <rect x="10" y="10" width="130" height="35" rx="4" fill="#E2E8F0" />
                  <text x="75" y="32" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="700" fontFamily="sans-serif">King Bed Suite</text>
                  <rect x="15" y="55" width="55" height="30" rx="3" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
                  <rect x="80" y="55" width="55" height="30" rx="3" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
                  <rect x="10" y="95" width="130" height="25" rx="3" fill="#CBD5E1" />

                  {mbrLamps?.state && (
                    <>
                      <circle cx="-12" cy="30" r="35" fill="url(#readingLampGrad)" />
                      <circle cx="162" cy="30" r="35" fill="url(#readingLampGrad)" />
                    </>
                  )}
                  <circle cx="-12" cy="30" r="9" fill={mbrLamps?.state ? '#FED7AA' : '#F1F5F9'} stroke="#EA580C" strokeWidth="1.2" />
                  <circle cx="162" cy="30" r="9" fill={mbrLamps?.state ? '#FED7AA' : '#F1F5F9'} stroke="#EA580C" strokeWidth="1.2" />
                  <text x="75" y="150" textAnchor="middle" fill="#9A3412" fontSize="9" fontWeight="700" fontFamily="monospace">
                    Reading Lamps ({mbrLamps?.level ?? 20}%)
                  </text>
                </g>

                <g transform="translate(740, 75)">
                  <rect x="0" y="0" width="130" height="55" rx="8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.2" />
                  <g transform="translate(14, 18)">
                    <circle cx="10" cy="10" r="8" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1" />
                    <g className={mbrAc?.state ? 'spin-slow' : ''} style={{ transformOrigin: '10px 10px' }}>
                      <path d="M 10 4 Q 13 7 10 10 Q 7 13 10 16" stroke="#0284C7" strokeWidth="1.2" fill="none" />
                      <path d="M 4 10 Q 7 7 10 10 Q 13 13 16 10" stroke="#0284C7" strokeWidth="1.2" fill="none" />
                    </g>
                  </g>
                  <text x="38" y="22" fill="#0369A1" fontSize="10" fontWeight="700" fontFamily="sans-serif">Whisper AC</text>
                  <text x="38" y="38" fill="#0284C7" fontSize="11" fontWeight="700" fontFamily="monospace">
                    COOL {mbrRoom?.target_temp_c || 22.0}°C
                  </text>
                </g>

                <g transform="translate(885, 75)">
                  <rect x="0" y="0" width="120" height="55" rx="8" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="1.2" />
                  <text x="12" y="20" fill="#6D28D9" fontSize="10" fontWeight="700" fontFamily="sans-serif">Motorized Blinds</text>
                  <text x="12" y="38" fill="#7C3AED" fontSize="12" fontWeight="700" fontFamily="monospace">
                    {mbrBlinds?.level ?? 65}% Down
                  </text>
                  <g transform="translate(12, 43)">
                    {[0, 1, 2, 3, 4].map(s => (
                      <line key={s} x1="0" y1={s * 2} x2="96" y2={s * 2} stroke="#A78BFA" strokeWidth="1" />
                    ))}
                  </g>
                </g>

                <g transform="translate(740, 155)">
                  <rect x="0" y="0" width="265" height="50" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                  <text x="14" y="22" fill="#0F172A" fontSize="10" fontWeight="700" fontFamily="sans-serif">Air Quality &amp; Acoustics</text>
                  <text x="14" y="38" fill="#64748B" fontSize="10" fontFamily="monospace">
                    Sound Level: 21 dBA (Whisper) · PM2.5: 2 µg/m³
                  </text>
                </g>
              </g>

              <line x1="6" y1="270" x2="1024" y2="270" stroke="#475569" strokeWidth="2.5" />
              <line x1="508" y1="6" x2="508" y2="270" stroke="#475569" strokeWidth="2.5" />
              <line x1="340" y1="270" x2="340" y2="519" stroke="#475569" strokeWidth="2.5" />
              <line x1="680" y1="270" x2="680" y2="519" stroke="#475569" strokeWidth="2.5" />

              <g id="room_kitchen" onClick={() => setSelectedRoomId('kitchen')} className="cursor-pointer">
                <rect
                  x="6"
                  y="274"
                  width="330"
                  height="245"
                  fill={selectedRoomId === 'kitchen' ? '#ECFDF5' : '#FFFFFF'}
                  stroke={selectedRoomId === 'kitchen' ? '#059669' : '#CBD5E1'}
                  strokeWidth={selectedRoomId === 'kitchen' ? 2 : 1}
                  rx="10"
                />

                <rect x="18" y="284" width="200" height="26" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <text x="28" y="301" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="sans-serif">
                  SMART CHEF KITCHEN
                </text>

                <g transform="translate(25, 330)">
                  <rect x="0" y="0" width="95" height="80" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                  <rect x="8" y="8" width="79" height="30" rx="4" fill="#E2E8F0" />
                  <rect x="8" y="42" width="79" height="30" rx="4" fill="#F1F5F9" />
                  <text x="47" y="26" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="700" fontFamily="sans-serif">Inverter Fridge</text>
                  <text x="47" y="62" textAnchor="middle" fill="#059669" fontSize="11" fontWeight="700" fontFamily="monospace">
                    {kitFridge?.state ? `${kitFridge.power_w} W` : 'STANDBY'}
                  </text>
                </g>

                <g transform="translate(135, 330)">
                  <rect x="0" y="0" width="85" height="80" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="1" />
                  <circle cx="28" cy="28" r="16" fill="none" stroke="#EA580C" strokeWidth="2" filter="url(#powerGlow)" />
                  <circle cx="28" cy="28" r="8" fill="none" stroke="#F97316" strokeWidth="1.5" />
                  <circle cx="58" cy="52" r="14" fill="none" stroke="#EA580C" strokeWidth="1.5" />
                  <text x="42" y="74" textAnchor="middle" fill="#FED7AA" fontSize="8" fontWeight="700" fontFamily="monospace">Induction 2.2kW</text>
                </g>

                <g transform="translate(230, 330)">
                  <rect x="0" y="0" width="90" height="80" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                  <circle cx="45" cy="30" r="16" fill="#F8FAFC" stroke="#0284C7" strokeWidth="1.2" />
                  <g className={kitHood?.state ? 'spin-fast' : ''} style={{ transformOrigin: '45px 30px' }}>
                    <line x1="45" y1="16" x2="45" y2="44" stroke="#0284C7" strokeWidth="1.5" />
                    <line x1="31" y1="30" x2="59" y2="30" stroke="#0284C7" strokeWidth="1.5" />
                  </g>
                  <text x="45" y="58" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600" fontFamily="sans-serif">Range Hood</text>
                  <text x="45" y="70" textAnchor="middle" fill="#0284C7" fontSize="9" fontWeight="700" fontFamily="monospace">
                    {kitHood?.state ? `${kitHood.power_w} W` : 'OFF'}
                  </text>
                </g>

                <g transform="translate(25, 435)">
                  <rect x="0" y="0" width="130" height="26" rx="6" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1" />
                  <circle cx="14" cy="13" r="4" fill="#15803D" />
                  <text x="24" y="17" fill="#15803D" fontSize="10" fontWeight="700" fontFamily="monospace">Leak Sensor: DRY</text>
                </g>
              </g>

              <g id="room_office" onClick={() => setSelectedRoomId('home_office')} className="cursor-pointer">
                <rect
                  x="344"
                  y="274"
                  width="332"
                  height="245"
                  fill={selectedRoomId === 'home_office' ? '#ECFEFF' : '#FFFFFF'}
                  stroke={selectedRoomId === 'home_office' ? '#0891B2' : '#CBD5E1'}
                  strokeWidth={selectedRoomId === 'home_office' ? 2 : 1}
                  rx="10"
                />

                <rect x="356" y="284" width="200" height="26" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <text x="366" y="301" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="sans-serif">
                  HOME OFFICE &amp; STUDIO
                </text>

                <g transform="translate(365, 330)">
                  <rect x="0" y="0" width="180" height="80" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
                  <rect x="15" y="15" width="70" height="35" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />
                  <rect x="95" y="15" width="70" height="35" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />
                  <line x1="50" y1="50" x2="50" y2="58" stroke="#64748B" strokeWidth="2" />
                  <line x1="130" y1="50" x2="130" y2="58" stroke="#64748B" strokeWidth="2" />
                  <text x="90" y="72" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="700" fontFamily="sans-serif">
                    Dual 4K Studio Setup ({offPc?.power_w || 380} W)
                  </text>
                </g>

                <g transform="translate(560, 330)">
                  <rect x="0" y="0" width="100" height="80" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                  <circle cx="50" cy="30" r="18" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.2" />
                  <g className={offPurifier?.state ? 'spin-fast' : ''} style={{ transformOrigin: '50px 30px' }}>
                    <circle cx="50" cy="30" r="8" fill="none" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" />
                  </g>
                  <text x="50" y="58" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600" fontFamily="sans-serif">HEPA Purifier</text>
                  <text x="50" y="70" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="700" fontFamily="monospace">
                    {offPurifier?.state ? `${offPurifier.power_w} W` : 'OFF'}
                  </text>
                </g>

                <g transform="translate(365, 430)">
                  <rect x="0" y="0" width="295" height="35" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                  <text x="14" y="22" fill="#0F172A" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                    Architect Task Light: <strong className="text-blue-700 font-mono">{offLight?.level ?? 85}%</strong> · 520 Lux
                  </text>
                </g>
              </g>

              <g id="room_garage" onClick={() => setSelectedRoomId('ev_garage')} className="cursor-pointer">
                <rect
                  x="684"
                  y="274"
                  width="340"
                  height="245"
                  fill={selectedRoomId === 'ev_garage' ? '#EFF6FF' : '#FFFFFF'}
                  stroke={selectedRoomId === 'ev_garage' ? '#2563EB' : '#CBD5E1'}
                  strokeWidth={selectedRoomId === 'ev_garage' ? 2 : 1}
                  rx="10"
                />

                <rect x="696" y="284" width="220" height="26" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <text x="706" y="301" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="sans-serif">
                  EV GARAGE &amp; HIGH-VOLTAGE BAY
                </text>

                <g transform="translate(705, 330)">
                  <rect x="0" y="0" width="130" height="110" rx="10" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.5" />
                  <circle cx="24" cy="24" r="14" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.2" />
                  <path d="M 24 14 L 19 24 L 24 24 L 23 34 L 29 23 L 24 23 Z" fill="#2563EB" />
                  <text x="44" y="22" fill="#1E40AF" fontSize="10" fontWeight="700" fontFamily="sans-serif">Level 2 Wallbox</text>
                  <text x="44" y="34" fill="#64748B" fontSize="9" fontFamily="monospace">32A / 240V AC</text>
                  <text x="14" y="65" fill="#2563EB" fontSize="16" fontWeight="700" fontFamily="monospace">
                    {evCharger?.state ? '7.20 kW' : '0.00 kW'}
                  </text>
                  <rect x="14" y="75" width="102" height="22" rx="4" fill={evCharger?.state ? '#DBEAFE' : '#F1F5F9'} />
                  <text x="65" y="90" textAnchor="middle" fill={evCharger?.state ? '#1E40AF' : '#64748B'} fontSize="9" fontWeight="700" fontFamily="monospace">
                    {evCharger?.state ? 'FAST CHARGING' : 'STANDBY'}
                  </text>
                </g>

                <g transform="translate(850, 330)">
                  <rect x="0" y="0" width="155" height="110" rx="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
                  <g transform="translate(18, 15)">
                    <rect x="0" y="0" width="120" height="45" rx="8" fill="#1E293B" />
                    <rect x="15" y="6" width="35" height="15" rx="3" fill="#38BDF8" opacity="0.8" />
                    <rect x="60" y="6" width="45" height="15" rx="3" fill="#38BDF8" opacity="0.8" />
                    <circle cx="25" cy="45" r="9" fill="#0F172A" stroke="#64748B" strokeWidth="2" />
                    <circle cx="95" cy="45" r="9" fill="#0F172A" stroke="#64748B" strokeWidth="2" />
                  </g>
                  <text x="20" y="80" fill="#0F172A" fontSize="10" fontWeight="700" fontFamily="sans-serif">Model 3 Long Range</text>
                  <text x="20" y="96" fill="#059669" fontSize="12" fontWeight="700" fontFamily="monospace">
                    Battery: 78% (58 kWh)
                  </text>
                </g>

                {evCharger?.state && (
                  <path
                    d="M 835 385 C 840 385, 845 385, 850 385"
                    stroke="#2563EB"
                    strokeWidth="3.5"
                    strokeDasharray="4 4"
                    className="flow-anim-fast"
                  />
                )}

                <g transform="translate(705, 455)">
                  <rect x="0" y="0" width="300" height="28" rx="6" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
                  <text x="12" y="18" fill="#1E40AF" fontSize="10" fontWeight="600" fontFamily="monospace">
                    Surplus Routing: Rooftop PV prioritizes EV Battery
                  </text>
                </g>
              </g>
            </g>

            {(activeFlowType === 'all' || activeFlowType === 'power') && (
              <g id="dynamic_power_bus_conduits" pointerEvents="none">
                <path
                  d="M 525 90 L 525 145"
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  strokeDasharray="6 6"
                  className="flow-anim"
                  filter="url(#powerGlow)"
                />
                <path
                  d="M 525 145 L 205 145 L 205 270"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  className="flow-anim"
                />
                <path
                  d="M 525 145 L 770 145 L 770 330"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  className="flow-anim-fast"
                  filter="url(#powerGlow)"
                />
              </g>
            )}

            {(activeFlowType === 'all' || activeFlowType === 'climate') && (
              <g id="dynamic_climate_airflow_conduits" pointerEvents="none">
                <path
                  d="M 470 195 C 430 220, 380 225, 340 220"
                  stroke="#38BDF8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="flow-anim"
                  fill="none"
                />
                <path
                  d="M 740 100 C 700 120, 650 125, 600 120"
                  stroke="#38BDF8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="flow-anim"
                  fill="none"
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900 font-sans tracking-tight">
                Deep Autonomous Automation Scenarios
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deploy whole-home energy, climate, security &amp; storage operating profiles with synchronized multi-zone transitions
            </p>
          </div>

          <span className="text-xs font-mono text-slate-500">
            Active: <strong className="text-purple-700 font-bold">{scenariosList.find(s => s.id === activeScenarioId)?.name || activeScenarioId}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenariosList.map(sc => {
            const isSelected = sc.id === activeScenarioId;

            return (
              <button
                key={sc.id}
                onClick={() => handleScenarioDeploy(sc.id)}
                disabled={isScenarioLoading}
                className={`btn-press p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-50/90 border-purple-300 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold font-sans ${isSelected ? 'text-purple-900' : 'text-slate-900'}`}>
                      {sc.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-sans line-clamp-2">
                    {sc.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                  <span className={isSelected ? 'text-purple-700 font-bold' : 'text-slate-400'}>
                    {isSelected ? 'DEPLOYED' : 'ARM SCENARIO'}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-700' : 'text-slate-400'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  Precision Sliders &amp; Actuators
                </span>
                <span className="text-slate-300">/</span>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
                  {selectedRoom?.name || 'Selected Room Controls'}
                </h3>
              </div>

              {selectedRoom?.target_temp_c !== undefined && (
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-xs">
                  <span className="text-slate-500 font-sans">Climate Setpoint:</span>
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

            <div className="space-y-4 mt-4">
              {selectedRoom?.devices.map(device => {
                const isLight = device.type === 'light';
                const isCover = device.type === 'cover';
                const isClimate = device.type === 'climate';
                const isCharger = device.type === 'charger';
                const hasSlider = isLight || isCover;

                return (
                  <div
                    key={device.id}
                    className={`p-4 rounded-xl border transition-all ${
                      device.state
                        ? 'bg-blue-50/30 border-blue-200/90 shadow-2xs'
                        : 'bg-slate-50/50 border-slate-200/70 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          device.state
                            ? isLight
                              ? 'bg-amber-50 border-amber-200 text-amber-600'
                              : isClimate
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : isCharger
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                              : isCover
                              ? 'bg-purple-50 border-purple-200 text-purple-600'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          {isLight && <Lightbulb className="w-5 h-5" />}
                          {isClimate && <Wind className="w-5 h-5" />}
                          {isCharger && <Car className="w-5 h-5" />}
                          {isCover && <Sliders className="w-5 h-5" />}
                          {!isLight && !isClimate && !isCharger && !isCover && <Power className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="text-sm font-bold text-slate-900 font-sans">{device.name}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-2">
                            {device.state ? (
                              <span className="text-emerald-700 font-semibold">
                                ACTIVE {device.power_w > 0 && `· ${device.power_w} W`}
                              </span>
                            ) : (
                              <span className="text-slate-400">STANDBY · 0 W</span>
                            )}
                            {hasSlider && (
                              <span className="text-slate-400">· Level: <strong className="text-slate-700">{device.level ?? 0}%</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeviceToggle(selectedRoom.id, device.id, device.state)}
                        className={`btn-press w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                          device.state ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.75 transition-transform ${
                            device.state ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {hasSlider && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500 w-16">
                          {isCover ? 'Blind Slat' : 'Dimmer'}:
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={device.level ?? 0}
                          onChange={(e) => handleSliderChange(selectedRoom.id, device.id, parseInt(e.target.value, 10))}
                          className="smooth-slider flex-1"
                        />
                        <span className="text-xs font-mono font-bold text-slate-900 w-10 text-right tabular-nums">
                          {device.level ?? 0}%
                        </span>
                      </div>
                    )}
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
              The rooftop 10kW hybrid inverter automatically prioritizes direct solar PV self-consumption for high-load appliances and the Level 2 EV Wallbox before storing surplus into the 15kWh LFP bank.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
