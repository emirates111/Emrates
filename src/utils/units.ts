import { UnitPreferences } from '../types/weather';

export function convertTemperature(celsius: number, unit: 'celsius' | 'fahrenheit'): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export const convertTemp = convertTemperature;

export function formatTemp(celsius: number, unit: 'celsius' | 'fahrenheit', includeSymbol = true): string {
  const val = convertTemperature(celsius, unit);
  if (!includeSymbol) return `${val}°`;
  return `${val}°${unit === 'celsius' ? 'C' : 'F'}`;
}

export function convertSpeed(kmh: number, unit: 'kmh' | 'mph'): number {
  if (unit === 'mph') {
    return Math.round(kmh * 0.621371);
  }
  return Math.round(kmh);
}

export function formatSpeed(kmh: number, unit: 'kmh' | 'mph'): string {
  const val = convertSpeed(kmh, unit);
  return `${val} ${unit}`;
}

export function formatPressure(hPa: number, unit: 'hPa' | 'inHg'): string {
  if (unit === 'inHg') {
    return `${(hPa * 0.02953).toFixed(2)} inHg`;
  }
  return `${Math.round(hPa)} hPa`;
}

export function formatPrecip(mm: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'fahrenheit') {
    const inches = mm * 0.0393701;
    return `${inches < 0.1 && inches > 0 ? '<0.1' : inches.toFixed(1)}"`;
  }
  return `${mm.toFixed(1)} mm`;
}

export function formatVisibility(km: number, unit: 'kmh' | 'mph'): string {
  if (unit === 'mph') {
    const miles = km * 0.621371;
    return `${miles >= 10 ? '10+' : miles.toFixed(1)} mi`;
  }
  return `${km >= 10 ? '10+' : km.toFixed(1)} km`;
}

export function formatTimeAmPm(isoString: string): string {
  if (!isoString) return '--:--';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return isoString.slice(11, 16);
  }
}

export function formatDateShort(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString.includes('T') ? isoString : `${isoString}T12:00:00Z`);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}
