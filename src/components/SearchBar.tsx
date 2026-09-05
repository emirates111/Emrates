import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { LocationData } from '../types/weather';
import { searchLocations } from '../services/weatherApi';

interface SearchBarProps {
  onSelectLocation: (loc: LocationData) => void;
  isDark: boolean;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectLocation,
  isDark,
  placeholder = 'Search city or region (e.g. London, Lagos, Tokyo)...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setErrorMessage(null);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const locations = await searchLocations(trimmed);
        setResults(locations);
        setIsOpen(true);
        setSelectedIndex(-1);
        if (locations.length === 0) {
          setErrorMessage(`No locations found for "${trimmed}"`);
        } else {
          setErrorMessage(null);
        }
      } catch (err: any) {
        setErrorMessage('Failed to search locations. Check your connection.');
        setResults([]);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (loc: LocationData) => {
    onSelectLocation(loc);
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-xl ${className}`}>
      <div
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border backdrop-blur-md transition-all shadow-sm ${
          isDark
            ? 'bg-slate-900/80 border-slate-700/80 text-slate-100 focus-within:border-sky-500/80 focus-within:ring-2 focus-within:ring-sky-500/20'
            : 'bg-white/80 border-slate-200 text-slate-900 focus-within:border-sky-500/80 focus-within:ring-2 focus-within:ring-sky-500/20'
        }`}
      >
        <Search className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />

        <input
          id="weather-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || errorMessage) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search city or location"
          className="w-full bg-transparent text-sm placeholder:text-slate-400 focus:outline-none"
        />

        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-sky-500 shrink-0" />}

        {query && !isLoading && (
          <button
            type="button"
            id="clear-search-btn"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            aria-label="Clear search input"
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 mt-2 rounded-xl border backdrop-blur-xl shadow-xl overflow-hidden z-50 transition-all ${
            isDark
              ? 'bg-slate-900/95 border-slate-700/80 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-900'
          }`}
        >
          {errorMessage && (
            <div className="px-4 py-3 text-sm text-slate-400 text-center">{errorMessage}</div>
          )}

          {results.length > 0 && (
            <ul className="max-h-72 overflow-y-auto divide-y divide-slate-500/10" role="listbox">
              {results.map((loc, idx) => {
                const isSelected = idx === selectedIndex;
                const region = loc.admin1 ? `${loc.admin1}, ` : '';
                return (
                  <li
                    key={`${loc.latitude}-${loc.longitude}-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(loc)}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm transition-colors ${
                      isSelected
                        ? isDark
                          ? 'bg-sky-600/30 text-white'
                          : 'bg-sky-50 text-sky-900'
                        : isDark
                        ? 'hover:bg-slate-800/80 text-slate-200'
                        : 'hover:bg-slate-100/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                      <div className="truncate">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {loc.name}
                        </span>
                        <span className="text-xs text-slate-400 ml-1.5">
                          {region}
                          {loc.country}
                        </span>
                      </div>
                    </div>
                    {loc.countryCode && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ml-2 shrink-0">
                        {loc.countryCode}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
