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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:border-slate-300 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Thermometer className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Supply Air Temp
                </span>
                <div className="text-[10px] text-slate-400 font-mono">AHU-01 Discharge</div>
              </div>
            </div>
            <span
              className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                Math.abs(tempDeviation) <= 1.0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {tempDeviation > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              Δ {tempDeviation > 0 ? '+' : ''}{tempDeviation.toFixed(1)}°C
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {supplyTemp.toFixed(1)}
              <span className="text-xs text-slate-500 font-sans ml-1 font-normal">°C</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block font-sans">Setpoint</span>
              <span className="text-xs text-blue-600 font-bold">{setPoint.toFixed(1)}°C</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Room: <span className="text-slate-800 font-semibold">{currentTemp.toFixed(1)}°C</span></span>
          <span className="text-blue-700 font-semibold">RH: {roomRh.toFixed(1)}%</span>
        </div>
      </div>

      <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:border-slate-300 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <Wind className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Airflow Delivery
                </span>
                <div className="text-[10px] text-slate-400 font-mono">Centrifugal Fan VFD</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
              {fanHz.toFixed(1)} Hz
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {airflowCfm.toLocaleString('en-US')}
              <span className="text-xs text-slate-500 font-sans ml-1 font-normal">CFM</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block font-sans">Metric</span>
              <span className="text-xs text-sky-700 font-bold">{Math.round(airflowCfm * 1.699)} m³/h</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Filter DP: <span className="text-slate-800 font-semibold">{ductPressurePa.toFixed(0)} Pa</span></span>
          <span className="text-emerald-700 font-semibold">HEPA Nominal</span>
        </div>
      </div>

      <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:border-slate-300 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Gauge className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Cleanroom Pressure
                </span>
                <div className="text-[10px] text-slate-400 font-mono">ISO Class 7 Cascade</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Positive
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              +{roomPressurePa.toFixed(1)}
              <span className="text-xs text-slate-500 font-sans ml-1 font-normal">Pa</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block font-sans">Threshold</span>
              <span className="text-xs text-emerald-700 font-bold">&gt; 15.0 Pa</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Airlock Cascade: <span className="text-slate-800 font-semibold">+12.5 Pa</span></span>
          <span className="text-emerald-700 font-semibold">Sealed</span>
        </div>
      </div>

      <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:border-slate-300 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Plant Power &amp; COP
                </span>
                <div className="text-[10px] text-slate-400 font-mono">Active Electrical Draw</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
              COP {copValue.toFixed(1)}
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalPowerKw.toFixed(1)}
              <span className="text-xs text-slate-500 font-sans ml-1 font-normal">kW</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block font-sans">Specific Power</span>
              <span className="text-xs text-purple-700 font-bold">{plantKwPerTon} kW/TR</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>ODUs: <span className="text-slate-800 font-semibold">{systemState?.odu_summary?.running ?? 5}/6 ON</span></span>
          <span>Heaters: <span className="text-amber-700 font-semibold">{systemState?.heater_summary?.running ?? 8}/8 ON</span></span>
        </div>
      </div>
    </div>
  );
}
