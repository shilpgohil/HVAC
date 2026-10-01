'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Fan, 
  Snowflake, 
  Flame, 
  TrendingUp, 
  AlertTriangle, 
  Settings, 
  Zap, 
  X,
  Radio,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { LivingBrandLogo } from '@/components/common/LivingBrandLogo';

export type NavTab = 'dashboard' | 'ahu' | 'odu' | 'heater' | 'graph' | 'alarms' | 'settings';
export type SystemMode = 'hvac' | 'electrical';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeSystem: SystemMode;
  onSelectSystem: (mode: SystemMode) => void;
  alarmCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ 
  currentTab, 
  onSelectTab, 
  activeSystem, 
  onSelectSystem, 
  alarmCount = 0,
  isOpen = false,
  onClose
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'System Overview', icon: LayoutDashboard, category: 'Master Twin' },
    { id: 'ahu' as NavTab, label: 'AHU Cleanroom', icon: Fan, category: 'Air Delivery' },
    { id: 'odu' as NavTab, label: 'ODU Inverters', icon: Snowflake, category: 'DX Cooling' },
    { id: 'heater' as NavTab, label: 'Electric Reheat', icon: Flame, category: 'Thermal Bank' },
    { id: 'graph' as NavTab, label: 'Telemetry Trends', icon: TrendingUp, category: 'Analytics' },
    { id: 'alarms' as NavTab, label: 'Alarms & Events', icon: AlertTriangle, category: 'Safety Deck', badge: alarmCount },
    { id: 'settings' as NavTab, label: 'System Settings', icon: Settings, category: 'Configuration' }
  ];

  const handleItemClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (activeSystem !== 'hvac') {
      onSelectSystem('hvac');
    }
    if (onClose) onClose();
  };

  const handleSystemChange = (sys: SystemMode) => {
    onSelectSystem(sys);
    if (onClose) onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-4">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <LivingBrandLogo systemHealth={alarmCount > 0 ? 'WARNING' : 'HEALTHY'} size="sm" showWordmark={true} />
          {onClose && (
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-3">
          <div className="p-1 rounded-xl surface-well border border-white/10 grid grid-cols-2 gap-1 text-[11px] font-mono">
            <button
              onClick={() => handleSystemChange('hvac')}
              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeSystem === 'hvac'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
              <span>HVAC</span>
            </button>
            <button
              onClick={() => handleSystemChange('electrical')}
              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeSystem === 'electrical'
                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>GRID</span>
            </button>
          </div>
        </div>

        <div className="px-3 space-y-1">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Supervisory Control
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSystem === 'hvac' && currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-150 active:scale-[0.98] ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="surface-well rounded-xl p-3 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              PLC Gateway
            </span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Scan Latency:</span>
            <span className="text-white font-bold">14.2 ms</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Safety Cutout:</span>
            <span className="text-cyan-400 font-bold">ARMED</span>
          </div>
        </div>

        <div className="text-[10px] text-center font-mono text-slate-500">
          AURA-TWIN v3.4 · ISO 14644-1
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 surface-panel border-r border-white/10 flex-col h-screen sticky top-0 shrink-0 z-40">
        {sidebarContent}
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md z-50 md:hidden transition-opacity"
          onClick={onClose}
        >
          <div 
            className="w-72 surface-panel border-r border-white/15 h-full p-0 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
