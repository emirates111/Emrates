import React from 'react';
import {
  CloudSun,
  Navigation,
  Sun,
  Moon,
  Bookmark,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';
import { SearchBar } from './SearchBar';
import { LocationData, UnitPreferences } from '../types/weather';

interface HeaderProps {
  onSelectLocation: (loc: LocationData) => void;
  onRequestCurrentLocation: () => void;
  isLocating: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  units: UnitPreferences;
  onToggleUnits: () => void;
  favoriteCount: number;
  onOpenFavorites: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectLocation,
  onRequestCurrentLocation,
  isLocating,
  isDark,
  onToggleTheme,
  units,
  onToggleUnits,
  favoriteCount,
  onOpenFavorites,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-slate-200/40 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Atmosphere
              <span className="text-[10px] uppercase font-semibold tracking-widest px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
                PRO
              </span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Precision Weather Forecast
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <SearchBar onSelectLocation={onSelectLocation} isDark={isDark} />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Use My Location Button */}
          <button
            type="button"
            id="use-my-location-btn"
            onClick={onRequestCurrentLocation}
            disabled={isLocating}
            title="Use current geolocation"
            aria-label="Use My Location"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 disabled:opacity-60"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
            ) : (
              <Navigation className="w-4 h-4 text-sky-500" />
            )}
            <span className="hidden lg:inline">My Location</span>
          </button>

          {/* Unit Toggle */}
          <button
            type="button"
            id="unit-toggle-btn"
            onClick={onToggleUnits}
            title={`Switch units (Current: °${units.temperature === 'celsius' ? 'C' : 'F'}, ${units.windSpeed})`}
            aria-label="Toggle Units"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <span className={units.temperature === 'celsius' ? 'text-sky-500 font-bold' : 'text-slate-400'}>
              °C
            </span>
            <span className="text-slate-400">/</span>
            <span className={units.temperature === 'fahrenheit' ? 'text-sky-500 font-bold' : 'text-slate-400'}>
              °F
            </span>
          </button>

          {/* Favorites Button with Counter */}
          <button
            type="button"
            id="favorites-btn"
            onClick={onOpenFavorites}
            title="Saved Favorite Locations"
            aria-label="View Favorite Locations"
            className="relative p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline text-xs sm:text-sm font-medium">Favorites</span>
            {favoriteCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="px-4 pb-3 md:hidden">
        <SearchBar onSelectLocation={onSelectLocation} isDark={isDark} />
      </div>
    </header>
  );
};
