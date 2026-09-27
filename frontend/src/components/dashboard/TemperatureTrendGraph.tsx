'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Droplets } from 'lucide-react';
import { fetchTemperatureHistory, HistoryPoint } from '@/lib/api';

interface TemperatureTrendGraphProps {
  initialHistory?: HistoryPoint[];
}

export function TemperatureTrendGraph({ initialHistory }: TemperatureTrendGraphProps) {
  const [timeRange, setTimeRange] = useState<'1H' | '6H' | '12H' | '24H'>('12H');
  const [activeMetric, setActiveMetric] = useState<'temp' | 'rh'>('temp');
  const [data, setData] = useState<HistoryPoint[]>(initialHistory || []);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const loadHistory = useCallback(async (range: string) => {
    try {
      const points = await fetchTemperatureHistory(range);
      if (points && points.length > 0) {
        setData(points);
      }
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    loadHistory(timeRange);
    const interval = setInterval(() => {
      loadHistory(timeRange);
    }, 3000);
    return () => clearInterval(interval);
  }, [timeRange, loadHistory]);

  const minY = activeMetric === 'temp' ? 10 : 20;
  const maxY = activeMetric === 'temp' ? 35 : 80;
  const rangeY = maxY - minY;
  const width = 800;
  const height = 240;
  const paddingX = 50;
  const paddingY = 35;
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

  // Temp Points
  const supplyPoints = data.map((d, i) => `${getX(i)},${getY(d.supply_c)}`).join(' ');
  const returnPoints = data.map((d, i) => `${getX(i)},${getY(d.return_c)}`).join(' ');
  const currentSetPoint = data.length > 0 ? data[data.length - 1].set_point_c : 22.0;
  const setPointY = getY(currentSetPoint);

  // RH Points
  const rhPoints = data.map((d, i) => `${getX(i)},${getY(d.rh_pct ?? 48.5)}`).join(' ');
  const currentRhSetPoint = data.length > 0 ? (data[data.length - 1].rh_setpoint_pct ?? 50.0) : 50.0;
  const rhSetPointY = getY(currentRhSetPoint);

  // Comfort band (45% to 55% RH)
  const rhComfortTop = getY(55);
  const rhComfortBottom = getY(45);

  const yTicks = activeMetric === 'temp' 
    ? [10, 15, 20, 25, 30, 35] 
    : [20, 35, 50, 65, 80];

  return (
    <div className="rounded-3xl p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] border border-slate-200/80 bg-white/90 backdrop-blur-md flex flex-col transition-all duration-300 relative overflow-hidden">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-2xs">
            {activeMetric === 'temp' ? <TrendingUp className="w-4 h-4" /> : <Droplets className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight">
                {activeMetric === 'temp' ? 'Temperature Telemetry' : 'Psychrometric Humidity (RH)'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono-numbers px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                Live Sensor Stream
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {activeMetric === 'temp' 
                ? 'Supply & Return Air differential tracking with dynamic setpoint' 
                : 'Cleanroom Relative Humidity with psychrometric dew point buffer'}
            </div>
          </div>
        </div>

        {/* Metric Selector Pill (Temp vs RH) */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setActiveMetric('temp')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
              activeMetric === 'temp'
                ? 'bg-white text-sky-950 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Temperature (°C)</span>
          </button>
          <button
            onClick={() => setActiveMetric('rh')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
              activeMetric === 'rh'
                ? 'bg-white text-emerald-950 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Humidity (% RH)</span>
          </button>
        </div>

        {/* Legend */}
        {activeMetric === 'temp' ? (
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-slate-700 font-medium">Supply</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-700 font-medium">Return</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-0.5 bg-blue-600 border-b border-dashed border-blue-600" />
              <span className="text-slate-700 font-medium">Setpoint</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-slate-700 font-medium">Actual RH %</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-0.5 bg-emerald-600 border-b border-dashed border-emerald-600" />
              <span className="text-slate-700 font-medium">RH Target</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-2 rounded bg-emerald-100 border border-emerald-300" />
              <span className="text-slate-700 font-medium">Comfort (45-55%)</span>
            </div>
          </div>
        )}

        {/* Time Filter Pills */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/80 shadow-xs">
          {(['1H', '6H', '12H', '24H'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setTimeRange(r);
                loadHistory(r);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeRange === r
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Line Graph */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
        >
          <defs>
            <linearGradient id="supplyAreaLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="returnAreaLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="rhAreaLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Cleanroom Comfort Band for RH mode */}
          {activeMetric === 'rh' && (
            <rect
              x={paddingX}
              y={rhComfortTop}
              width={innerW}
              height={rhComfortBottom - rhComfortTop}
              fill="rgba(16, 185, 129, 0.08)"
              stroke="rgba(16, 185, 129, 0.3)"
              strokeDasharray="4 4"
            />
          )}

          {/* Y Gridlines and Labels */}
          {yTicks.map((val) => {
            const yPos = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={yPos}
                  x2={width - paddingX}
                  y2={yPos}
                  stroke="rgba(15, 23, 42, 0.07)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 10}
                  y={yPos + 4}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {val}{activeMetric === 'temp' ? '°C' : '%'}
                </text>
              </g>
            );
          })}

          {/* Set Point Reference Line */}
          {activeMetric === 'temp' ? (
            <line
              x1={paddingX}
              y1={setPointY}
              x2={width - paddingX}
              y2={setPointY}
              stroke="#0284C7"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.8"
            />
          ) : (
            <line
              x1={paddingX}
              y1={rhSetPointY}
              x2={width - paddingX}
              y2={rhSetPointY}
              stroke="#059669"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.85"
            />
          )}

          {/* Data Lines: Temperature Mode */}
          {activeMetric === 'temp' && data.length > 1 && (
            <>
              {/* Supply Area Fill */}
              <polygon
                fill="url(#supplyAreaLight)"
                points={`${getX(0)},${height - paddingY} ${supplyPoints} ${getX(data.length - 1)},${height - paddingY}`}
              />
              {/* Supply Polyline */}
              <polyline
                fill="none"
                stroke="#0284C7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={supplyPoints}
              />
              {/* Return Polyline */}
              <polyline
                fill="none"
                stroke="#D97706"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={returnPoints}
              />
            </>
          )}

          {/* Data Lines: RH Mode */}
          {activeMetric === 'rh' && data.length > 1 && (
            <>
              {/* RH Area Fill */}
              <polygon
                fill="url(#rhAreaLight)"
                points={`${getX(0)},${height - paddingY} ${rhPoints} ${getX(data.length - 1)},${height - paddingY}`}
              />
              {/* RH Polyline */}
              <polyline
                fill="none"
                stroke="#0284C7"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={rhPoints}
              />
            </>
          )}

          {/* Interactive Nodes */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredIdx === i;

            return (
              <g key={i} className="cursor-pointer">
                {/* Vertical hover crosshair */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={height - paddingY}
                    stroke="rgba(15, 23, 42, 0.2)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {activeMetric === 'temp' ? (
                  <>
                    <circle
                      cx={x}
                      cy={getY(d.supply_c)}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#FFFFFF"
                      stroke="#0284C7"
                      strokeWidth="2"
                    />
                    <circle
                      cx={x}
                      cy={getY(d.return_c)}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#FFFFFF"
                      stroke="#D97706"
                      strokeWidth="2"
                    />
                  </>
                ) : (
                  <circle
                    cx={x}
                    cy={getY(d.rh_pct ?? 48.5)}
                    r={isHovered ? 5.5 : 3.5}
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="2.5"
                  />
                )}

                {/* Invisible hover hotspot */}
                <rect
                  x={x - 15}
                  y={paddingY}
                  width={30}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {/* X Axis Time Labels */}
                {(data.length <= 12 || i % 2 === 0 || i === data.length - 1) && (
                  <text
                    x={x}
                    y={height - paddingY + 18}
                    fill="#64748B"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                  >
                    {d.time}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card (Light Mode) */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div
            className="absolute top-2 z-20 rounded-xl p-3 bg-white/95 border border-slate-200/90 shadow-xl pointer-events-none text-xs backdrop-blur-md"
            style={{
              left: `${Math.min(width - 150, Math.max(50, getX(hoveredIdx) - 60))}px`
            }}
          >
            <div className="font-mono-numbers font-semibold text-slate-500 pb-1.5 border-b border-slate-100 text-[10px]">
              {data[hoveredIdx].time}
            </div>
            {activeMetric === 'temp' ? (
              <div className="space-y-1 pt-1.5 font-mono-numbers">
                <div className="flex justify-between space-x-3 text-sky-700">
                  <span>Supply:</span>
                  <span className="font-bold">{data[hoveredIdx].supply_c.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between space-x-3 text-amber-700">
                  <span>Return:</span>
                  <span className="font-bold">{data[hoveredIdx].return_c.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between space-x-3 text-slate-500 pt-1 border-t border-slate-100">
                  <span>Setpoint:</span>
                  <span>{data[hoveredIdx].set_point_c.toFixed(1)}°C</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1 pt-1.5 font-mono-numbers">
                <div className="flex justify-between space-x-3 text-sky-700">
                  <span>Actual RH:</span>
                  <span className="font-bold">{(data[hoveredIdx].rh_pct ?? 48.5).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between space-x-3 text-slate-500 pt-1 border-t border-slate-100">
                  <span>Target RH:</span>
                  <span>{(data[hoveredIdx].rh_setpoint_pct ?? 50.0).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
