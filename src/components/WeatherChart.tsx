import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Thermometer, Droplets, Wind } from 'lucide-react';
import { HourlyForecastItem, UnitPreferences } from '../types/weather';
import { convertTemperature, convertSpeed } from '../utils/units';

interface WeatherChartProps {
  hourly: HourlyForecastItem[];
  units: UnitPreferences;
  isDark: boolean;
  title?: string;
}

type ChartMetric = 'temperature' | 'precipitation' | 'wind';

export const WeatherChart: React.FC<WeatherChartProps> = ({
  hourly,
  units,
  isDark,
  title = '24-Hour Trend Chart',
}) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('temperature');

  // Format chart data based on selected units
  const chartData = hourly.map((item) => {
    return {
      time: item.hourLabel,
      rawTime: item.time,
      condition: item.condition,
      temperature: convertTemperature(item.temperature, units.temperature),
      feelsLike: convertTemperature(item.feelsLike, units.temperature),
      precipitation: item.precipitationProbability,
      windSpeed: convertSpeed(item.windSpeed, units.windSpeed),
    };
  });

  const getMetricConfig = () => {
    switch (activeMetric) {
      case 'temperature':
        return {
          key: 'temperature',
          name: 'Temperature',
          unit: units.temperature === 'celsius' ? '°C' : '°F',
          stroke: '#f59e0b',
          fill: '#f59e0b',
          gradientId: 'tempGradient',
        };
      case 'precipitation':
        return {
          key: 'precipitation',
          name: 'Precipitation Chance',
          unit: '%',
          stroke: '#38bdf8',
          fill: '#38bdf8',
          gradientId: 'precipGradient',
        };
      case 'wind':
        return {
          key: 'windSpeed',
          name: 'Wind Speed',
          unit: units.windSpeed,
          stroke: '#2dd4bf',
          fill: '#2dd4bf',
          gradientId: 'windGradient',
        };
    }
  };

  const metric = getMetricConfig();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={`p-3 rounded-xl border shadow-xl backdrop-blur-md text-xs space-y-1 ${
            isDark
              ? 'bg-slate-900/90 border-slate-700 text-slate-100'
              : 'bg-white/90 border-slate-200 text-slate-900'
          }`}
        >
          <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="text-slate-400 font-normal">{data.condition}</span>
          </p>
          <div className="pt-1 flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: metric.stroke }}
            />
            <span className="font-semibold text-sm">
              {payload[0].value} {metric.unit}
            </span>
          </div>
          {activeMetric === 'temperature' && (
            <p className="text-[11px] text-slate-400">
              Feels like {data.feelsLike}
              {metric.unit}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <section
      aria-label="Weather Chart"
      className={`rounded-3xl border p-5 sm:p-6 backdrop-blur-xl transition-all shadow-md ${
        isDark
          ? 'bg-slate-900/60 border-slate-700/60 text-white'
          : 'bg-white/80 border-slate-200/80 text-slate-900 shadow-slate-200/50'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive timeline projections
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveMetric('temperature')}
            aria-pressed={activeMetric === 'temperature'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMetric === 'temperature'
                ? 'bg-white dark:bg-slate-700 text-amber-500 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temperature</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('precipitation')}
            aria-pressed={activeMetric === 'precipitation'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMetric === 'precipitation'
                ? 'bg-white dark:bg-slate-700 text-sky-500 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Precipitation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('wind')}
            aria-pressed={activeMetric === 'wind'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMetric === 'wind'
                ? 'bg-white dark:bg-slate-700 text-teal-500 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Speed</span>
          </button>
        </div>
      </div>

      {/* Recharts chart canvas */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={metric.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.fill} stopOpacity={0.4} />
                <stop offset="95%" stopColor={metric.fill} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? '#334155' : '#e2e8f0'}
              opacity={0.6}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
              unit={activeMetric === 'precipitation' ? '%' : ''}
              domain={activeMetric === 'precipitation' ? [0, 100] : ['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={metric.key}
              stroke={metric.stroke}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${metric.gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
