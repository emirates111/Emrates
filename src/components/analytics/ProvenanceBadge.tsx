import React from 'react';
import { Database, Activity, Sparkles, TrendingUp } from 'lucide-react';

export type ProvenanceType = 'observation' | 'statistical' | 'forecast' | 'ai_prediction';

interface ProvenanceBadgeProps {
  type: ProvenanceType;
  className?: string;
  size?: 'sm' | 'md';
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  type,
  className = '',
  size = 'sm',
}) => {
  const configs: Record<
    ProvenanceType,
    { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }
  > = {
    observation: {
      label: 'Historical Observation',
      icon: Database,
      classes:
        'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 dark:border-sky-500/40',
    },
    statistical: {
      label: 'Statistical Estimate',
      icon: Activity,
      classes:
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/40',
    },
    forecast: {
      label: 'Numerical Forecast',
      icon: TrendingUp,
      classes:
        'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30 dark:border-violet-500/40',
    },
    ai_prediction: {
      label: 'AI-Generated Prediction',
      icon: Sparkles,
      classes:
        'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-500/40',
    },
  };

  const current = configs[type];
  const Icon = current.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
        current.classes
      } ${isSm ? 'text-[10px] px-2.5 py-0.5' : 'text-xs px-3 py-1'} ${className}`}
    >
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>[{current.label}]</span>
    </span>
  );
};
