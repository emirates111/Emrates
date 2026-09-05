export interface LocationData {
  id?: number | string;
  name: string;
  country: string;
  countryCode: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  elevation?: number;
}

export type WeatherTheme = 'sunny' | 'clear-night' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';

export type UVLevel = 'low' | 'moderate' | 'high' | 'very-high' | 'extreme';

export interface CurrentWeather {
  temperature: number; // Celsius
  feelsLike: number; // Celsius
  tempMin: number;
  tempMax: number;
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // degrees
  windDirectionCardinal: string;
  windGust: number; // km/h
  pressure: number; // hPa
  uvIndex: number;
  uvLevel: UVLevel;
  visibility: number; // km
  cloudCover: number; // %
  dewPoint: number; // Celsius
  weatherCode: number;
  condition: string;
  icon: string;
  isDay: boolean;
  sunrise: string; // ISO
  sunset: string; // ISO
  lastUpdated: string; // ISO
}

export interface HourlyForecastItem {
  time: string; // ISO string
  hourLabel: string; // e.g. "2 PM" or "14:00"
  temperature: number;
  feelsLike: number;
  precipitationProbability: number; // %
  precipitation: number; // mm
  weatherCode: number;
  condition: string;
  icon: string;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string; // YYYY-MM-DD
  dayName: string; // e.g. "Monday", "Today"
  shortDay: string; // e.g. "Mon"
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  precipitationProbability: number;
  precipitationSum: number;
  weatherCode: number;
  condition: string;
  icon: string;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  windSpeedMax: number;
  hourly: HourlyForecastItem[];
}

export interface WeatherResponse {
  location: LocationData;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  theme: WeatherTheme;
}

export interface UnitPreferences {
  temperature: 'celsius' | 'fahrenheit';
  windSpeed: 'kmh' | 'mph';
  pressure: 'hPa' | 'inHg';
}

export interface FavoriteLocation {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  savedAt: number;
  temp?: number;
  condition?: string;
}

export interface ConditionFrequency {
  condition: string;
  type: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'dry' | 'foggy' | 'snowy';
  days: number;
  percentage: number;
  avgSpellLengthDays: number;
  maxSpellLengthDays: number;
  color: string;
}

export interface MonthlyClimateStat {
  month: string;
  monthIndex: number;
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  totalRain: number;
  rainyDays: number;
  avgHumidity: number;
  avgWindSpeed: number;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  temperature: number;
  tempMA7: number;
  tempMA30: number;
  tempNormal: number;
  precipitation: number;
  precipMA7: number;
  humidity: number;
  windSpeed: number;
  isAnomaly: boolean;
  anomalyType?: 'heatwave' | 'cold_snap' | 'extreme_rain' | 'storm_wind';
  anomalyDescription?: string;
}

export interface ForecastPredictionPoint {
  date: string;
  label: string;
  projectedTemp: number;
  upper80: number;
  lower80: number;
  upper95: number;
  lower95: number;
  projectedRain: number;
  rainUpper80: number;
}

export interface SeasonalPhase {
  id: string;
  name: string;
  period: string;
  startMonth: string;
  endMonth: string;
  peakPeriod: string;
  confidence: number; // % e.g. 85
  marginDays: number; // ± days
  description: string;
  keyCharacteristics: string[];
  isActive: boolean;
  color: string;
}

export interface SectorImpact {
  sector: 'agriculture' | 'transportation' | 'health' | 'water' | 'outdoor' | 'flooding' | 'drought';
  title: string;
  severity: 'low' | 'moderate' | 'elevated' | 'high' | 'critical';
  summary: string;
  keyRisks: string[];
  recommendations: string[];
  primaryMetric: string;
  metricValue: string;
}

export interface AnomalyRecord {
  date: string;
  type: 'heatwave' | 'cold_snap' | 'extreme_rain' | 'storm_wind';
  value: number;
  expected: number;
  deviation: string;
  description: string;
}

export interface ClimateAnalysisResponse {
  location: LocationData;
  dataSource: string;
  observationPeriod: string;
  totalDaysAnalyzed: number;
  conditionFrequencies: ConditionFrequency[];
  monthlyStats: MonthlyClimateStat[];
  timeSeries: TimeSeriesPoint[];
  forecastPredictions: ForecastPredictionPoint[];
  seasonalTimeline: SeasonalPhase[];
  sectorImpacts: SectorImpact[];
  anomalies: AnomalyRecord[];
  summaryMetrics: {
    hottestDay: { date: string; temp: number };
    coldestDay: { date: string; temp: number };
    wettestDay: { date: string; precip: number };
    totalAnnualRainfall: number;
    rainyDaysCount: number;
    dryDaysCount: number;
    longestDrySpellDays: number;
    longestRainySpellDays: number;
  };
}

