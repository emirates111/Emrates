import React from 'react';
import {
  Sun,
  SunMedium,
  Moon,
  MoonStar,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  Snowflake,
  CloudLightning,
  CloudFog,
  Wind,
} from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
  animate?: boolean;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  name,
  className = 'w-6 h-6',
  size,
  animate = false,
}) => {
  const iconProps = {
    className: `${className} ${animate ? 'transition-transform duration-300 hover:scale-110' : ''}`,
    size,
    'aria-hidden': true,
  };

  switch (name) {
    case 'Sun':
      return <Sun {...iconProps} className={`${iconProps.className} text-amber-400`} />;
    case 'SunMedium':
      return <SunMedium {...iconProps} className={`${iconProps.className} text-amber-400`} />;
    case 'Moon':
      return <Moon {...iconProps} className={`${iconProps.className} text-indigo-300`} />;
    case 'MoonStar':
      return <MoonStar {...iconProps} className={`${iconProps.className} text-indigo-300`} />;
    case 'CloudSun':
      return <CloudSun {...iconProps} className={`${iconProps.className} text-amber-300`} />;
    case 'CloudMoon':
      return <CloudMoon {...iconProps} className={`${iconProps.className} text-slate-300`} />;
    case 'Cloud':
      return <Cloud {...iconProps} className={`${iconProps.className} text-slate-400`} />;
    case 'CloudRain':
      return <CloudRain {...iconProps} className={`${iconProps.className} text-sky-400`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle {...iconProps} className={`${iconProps.className} text-sky-300`} />;
    case 'CloudSnow':
      return <CloudSnow {...iconProps} className={`${iconProps.className} text-cyan-200`} />;
    case 'Snowflake':
      return <Snowflake {...iconProps} className={`${iconProps.className} text-cyan-200`} />;
    case 'CloudLightning':
      return <CloudLightning {...iconProps} className={`${iconProps.className} text-amber-300`} />;
    case 'CloudFog':
      return <CloudFog {...iconProps} className={`${iconProps.className} text-zinc-400`} />;
    case 'Wind':
      return <Wind {...iconProps} className={`${iconProps.className} text-teal-300`} />;
    default:
      return <Cloud {...iconProps} className={`${iconProps.className} text-slate-400`} />;
  }
};
