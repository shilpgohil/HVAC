'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface TwoStepConfirmModalProps {
  isOpen: boolean;
  title: string;
  targetComponent: string;
  actionDescription: string;
  requestedValue: string | number;
  onConfirm: () => void;
  onCancel: () => void;
  countdownSeconds?: number;
}

export function TwoStepConfirmModal({
  isOpen,
  title,
  targetComponent,
  actionDescription,
  requestedValue,
  onConfirm,
  onCancel,
  countdownSeconds = 8,
}: TwoStepConfirmModalProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(countdownSeconds);
  const [sliderProgress, setSliderProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(countdownSeconds);
      setSliderProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, countdownSeconds, onCancel]);

  if (!isOpen) return null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderProgress(val);
    if (val >= 98) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md surface-panel rounded-2xl p-6 border border-cyan-500/30 shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Two-Step Supervisory Interlock
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="surface-well rounded-xl p-3.5 mb-5 border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Target System:</span>
            <span className="font-mono font-bold text-cyan-400">
              {targetComponent}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Operation:</span>
            <span className="font-medium text-slate-200">{actionDescription}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Command Payload:</span>
            <span className="font-mono font-bold text-emerald-400">
              {requestedValue}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
              <span className="text-slate-400">Slide to Authorize</span>
              <span className="text-cyan-400 font-bold">{sliderProgress}%</span>
            </div>
            <div className="relative h-12 surface-well rounded-xl flex items-center px-2 border border-white/10 overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-600/30 to-cyan-500/50 transition-all"
                style={{ width: `${sliderProgress}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={sliderProgress}
                onChange={handleSliderChange}
                className="w-full h-8 opacity-0 z-10 cursor-pointer"
              />
              <div
                className="absolute flex items-center justify-center w-10 h-8 rounded-lg bg-cyan-500 text-slate-950 font-bold shadow-lg pointer-events-none transition-all"
                style={{
                  left: `calc(${sliderProgress}% * 0.85 + 4px)`,
                }}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="w-full text-center text-xs text-slate-400 pointer-events-none select-none font-mono tracking-wider uppercase">
                {sliderProgress > 80 ? 'Release to Confirm' : 'Slide ➔'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400 font-mono">
            <span>Timeout rollback: {secondsLeft}s</span>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-sans transition-colors"
              >
                Authorize Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
