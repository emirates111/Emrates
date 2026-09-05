import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { QuickCitiesBar } from './components/QuickCitiesBar';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { WeatherChart } from './components/WeatherChart';
import { WeatherDetails } from './components/WeatherDetails';
import { StatisticalDashboard } from './components/analytics/StatisticalDashboard';
import { FavoriteLocations } from './components/FavoriteLocations';
import { WeatherAtmosphere } from './components/WeatherAtmosphere';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import {
  LocationData,
  WeatherResponse,
  UnitPreferences,
  FavoriteLocation,
  DailyForecastItem,
} from './types/weather';
import { fetchWeather, reverseGeocode, DEFAULT_LOCATIONS } from './services/weatherApi';

const DEFAULT_LOCATION: LocationData = {
  name: 'London',
  country: 'United Kingdom',
  countryCode: 'GB',
  admin1: 'England',
  latitude: 51.5085,
  longitude: -0.1257,
};

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('atmosphere_theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Unit preferences state
  const [units, setUnits] = useState<UnitPreferences>(() => {
    const saved = localStorage.getItem('atmosphere_units');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      temperature: 'celsius',
      windSpeed: 'kmh',
      pressure: 'hPa',
    };
  });

  // Current location state
  const [currentLocation, setCurrentLocation] = useState<LocationData>(() => {
    const saved = localStorage.getItem('atmosphere_last_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEFAULT_LOCATION;
  });

  // Weather data state
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<{
    type: 'network' | 'permission' | 'notFound' | 'api';
    message?: string;
  } | null>(null);

  // Selected forecast day for inspection (defaults to today's date)
  const [selectedDay, setSelectedDay] = useState<DailyForecastItem | null>(null);

  // Favorites & Recents state
  const [favorites, setFavorites] = useState<FavoriteLocation[]>(() => {
    const saved = localStorage.getItem('atmosphere_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [recentSearches, setRecentSearches] = useState<LocationData[]>(() => {
    const saved = localStorage.getItem('atmosphere_recents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);

  // Sync dark theme class on document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('atmosphere_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Persist units
  useEffect(() => {
    localStorage.setItem('atmosphere_units', JSON.stringify(units));
  }, [units]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('atmosphere_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Persist recent searches
  useEffect(() => {
    localStorage.setItem('atmosphere_recents', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Load weather for a location
  const loadWeather = useCallback(
    async (loc: LocationData, isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await fetchWeather(loc);
        setWeatherData(data);
        setCurrentLocation(data.location);
        setSelectedDay(data.daily[0] || null);

        // Update last location in localStorage
        localStorage.setItem('atmosphere_last_location', JSON.stringify(data.location));

        // Add to recent searches if not already present at index 0
        setRecentSearches((prev) => {
          const filtered = prev.filter(
            (r) =>
              r.latitude.toFixed(2) !== data.location.latitude.toFixed(2) ||
              r.longitude.toFixed(2) !== data.location.longitude.toFixed(2)
          );
          return [data.location, ...filtered].slice(0, 8);
        });

        // Update temperature snapshot in saved favorites if this location is saved
        setFavorites((prev) =>
          prev.map((fav) => {
            if (
              fav.latitude.toFixed(2) === data.location.latitude.toFixed(2) &&
              fav.longitude.toFixed(2) === data.location.longitude.toFixed(2)
            ) {
              return {
                ...fav,
                temp: data.current.temperature,
                condition: data.current.condition,
              };
            }
            return fav;
          })
        );
      } catch (err: any) {
        console.error('Failed to load weather:', err);
        setError({
          type: 'api',
          message: err.message || 'Unable to retrieve weather data. Please try again.',
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    loadWeather(currentLocation);
  }, []);

  // Request browser geolocation
  const handleRequestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError({
        type: 'permission',
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const loc = await reverseGeocode(lat, lon);
          await loadWeather(loc);
        } catch (err) {
          console.warn('Geolocation reverse geocoding failed:', err);
          await loadWeather({
            name: 'Current Location',
            country: '',
            countryCode: '',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError({
            type: 'permission',
            message: 'Location access was denied. You can search for your city in the search bar.',
          });
        } else {
          setError({
            type: 'api',
            message: 'Unable to determine your current location. Please search manually.',
          });
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Toggle favorite for current location
  const isCurrentFavorite = favorites.some(
    (f) =>
      f.latitude.toFixed(2) === currentLocation.latitude.toFixed(2) &&
      f.longitude.toFixed(2) === currentLocation.longitude.toFixed(2)
  );

  const handleToggleFavorite = () => {
    if (isCurrentFavorite) {
      setFavorites((prev) =>
        prev.filter(
          (f) =>
            f.latitude.toFixed(2) !== currentLocation.latitude.toFixed(2) ||
            f.longitude.toFixed(2) !== currentLocation.longitude.toFixed(2)
        )
      );
    } else {
      const newFav: FavoriteLocation = {
        id: `${currentLocation.latitude}_${currentLocation.longitude}_${Date.now()}`,
        name: currentLocation.name,
        country: currentLocation.country,
        countryCode: currentLocation.countryCode,
        admin1: currentLocation.admin1,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        savedAt: Date.now(),
        temp: weatherData?.current.temperature,
        condition: weatherData?.current.condition,
      };
      setFavorites((prev) => [newFav, ...prev]);
    }
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearRecents = () => {
    setRecentSearches([]);
  };

  // Toggle Units
  const handleToggleUnits = () => {
    setUnits((prev) => ({
      temperature: prev.temperature === 'celsius' ? 'fahrenheit' : 'celsius',
      windSpeed: prev.windSpeed === 'kmh' ? 'mph' : 'kmh',
      pressure: prev.pressure === 'hPa' ? 'inHg' : 'hPa',
    }));
  };

  // Determine chart hours to display:
  // If user selected a specific future day with hourly data, display that day's 24 hours;
  // otherwise, display the live next 24 hours from the current hour!
  const activeChartHours =
    selectedDay && selectedDay.hourly && selectedDay.hourly.length > 0 && selectedDay.date !== weatherData?.daily[0]?.date
      ? selectedDay.hourly
      : weatherData?.hourly || [];

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors selection:bg-sky-500 selection:text-white ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Dynamic weather atmosphere backdrop */}
      <WeatherAtmosphere theme={weatherData?.theme || 'sunny'} isDark={isDark} />

      {/* Main Header */}
      <Header
        onSelectLocation={(loc) => loadWeather(loc)}
        onRequestCurrentLocation={handleRequestCurrentLocation}
        isLocating={isLocating}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        units={units}
        onToggleUnits={handleToggleUnits}
        favoriteCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Trending & Quick Popular Cities Bar */}
        <QuickCitiesBar
          currentLocationName={currentLocation.name}
          onSelectCity={(city) => loadWeather(city)}
          isDark={isDark}
        />

        {/* Loading Skeleton */}
        {isLoading && <LoadingState isDark={isDark} />}

        {/* Error State */}
        {!isLoading && error && (
          <ErrorState
            type={error.type}
            message={error.message}
            onRetry={() => loadWeather(currentLocation)}
            onSelectFallback={(loc) => loadWeather(loc)}
            isDark={isDark}
          />
        )}

        {/* Weather Dashboard View */}
        {!isLoading && !error && weatherData && (
          <div className="space-y-6">
            {/* Current Weather Hero */}
            <CurrentWeather
              location={weatherData.location}
              weather={weatherData.current}
              units={units}
              isFavorite={isCurrentFavorite}
              onToggleFavorite={handleToggleFavorite}
              onRefresh={() => loadWeather(currentLocation, true)}
              isRefreshing={isRefreshing}
              isDark={isDark}
            />

            {/* 24-Hour Hourly Forecast */}
            <HourlyForecast hourly={weatherData.hourly} units={units} isDark={isDark} />

            {/* Grid: 7-Day Forecast & Interactive Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* 7-Day Extended Forecast */}
              <div className="lg:col-span-5 w-full">
                <DailyForecast
                  daily={weatherData.daily}
                  selectedDate={selectedDay?.date || weatherData.daily[0]?.date || ''}
                  onSelectDay={(day) => setSelectedDay(day)}
                  units={units}
                  isDark={isDark}
                />
              </div>

              {/* Interactive Trend Chart */}
              <div className="lg:col-span-7 w-full">
                <WeatherChart
                  hourly={activeChartHours}
                  units={units}
                  isDark={isDark}
                  title={
                    selectedDay && selectedDay.date !== weatherData.daily[0]?.date
                      ? `${selectedDay.dayName} Projection (${selectedDay.date})`
                      : 'Next 24 Hours Projection'
                  }
                />
              </div>
            </div>

            {/* Detailed Weather Diagnostics */}
            <WeatherDetails weather={weatherData.current} units={units} isDark={isDark} />

            {/* Advanced Statistical & Time-Series Analysis Section */}
            <StatisticalDashboard
              location={currentLocation}
              units={units}
              isDark={isDark}
            />
          </div>
        )}
      </main>

      {/* Saved Favorites & Recents Modal */}
      <FavoriteLocations
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectLocation={(loc) => loadWeather(loc)}
        onRemoveFavorite={handleRemoveFavorite}
        recentSearches={recentSearches}
        onClearRecents={handleClearRecents}
        units={units}
        isDark={isDark}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/40 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Atmosphere Weather Platform • Real-time global meteorological forecasts powered by
            Open-Meteo
          </p>
          <div className="flex items-center gap-4">
            <span>High-Precision ECMWF & GFS Models</span>
            <span>•</span>
            <span className="text-emerald-500 font-medium">100% Free & Open Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
