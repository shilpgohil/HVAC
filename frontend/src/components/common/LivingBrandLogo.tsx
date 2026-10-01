'use client';

import React, { useState, useRef, useEffect } from 'react';

interface LivingBrandLogoProps {
  systemHealth?: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export function LivingBrandLogo({
  systemHealth = 'HEALTHY',
  size = 'md',
  showWordmark = true,
}: LivingBrandLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    setTilt({
      x: deltaY * -12,
      y: deltaX * 12,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const dimensions = {
    sm: { icon: 32, box: 'w-8 h-8' },
    md: { icon: 42, box: 'w-10 h-10' },
    lg: { icon: 56, box: 'w-14 h-14' },
  }[size];

  const colorConfig = {
    HEALTHY: {
      primary: '#06B6D4',
      secondary: '#22C55E',
      glow: 'rgba(6, 182, 212, 0.4)',
      bg: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.3)',
    },
    WARNING: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      glow: 'rgba(245, 158, 11, 0.4)',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
    },
    CRITICAL: {
      primary: '#EF4444',
      secondary: '#F87171',
      glow: 'rgba(239, 68, 68, 0.5)',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
    },
    OFFLINE: {
      primary: '#94A3B8',
      secondary: '#64748B',
      glow: 'rgba(148, 163, 184, 0.2)',
      bg: 'rgba(148, 163, 184, 0.08)',
      border: 'rgba(148, 163, 184, 0.2)',
    },
  }[systemHealth];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="flex items-center gap-3 select-none cursor-pointer group"
      style={{
        perspective: '600px',
      }}
    >
      <div
        className={`relative ${dimensions.box} rounded-xl flex items-center justify-center transition-transform duration-200 ease-out`}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.05 : 1})`,
          background: colorConfig.bg,
          border: `1px solid ${colorConfig.border}`,
          boxShadow: `0 0 20px -2px ${colorConfig.glow}, inset 0 1px 0 0 rgba(255, 255, 255, 0.15)`,
        }}
      >
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke={colorConfig.primary}
            strokeWidth="1.5"
            strokeDasharray="4 2"
            strokeOpacity="0.4"
          />

          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="2"
          />

          <g
            id="logo-rotor"
            className={isHovered ? 'spin-fast' : 'spin-slow'}
            style={{ transformOrigin: '50px 50px' }}
          >
            <path
              d="M50 50 C48 35, 36 24, 50 16 C55 24, 52 35, 50 50 Z"
              fill={colorConfig.primary}
              fillOpacity="0.8"
            />
            <path
              d="M50 50 C65 48, 76 36, 84 50 C76 55, 65 52, 50 50 Z"
              fill={colorConfig.secondary}
              fillOpacity="0.8"
            />
            <path
              d="M50 50 C52 65, 64 76, 50 84 C45 76, 48 65, 50 50 Z"
              fill={colorConfig.primary}
              fillOpacity="0.8"
            />
            <path
              d="M50 50 C35 52, 24 64, 16 50 C24 45, 35 48, 50 50 Z"
              fill={colorConfig.secondary}
              fillOpacity="0.8"
            />
          </g>

          <g id="logo-flow">
            <path
              d="M26 30 C34 22, 46 20, 56 22"
              stroke={colorConfig.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.7"
              className="flow-anim"
            />
            <path
              d="M74 70 C66 78, 54 80, 44 78"
              stroke={colorConfig.secondary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.7"
              className="flow-anim"
            />
          </g>

          <circle
            id="logo-core"
            cx="50"
            cy="50"
            r="7"
            fill="#FFFFFF"
            style={{
              filter: `drop-shadow(0 0 6px ${colorConfig.primary})`,
            }}
          />
        </svg>

        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="w-full h-full animate-sheen" />
        </div>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-wider uppercase text-white font-sans">
              HVAC TWIN
            </span>
            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 tracking-widest">
              PRO
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono tracking-tight">
            Supervisory Control Deck
          </span>
        </div>
      )}
    </div>
  );
}
