import React, { useEffect, useRef } from 'react';
import { WeatherTheme } from '../types/weather';

interface WeatherAtmosphereProps {
  theme: WeatherTheme;
  isDark: boolean;
}

export const WeatherAtmosphere: React.FC<WeatherAtmosphereProps> = ({ theme, isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Only run animated particle canvas for rain, snow, or storm
    if (theme !== 'rain' && theme !== 'snow' && theme !== 'storm') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle definitions
    interface Particle {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      radius?: number;
      drift?: number;
    }

    const particleCount = theme === 'snow' ? 50 : 70;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: theme === 'rain' || theme === 'storm' ? Math.random() * 18 + 10 : 0,
        speed: theme === 'snow' ? Math.random() * 1.5 + 0.8 : Math.random() * 8 + 6,
        opacity: Math.random() * 0.35 + 0.15,
        radius: theme === 'snow' ? Math.random() * 2 + 1.2 : 0,
        drift: (Math.random() - 0.5) * 0.8,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (theme === 'snow') {
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(200, 225, 255, 0.6)';
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius || 1.5, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speed;
          p.x += p.drift || 0;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        });
      } else if (theme === 'rain' || theme === 'storm') {
        ctx.strokeStyle = isDark ? 'rgba(180, 215, 255, 0.25)' : 'rgba(100, 150, 220, 0.25)';
        ctx.lineWidth = 1.2;

        particles.forEach((p) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 2, p.y + p.length);
          ctx.stroke();

          p.y += p.speed;
          p.x += 1.5;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, isDark]);

  // CSS atmosphere gradient mapping
  const getThemeGradient = () => {
    if (isDark) {
      switch (theme) {
        case 'sunny':
          return 'from-slate-950 via-amber-950/20 to-slate-900';
        case 'clear-night':
          return 'from-slate-950 via-indigo-950/40 to-slate-900';
        case 'cloudy':
          return 'from-zinc-950 via-slate-900/60 to-zinc-900';
        case 'rain':
          return 'from-slate-950 via-sky-950/30 to-slate-900';
        case 'storm':
          return 'from-zinc-950 via-purple-950/20 to-slate-950';
        case 'snow':
          return 'from-slate-950 via-cyan-950/25 to-slate-900';
        case 'fog':
          return 'from-zinc-950 via-zinc-900 to-slate-900';
        default:
          return 'from-slate-950 via-slate-900 to-zinc-900';
      }
    } else {
      switch (theme) {
        case 'sunny':
          return 'from-sky-50 via-amber-50/40 to-blue-100/60';
        case 'clear-night':
          return 'from-indigo-100/70 via-slate-100 to-blue-100/50';
        case 'cloudy':
          return 'from-slate-100 via-zinc-100 to-gray-200/60';
        case 'rain':
          return 'from-slate-100 via-sky-100/50 to-blue-100/60';
        case 'storm':
          return 'from-slate-200 via-gray-200 to-zinc-300/60';
        case 'snow':
          return 'from-blue-50/80 via-cyan-50/50 to-slate-100';
        case 'fog':
          return 'from-zinc-100 via-slate-100 to-zinc-200/70';
        default:
          return 'from-sky-50 via-slate-50 to-blue-50';
      }
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-700">
      {/* Dynamic atmospheric gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient()} transition-all duration-700`} />

      {/* Subtle radial lighting orb */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 transition-all duration-700 ${
          theme === 'sunny'
            ? 'bg-amber-300'
            : theme === 'clear-night'
            ? 'bg-indigo-500'
            : theme === 'rain'
            ? 'bg-sky-400'
            : theme === 'snow'
            ? 'bg-cyan-300'
            : 'bg-blue-400'
        }`}
      />

      <div
        className={`absolute top-1/2 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-700 ${
          theme === 'sunny'
            ? 'bg-orange-300'
            : theme === 'clear-night'
            ? 'bg-violet-600'
            : theme === 'storm'
            ? 'bg-purple-600'
            : 'bg-slate-400'
        }`}
      />

      {/* Falling particles for rain, snow, storm */}
      {(theme === 'rain' || theme === 'snow' || theme === 'storm') && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
      )}
    </div>
  );
};
