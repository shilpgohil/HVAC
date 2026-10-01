'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, Droplets, Clock, Activity } from 'lucide-react';
import { fetchTemperatureHistory, HistoryPoint } from '@/lib/api';

interface TemperatureTrendGraphProps {
  initialHistory?: HistoryPoint[];
}

export function TemperatureTrendGraph({ initialHistory }: TemperatureTrendGraphProps) {
  const [timeRange, setTimeRange] = useState<'15M' | '1H' | '6H' | '24H' | 'LIVE'>('1H');
  const [activeMetric, setActiveMetric] = useState<'temp' | 'rh'>('temp');
  const [data, setData] = useState<HistoryPoint[]>(initialHistory || []);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const loadHistory = useCallback(async (range: string) => {
    try {
      const apiRange = range === '15M' ? '1H' : (range === 'LIVE' ? '1H' : range);
      const points = await fetchTemperatureHistory(apiRange);
      if (points && points.length > 0) {
        setData(points);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadHistory(timeRange);
    const interval = setInterval(() => {
      loadHistory(timeRange);
    }, 2500);
    return () => clearInterval(interval);
  }, [timeRange, loadHistory]);

  const minY = activeMetric === 'temp' ? 12 : 30;
  const maxY = activeMetric === 'temp' ? 32 : 75;
  const rangeY = maxY - minY;
  const width = 850;
  const height = 260;
  const paddingX = 45;
  const paddingY = 30;
  const innerW = width - paddingX * 2;
  const innerH = height - paddingY * 2;

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return paddingY + innerH - ((clamped - minY) / rangeY) * innerH;
  };

  const getX = (idx: number) => {
    if (data.length <= 1) return paddingX + innerW / 2;
    return paddingX + (idx / (data.length - 1)) * innerW;
  };

  const supplyPoints = data.map((d, i) => `${getX(i)},${getY(d.supply_c)}`).join(' ');
  const returnPoints = data.map((d, i) => `${getX(i)},${getY(d.return_c)}`).join(' ');
  const roomPoints = data.map((d, i) => `${getX(i)},${getY(d.current_c)}`).join(' ');
  const currentSetPoint = data.length > 0 ? data[data.length - 1].set_point_c : 22.0;
  const setPointY = getY(currentSetPoint);

  const rhPoints = data.map((d, i) => `${getX(i)},${getY(d.rh_pct ?? 48.5)}`).join(' ');
  const currentRhSetPoint = data.length > 0 ? (data[data.length - 1].rh_setpoint_pct ?? 50.0) : 50.0;
  const rhSetPointY = getY(currentRhSetPoint);

  const yTicks = activeMetric === 'temp' 
    ? [12, 16, 20, 24, 28, 32] 
    : [30, 40, 50, 60, 70];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || data.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaleX = width / rect.width;
    const svgX = mouseX * scaleX;
    
    if (svgX < paddingX || svgX > width - paddingX) {
      setHoveredIdx(null);
      return;
    }
    
    const relativeX = (svgX - paddingX) / innerW;
    const rawIdx = Math.round(relativeX * (data.length - 1));
    const clampedIdx = Math.max(0, Math.min(data.length - 1, rawIdx));
    setHoveredIdx(clampedIdx);
  };

  const hoveredData = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="surface-panel rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
            {activeMetric === 'temp' ? <TrendingUp className="w-4 h-4" /> : <Droplets className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm tracking-tight font-sans">
                {activeMetric === 'temp' ? 'Temperature Telemetry Spectrum' : 'Psychrometric Humidity (RH)'}
              </span>
              <span className="text-[10px] text-cyan-300 font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
                Real-Time Stream
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {activeMetric === 'temp' 
                ? 'Supply (18.2°C) · Return (26.7°C) · Room (24.4°C) vs Setpoint (22.0°C)' 
                : 'Cleanroom Relative Humidity with psychrometric tolerance band'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-0.5 surface-well rounded-xl border border-white/10 flex items-center font-mono text-xs">
            <button
              onClick={() => setActiveMetric('temp')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeMetric === 'temp'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Temp (°C)
            </button>
            <button
              onClick={() => setActiveMetric('rh')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeMetric === 'rh'
                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Humidity (% RH)
            </button>
          </div>

          <div className="p-0.5 surface-well rounded-xl border border-white/10 flex items-center font-mono text-xs">
            {(['15M', '1H', '6H', '24H', 'LIVE'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  timeRange === r
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 py-1 text-xs font-mono text-slate-400 mb-2">
        <div className="flex items-center gap-4">
          {activeMetric === 'temp' ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 rounded-full bg-cyan-400" />
                <span className="text-white font-semibold">Supply Air</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 rounded-full bg-amber-400" />
                <span className="text-white font-semibold">Return Air</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 rounded-full bg-sky-400" />
                <span className="text-white font-semibold">Room Space</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 border-b-2 border-dashed border-emerald-400" />
                <span className="text-emerald-400 font-semibold">Setpoint (22.0°C)</span>
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 rounded-full bg-blue-400" />
                <span className="text-white font-semibold">Relative Humidity</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 border-b-2 border-dashed border-emerald-400" />
                <span className="text-emerald-400 font-semibold">RH Target (50%)</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-500">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Polling 1 Hz</span>
        </div>
      </div>

      <div className="relative w-full surface-well rounded-xl p-3 border border-white/5 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="cyanAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="amberAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#1E293B"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {val}{activeMetric === 'temp' ? '°C' : '%'}
                </text>
              </g>
            );
          })}

          {activeMetric === 'temp' ? (
            <>
              <line
                x1={paddingX}
                y1={setPointY}
                x2={width - paddingX}
                y2={setPointY}
                stroke="#22C55E"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.8"
              />

              {data.length > 1 && (
                <>
                  <polygon
                    points={`${paddingX},${innerH + paddingY} ${supplyPoints} ${width - paddingX},${innerH + paddingY}`}
                    fill="url(#cyanAreaGrad)"
                  />
                  <polyline
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="2.5"
                    points={supplyPoints}
                  />
                  <polyline
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    points={returnPoints}
                  />
                  <polyline
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                    points={roomPoints}
                  />
                </>
              )}
            </>
          ) : (
            <>
              <line
                x1={paddingX}
                y1={rhSetPointY}
                x2={width - paddingX}
                y2={rhSetPointY}
                stroke="#22C55E"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.8"
              />
              {data.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  points={rhPoints}
                />
              )}
            </>
          )}

          {hoveredIdx !== null && (
            <g>
              <line
                x1={getX(hoveredIdx)}
                y1={paddingY}
                x2={getX(hoveredIdx)}
                y2={height - paddingY}
                stroke="#06B6D4"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {activeMetric === 'temp' ? (
                <>
                  <circle
                    cx={getX(hoveredIdx)}
                    cy={getY(data[hoveredIdx].supply_c)}
                    r="4"
                    fill="#06B6D4"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={getX(hoveredIdx)}
                    cy={getY(data[hoveredIdx].return_c)}
                    r="4"
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                </>
              ) : (
                <circle
                  cx={getX(hoveredIdx)}
                  cy={getY(data[hoveredIdx].rh_pct ?? 48.5)}
                  r="4"
                  fill="#3B82F6"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              )}
            </g>
          )}
        </svg>

        {hoveredData && hoveredIdx !== null && (
          <div
            className="absolute top-4 surface-panel border border-cyan-500/40 rounded-xl p-3 shadow-2xl text-xs font-mono pointer-events-none z-20"
            style={{
              left: `${Math.min(width - 240, Math.max(20, (getX(hoveredIdx) / width) * 100))}%`,
            }}
          >
            <div className="text-[10px] text-slate-400 border-b border-white/10 pb-1 mb-1.5 flex items-center justify-between gap-4">
              <span>{hoveredData.time}</span>
              <span className="text-cyan-400 font-bold">SNAPSHOT</span>
            </div>
            {activeMetric === 'temp' ? (
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-cyan-400">Supply Air:</span>
                  <span className="text-white font-bold">{hoveredData.supply_c}°C</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-amber-400">Return Air:</span>
                  <span className="text-white font-bold">{hoveredData.return_c}°C</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sky-400">Room Space:</span>
                  <span className="text-white font-bold">{hoveredData.current_c}°C</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-emerald-400">Setpoint:</span>
                  <span className="text-emerald-400 font-bold">{hoveredData.set_point_c}°C</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-blue-400">RH Measured:</span>
                  <span className="text-white font-bold">{hoveredData.rh_pct ?? 48.5}%</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-emerald-400">RH Target:</span>
                  <span className="text-emerald-400 font-bold">{hoveredData.rh_setpoint_pct ?? 50.0}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
