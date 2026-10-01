'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  ChevronDown, 
  Search, 
  Command, 
  Zap, 
  Snowflake, 
  Menu,
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
    <header className="h-14 md:h-16 px-3 md:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      <div className="flex items-center gap-2.5 md:gap-4">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-200 text-slate-700 transition-all flex items-center justify-center cursor-pointer min-w-[38px] min-h-[38px]"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-4.5 h-4.5 text-slate-700" />
          </button>
        )}

        <div className="md:hidden flex items-center">
          <LivingBrandLogo systemHealth={systemHealth} size="sm" showWordmark={true} />
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="text-slate-900 font-bold text-sm tracking-tight">HVAC Command</span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            {activeSystem === 'hvac' ? 'Cleanroom Twin' : 'Electrical SLD'}
          </span>
        </div>

        <div className="relative hidden xl:flex items-center">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl w-60 transition-all text-xs text-slate-600 group">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search points, registers, tags..." 
              className="bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 w-full text-xs font-sans"
            />
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-500 shrink-0 shadow-2xs">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4 py-1.5 px-3.5 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs shadow-2xs">
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-500">SAT:</span>
          <span className="font-bold text-slate-900 tabular-nums">{supplyTemp.toFixed(1)}°C</span>
        </div>
        <div className="w-px h-3.5 bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-slate-500">RAT:</span>
          <span className="font-bold text-slate-900 tabular-nums">{returnTemp.toFixed(1)}°C</span>
        </div>
        <div className="w-px h-3.5 bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-slate-500">LOAD:</span>
          <span className="font-bold text-slate-900 tabular-nums">{totalPower.toFixed(1)} kW</span>
        </div>
        <div className="w-px h-3.5 bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-slate-500">DP:</span>
          <span className="font-bold text-slate-900 tabular-nums">{ductPressure.toFixed(0)} Pa</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3.5">
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsScenarioDropdownOpen((prev) => !prev)}
            className="btn-press flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-xs font-mono text-slate-700 shadow-2xs cursor-pointer min-h-[36px]"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="hidden sm:inline font-medium text-slate-500">Scenario:</span>
            <span className="text-slate-900 font-bold max-w-[80px] sm:max-w-[120px] truncate">
              {activeScenario?.name ?? `Scenario ${activeScenarioId}`}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {isScenarioDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 border-b border-slate-100 font-bold">
                12 Thermodynamic Test Scenarios
              </div>
              <div className="max-h-64 overflow-y-auto space-y-0.5 mt-1">
                {scenarios.map((sc) => (
                  <button
                    key={sc.scenario_id}
                    onClick={() => handleSelectScenario(sc.scenario_id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                      sc.scenario_id === activeScenarioId
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="text-slate-400 mr-1.5">#{sc.scenario_id}</span>
                      <span>{sc.name}</span>
                    </div>
                    {sc.scenario_id === activeScenarioId && (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className={wsConnected ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
            {wsConnected ? 'LIVE BUS' : 'OFFLINE'}
          </span>
        </div>

        <div className="hidden md:flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-xl">
          <button
            onClick={() => onSelectSystem('hvac')}
            className={`btn-press flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeSystem === 'hvac'
                ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Snowflake className="w-3 h-3 text-blue-600" />
            <span>HVAC</span>
          </button>
          <button
            onClick={() => onSelectSystem('electrical')}
            className={`btn-press flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeSystem === 'electrical'
                ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-600" />
            <span>GRID</span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-500 hidden 2xl:block">
          {timeStr}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="hidden xl:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-900">Plant Operator</div>
            <div className="text-[10px] text-blue-600 font-mono font-medium">Supervisory Level 3</div>
          </div>
        </div>
      </div>
    </header>
  );
}
