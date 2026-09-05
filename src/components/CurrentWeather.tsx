import React from 'react';
import {
  MapPin,
  Bookmark,
  BookmarkCheck,
  ArrowUp,
  ArrowDown,
  Clock,
  RefreshCw,
  Compass,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  BarChart3,
} from 'lucide-react';
import { CurrentWeather as CurrentWeatherType, LocationData, UnitPreferences } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp, formatSpeed, formatTimeAmPm } from '../utils/units';

interface CurrentWeatherProps {
  location: LocationData;
  weather: CurrentWeatherType;
  units: UnitPreferences;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isDark: boolean;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  location,
  weather,
  units,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  isRefreshing,
  isDark,
}) => {
  const lastUpdatedTime = formatTimeAmPm(weather.lastUpdated);

  return (
    <section
      aria-label="Current Weather"
      className={`relative overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-300 shadow-lg ${
        isDark
          ? 'bg-slate-900/60 border-slate-700/60 text-white'
          : 'bg-white/80 border-slate-200/80 text-slate-900 shadow-slate-200/50'
      }`}
    >
      {/* Background atmospheric radial glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none bg-sky-400" />

      <div className="p-6 sm:p-8 lg:p-10 relative z-10 flex flex-col justify-between h-full gap-6">
        {/* Top bar: Location & Action buttons */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-500 shrink-0" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {location.name}
              </h1>
              {location.countryCode && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  {location.countryCode}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 pl-7">
              {[location.admin1, location.country].filter(Boolean).join(', ')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              type="button"
              id="refresh-weather-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh weather data"
              aria-label="Refresh weather data"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
            </button>

            {/* Favorite toggle button */}
            <button
              type="button"
              id="favorite-toggle-btn"
              onClick={onToggleFavorite}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all active:scale-95 ${
                isFavorite
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {isFavorite ? (
                <>
                  <BookmarkCheck className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Save</span>
                </>
              )}
            </button>

            {/* Jump to Climatology & Statistical Analysis */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('statistical-analysis-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              title="View Statistical & Time-Series Analysis"
              aria-label="View Statistical & Time-Series Analysis"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 transition-all active:scale-95"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Climate Analytics</span>
            </button>
          </div>
        </div>

        {/* Center: Temperature & Weather Icon Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center py-2">
          {/* Main Temperature & Condition */}
          <div className="flex items-center gap-6">
            <div className="shrink-0 p-3 rounded-2xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20">
              <WeatherIcon name={weather.icon} className="w-16 h-16 sm:w-20 sm:h-20" animate />
            </div>

            <div>
              <div className="flex items-baseline">
                <span className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter">
                  {formatTemp(weather.temperature, units.temperature, false)}
                </span>
                <span className="text-2xl sm:text-3xl font-light text-slate-400 ml-1">
                  °{units.temperature === 'celsius' ? 'C' : 'F'}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {weather.condition}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                <span>
                  Feels like{' '}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {formatTemp(weather.feelsLike, units.temperature)}
                  </strong>
                </span>
                <span>•</span>
                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
                  <ArrowUp className="w-3.5 h-3.5 mr-0.5" />
                  {formatTemp(weather.tempMax, units.temperature)}
                </span>
                <span className="inline-flex items-center text-sky-600 dark:text-sky-400">
                  <ArrowDown className="w-3.5 h-3.5 mr-0.5" />
                  {formatTemp(weather.tempMin, units.temperature)}
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics Quick Highlights Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/40">
            {/* Wind */}
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-teal-500" />
                Wind
              </span>
              <span className="text-sm sm:text-base font-bold mt-1 text-slate-900 dark:text-white">
                {formatSpeed(weather.windSpeed, units.windSpeed)}
              </span>
              <span className="text-[11px] text-slate-400">
                {weather.windDirectionCardinal} ({weather.windDirection}°)
              </span>
            </div>

            {/* Humidity */}
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-500" />
                Humidity
              </span>
              <span className="text-sm sm:text-base font-bold mt-1 text-slate-900 dark:text-white">
                {weather.humidity}%
              </span>
              <span className="text-[11px] text-slate-400">Dew pt {formatTemp(weather.dewPoint, units.temperature)}</span>
            </div>

            {/* Sunrise */}
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                Sunrise
              </span>
              <span className="text-sm sm:text-base font-bold mt-1 text-slate-900 dark:text-white">
                {formatTimeAmPm(weather.sunrise)}
              </span>
              <span className="text-[11px] text-slate-400">Dawn</span>
            </div>

            {/* Sunset */}
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sunset className="w-3.5 h-3.5 text-orange-500" />
                Sunset
              </span>
              <span className="text-sm sm:text-base font-bold mt-1 text-slate-900 dark:text-white">
                {formatTimeAmPm(weather.sunset)}
              </span>
              <span className="text-[11px] text-slate-400">Dusk</span>
            </div>
          </div>
        </div>

        {/* Bottom meta row: Last updated indicator */}
        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated: {lastUpdatedTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Live Feed
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
