'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  ShieldAlert, 
  Filter, 
  Clock 
} from 'lucide-react';
import { SystemState, AlarmItem } from '@/types/hvac';

interface AlarmsDetailViewProps {
  systemState: SystemState | null;
}

export function AlarmsDetailView({ systemState }: AlarmsDetailViewProps) {
  const alarms: AlarmItem[] = systemState?.alarms || [
    {
      id: 'alarm-01',
      component_code: 'ODU-04',
      severity: 'WARNING',
      state: 'ACTIVE',
      condition: 'STANDBY_OFF',
      message: 'ODU standby reserve circuit',
      triggered_at: '26 Aug 2026 12:32 PM'
    }
  ];

  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');

  const filteredAlarms = alarms.filter(a => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  const activeCount = alarms.filter(a => a.state === 'ACTIVE').length;
  const criticalCount = alarms.filter(a => a.severity === 'CRITICAL' && a.state !== 'CLEARED').length;
  const warningCount = alarms.filter(a => a.severity === 'WARNING' && a.state !== 'CLEARED').length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Alarm Center Status (Read-Only) */}
      <div className="rounded-2xl p-6 bg-white/90 border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <Bell className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Supervisory Alarm &amp; Fault Console</h1>
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono-numbers font-medium uppercase tracking-wider ${
                criticalCount > 0 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {criticalCount > 0 ? `${criticalCount} Critical Trips` : 'Plant Systems Normal'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono-numbers">
              Live Modbus PLC event bus · ANSI/ISA-18.2 Alarm Lifecycle Management
            </p>
          </div>
        </div>

        {/* Read-Only Status Indicator */}
        <div className="p-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-right">
          <span className="text-slate-500 text-[11px] font-medium">Supervisory Mode</span>
          <div className="text-sm font-bold font-mono-numbers text-slate-800 mt-0.5">
            Read-Only Audit Stream
          </div>
        </div>
      </div>

      {/* 2. Severity Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setSeverityFilter('ALL')}
          className={`rounded-xl p-5 bg-white/90 border cursor-pointer transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] backdrop-blur-md ${
            severityFilter === 'ALL' ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">Total Logged Events</div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1">
            {alarms.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono-numbers">
            {activeCount} active · {alarms.length - activeCount} cleared
          </div>
        </div>

        <div 
          onClick={() => setSeverityFilter('CRITICAL')}
          className={`rounded-xl p-5 bg-white/90 border cursor-pointer transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] backdrop-blur-md ${
            severityFilter === 'CRITICAL' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">Critical Priority</div>
          <div className="text-2xl font-bold font-mono-numbers text-rose-600 mt-1">
            {criticalCount}
          </div>
          <div className="text-[11px] text-rose-700 mt-2 font-medium">
            Safety interlock trips &amp; high limit
          </div>
        </div>

        <div 
          onClick={() => setSeverityFilter('WARNING')}
          className={`rounded-xl p-5 bg-white/90 border cursor-pointer transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] backdrop-blur-md ${
            severityFilter === 'WARNING' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">Warning Priority</div>
          <div className="text-2xl font-bold font-mono-numbers text-amber-600 mt-1">
            {warningCount}
          </div>
          <div className="text-[11px] text-amber-700 mt-2 font-medium">
            Threshold drifts &amp; filter loading
          </div>
        </div>

        <div 
          onClick={() => setSeverityFilter('INFO')}
          className={`rounded-xl p-5 bg-white/90 border cursor-pointer transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] backdrop-blur-md ${
            severityFilter === 'INFO' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">Advisory / Info</div>
          <div className="text-2xl font-bold font-mono-numbers text-blue-600 mt-1">
            {alarms.filter(a => a.severity === 'INFO').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Routine cycling &amp; oil returns
          </div>
        </div>
      </div>

      {/* 3. Alarm Records List (Read-Only) */}
      <div className="rounded-2xl p-6 bg-white/90 border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-sky-600" />
            <span className="font-bold text-slate-900 text-sm">Active &amp; Historical Incidents</span>
          </div>
          <span className="text-xs text-slate-500 font-mono-numbers">
            Displaying {filteredAlarms.length} events
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAlarms.length === 0 ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
              <span className="text-slate-900 font-bold text-sm">No Alarms in this Filter</span>
              <span className="text-xs text-slate-500 mt-0.5">Thermodynamic equilibrium and safety interlocks clear</span>
            </div>
          ) : (
            filteredAlarms.map((alarm) => {
              const isCrit = alarm.severity === 'CRITICAL';
              const isWarn = alarm.severity === 'WARNING';
              return (
                <div key={alarm.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start space-x-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      isCrit 
                        ? 'bg-rose-50 border-rose-200 text-rose-600' 
                        : isWarn
                          ? 'bg-amber-50 border-amber-200 text-amber-600'
                          : 'bg-sky-50 border-sky-200 text-sky-600'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-slate-900 text-sm">{alarm.component_code}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono-numbers font-semibold ${
                          isCrit 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : isWarn
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-sky-100 text-sky-800 border border-sky-200'
                        }`}>
                          {alarm.severity}
                        </span>
                        <span className="text-xs text-slate-500 font-mono-numbers flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{alarm.triggered_at}</span>
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-1">{alarm.condition}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{alarm.message}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="px-3 py-1 rounded-md text-xs font-mono-numbers font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      State: {alarm.state}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
