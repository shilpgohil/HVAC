'use client';

import React, { useState, useRef } from 'react';

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
      x: deltaY * -10,
      y: deltaX * 10,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const dimensions = {
    sm: { icon: 32, box: 'w-8 h-8' },
    md: { icon: 40, box: 'w-10 h-10' },
    lg: { icon: 52, box: 'w-13 h-13' },
  }[size];

  const colorConfig = {
    HEALTHY: {
      primary: '#0284C7',
      secondary: '#059669',
      glow: 'rgba(2, 132, 199, 0.25)',
      bg: '#F0F9FF',
      border: '#BAE6FD',
    },
    WARNING: {
      primary: '#D97706',
      secondary: '#F59E0B',
      glow: 'rgba(217, 119, 6, 0.25)',
      bg: '#FFFBEB',
      border: '#FDE68A',
    },
    CRITICAL: {
      primary: '#DC2626',
      secondary: '#EF4444',
      glow: 'rgba(220, 38, 38, 0.25)',
      bg: '#FEF2F2',
      border: '#FECACA',
    },
    OFFLINE: {
      primary: '#64748B',
      secondary: '#94A3B8',
      glow: 'rgba(100, 116, 139, 0.2)',
      bg: '#F8FAFC',
      border: '#E2E8F0',
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
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isHovered ? 'transform 100ms ease-out' : 'transform 400ms ease-out',
      }}
    >
      <div
        className={`relative ${dimensions.box} rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm`}
        style={{
          backgroundColor: colorConfig.bg,
          border: `1px solid ${colorConfig.border}`,
          boxShadow: isHovered ? `0 4px 16px ${colorConfig.glow}` : '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width={dimensions.icon}
          height={dimensions.icon}
          className="transition-transform duration-300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={colorConfig.border}
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          <g
            id="logo-rotor"
            className={isHovered ? 'spin-fast' : 'spin-slow'}
            style={{ transformOrigin: '50px 50px' }}
          >
            <path
              d="M50 50 C48 35, 36 24, 50 16 C55 24, 52 35, 50 50 Z"
              fill={colorConfig.primary}
            />
            <path
              d="M50 50 C65 48, 76 36, 84 50 C76 55, 65 52, 50 50 Z"
              fill={colorConfig.secondary}
            />
            <path
              d="M50 50 C52 65, 64 76, 50 84 C45 76, 48 65, 50 50 Z"
              fill={colorConfig.primary}
            />
            <path
              d="M50 50 C35 52, 24 64, 16 50 C24 45, 35 48, 50 50 Z"
              fill={colorConfig.secondary}
            />
          </g>

          <g id="logo-flow">
            <path
              d="M26 30 C34 22, 46 20, 56 22"
              stroke={colorConfig.primary}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="flow-anim"
            />
            <path
              d="M74 70 C66 78, 54 80, 44 78"
              stroke={colorConfig.secondary}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="flow-anim"
            />
          </g>

          <circle
            id="logo-core"
            cx="50"
            cy="50"
            r="7"
            fill="#FFFFFF"
            stroke={colorConfig.primary}
            strokeWidth="2"
            style={{
              filter: `drop-shadow(0 1px 3px ${colorConfig.glow})`,
            }}
          />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-slate-900 font-sans">
              HVAC Twin
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              PRO
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Supervisory Control Deck
          </span>
        </div>
      )}
    </div>
  );
}
