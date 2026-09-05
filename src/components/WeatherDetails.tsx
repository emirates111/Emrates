import React from 'react';
import {
  Sun,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Cloud,
  Thermometer,
  Sunrise,
  Sunset,
  Info,
} from 'lucide-react';
import { CurrentWeather, UnitPreferences } from '../types/weather';
import {
  formatTemp,
  formatSpeed,
  formatPressure,
  formatVisibility,
  formatTimeAmPm,
} from '../utils/units';

interface WeatherDetailsProps {
  weather: CurrentWeather;
  units: UnitPreferences;
  isDark: boolean;
}

export const WeatherDetails: React.FC<WeatherDetailsProps> = ({ weather, units, isDark }) => {
  // UV advice calculation
  const getUVBadge = (uv: number) => {
    if (uv < 3) {
      return { label: 'Low', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', advice: 'Minimal sun protection required' };
    }
    if (uv < 6) {
      return { label: 'Moderate', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', advice: 'Wear sunglasses & hat' };
    }
    if (uv < 8) {
      return { label: 'High', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', advice: 'Use SPF 30+ sunscreen' };
    }
    if (uv < 11) {
      return { label: 'Very High', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', advice: 'Seek shade during midday' };
    }
    return { label: 'Extreme', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', advice: 'Avoid outdoor sun exposure' };
  };

  const uvInfo = getUVBadge(weather.uvIndex);

  // Humidity Comfort
  const getHumidityComfort = (humidity: number) => {
    if (humidity < 30) return 'Dry environment';
    if (humidity <= 60) return 'Comfortable levels';
    if (humidity <= 80) return 'Noticeably humid';
    return 'Very muggy & damp';
  };

  // Visibility Clarity
  const getVisibilityStatus = (km: number) => {
    if (km >= 10) return 'Clear visual range';
    if (km >= 5) return 'Moderate visibility';
    return 'Fog or reduced clarity';
  };

  const detailsList = [
    {
      id: 'uv-index',
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      label: 'UV Index',
      value: weather.uvIndex.toString(),
      badge: uvInfo.label,
      badgeColor: uvInfo.color,
      subtext: uvInfo.advice,
    },
    {
      id: 'wind-conditions',
      icon: <Wind className="w-5 h-5 text-teal-500" />,
      label: 'Wind & Gusts',
      value: formatSpeed(weather.windSpeed, units.windSpeed),
      badge: `${weather.windDirectionCardinal} (${weather.windDirection}°)`,
      badgeColor: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      subtext: `Peak gusts to ${formatSpeed(weather.windGust, units.windSpeed)}`,
    },
    {
      id: 'humidity-level',
      icon: <Droplets className="w-5 h-5 text-sky-500" />,
      label: 'Humidity',
      value: `${weather.humidity}%`,
      badge: getHumidityComfort(weather.humidity),
      badgeColor: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      subtext: `Dew point: ${formatTemp(weather.dewPoint, units.temperature)}`,
    },
    {
      id: 'pressure',
      icon: <Gauge className="w-5 h-5 text-indigo-500" />,
      label: 'Atmospheric Pressure',
      value: formatPressure(weather.pressure, units.pressure),
      badge: weather.pressure > 1013 ? 'High' : 'Low',
      badgeColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      subtext: 'Mean sea-level barometer',
    },
    {
      id: 'visibility',
      icon: <Eye className="w-5 h-5 text-emerald-500" />,
      label: 'Visibility',
      value: formatVisibility(weather.visibility, units.windSpeed),
      badge: getVisibilityStatus(weather.visibility),
      badgeColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      subtext: 'Horizontal sight distance',
    },
    {
      id: 'cloud-coverage',
      icon: <Cloud className="w-5 h-5 text-slate-400" />,
      label: 'Cloud Coverage',
      value: `${weather.cloudCover}%`,
      badge: weather.cloudCover > 80 ? 'Overcast' : weather.cloudCover > 20 ? 'Partly cloudy' : 'Clear skies',
      badgeColor: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
      subtext: 'Sky fraction covered',
    },
    {
      id: 'dew-point',
      icon: <Thermometer className="w-5 h-5 text-cyan-500" />,
      label: 'Dew Point',
      value: formatTemp(weather.dewPoint, units.temperature),
      badge: 'Condensation Point',
      badgeColor: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      subtext: 'Air saturation temperature',
    },
    {
      id: 'sun-cycle',
      icon: <Sunrise className="w-5 h-5 text-amber-500" />,
      label: 'Solar Schedule',
      value: `${formatTimeAmPm(weather.sunrise)}`,
      badge: `Sunset ${formatTimeAmPm(weather.sunset)}`,
      badgeColor: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      subtext: 'Local celestial timings',
    },
  ];

  return (
    <section
      aria-label="Detailed Weather Metrics"
      className={`rounded-3xl border p-5 sm:p-6 backdrop-blur-xl transition-all shadow-md ${
        isDark
          ? 'bg-slate-900/60 border-slate-700/60 text-white'
          : 'bg-white/80 border-slate-200/80 text-slate-900 shadow-slate-200/50'
      }`}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-500" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Weather Details</h2>
        </div>
        <span className="text-xs text-slate-400">Atmospheric diagnostics</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {detailsList.map((item) => (
          <div
            key={item.id}
            id={`detail-${item.id}`}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
              isDark
                ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70'
                : 'bg-slate-50/80 border-slate-200/70 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-700/50">
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {item.value}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${item.badgeColor}`}
              >
                {item.badge}
              </span>
              <span className="text-[11px] text-slate-400 truncate text-right">
                {item.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
