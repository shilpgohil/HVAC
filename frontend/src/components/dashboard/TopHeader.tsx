'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  ChevronDown, 
  Search, 
  Command, 
  Zap, 
  Snowflake,
  Sun,
  Activity,
  CheckCircle2
} from 'lucide-react';

export type SystemMode = 'hvac' | 'electrical';

interface TopHeaderProps {
  activeSystem: SystemMode;
  onSelectSystem: (mode: SystemMode) => void;
  alarmCount?: number;
}

export function TopHeader({ 
  activeSystem, 
  onSelectSystem, 
  alarmCount = 1 
}: TopHeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('27 Sep 2026, 21:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      setTimeStr(now.toLocaleString('en-US', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 px-6 bg-white/90 border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_10px_rgba(15,23,42,0.03)] backdrop-blur-md">
      {/* 1. Left: Search Bar with ⌘K Badge (Light Mode) */}
      <div className="flex items-center space-x-4">
        <div className="relative flex items-center">
          <div className="flex items-center space-x-2 bg-slate-100/90 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl w-60 md:w-72 transition-all text-xs text-slate-500 group">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
            <input 
              type="text" 
              placeholder="Search telemetry, points, alarms..." 
              className="bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 w-full text-xs font-sans"
            />
            <div className="flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono-numbers text-slate-500 shrink-0 shadow-2xs">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Center: Restrained System Switcher (Light Mode) */}
      <div className="hidden md:flex items-center space-x-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl shadow-inner">
        <button
          onClick={() => onSelectSystem('hvac')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            activeSystem === 'hvac'
              ? 'bg-white text-sky-950 border border-slate-200 shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Snowflake className={`w-3.5 h-3.5 ${activeSystem === 'hvac' ? 'text-sky-600' : 'text-slate-400'}`} />
          <span>HVAC Digital Twin</span>
        </button>

        <button
          onClick={() => onSelectSystem('electrical')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            activeSystem === 'electrical'
              ? 'bg-white text-blue-950 border border-slate-200 shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${activeSystem === 'electrical' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Electrical Grid</span>
        </button>
      </div>

      {/* 3. Right: Live Status, Time & Profile (Crisp Light Mode) */}
      <div className="flex items-center space-x-3.5">
        {/* System Online Live Badge */}
        <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Online · Live Bus</span>
        </div>

        {/* Live Clock */}
        <div className="text-xs font-mono-numbers text-slate-500 hidden xl:block font-medium">
          {timeStr}
        </div>

        {/* User / Plant Operator Avatar */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-800">Lead Plant Engineer</div>
            <div className="text-[10px] text-slate-400 font-mono-numbers">Supervisory Auth</div>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
