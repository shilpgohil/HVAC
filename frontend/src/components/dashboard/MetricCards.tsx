'use client';

import React from 'react';
import { Thermometer, Wind, Gauge, Zap, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
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
      <div className="sapphire-card rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <Thermometer className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Supply Air Temp
              </span>
              <div className="text-[10px] text-slate-500 font-mono">AHU-01 Discharge</div>
            </div>
          </div>
          <span
            className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              Math.abs(tempDeviation) <= 1.0
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}
          >
            {tempDeviation > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            Δ {tempDeviation > 0 ? '+' : ''}{tempDeviation.toFixed(1)}°C
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {supplyTemp.toFixed(1)}
            <span className="text-xs text-slate-400 font-sans ml-1 font-normal">°C</span>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block">Setpoint</span>
            <span className="text-xs text-cyan-400 font-bold">{setPoint.toFixed(1)}°C</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Room Temp: <span className="text-slate-200 font-semibold">{currentTemp.toFixed(1)}°C</span></span>
          <span className="text-cyan-400/80">RH: {roomRh.toFixed(1)}%</span>
        </div>
      </div>

      <div className="sapphire-card rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <Wind className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Airflow Delivery
              </span>
              <div className="text-[10px] text-slate-500 font-mono">Centrifugal Fan VFD</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            {fanHz.toFixed(1)} Hz
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {airflowCfm.toLocaleString('en-US')}
            <span className="text-xs text-slate-400 font-sans ml-1 font-normal">CFM</span>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block">Metric</span>
            <span className="text-xs text-sky-400 font-bold">{Math.round(airflowCfm * 1.699)} m³/h</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Static DP: <span className="text-slate-200 font-semibold">{ductPressurePa.toFixed(0)} Pa</span></span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Laminar
          </span>
        </div>
      </div>

      <div className="sapphire-card rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Gauge className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Cleanroom Pressure
              </span>
              <div className="text-[10px] text-slate-500 font-mono">Suite 101 Cascade</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            ISO Class 7
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            +{roomPressurePa.toFixed(1)}
            <span className="text-xs text-slate-400 font-sans ml-1 font-normal">Pa</span>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block">Min Limit</span>
            <span className="text-xs text-emerald-400 font-bold">+15.0 Pa</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Cascade Status: <span className="text-emerald-400 font-semibold">Positive</span></span>
          <span className="text-slate-300">DP: 0.10 in.wc</span>
        </div>
      </div>

      <div className="sapphire-card rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Plant Power & COP
              </span>
              <div className="text-[10px] text-slate-500 font-mono">Total Consumption</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            COP {copValue.toFixed(1)}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalPowerKw.toFixed(1)}
            <span className="text-xs text-slate-400 font-sans ml-1 font-normal">kW</span>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block">Efficiency</span>
            <span className="text-xs text-amber-400 font-bold">{plantKwPerTon} kW/Ton</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>ODU Inverters: <span className="text-slate-200 font-semibold">{systemState?.odu_summary?.running ?? 5}/6 Active</span></span>
          <span className="text-cyan-400">8 HTR Active</span>
        </div>
      </div>
    </div>
  );
}
