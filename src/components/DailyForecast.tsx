import React, { useState } from 'react';
import { Calendar, Droplets, ChevronRight } from 'lucide-react';
import { DailyForecastItem, UnitPreferences } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp } from '../utils/units';

interface DailyForecastProps {
  daily: DailyForecastItem[];
  selectedDate: string;
  onSelectDay: (day: DailyForecastItem) => void;
  units: UnitPreferences;
  isDark: boolean;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({
  daily,
  selectedDate,
  onSelectDay,
  units,
  isDark,
}) => {
  const [range, setRange] = useState<number>(7);

  const availableDays = daily.length;
  const activeCount = Math.min(range, availableDays);
  const visibleDays = daily.slice(0, activeCount);

  // Find global min and max across all visible days for the visual temperature range bar
  const allMins = visibleDays.map((d) => d.tempMin);
  const allMaxs = visibleDays.map((d) => d.tempMax);
  const globalMin = allMins.length ? Math.min(...allMins) : 0;
  const globalMax = allMaxs.length ? Math.max(...allMaxs) : 10;
  const totalRange = Math.max(1, globalMax - globalMin);

  return (
    <section
      aria-label={`${activeCount}-Day Forecast`}
      className={`rounded-3xl border p-5 sm:p-6 backdrop-blur-xl transition-all shadow-md ${
        isDark
          ? 'bg-slate-900/60 border-slate-700/60 text-white'
          : 'bg-white/80 border-slate-200/80 text-slate-900 shadow-slate-200/50'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-500" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            {activeCount}-Day Extended Forecast
          </h2>
        </div>

        {/* Range Selector: 7, 14, or 16 Days */}
        {availableDays > 7 && (
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setRange(7)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeCount === 7
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setRange(14)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeCount === 14
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              14 Days
            </button>
            {availableDays >= 16 && (
              <button
                type="button"
                onClick={() => setRange(16)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeCount === 16
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                16 Days
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
        {visibleDays.map((day) => {
          const isSelected = selectedDate === day.date;

          // Calculate visual temperature bar width and offset
          const leftPercent = ((day.tempMin - globalMin) / totalRange) * 100;
          const widthPercent = Math.max(8, ((day.tempMax - day.tempMin) / totalRange) * 100);

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDay(day)}
              aria-label={`View forecast for ${day.dayName}, high of ${formatTemp(
                day.tempMax,
                units.temperature
              )}, low of ${formatTemp(day.tempMin, units.temperature)}`}
              className={`w-full text-left p-3 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 sm:gap-4 ${
                isSelected
                  ? 'border-sky-500/80 bg-sky-500/10 shadow-sm ring-1 ring-sky-500/30'
                  : isDark
                  ? 'border-slate-800/60 bg-slate-800/30 hover:bg-slate-800/70 hover:border-slate-700/60'
                  : 'border-slate-200/60 bg-slate-50/70 hover:bg-white hover:border-slate-300'
              }`}
            >
              {/* Day Name & Date */}
              <div className="w-24 sm:w-28 shrink-0">
                <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white block truncate">
                  {day.dayName}
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {day.date.slice(5).replace('-', '/')}
                </span>
              </div>

              {/* Weather Icon & Condition */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <WeatherIcon name={day.icon} className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 truncate hidden md:inline">
                  {day.condition}
                </span>
              </div>

              {/* Precipitation Probability */}
              <div className="w-14 sm:w-16 flex items-center justify-end gap-1 text-xs font-semibold text-sky-500 shrink-0">
                {day.precipitationProbability > 0 ? (
                  <>
                    <Droplets className="w-3.5 h-3.5" />
                    <span>{day.precipitationProbability}%</span>
                  </>
                ) : (
                  <span className="text-slate-400 text-[11px] font-normal">0%</span>
                )}
              </div>

              {/* Min - Visual Range Bar - Max */}
              <div className="w-36 sm:w-52 flex items-center gap-2 shrink-0">
                <span className="text-xs sm:text-sm text-slate-400 font-medium w-9 text-right shrink-0">
                  {formatTemp(day.tempMin, units.temperature)}
                </span>

                {/* Range Bar */}
                <div className="flex-1 h-2 rounded-full bg-slate-200/80 dark:bg-slate-700/60 relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white w-9 shrink-0">
                  {formatTemp(day.tempMax, units.temperature)}
                </span>
              </div>

              {/* Detail indicator arrow */}
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isSelected ? 'text-sky-500 rotate-90 sm:rotate-0' : 'text-slate-400'
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
};
