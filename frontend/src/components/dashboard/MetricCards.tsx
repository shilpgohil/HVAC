'use client';

import React from 'react';
import { Thermometer, Wind, Gauge, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { SystemState } from '@/types/hvac';

interface MetricCardsProps {
  systemState: SystemState | null;
}

export function MetricCards({ systemState }: MetricCardsProps) {
  const supplyTemp = systemState?.temperatures?.supply_c ?? 18.2;
  const currentTemp = systemState?.temperatures?.current_c ?? 24.4;
  const setPoint = systemState?.temperatures?.set_point_c ?? 22.0;
  const tempDeviation = currentTemp - setPoint;

  const airflowCfm = systemState?.ahu?.airflow_cfm ?? 14500;
  const fanHz = systemState?.ahu?.fan_vfd_hz ?? 50.0;
  const ductPressurePa = systemState?.ahu?.filter_dp_pa ?? 120.0;

  const roomPressurePa = 24.8;
  const roomRh = systemState?.humidity?.current_rh ?? 48.5;

  const totalPowerKw = systemState?.system_info?.total_power_kw ?? 132.8;
  const copValue = (systemState?.odu_summary?.running ?? 5) > 0 ? 5.2 : 0.0;
  const plantKwPerTon = 0.68;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      <div className="card-lift rounded-2xl p-3 sm:p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:border-slate-300 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Thermometer className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-700 font-bold block whitespace-nowrap">
                  Supply Air
                </span>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden sm:block">AHU-01 Discharge</div>
              </div>
            </div>
            <span
              className={`flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold shrink-0 ${
                Math.abs(tempDeviation) <= 1.0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {tempDeviation > 0 ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              <span className="hidden sm:inline">Δ</span> {tempDeviation > 0 ? '+' : ''}{tempDeviation.toFixed(1)}°C
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1 sm:mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {supplyTemp.toFixed(1)}
              <span className="text-xs text-slate-500 font-sans ml-0.5 font-normal">°C</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block font-sans">Setpoint</span>
              <span className="text-[11px] sm:text-xs text-blue-600 font-bold">{setPoint.toFixed(1)}°C</span>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-500">
          <span>Room: <span className="text-slate-800 font-semibold">{currentTemp.toFixed(1)}°C</span></span>
          <span className="text-blue-700 font-semibold">RH: {roomRh.toFixed(1)}%</span>
        </div>
      </div>

      <div className="card-lift rounded-2xl p-3 sm:p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:border-slate-300 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                <Wind className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-700 font-bold block whitespace-nowrap">
                  Airflow
                </span>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden sm:block">Centrifugal Fan VFD</div>
              </div>
            </div>
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
              {fanHz.toFixed(1)} Hz
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1 sm:mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {airflowCfm.toLocaleString('en-US')}
              <span className="text-xs text-slate-500 font-sans ml-0.5 font-normal">CFM</span>
            </div>
            <div className="text-right font-mono hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-sans">Metric</span>
              <span className="text-xs text-sky-700 font-bold">{Math.round(airflowCfm * 1.699)} m³/h</span>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-500">
          <span>Filter DP: <span className="text-slate-800 font-semibold">{ductPressurePa.toFixed(0)} Pa</span></span>
          <span className="text-emerald-700 font-semibold hidden sm:inline">HEPA Nominal</span>
        </div>
      </div>

      <div className="card-lift rounded-2xl p-3 sm:p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:border-slate-300 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Gauge className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-700 font-bold block whitespace-nowrap">
                  Pressure
                </span>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden sm:block">ISO Class 7 Cascade</div>
              </div>
            </div>
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Positive
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1 sm:mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
              +{roomPressurePa.toFixed(1)}
              <span className="text-xs text-slate-500 font-sans ml-0.5 font-normal">Pa</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block font-sans">Threshold</span>
              <span className="text-[11px] sm:text-xs text-emerald-700 font-bold">&gt; 15 Pa</span>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-500">
          <span>Airlock: <span className="text-slate-800 font-semibold">+12.5 Pa</span></span>
          <span className="text-emerald-700 font-semibold hidden sm:inline">Sealed</span>
        </div>
      </div>

      <div className="card-lift rounded-2xl p-3 sm:p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:border-slate-300 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                <Zap className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-700 font-bold block whitespace-nowrap">
                  Power &amp; COP
                </span>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden sm:block">Active Electrical Draw</div>
              </div>
            </div>
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
              COP {copValue.toFixed(1)}
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1 sm:mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalPowerKw.toFixed(1)}
              <span className="text-xs text-slate-500 font-sans ml-0.5 font-normal">kW</span>
            </div>
            <div className="text-right font-mono hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-sans">Specific Power</span>
              <span className="text-xs text-purple-700 font-bold">{plantKwPerTon} kW/TR</span>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-500">
          <span>ODU: <span className="text-slate-800 font-semibold">{systemState?.odu_summary?.running ?? 5}/6</span></span>
          <span>HTR: <span className="text-amber-700 font-semibold">{systemState?.heater_summary?.running ?? 8}/8</span></span>
        </div>
      </div>
    </div>
  );
}
