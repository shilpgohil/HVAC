'use client';

import React, { useRef, useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

export interface MotionTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  description?: string;
  category?: string;
}

interface MotionTabsProps {
  tabs: MotionTabItem[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  title?: string;
  subtitle?: string;
  showStagedHeader?: boolean;
}

export function MotionTabs({
  tabs,
  activeTab,
  onSelectTab,
  title,
  subtitle,
  showStagedHeader = true,
}: MotionTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const activeTabMeta = tabs.find((t) => t.id === activeTab) || tabs[0];

  useEffect(() => {
    if (!containerRef.current) return;
    const activeElement = containerRef.current.querySelector<HTMLElement>(`[data-tab-id="${activeTab}"]`);
    if (activeElement) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tabRect = activeElement.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
        opacity: 1,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className="space-y-3">
      {showStagedHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                {activeTabMeta?.category || 'Operational Subsystem'}
              </span>
              <span className="text-slate-600">/</span>
              <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                {title || activeTabMeta?.label}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {subtitle || activeTabMeta?.description || 'Real-time telemetry and supervisory control loop'}
            </p>
          </div>
        </div>
      )}

      <div className="p-1 rounded-2xl surface-panel border border-white/10 shadow-2xl relative overflow-x-auto select-none">
        <div ref={containerRef} className="relative flex items-center gap-1 min-w-max">
          <div
            className="absolute top-0 bottom-0 my-auto h-[calc(100%-6px)] rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/15 border border-cyan-500/40 shadow-[0_0_16px_rgba(6,182,212,0.25)] transition-all pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
              transitionDuration: '240ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative z-10 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-colors duration-150 focus:outline-none ${
                  isActive
                    ? 'text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isActive ? 'text-cyan-400 scale-110' : 'text-slate-500'
                  }`}
                />
                <span className="tracking-tight whitespace-nowrap">{tab.label}</span>

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold font-mono animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
