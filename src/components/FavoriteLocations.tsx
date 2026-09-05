import React from 'react';
import { Bookmark, History, Trash2, X, MapPin, ArrowRight } from 'lucide-react';
import { FavoriteLocation, LocationData, UnitPreferences } from '../types/weather';
import { formatTemp } from '../utils/units';

interface FavoriteLocationsProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteLocation[];
  onSelectLocation: (loc: LocationData) => void;
  onRemoveFavorite: (id: string) => void;
  recentSearches: LocationData[];
  onClearRecents: () => void;
  units: UnitPreferences;
  isDark: boolean;
}

export const FavoriteLocations: React.FC<FavoriteLocationsProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectLocation,
  onRemoveFavorite,
  recentSearches,
  onClearRecents,
  units,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby="favorites-dialog-title"
    >
      <div
        className={`w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-2xl transition-all ${
          isDark
            ? 'bg-slate-900/95 border-slate-700 text-white'
            : 'bg-white/95 border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            <h2 id="favorites-dialog-title" className="text-lg font-bold tracking-tight">
              Saved Locations & Recents
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Favorites List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Favorites ({favorites.length})
              </span>
            </div>

            {favorites.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-sm">
                <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-medium">No saved locations yet</p>
                <p className="text-xs mt-1">
                  Click the "Save" bookmark on any location card to pin it here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isDark
                        ? 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                        : 'bg-slate-50 border-slate-200/70 hover:bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectLocation({
                          name: fav.name,
                          country: fav.country,
                          countryCode: fav.countryCode,
                          admin1: fav.admin1,
                          latitude: fav.latitude,
                          longitude: fav.longitude,
                        });
                        onClose();
                      }}
                      className="flex items-center gap-3 text-left flex-1 min-w-0 mr-3"
                    >
                      <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {fav.name}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          {[fav.admin1, fav.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      {fav.temp !== undefined && (
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {formatTemp(fav.temp, units.temperature)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveFavorite(fav.id)}
                        aria-label={`Remove ${fav.name} from favorites`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Searches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Recent Searches
              </span>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={onClearRecents}
                  className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {recentSearches.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No recent searches yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recentSearches.map((rec, idx) => (
                  <button
                    key={`${rec.latitude}-${rec.longitude}-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelectLocation(rec);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                      isDark
                        ? 'bg-slate-800/30 border-slate-700/40 hover:bg-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-200/60 hover:bg-white text-slate-700'
                    }`}
                  >
                    <span className="font-medium truncate">{rec.name}</span>
                    <span className="text-[10px] text-slate-400 ml-1 shrink-0">{rec.country}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
