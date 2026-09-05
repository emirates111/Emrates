import React, { useState } from 'react';
import { Calendar, Compass, ShieldAlert, Sparkles, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { SeasonalPhase } from '../../types/weather';
import { ProvenanceBadge } from './ProvenanceBadge';

interface SeasonalTimelineCardProps {
  timeline: SeasonalPhase[];
  isDark: boolean;
}

export const SeasonalTimelineCard: React.FC<SeasonalTimelineCardProps> = ({ timeline, isDark }) => {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(
    () => timeline.find((p) => p.isActive)?.id || timeline[0]?.id || ''
  );

  const selectedPhase = timeline.find((p) => p.id === selectedPhaseId) || timeline[0];

  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      isDark
        ? 'bg-slate-900/80 border-slate-800/80 shadow-lg shadow-black/20'
        : 'bg-white/90 border-slate-200/90 shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold tracking-tight">Seasonal Weather Timeline & Transitions</h3>
            <ProvenanceBadge type="statistical" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Estimated seasonal onset, peak windows, and cessation intervals with statistical confidence ranges
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Ranges are empirical estimates (±5 to ±12 days)</span>
        </div>
      </div>

      {/* Visual Phase Ribbon / Progression Bar */}
      <div className="mb-6 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {timeline.map((phase) => {
            const isSelected = phase.id === selectedPhaseId;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setSelectedPhaseId(phase.id)}
                className={`p-2.5 rounded-xl text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-sky-500/40'
                    : 'hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                }`}
              >
                {/* Active Live Pulse */}
                {phase.isActive && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: phase.color }}
                    />
                    <span className="text-xs font-semibold truncate leading-tight">{phase.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                    {phase.period}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">
                    Conf: <strong className="text-emerald-500 font-semibold">{phase.confidence}%</strong>
                  </span>
                  {phase.isActive && (
                    <span className="text-emerald-500 font-medium text-[9px] uppercase tracking-wider">
                      Active Now
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Seasonal Phase Detailed Card */}
      {selectedPhase && (
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-800/40 border-slate-700/60'
            : 'bg-slate-50/80 border-slate-200/80'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: selectedPhase.color }}
                  />
                  {selectedPhase.name}
                </h4>
                {selectedPhase.isActive && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Current Active Seasonal Phase
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Estimated Window: <strong className="text-slate-700 dark:text-slate-200">{selectedPhase.period}</strong> • Peak Intensity:{' '}
                <strong className="text-sky-500 dark:text-sky-400">{selectedPhase.peakPeriod}</strong>
              </p>
            </div>

            {/* Confidence Gauge */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
                  Model Confidence
                </div>
                <div className="text-sm font-bold text-emerald-500">
                  {selectedPhase.confidence}% (±{selectedPhase.marginDays} days)
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-500">
                {selectedPhase.confidence}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-4">
            {/* Description */}
            <div className="md:col-span-6 space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Synoptic Climatology & Dynamics
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedPhase.description}
              </p>
            </div>

            {/* Key Characteristics */}
            <div className="md:col-span-6 space-y-2.5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Observable Markers & Sector Windows
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {selectedPhase.keyCharacteristics.map((char, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
