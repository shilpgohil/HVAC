'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  ShieldAlert, 
  Filter, 
  Clock,
  Check,
  Trash2
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
      <div className="surface-panel rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
            <Bell className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight font-sans">Alarms & Fault Management Console</h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                criticalCount > 0 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {criticalCount > 0 ? `${criticalCount} Critical Trips` : 'Normal Operations'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Safety interlock event logging, threshold trips, and supervisory operator acknowledgment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl surface-well border border-white/10 flex items-center gap-1 font-mono text-xs">
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  severityFilter === sev
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="text-xs text-slate-400 font-mono uppercase mb-1">Active Alarms</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">{activeCount}</div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1">Requiring Attention</div>
        </div>

        <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="text-xs text-slate-400 font-mono uppercase mb-1">Critical Trips</div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">{criticalCount}</div>
          <div className="text-[11px] text-rose-400 font-mono mt-1">Safety Cutouts</div>
        </div>

        <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="text-xs text-slate-400 font-mono uppercase mb-1">Warning Limits</div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{warningCount}</div>
          <div className="text-[11px] text-amber-400 font-mono mt-1">Threshold Excursions</div>
        </div>
      </div>

      <div className="surface-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Event Log Stream ({filteredAlarms.length})
          </h2>
          <span className="text-xs font-mono text-slate-500">ISO 14644-1 Audit Trace</span>
        </div>

        <div className="divide-y divide-white/5">
          {filteredAlarms.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-mono flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
              <span className="text-white font-semibold text-sm">No Active Faults Matching Filter</span>
              <span className="text-slate-500 mt-1">All engineering limits verified nominal</span>
            </div>
          ) : (
            filteredAlarms.map((alarm) => (
              <div key={alarm.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    alarm.severity === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : (alarm.severity === 'WARNING' ? 'bg-amber-500' : 'bg-cyan-500')
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">{alarm.component_code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        alarm.severity === 'CRITICAL' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {alarm.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{alarm.triggered_at}</span>
                    </div>
                    <div className="text-xs text-slate-300 font-mono mt-1">{alarm.message}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {alarm.state !== 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => handleAck(alarm.id)}
                      className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleClear(alarm.id)}
                    className="p-2 rounded-xl surface-well hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors"
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
