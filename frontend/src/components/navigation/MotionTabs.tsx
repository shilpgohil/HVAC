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

  const activeTabMeta = tabs.find(t => t.id === activeTab) || tabs[0];

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
      {/* 1. Staged Heading (Arise UI Narrative Stage) */}
      {showStagedHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono-numbers uppercase tracking-wider font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/80">
                {activeTabMeta?.category || 'Operational View'}
              </span>
              <span className="text-slate-300">/</span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {title || activeTabMeta?.label}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {subtitle || activeTabMeta?.description || 'Real-time telemetry and supervisory monitoring'}
            </p>
          </div>
        </div>
      )}

      {/* 2. Fluid Pill Motion Tab Bar (Inspired by Arise UI MotionTabs) */}
      <div className="p-1 rounded-2xl bg-white/90 border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] backdrop-blur-md relative overflow-x-auto select-none">
        <div ref={containerRef} className="relative flex items-center space-x-1 min-w-max">
          {/* Animated Sliding Highlight Pill */}
          <div
            className="absolute top-0 bottom-0 my-auto h-[calc(100%-4px)] rounded-xl bg-gradient-to-b from-sky-50 to-white border border-sky-200/90 shadow-[0_2px_8px_-1px_rgba(14,165,233,0.18)] transition-all duration-300 pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />

          {/* Tab Buttons */}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative z-10 flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors duration-200 focus:outline-none ${
                  isActive
                    ? 'text-sky-950 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isActive ? 'text-sky-600 scale-105' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="tracking-tight whitespace-nowrap">{tab.label}</span>

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold font-mono-numbers">
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
