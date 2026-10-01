'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, X, ArrowRight } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                {title}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Two-Step Supervisory Interlock
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5 mb-5 border border-slate-200/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Target System:</span>
            <span className="font-mono font-bold text-blue-700">
              {targetComponent}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Operation:</span>
            <span className="font-medium text-slate-800">{actionDescription}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Command Payload:</span>
            <span className="font-mono font-bold text-emerald-700">
              {requestedValue}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
              <span className="text-slate-500">Slide to Authorize</span>
              <span className="text-blue-700 font-bold">{sliderProgress}%</span>
            </div>
            <div className="relative h-12 bg-slate-100 rounded-xl flex items-center px-2 border border-slate-200 overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-blue-100 transition-all"
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
                className="absolute flex items-center justify-center w-10 h-8 rounded-lg bg-blue-600 text-white font-bold shadow-sm pointer-events-none transition-all"
                style={{
                  left: `calc(${sliderProgress}% * 0.85 + 4px)`,
                }}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="w-full text-center text-xs text-slate-500 pointer-events-none select-none font-mono tracking-wider uppercase font-semibold">
                {sliderProgress > 80 ? (
                  'Release to Confirm'
                ) : (
                  <span className="inline-flex items-center gap-1.5 justify-center">
                    <span>Slide to Confirm</span>
                    <ArrowRight className="w-3.5 h-3.5 inline text-blue-600 animate-pulse" />
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-mono">
            <span>Timeout rollback: {secondsLeft}s</span>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="btn-press px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="btn-press px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold font-sans transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
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
