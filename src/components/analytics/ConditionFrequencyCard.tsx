import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { Sun, Cloud, CloudRain, Zap, ShieldCheck, Snowflake, Calendar, Clock, BarChart3 } from 'lucide-react';
import { ConditionFrequency, MonthlyClimateStat } from '../../types/weather';
import { ProvenanceBadge } from './ProvenanceBadge';

interface ConditionFrequencyCardProps {
  frequencies: ConditionFrequency[];
  monthlyStats: MonthlyClimateStat[];
  longestDrySpell: number;
  longestRainSpell: number;
  totalDays: number;
  isDark: boolean;
}

export const ConditionFrequencyCard: React.FC<ConditionFrequencyCardProps> = ({
  frequencies,
  monthlyStats,
  longestDrySpell,
  longestRainSpell,
  totalDays,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<'frequency' | 'duration' | 'monthly'>('frequency');

  const getConditionIcon = (type: string) => {
    switch (type) {
      case 'sunny':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'cloudy':
        return <Cloud className="w-4 h-4 text-slate-400" />;
      case 'rainy':
        return <CloudRain className="w-4 h-4 text-sky-500" />;
      case 'stormy':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'dry':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'snowy':
        return <Snowflake className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sun className="w-4 h-4 text-amber-500" />;
    }
  };

  // Prepare monthly dataset with estimated monthly condition breakdown
  const monthlyData = monthlyStats.map((m) => {
    const daysInMonth = 30;
    const rainDays = Math.min(daysInMonth, m.rainyDays);
    const dryDays = daysInMonth - rainDays;
    const cloudyDaysEst = Math.round(dryDays * (m.avgHumidity > 65 ? 0.45 : 0.25));
    const sunnyDaysEst = Math.max(0, dryDays - cloudyDaysEst);

    return {
      month: m.month,
      'Rainy Days': rainDays,
      'Sunny Days': sunnyDaysEst,
      'Cloudy Days': cloudyDaysEst,
      'Total Rain (mm)': m.totalRain,
    };
  });

  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      isDark
        ? 'bg-slate-900/80 border-slate-800/80 shadow-lg shadow-black/20'
        : 'bg-white/90 border-slate-200/90 shadow-sm'
    }`}>
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold tracking-tight">Weather Condition Frequency & Spells</h3>
            <ProvenanceBadge type="observation" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Statistical distribution and continuity durations analyzed across {totalDays} consecutive daily observations
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('frequency')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'frequency'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Annual %
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('duration')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'duration'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Spell Lengths
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monthly')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Monthly Shifts
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {frequencies.map((item) => (
          <div
            key={item.condition}
            className={`p-3.5 rounded-xl border transition-all ${
              isDark
                ? 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-1.5 rounded-lg bg-slate-200/50 dark:bg-slate-700/50">
                {getConditionIcon(item.type)}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/40 dark:bg-slate-700/40">
                {item.percentage}%
              </span>
            </div>
            <div className="text-sm font-semibold truncate mb-1">{item.condition}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
              <div>{item.days} days / yr</div>
              <div className="flex items-center gap-1 text-[11px] pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                <Clock className="w-3 h-3 opacity-60" />
                <span>Avg spell: {item.avgSpellLengthDays}d</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Area */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'frequency' ? (
            <BarChart data={frequencies} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
              <XAxis
                dataKey="condition"
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                angle={-10}
                textAnchor="end"
              />
              <YAxis
                unit="%"
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ConditionFrequency;
                    return (
                      <div className={`p-3 rounded-xl border text-xs shadow-xl backdrop-blur-md ${
                        isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                      }`}>
                        <div className="font-semibold mb-1 flex items-center gap-1.5">
                          {getConditionIcon(data.type)}
                          <span>{data.condition}</span>
                        </div>
                        <div className="text-slate-400 space-y-0.5">
                          <div>Annual Frequency: <strong className="text-sky-400">{data.percentage}%</strong> ({data.days} days)</div>
                          <div>Average Continuity: <strong>{data.avgSpellLengthDays} consecutive days</strong></div>
                          <div>Max Continuous Streak: <strong>{data.maxSpellLengthDays} days</strong></div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                {frequencies.map((entry) => (
                  <Cell key={`cell-${entry.condition}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : activeTab === 'duration' ? (
            <BarChart data={frequencies} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
              <XAxis
                dataKey="condition"
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                angle={-10}
                textAnchor="end"
              />
              <YAxis
                unit=" days"
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ConditionFrequency;
                    return (
                      <div className={`p-3 rounded-xl border text-xs shadow-xl backdrop-blur-md ${
                        isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                      }`}>
                        <div className="font-semibold mb-1">{data.condition} Duration</div>
                        <div>Average Continuous Spell: <strong className="text-sky-400">{data.avgSpellLengthDays} days</strong></div>
                        <div>Longest Recorded Streak: <strong className="text-amber-400">{data.maxSpellLengthDays} days</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar name="Average Spell (Days)" dataKey="avgSpellLengthDays" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              <Bar name="Max Recorded Streak (Days)" dataKey="maxSpellLengthDays" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis unit="d" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className={`p-3 rounded-xl border text-xs shadow-xl backdrop-blur-md ${
                        isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                      }`}>
                        <div className="font-semibold mb-1">{label} Weather Breakdown</div>
                        {payload.map((p: any) => (
                          <div key={p.name} className="flex justify-between gap-4">
                            <span style={{ color: p.color }}>{p.name}:</span>
                            <span className="font-medium">{p.value} {p.name.includes('Rain (mm)') ? 'mm' : 'days'}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="Rainy Days" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Cloudy Days" stackId="a" fill="#64748b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Sunny Days" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Continuity Insights Callout */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
          <span className="text-slate-600 dark:text-slate-300">
            <strong>Continuity Analysis:</strong> Longest unbroken dry stretch recorded was{' '}
            <strong className="text-emerald-500">{longestDrySpell} days</strong>; longest continuous rainy spell was{' '}
            <strong className="text-sky-500">{longestRainSpell} days</strong>.
          </span>
        </div>
        <ProvenanceBadge type="statistical" size="sm" />
      </div>
    </div>
  );
};
