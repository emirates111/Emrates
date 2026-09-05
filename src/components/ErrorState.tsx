import React from 'react';
import { AlertTriangle, MapPinOff, WifiOff, RefreshCw, Compass } from 'lucide-react';
import { DEFAULT_LOCATIONS } from '../services/weatherApi';
import { LocationData } from '../types/weather';

interface ErrorStateProps {
  type: 'network' | 'permission' | 'notFound' | 'api';
  message?: string;
  onRetry: () => void;
  onSelectFallback: (loc: LocationData) => void;
  isDark: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  type,
  message,
  onRetry,
  onSelectFallback,
  isDark,
}) => {
  const getErrorContent = () => {
    switch (type) {
      case 'permission':
        return {
          icon: <MapPinOff className="w-12 h-12 text-amber-500" />,
          title: 'Location Permission Denied',
          description:
            'Browser location access was blocked or denied. You can enable it in your browser site settings or choose a city manually below.',
        };
      case 'network':
        return {
          icon: <WifiOff className="w-12 h-12 text-rose-500" />,
          title: 'Network Connection Issue',
          description:
            'Unable to reach weather servers. Please check your internet connection and try again.',
        };
      case 'notFound':
        return {
          icon: <Compass className="w-12 h-12 text-indigo-500" />,
          title: 'Location Not Found',
          description:
            message || 'We could not find weather information for the specified location.',
        };
      case 'api':
      default:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-rose-500" />,
          title: 'Unable to Load Weather Data',
          description:
            message || 'An unexpected error occurred while communicating with the weather service.',
        };
    }
  };

  const content = getErrorContent();

  return (
    <div
      role="alert"
      className={`rounded-3xl border p-8 sm:p-12 text-center max-w-2xl mx-auto backdrop-blur-xl shadow-xl my-8 transition-all ${
        isDark
          ? 'bg-slate-900/80 border-slate-700 text-white'
          : 'bg-white/90 border-slate-200 text-slate-900'
      }`}
    >
      <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5 shadow-inner">
        {content.icon}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">{content.title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
        {content.description}
      </p>

      {/* Retry Action Button */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <button
          type="button"
          id="error-retry-btn"
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm shadow-md shadow-sky-500/20 active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>

      {/* Popular Fallback Locations */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Or explore popular cities:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {DEFAULT_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              type="button"
              onClick={() => onSelectFallback(loc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isDark
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
              }`}
            >
              {loc.name}, {loc.countryCode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
