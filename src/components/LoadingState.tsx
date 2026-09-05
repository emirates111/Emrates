import React from 'react';

interface LoadingStateProps {
  isDark: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ isDark }) => {
  const bgCard = isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200';
  const shimmer = isDark ? 'bg-slate-800' : 'bg-slate-200';

  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading weather forecast">
      {/* Current Weather Skeleton */}
      <div className={`rounded-3xl border p-6 sm:p-10 ${bgCard}`}>
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className={`h-8 w-48 sm:w-64 rounded-xl ${shimmer}`} />
            <div className={`h-4 w-32 rounded-lg ${shimmer}`} />
          </div>
          <div className={`h-10 w-24 rounded-xl ${shimmer}`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 items-center">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl ${shimmer}`} />
            <div className="space-y-3">
              <div className={`h-16 w-36 rounded-2xl ${shimmer}`} />
              <div className={`h-5 w-28 rounded-lg ${shimmer}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-20 rounded-2xl ${shimmer}`} />
            ))}
          </div>
        </div>

        <div className={`h-4 w-40 rounded-md ${shimmer}`} />
      </div>

      {/* Hourly Forecast Skeleton */}
      <div className={`rounded-3xl border p-6 ${bgCard}`}>
        <div className={`h-5 w-40 rounded-lg mb-4 ${shimmer}`} />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={`shrink-0 w-24 h-36 rounded-2xl ${shimmer}`} />
          ))}
        </div>
      </div>

      {/* 2-column Grid: Chart & 7-Day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-3xl border p-6 h-80 ${bgCard}`}>
          <div className={`h-5 w-48 rounded-lg mb-6 ${shimmer}`} />
          <div className={`h-52 rounded-2xl ${shimmer}`} />
        </div>

        <div className={`rounded-3xl border p-6 h-80 ${bgCard}`}>
          <div className={`h-5 w-48 rounded-lg mb-6 ${shimmer}`} />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-10 rounded-xl ${shimmer}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
