'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, Droplets, Activity } from 'lucide-react';
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
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] relative overflow-hidden flex flex-col hover:border-slate-300 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            {activeMetric === 'temp' ? <TrendingUp className="w-4 h-4" /> : <Droplets className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight font-sans">
                {activeMetric === 'temp' ? 'Temperature Telemetry Spectrum' : 'Psychrometric Humidity (RH)'}
              </span>
              <span className="text-[10px] text-blue-700 font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                Real-Time Stream
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-sans mt-0.5">
              {activeMetric === 'temp' 
                ? 'Supply (18.2°C) · Return (26.7°C) · Room (24.4°C) vs Setpoint (22.0°C)' 
                : 'Cleanroom Relative Humidity with psychrometric tolerance band'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-0.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center font-mono text-xs">
            <button
              onClick={() => setActiveMetric('temp')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeMetric === 'temp'
                  ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temp (°C)
            </button>
            <button
              onClick={() => setActiveMetric('rh')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeMetric === 'rh'
                  ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Humidity (% RH)
            </button>
          </div>

          <div className="p-0.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center font-mono text-xs">
            {(['15M', '1H', '6H', '24H', 'LIVE'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 py-1 text-xs font-mono text-slate-500 mb-2">
        <div className="flex items-center gap-4">
          {activeMetric === 'temp' ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 rounded-full bg-blue-600" />
                <span className="text-slate-800 font-semibold">Supply Air</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 rounded-full bg-amber-500" />
                <span className="text-slate-800 font-semibold">Return Air</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 rounded-full bg-sky-500" />
                <span className="text-slate-800 font-semibold">Room Space</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 border-b-2 border-dashed border-emerald-600" />
                <span className="text-emerald-700 font-semibold">Setpoint (22.0°C)</span>
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 rounded-full bg-blue-600" />
                <span className="text-slate-800 font-semibold">Relative Humidity</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 border-b-2 border-dashed border-emerald-600" />
                <span className="text-emerald-700 font-semibold">RH Target (50%)</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Activity className="w-3 h-3 text-blue-600 animate-pulse" />
          <span>Polling 1 Hz</span>
        </div>
      </div>

      <div className="relative w-full bg-slate-50/70 rounded-xl p-3 border border-slate-200 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
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
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  fill="#94A3B8"
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
                stroke="#10B981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {data.length > 1 && (
                <>
                  <polygon
                    points={`${paddingX},${innerH + paddingY} ${supplyPoints} ${width - paddingX},${innerH + paddingY}`}
                    fill="url(#blueAreaGrad)"
                  />
                  <polyline
                    fill="none"
                    stroke="#2563EB"
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
                    stroke="#0284C7"
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
                stroke="#10B981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {data.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#2563EB"
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
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {activeMetric === 'temp' ? (
                <>
                  <circle
                    cx={getX(hoveredIdx)}
                    cy={getY(data[hoveredIdx].supply_c)}
                    r="4"
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <circle
                    cx={getX(hoveredIdx)}
                    cy={getY(data[hoveredIdx].return_c)}
                    r="4"
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                </>
              ) : (
                <circle
                  cx={getX(hoveredIdx)}
                  cy={getY(data[hoveredIdx].rh_pct ?? 48.5)}
                  r="4"
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              )}
            </g>
          )}
        </svg>

        {hoveredData && hoveredIdx !== null && (
          <div
            className="absolute top-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-xl text-xs font-mono pointer-events-none z-20"
            style={{
              left: `${Math.min(width - 240, Math.max(20, (getX(hoveredIdx) / width) * 100))}%`,
            }}
          >
            <div className="text-[10px] text-slate-500 border-b border-slate-100 pb-1 mb-1.5 flex items-center justify-between gap-4 font-bold">
              <span>{hoveredData.time}</span>
              <span className="text-blue-600">SNAPSHOT</span>
            </div>
            {activeMetric === 'temp' ? (
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-blue-600 font-medium">Supply Air:</span>
                  <span className="text-slate-900 font-bold">{hoveredData.supply_c}°C</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-amber-600 font-medium">Return Air:</span>
                  <span className="text-slate-900 font-bold">{hoveredData.return_c}°C</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sky-600 font-medium">Room Space:</span>
                  <span className="text-slate-900 font-bold">{hoveredData.current_c}°C</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-emerald-700 font-medium">Setpoint:</span>
                  <span className="text-emerald-700 font-bold">{hoveredData.set_point_c}°C</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-blue-600 font-medium">RH Measured:</span>
                  <span className="text-slate-900 font-bold">{hoveredData.rh_pct ?? 48.5}%</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-emerald-700 font-medium">RH Target:</span>
                  <span className="text-emerald-700 font-bold">{hoveredData.rh_setpoint_pct ?? 50.0}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
