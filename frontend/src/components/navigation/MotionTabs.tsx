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

  const updateIndicator = () => {
    if (!containerRef.current) return;
    const activeElement = containerRef.current.querySelector<HTMLElement>(`[data-tab-id="${activeTab}"]`);
    if (activeElement) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tabRect = activeElement.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left + containerRef.current.scrollLeft,
        width: tabRect.width,
        opacity: 1,
      });
    }
  };

  useEffect(() => {
    updateIndicator();
    if (!containerRef.current) return;
    const activeElement = containerRef.current.querySelector<HTMLElement>(`[data-tab-id="${activeTab}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab, tabs]);

  return (
    <div className="space-y-3">
      {showStagedHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                {activeTabMeta?.category || 'Operational Subsystem'}
              </span>
              <span className="text-slate-300">/</span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
                {title || activeTabMeta?.label}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-sans font-normal">
              {subtitle || activeTabMeta?.description || 'Real-time telemetry and supervisory control loop'}
            </p>
          </div>
        </div>
      )}

      <div 
        className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-2xs relative overflow-x-auto select-none"
        onScroll={updateIndicator}
      >
        <div ref={containerRef} className="relative flex items-center gap-1 min-w-max">
          <div
            className="absolute top-0 bottom-0 my-auto h-[calc(100%-6px)] rounded-xl bg-white border border-slate-200/80 shadow-sm pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
              transition: 'left 220ms cubic-bezier(0.16, 1, 0.3, 1), width 220ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease',
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
                className={`btn-press relative z-10 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-colors duration-150 focus:outline-none cursor-pointer ${
                  isActive
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
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
