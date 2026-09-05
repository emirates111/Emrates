import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Droplets, Clock } from 'lucide-react';
import { HourlyForecastItem, UnitPreferences } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp } from '../utils/units';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  units: UnitPreferences;
  isDark: boolean;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, units, isDark }) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      aria-label="Hourly Forecast"
      className={`rounded-3xl border p-5 sm:p-6 backdrop-blur-xl transition-all shadow-md ${
        isDark
          ? 'bg-slate-900/60 border-slate-700/60 text-white'
          : 'bg-white/80 border-slate-200/80 text-slate-900 shadow-slate-200/50'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-500" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Hourly Forecast</h2>
          <span className="text-xs text-slate-400 font-normal">Next 24 Hours</span>
        </div>

        {/* Scroll navigation arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Scroll hourly forecast left"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Scroll hourly forecast right"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory focus:outline-none"
        tabIndex={0}
        role="region"
        aria-label="24-hour weather timeline"
      >
        {hourly.map((item, idx) => {
          const isNow = idx === 0;
          return (
            <div
              key={item.time}
              className={`snap-start shrink-0 w-22 sm:w-24 p-3 rounded-2xl flex flex-col items-center justify-between gap-2.5 transition-all text-center border ${
                isNow
                  ? 'bg-sky-500/10 border-sky-500/30 font-medium shadow-sm'
                  : isDark
                  ? 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/70'
                  : 'bg-slate-50/80 border-slate-200/60 hover:bg-white'
              }`}
            >
              {/* Hour label */}
              <span
                className={`text-xs font-semibold ${
                  isNow ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.hourLabel}
              </span>

              {/* Weather icon */}
              <div className="py-1">
                <WeatherIcon name={item.icon} className="w-8 h-8" />
              </div>

              {/* Temperature */}
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {formatTemp(item.temperature, units.temperature)}
              </span>

              {/* Precipitation Probability */}
              <div className="flex items-center gap-1 text-[11px] font-medium text-sky-600 dark:text-sky-400">
                <Droplets className="w-3 h-3 shrink-0" />
                <span>{item.precipitationProbability}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
