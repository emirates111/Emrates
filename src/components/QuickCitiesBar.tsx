import React from 'react';
import { Sparkles, MapPin } from 'lucide-react';
import { LocationData } from '../types/weather';

interface QuickCitiesBarProps {
  currentLocationName: string;
  onSelectCity: (loc: LocationData) => void;
  isDark: boolean;
}

const POPULAR_CITIES: LocationData[] = [
  { name: 'Lagos', country: 'Nigeria', countryCode: 'NG', admin1: 'Lagos', latitude: 6.4541, longitude: 3.3947 },
  { name: 'Abuja', country: 'Nigeria', countryCode: 'NG', admin1: 'Federal Capital Territory', latitude: 9.0765, longitude: 7.3986 },
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', admin1: 'England', latitude: 51.5085, longitude: -0.1257 },
  { name: 'New York', country: 'United States', countryCode: 'US', admin1: 'New York', latitude: 40.7143, longitude: -74.006 },
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', admin1: 'Tokyo', latitude: 35.6895, longitude: 139.6917 },
  { name: 'Paris', country: 'France', countryCode: 'FR', admin1: 'Île-de-France', latitude: 48.8534, longitude: 2.3488 },
  { name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', admin1: 'Dubai', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Sydney', country: 'Australia', countryCode: 'AU', admin1: 'New South Wales', latitude: -33.8678, longitude: 151.2073 },
];

export const QuickCitiesBar: React.FC<QuickCitiesBarProps> = ({
  currentLocationName,
  onSelectCity,
  isDark,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
      <span className="flex items-center gap-1 text-slate-400 font-medium shrink-0 pl-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Trending:</span>
      </span>

      <div className="flex items-center gap-1.5">
        {POPULAR_CITIES.map((city) => {
          const isActive = currentLocationName.toLowerCase() === city.name.toLowerCase();
          return (
            <button
              key={city.name}
              type="button"
              onClick={() => onSelectCity(city)}
              className={`shrink-0 px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 font-medium ${
                isActive
                  ? 'bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-500/20'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <MapPin className="w-3 h-3 opacity-70" />
              <span>{city.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
