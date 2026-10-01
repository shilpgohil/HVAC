'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  ShieldAlert, 
  Check, 
  Trash2,
  AlertTriangle,
  Clock,
  Filter
} from 'lucide-react';
import { SystemState, AlarmItem } from '@/types/hvac';
import { acknowledgeAlarm, clearAlarm } from '@/lib/api';

interface AlarmsDetailViewProps {
  systemState: SystemState | null;
}

export function AlarmsDetailView({ systemState }: AlarmsDetailViewProps) {
  const alarms: AlarmItem[] = systemState?.alarms || [
    {
      id: 'ALM-ODU-04',
      component_code: 'ODU-04',
      severity: 'WARNING',
      state: 'ACTIVE',
      condition: 'STANDBY_OFF',
      message: 'ODU standby reserve circuit',
      triggered_at: '26 Aug 2026 12:32 PM'
    }
  ];

  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');

  const filteredAlarms = alarms.filter((a) => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  const activeCount = alarms.filter((a) => a.state === 'ACTIVE').length;
  const criticalCount = alarms.filter((a) => a.severity === 'CRITICAL' && a.state !== 'CLEARED').length;
  const warningCount = alarms.filter((a) => a.severity === 'WARNING' && a.state !== 'CLEARED').length;

  const handleAck = async (id: string) => {
    try {
      await acknowledgeAlarm(id, 'operator-console');
    } catch {}
  };

  const handleClear = async (id: string) => {
    try {
      await clearAlarm(id);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <Bell className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                Alarms &amp; Fault Management Console
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                criticalCount > 0 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {criticalCount > 0 ? `${criticalCount} Critical Trips` : 'Normal Operations'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Safety interlock event logging, threshold trips, and supervisory operator acknowledgment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center gap-1 font-mono text-xs">
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
          <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider font-semibold mb-1">
            Active Alarms
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {activeCount}
          </div>
          <div className="text-[11px] text-blue-600 font-medium font-sans mt-1">
            Requiring Attention
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
          <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider font-semibold mb-1">
            Critical Trips
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {criticalCount}
          </div>
          <div className="text-[11px] text-rose-600 font-medium font-sans mt-1">
            Safety Cutouts
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
          <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider font-semibold mb-1">
            Warning Limits
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {warningCount}
          </div>
          <div className="text-[11px] text-amber-600 font-medium font-sans mt-1">
            Threshold Excursions
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
            Event Log Stream ({filteredAlarms.length})
          </h2>
          <span className="text-xs font-mono text-slate-500 font-medium">ISO 14644-1 Audit Trace</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAlarms.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-sans flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <span className="text-slate-900 font-semibold text-sm">No Active Faults Matching Filter</span>
              <span className="text-slate-500 mt-1">All engineering limits verified nominal</span>
            </div>
          ) : (
            filteredAlarms.map((alarm) => (
              <div 
                key={alarm.id} 
                className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    alarm.severity === 'CRITICAL' 
                      ? 'bg-rose-500 animate-pulse' 
                      : (alarm.severity === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500')
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-mono">{alarm.component_code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        alarm.severity === 'CRITICAL' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : (alarm.severity === 'WARNING' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : 'bg-blue-50 text-blue-700 border border-blue-200')
                      }`}>
                        {alarm.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{alarm.triggered_at}</span>
                    </div>
                    <div className="text-xs text-slate-600 font-sans mt-0.5">{alarm.message}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {alarm.state !== 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => handleAck(alarm.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-mono font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleClear(alarm.id)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                    title="Clear Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
