'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  ChevronDown, 
  Search, 
  Command, 
  Zap, 
  Snowflake, 
  Activity, 
  Menu,
  Gauge,
  Thermometer,
  Wind,
  Layers,
  Check
} from 'lucide-react';
import { LivingBrandLogo } from '@/components/common/LivingBrandLogo';
import { SystemState } from '@/types/hvac';
import { fetchScenarios, switchScenario, ScenarioItem } from '@/lib/api';

export type SystemMode = 'hvac' | 'electrical';

interface TopHeaderProps {
  activeSystem: SystemMode;
  onSelectSystem: (mode: SystemMode) => void;
  alarmCount?: number;
  onToggleMobileSidebar?: () => void;
  systemState?: SystemState | null;
  wsConnected?: boolean;
}

export function TopHeader({ 
  activeSystem, 
  onSelectSystem, 
  alarmCount = 0,
  onToggleMobileSidebar,
  systemState,
  wsConnected = true
}: TopHeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<number>(1);
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleString('en-US', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchScenarios()
      .then((data) => {
        setScenarios(data);
        const active = data.find((s) => s.active);
        if (active) setActiveScenarioId(active.scenario_id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsScenarioDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectScenario = async (scId: number) => {
    setActiveScenarioId(scId);
    setIsScenarioDropdownOpen(false);
    try {
      await switchScenario(scId);
      const updated = await fetchScenarios();
      setScenarios(updated);
    } catch {}
  };

  const activeScenario = scenarios.find((s) => s.scenario_id === activeScenarioId);

  const supplyTemp = systemState?.temperatures?.supply_c ?? 18.2;
  const returnTemp = systemState?.temperatures?.return_c ?? 26.7;
  const totalPower = systemState?.system_info?.total_power_kw ?? 132.8;
  const ductPressure = systemState?.ahu?.filter_dp_pa ?? 120.0;

  const systemHealth = alarmCount > 3 ? 'CRITICAL' : (alarmCount > 0 ? 'WARNING' : 'HEALTHY');

  return (
    <header className="h-16 px-4 md:px-6 surface-panel border-b border-white/10 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
      <div className="flex items-center gap-3 md:gap-4">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
        )}

        <LivingBrandLogo systemHealth={systemHealth} size="sm" showWordmark={true} />

        <div className="relative hidden xl:flex items-center">
          <div className="flex items-center gap-2 bg-[#020617]/80 border border-white/10 hover:border-cyan-500/40 px-3 py-1.5 rounded-xl w-60 transition-all text-xs text-slate-400 group">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search points, registers, tags..." 
              className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full text-xs font-sans"
            />
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-[10px] font-mono text-slate-400 shrink-0">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4 py-1 px-3 surface-well rounded-xl border border-white/5 font-mono text-xs">
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">SAT:</span>
          <span className="font-bold text-white tabular-nums">{supplyTemp.toFixed(1)}°C</span>
        </div>
        <div className="w-px h-3 bg-slate-700/60" />
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">RAT:</span>
          <span className="font-bold text-white tabular-nums">{returnTemp.toFixed(1)}°C</span>
        </div>
        <div className="w-px h-3 bg-slate-700/60" />
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">LOAD:</span>
          <span className="font-bold text-white tabular-nums">{totalPower.toFixed(1)} kW</span>
        </div>
        <div className="w-px h-3 bg-slate-700/60" />
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">DP:</span>
          <span className="font-bold text-white tabular-nums">{ductPressure.toFixed(0)} Pa</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 md:gap-3.5">
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsScenarioDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl surface-well hover:border-cyan-500/40 border border-white/10 transition-colors text-xs font-mono text-slate-200"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-semibold">Scenario:</span>
            <span className="text-cyan-400 font-bold max-w-[120px] truncate">
              {activeScenario?.name ?? `Scenario ${activeScenarioId}`}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isScenarioDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 surface-panel rounded-xl border border-white/15 shadow-2xl p-1.5 z-50 animate-in fade-in duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/10">
                12 Thermodynamic Test Scenarios
              </div>
              <div className="max-h-64 overflow-y-auto space-y-0.5 mt-1">
                {scenarios.map((sc) => (
                  <button
                    key={sc.scenario_id}
                    onClick={() => handleSelectScenario(sc.scenario_id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                      sc.scenario_id === activeScenarioId
                        ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="text-slate-500 mr-1.5">#{sc.scenario_id}</span>
                      <span>{sc.name}</span>
                    </div>
                    {sc.scenario_id === activeScenarioId && (
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 surface-well border border-white/10 px-2.5 py-1 rounded-xl text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className={wsConnected ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
            {wsConnected ? 'LIVE BUS' : 'OFFLINE'}
          </span>
        </div>

        <div className="hidden md:flex items-center p-0.5 surface-well border border-white/10 rounded-xl">
          <button
            onClick={() => onSelectSystem('hvac')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              activeSystem === 'hvac'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Snowflake className="w-3 h-3 text-cyan-400" />
            <span>HVAC</span>
          </button>
          <button
            onClick={() => onSelectSystem('electrical')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              activeSystem === 'electrical'
                ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-blue-400" />
            <span>GRID</span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400 hidden 2xl:block">
          {timeStr}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-xl bg-slate-800/90 border border-white/10 flex items-center justify-center text-cyan-400 shadow-inner">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden xl:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-200">Plant Operator</div>
            <div className="text-[10px] text-cyan-400 font-mono">Supervisory Level 3</div>
          </div>
        </div>
      </div>
    </header>
  );
}
