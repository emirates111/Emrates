import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Activity,
  Layers,
  RefreshCw,
  Info,
  AlertTriangle,
  Sun,
  CloudRain,
  Flame,
  Thermometer,
} from 'lucide-react';
import { LocationData, ClimateAnalysisResponse, UnitPreferences } from '../../types/weather';
import { fetchHistoricalAnalysis } from '../../services/weatherApi';
import { ConditionFrequencyCard } from './ConditionFrequencyCard';
import { SeasonalTimelineCard } from './SeasonalTimelineCard';
import { TimeSeriesAnalysisCard } from './TimeSeriesAnalysisCard';
import { PredictedEffectsCard } from './PredictedEffectsCard';
import { ProvenanceBadge } from './ProvenanceBadge';
import { convertTemp } from '../../utils/units';

interface StatisticalDashboardProps {
  location: LocationData;
  units: UnitPreferences;
  isDark: boolean;
}

type SectionView = 'all' | 'frequencies' | 'timeline' | 'timeseries' | 'impacts';

export const StatisticalDashboard: React.FC<StatisticalDashboardProps> = ({
  location,
  units,
  isDark,
}) => {
  const [data, setData] = useState<ClimateAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionView>('all');

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHistoricalAnalysis(location);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load climate analysis:', err);
      setError(err.message || 'Could not load historical climate analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [location.latitude, location.longitude]);

  const tempUnit = units.temperature === 'celsius' ? '°C' : '°F';

  return (
    <section id="statistical-analysis-section" className="mt-12 space-y-6">
      {/* Section Header & Provenance Banner */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isDark
          ? 'bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border-slate-800 shadow-xl'
          : 'bg-gradient-to-r from-slate-50 via-white to-sky-50/50 border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/50 dark:border-slate-800/60">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
              <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Statistical & Time-Series Analysis
              </h2>
              <ProvenanceBadge type="observation" />
              <ProvenanceBadge type="statistical" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              Empirical climatological insights for <strong className="text-slate-800 dark:text-slate-200">{location.name}</strong>, analyzing 365 days of ERA5 reanalysis, seasonal transition patterns, continuous spell durations, and multisector impact forecasts.
            </p>
          </div>

          {/* Refresh & Provenance Metadata Button */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto">
            <button
              type="button"
              onClick={loadAnalysis}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all border border-slate-200 dark:border-slate-700 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing Data...' : 'Refresh Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Observation Metadata & Quick KPI Bar */}
        {data && !loading && (
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Hottest Day</div>
              <div className="text-sm font-bold text-amber-500 flex items-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5" />
                <span>{convertTemp(data.summaryMetrics.hottestDay.temp, units.temperature)}{tempUnit}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{data.summaryMetrics.hottestDay.date}</div>
            </div>

            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Coldest Day</div>
              <div className="text-sm font-bold text-sky-400 flex items-center gap-1 mt-0.5">
                <Thermometer className="w-3.5 h-3.5" />
                <span>{convertTemp(data.summaryMetrics.coldestDay.temp, units.temperature)}{tempUnit}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{data.summaryMetrics.coldestDay.date}</div>
            </div>

            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Total Rainfall</div>
              <div className="text-sm font-bold text-sky-500 flex items-center gap-1 mt-0.5">
                <CloudRain className="w-3.5 h-3.5" />
                <span>{data.summaryMetrics.totalAnnualRainfall} mm</span>
              </div>
              <div className="text-[10px] text-slate-400">{data.summaryMetrics.rainyDaysCount} rain days</div>
            </div>

            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Wettest Single Day</div>
              <div className="text-sm font-bold text-indigo-400 flex items-center gap-1 mt-0.5">
                <CloudRain className="w-3.5 h-3.5" />
                <span>{data.summaryMetrics.wettestDay.precip} mm</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{data.summaryMetrics.wettestDay.date}</div>
            </div>

            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Max Dry Spell</div>
              <div className="text-sm font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                <Sun className="w-3.5 h-3.5" />
                <span>{data.summaryMetrics.longestDrySpellDays} days</span>
              </div>
              <div className="text-[10px] text-slate-400">Continuous stretch</div>
            </div>

            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Max Rain Spell</div>
              <div className="text-sm font-bold text-sky-500 flex items-center gap-1 mt-0.5">
                <CloudRain className="w-3.5 h-3.5" />
                <span>{data.summaryMetrics.longestRainySpellDays} days</span>
              </div>
              <div className="text-[10px] text-slate-400">Continuous stretch</div>
            </div>
          </div>
        )}

        {/* Section View Selector */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeSection === 'all'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/60'
            }`}
          >
            All Modules
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('frequencies')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeSection === 'frequencies'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/60'
            }`}
          >
            Condition Frequencies & Spells
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('timeline')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeSection === 'timeline'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/60'
            }`}
          >
            Seasonal Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('timeseries')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeSection === 'timeseries'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/60'
            }`}
          >
            Time-Series & Anomalies
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('impacts')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeSection === 'impacts'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/60'
            }`}
          >
            Predicted Sector Effects
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className={`p-12 rounded-3xl border text-center space-y-4 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-12 h-12 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h4 className="text-base font-semibold">Retrieving Historical Climate Reanalysis...</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Extracting 365 daily meteorological observations, calculating moving averages, identifying climatological anomalies, and generating confidence intervals.
            </p>
          </div>
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadAnalysis}
            className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Active Modules Content */}
      {data && !loading && (
        <div className="space-y-6">
          {(activeSection === 'all' || activeSection === 'frequencies') && (
            <ConditionFrequencyCard
              frequencies={data.conditionFrequencies}
              monthlyStats={data.monthlyStats}
              longestDrySpell={data.summaryMetrics.longestDrySpellDays}
              longestRainSpell={data.summaryMetrics.longestRainySpellDays}
              totalDays={data.totalDaysAnalyzed}
              isDark={isDark}
            />
          )}

          {(activeSection === 'all' || activeSection === 'timeline') && (
            <SeasonalTimelineCard
              timeline={data.seasonalTimeline}
              isDark={isDark}
            />
          )}

          {(activeSection === 'all' || activeSection === 'timeseries') && (
            <TimeSeriesAnalysisCard
              timeSeries={data.timeSeries}
              forecastPredictions={data.forecastPredictions}
              anomalies={data.anomalies}
              units={units}
              isDark={isDark}
            />
          )}

          {(activeSection === 'all' || activeSection === 'impacts') && (
            <PredictedEffectsCard
              analysis={data}
              isDark={isDark}
            />
          )}
        </div>
      )}
    </section>
  );
};
