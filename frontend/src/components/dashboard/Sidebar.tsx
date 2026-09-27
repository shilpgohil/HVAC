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
  Activity, 
  Zap, 
  CheckCircle2,
  X
} from 'lucide-react';

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
  alarmCount = 1,
  isOpen = false,
  onClose
}: SidebarProps) {
  const hvacNavItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ahu' as NavTab, label: 'AHU Cleanroom', icon: Fan },
    { id: 'odu' as NavTab, label: 'ODU Inverters', icon: Snowflake },
    { id: 'heater' as NavTab, label: 'Electric Heater', icon: Flame },
    { id: 'graph' as NavTab, label: 'Telemetry Trends', icon: TrendingUp },
    { id: 'alarms' as NavTab, label: 'Alarm / Fault', icon: AlertTriangle, badge: alarmCount },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings }
  ];

  const handleItemClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onClose) onClose();
  };

  const handleSystemChange = (sys: SystemMode) => {
    onSelectSystem(sys);
    if (onClose) onClose();
  };

  const sidebarContent = (
    <>
      <div>
        {/* Logo & Header */}
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 shadow-xs">
              <Activity className="w-4.5 h-4.5 text-sky-600" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm tracking-tight flex items-center space-x-1.5">
                <span>SuperTwin SCADA</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono-numbers">
                Industrial Digital Twin
              </div>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* System Switcher (Compact Light Mode Pill) */}
        <div className="p-3">
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200/80 grid grid-cols-2 gap-1 text-[11px] font-medium">
            <button
              onClick={() => handleSystemChange('hvac')}
              className={`py-1.5 px-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeSystem === 'hvac'
                  ? 'bg-white text-sky-900 border border-slate-200 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 text-sky-600" />
              <span>HVAC Twin</span>
            </button>
            <button
              onClick={() => handleSystemChange('electrical')}
              className={`py-1.5 px-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeSystem === 'electrical'
                  ? 'bg-white text-blue-900 border border-slate-200 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Electrical</span>
            </button>
          </div>
        </div>

        {/* Navigation list */}
        {activeSystem === 'hvac' ? (
          <nav className="px-3 py-1 space-y-1">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono-numbers">
              Operational Subsystems
            </div>
            {hvacNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-sky-50/80 text-sky-950 font-bold border border-sky-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono-numbers font-bold bg-rose-100 text-rose-700 border border-rose-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="px-3 py-2 space-y-2">
            <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono-numbers">
              Distribution Board
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="text-slate-900 font-bold text-xs">Plant Electrical Grid</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                7-Panel balanced 3-phase distribution telemetry.
              </p>
              <div className="pt-2 border-t border-slate-200/80 flex justify-between text-[11px] text-emerald-700 font-mono-numbers">
                <span>Feeders 1-7:</span>
                <span className="font-semibold">Online</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info (Crisp Light Mode, zero overlap) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <div className="text-xs font-bold text-slate-800 truncate">Twin SCADA v2.5</div>
          <div className="text-[10px] text-slate-500 font-mono-numbers truncate">PLC: 192.168.10.120</div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-mono-numbers shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold">Synced</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white/95 border-r border-slate-200 flex-col shrink-0 min-h-screen justify-between select-none z-20 backdrop-blur-md shadow-xs sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
          onClick={onClose} 
        />
        
        {/* Sliding Panel */}
        <div 
          className={`absolute top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 transform flex flex-col justify-between overflow-y-auto ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
