import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, AlertTriangle, Filter, Eye, Layers, Calendar } from 'lucide-react';
import { TimeSeriesPoint, ForecastPredictionPoint, AnomalyRecord, UnitPreferences } from '../../types/weather';
import { ProvenanceBadge } from './ProvenanceBadge';
import { convertTemp, convertSpeed } from '../../utils/units';

interface TimeSeriesAnalysisCardProps {
  timeSeries: TimeSeriesPoint[];
  forecastPredictions: ForecastPredictionPoint[];
  anomalies: AnomalyRecord[];
  units: UnitPreferences;
  isDark: boolean;
}

type MetricType = 'temperature' | 'rainfall' | 'humidity_wind' | 'prediction_interval';
type TimeWindow = '365d' | '90d' | '30d' | 'forecast';

export const TimeSeriesAnalysisCard: React.FC<TimeSeriesAnalysisCardProps> = ({
  timeSeries,
  forecastPredictions,
  anomalies,
  units,
  isDark,
}) => {
  const [metric, setMetric] = useState<MetricType>('temperature');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('90d');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);

  // Historical data filtered by window
  let sliceCount = 365;
  if (timeWindow === '90d') sliceCount = 90;
  if (timeWindow === '30d') sliceCount = 30;

  const historicalData = timeSeries.slice(-sliceCount).map((pt) => ({
    ...pt,
    temperature: convertTemp(pt.temperature, units.temperature),
    tempMA7: convertTemp(pt.tempMA7, units.temperature),
    tempMA30: convertTemp(pt.tempMA30, units.temperature),
    tempNormal: convertTemp(pt.tempNormal, units.temperature),
    windSpeed: convertSpeed(pt.windSpeed, units.windSpeed),
  }));

  // Forecast prediction intervals
  const forecastData = forecastPredictions.map((f) => ({
    label: f.label,
    date: f.date,
    projectedTemp: convertTemp(f.projectedTemp, units.temperature),
    upper80: convertTemp(f.upper80, units.temperature),
    lower80: convertTemp(f.lower80, units.temperature),
    upper95: convertTemp(f.upper95, units.temperature),
    lower95: convertTemp(f.lower95, units.temperature),
    projectedRain: f.projectedRain,
    rainUpper80: f.rainUpper80,
  }));

  const tempUnit = units.temperature === 'celsius' ? '°C' : '°F';
  const speedUnit = units.windSpeed === 'kmh' ? 'km/h' : 'mph';

  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      isDark
        ? 'bg-slate-900/80 border-slate-800/80 shadow-lg shadow-black/20'
        : 'bg-white/90 border-slate-200/90 shadow-sm'
    }`}>
      {/* Header & Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-semibold tracking-tight">Time-Series Climatological Analysis</h3>
            {metric === 'prediction_interval' ? (
              <ProvenanceBadge type="forecast" />
            ) : (
              <div className="flex items-center gap-1.5">
                <ProvenanceBadge type="observation" />
                <ProvenanceBadge type="statistical" />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rolling moving averages (MA-7 & MA-30), seasonal normal baselines, and variance prediction intervals
          </p>
        </div>

        {/* Metric Toggles */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => {
              setMetric('temperature');
              if (timeWindow === 'forecast') setTimeWindow('90d');
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              metric === 'temperature'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Temperature & MAs
          </button>
          <button
            type="button"
            onClick={() => {
              setMetric('rainfall');
              if (timeWindow === 'forecast') setTimeWindow('90d');
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              metric === 'rainfall'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Rainfall & Spells
          </button>
          <button
            type="button"
            onClick={() => {
              setMetric('humidity_wind');
              if (timeWindow === 'forecast') setTimeWindow('90d');
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              metric === 'humidity_wind'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Humidity & Wind
          </button>
          <button
            type="button"
            onClick={() => {
              setMetric('prediction_interval');
              setTimeWindow('forecast');
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1 ${
              metric === 'prediction_interval'
                ? 'bg-violet-500 text-white shadow-xs'
                : 'text-violet-600 dark:text-violet-400 hover:text-violet-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>14-Day Prediction Intervals</span>
          </button>
        </div>
      </div>

      {/* Secondary Controls Bar: Horizon Filter & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200/50 dark:border-slate-800/60 text-xs">
        {metric !== 'prediction_interval' && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Time Horizon:</span>
            {(['30d', '90d', '365d'] as TimeWindow[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setTimeWindow(w)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  timeWindow === w
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300'
                }`}
              >
                {w === '30d' ? 'Last 30 Days' : w === '90d' ? 'Last 90 Days' : 'Full Year (365d)'}
              </button>
            ))}
          </div>
        )}

        {metric === 'prediction_interval' && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <span className="inline-block w-3 h-3 rounded bg-violet-400/30 border border-violet-500/60" />
            <span>80% & 95% Confidence Prediction Intervals based on historical seasonal variance</span>
          </div>
        )}

        {anomalies.length > 0 && metric !== 'prediction_interval' && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{anomalies.length} statistical anomalies detected (&gt;2σ deviation)</span>
          </div>
        )}
      </div>

      {/* Interactive Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metric === 'temperature' ? (
            <ComposedChart data={historicalData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={25} />
              <YAxis unit={tempUnit} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className={`p-3 rounded-xl border text-xs shadow-xl backdrop-blur-md ${
                        isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                      }`}>
                        <div className="font-semibold mb-1 flex items-center justify-between gap-2">
                          <span>{label} ({d.date})</span>
                          {d.isAnomaly && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-400 font-bold">
                              ANOMALY
                            </span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-amber-400 font-medium">Observed Mean: {d.temperature}{tempUnit}</div>
                          <div className="text-sky-400">7-Day Moving Avg: {d.tempMA7}{tempUnit}</div>
                          <div className="text-indigo-400">30-Day Moving Avg: {d.tempMA30}{tempUnit}</div>
                          <div className="text-slate-400">Seasonal Normal: {d.tempNormal}{tempUnit}</div>
                        </div>
                        {d.isAnomaly && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-700 text-amber-300 text-[10px]">
                            {d.anomalyDescription}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" name="Seasonal Normal" dataKey="tempNormal" stroke="#94a3b8" strokeDasharray="5 5" dot={false} strokeWidth={1.5} />
              <Line type="monotone" name="30-Day MA" dataKey="tempMA30" stroke="#818cf8" dot={false} strokeWidth={2} />
              <Line type="monotone" name="7-Day MA" dataKey="tempMA7" stroke="#38bdf8" dot={false} strokeWidth={2} />
              <Line type="monotone" name="Daily Observed" dataKey="temperature" stroke="#f59e0b" dot={false} strokeWidth={1.5} />
            </ComposedChart>
          ) : metric === 'rainfall' ? (
            <ComposedChart data={historicalData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={25} />
              <YAxis unit=" mm" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className={`p-3 rounded-xl border text-xs shadow-xl backdrop-blur-md ${
                        isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                      }`}>
                        <div className="font-semibold mb-1">{label} ({d.date})</div>
                        <div className="space-y-0.5">
                          <div className="text-sky-400 font-medium">Daily Precipitation: {d.precipitation} mm</div>
                          <div className="text-indigo-400">7-Day Rolling Rain Avg: {d.precipMA7} mm</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="precipitation" name="Daily Rain (mm)" fill="#0284c7" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Line type="monotone" name="7-Day Rain MA" dataKey="precipMA7" stroke="#6366f1" strokeWidth={2} dot={false} />
            </ComposedChart>
          ) : metric === 'humidity_wind' ? (
            <ComposedChart data={historicalData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={25} />
              <YAxis yAxisId="left" unit="%" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" unit={` ${speedUnit}`} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className={`p-3 rounded-xl border text-xs shadow-xl backdrop-blur-md ${
                        isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                      }`}>
                        <div className="font-semibold mb-1">{label} ({d.date})</div>
                        <div className="text-emerald-400">Relative Humidity: {d.humidity}%</div>
                        <div className="text-cyan-400">Peak Wind Speed: {d.windSpeed} {speedUnit}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area yAxisId="left" type="monotone" name="Humidity (%)" dataKey="humidity" fill="#10b981" stroke="#10b981" fillOpacity={0.15} strokeWidth={1.5} />
              <Line yAxisId="right" type="monotone" name={`Wind Speed (${speedUnit})`} dataKey="windSpeed" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </ComposedChart>
          ) : (
            // Forecast with Prediction Intervals
            <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis unit={tempUnit} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className={`p-3 rounded-xl border text-xs shadow-xl backdrop-blur-md ${
                        isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                      }`}>
                        <div className="font-semibold mb-1 flex items-center justify-between gap-3">
                          <span>{label} ({d.date})</span>
                          <span className="text-[10px] text-violet-400 font-bold">[Forecast Interval]</span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-white font-bold text-sm">
                            Projected Mean: {d.projectedTemp}{tempUnit}
                          </div>
                          <div className="text-violet-300">
                            80% Confidence Interval: [{d.lower80}{tempUnit} to {d.upper80}{tempUnit}]
                          </div>
                          <div className="text-slate-400">
                            95% Confidence Interval: [{d.lower95}{tempUnit} to {d.upper95}{tempUnit}]
                          </div>
                          <div className="text-sky-400 pt-1 border-t border-slate-700">
                            Projected Rain: {d.projectedRain} mm (Upper Bound: {d.rainUpper80} mm)
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" name="95% Confidence Interval" dataKey="upper95" stroke="none" fill="#8b5cf6" fillOpacity={0.12} />
              <Area type="monotone" name="80% Confidence Interval" dataKey="upper80" stroke="none" fill="#8b5cf6" fillOpacity={0.25} />
              <Line type="monotone" name="Lower 80% Bound" dataKey="lower80" stroke="#a78bfa" strokeDasharray="3 3" dot={false} strokeWidth={1} />
              <Line type="monotone" name="Projected Temperature" dataKey="projectedTemp" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3, fill: '#7c3aed' }} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Anomalies Callout Section */}
      {anomalies.length > 0 && metric !== 'prediction_interval' && (
        <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-800/60">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Statistical Climatological Anomalies (Past 12 Months)</span>
            </span>
            <span className="text-[11px] text-slate-400">Threshold: &gt;2.1σ Standard Deviation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {anomalies.slice(0, 6).map((anom, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  anom.type === 'heatwave'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                    : anom.type === 'cold_snap'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300'
                    : 'bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300'
                }`}
              >
                <div className="font-bold shrink-0">{anom.date}</div>
                <div className="flex-1 truncate">
                  <div className="font-semibold capitalize">{anom.type.replace('_', ' ')}</div>
                  <div className="text-[11px] opacity-85 truncate">{anom.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
