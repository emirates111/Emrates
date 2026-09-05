import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { computeClimateAnalysis, generateAICoverageReport } from './server/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for weather and geocoding to prevent excessive upstream calls
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const weatherCache = new Map<string, CacheEntry<any>>();
const geocodeCache = new Map<string, CacheEntry<any>>();

const WEATHER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const GEOCODE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCardinalDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

function getUVLevel(uv: number): 'low' | 'moderate' | 'high' | 'very-high' | 'extreme' {
  if (uv < 3) return 'low';
  if (uv < 6) return 'moderate';
  if (uv < 8) return 'high';
  if (uv < 11) return 'very-high';
  return 'extreme';
}

function getWeatherInfo(code: number, isDay: boolean = true): {
  condition: string;
  icon: string;
  theme: 'sunny' | 'clear-night' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';
} {
  switch (code) {
    case 0:
      return {
        condition: 'Clear Sky',
        icon: isDay ? 'Sun' : 'Moon',
        theme: isDay ? 'sunny' : 'clear-night',
      };
    case 1:
      return {
        condition: 'Mainly Clear',
        icon: isDay ? 'SunMedium' : 'MoonStar',
        theme: isDay ? 'sunny' : 'clear-night',
      };
    case 2:
      return {
        condition: 'Partly Cloudy',
        icon: isDay ? 'CloudSun' : 'CloudMoon',
        theme: 'cloudy',
      };
    case 3:
      return {
        condition: 'Overcast',
        icon: 'Cloud',
        theme: 'cloudy',
      };
    case 45:
    case 48:
      return {
        condition: 'Foggy & Rime Fog',
        icon: 'CloudFog',
        theme: 'fog',
      };
    case 51:
      return {
        condition: 'Light Drizzle',
        icon: 'CloudDrizzle',
        theme: 'rain',
      };
    case 53:
      return {
        condition: 'Moderate Drizzle',
        icon: 'CloudDrizzle',
        theme: 'rain',
      };
    case 55:
      return {
        condition: 'Dense Drizzle',
        icon: 'CloudDrizzle',
        theme: 'rain',
      };
    case 56:
    case 57:
      return {
        condition: 'Freezing Drizzle',
        icon: 'CloudSnow',
        theme: 'snow',
      };
    case 61:
      return {
        condition: 'Slight Rain',
        icon: 'CloudRain',
        theme: 'rain',
      };
    case 63:
      return {
        condition: 'Moderate Rain',
        icon: 'CloudRain',
        theme: 'rain',
      };
    case 65:
      return {
        condition: 'Heavy Rain',
        icon: 'CloudRain',
        theme: 'rain',
      };
    case 66:
    case 67:
      return {
        condition: 'Freezing Rain',
        icon: 'CloudSnow',
        theme: 'snow',
      };
    case 71:
      return {
        condition: 'Slight Snowfall',
        icon: 'Snowflake',
        theme: 'snow',
      };
    case 73:
      return {
        condition: 'Moderate Snowfall',
        icon: 'Snowflake',
        theme: 'snow',
      };
    case 75:
      return {
        condition: 'Heavy Snowfall',
        icon: 'Snowflake',
        theme: 'snow',
      };
    case 77:
      return {
        condition: 'Snow Grains',
        icon: 'Snowflake',
        theme: 'snow',
      };
    case 80:
      return {
        condition: 'Slight Showers',
        icon: 'CloudRain',
        theme: 'rain',
      };
    case 81:
      return {
        condition: 'Moderate Showers',
        icon: 'CloudRain',
        theme: 'rain',
      };
    case 82:
      return {
        condition: 'Violent Showers',
        icon: 'CloudRain',
        theme: 'rain',
      };
    case 85:
    case 86:
      return {
        condition: 'Snow Showers',
        icon: 'CloudSnow',
        theme: 'snow',
      };
    case 95:
      return {
        condition: 'Thunderstorm',
        icon: 'CloudLightning',
        theme: 'storm',
      };
    case 96:
    case 99:
      return {
        condition: 'Severe Thunderstorm & Hail',
        icon: 'CloudLightning',
        theme: 'storm',
      };
    default:
      return {
        condition: 'Partly Cloudy',
        icon: isDay ? 'CloudSun' : 'CloudMoon',
        theme: 'cloudy',
      };
  }
}

// Format hour label
function formatHour(isoTime: string): string {
  try {
    const d = new Date(isoTime);
    return d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
  } catch {
    return isoTime.slice(11, 16);
  }
}

// Format day name
function formatDayName(dateStr: string, index: number): { dayName: string; shortDay: string } {
  if (index === 0) {
    return { dayName: 'Today', shortDay: 'Today' };
  }
  if (index === 1) {
    return { dayName: 'Tomorrow', shortDay: 'Tmrw' };
  }
  try {
    const date = new Date(dateStr + 'T12:00:00Z');
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const shortDay = date.toLocaleDateString('en-US', { weekday: 'short' });
    return { dayName, shortDay };
  } catch {
    return { dayName: dateStr, shortDay: dateStr };
  }
}

// API: Search Locations / Geocoding
app.get('/api/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim();
  if (!query || query.length < 2) {
    res.json({ results: [] });
    return;
  }

  const cacheKey = `search_${query.toLowerCase()}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    res.json({ results: cached.data });
    return;
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    const results = (data.results || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || '',
      countryCode: item.country_code ? item.country_code.toUpperCase() : '',
      admin1: item.admin1 || item.admin2 || '',
      timezone: item.timezone || 'auto',
      elevation: item.elevation,
    }));

    geocodeCache.set(cacheKey, { data: results, expiry: Date.now() + GEOCODE_CACHE_TTL });
    res.json({ results });
  } catch (error: any) {
    console.error('Geocoding search error:', error.message);
    res.status(500).json({ error: 'Failed to search for locations', details: error.message });
  }
});

// API: Reverse Geocode (Coordinates to City/Location Name)
app.get('/api/reverse-geocode', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (isNaN(lat) || isNaN(lon)) {
    res.status(400).json({ error: 'Valid lat and lon are required' });
    return;
  }

  const cacheKey = `reverse_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    res.json(cached.data);
    return;
  }

  try {
    // Attempt reverse geocoding via BigDataCloud client-free reverse geocoder or OpenStreetMap Nominatim
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const response = await fetch(url, { headers: { 'User-Agent': 'AtmosphereWeatherApp/1.0' } });

    if (response.ok) {
      const data = await response.json();
      const result = {
        name: data.city || data.locality || data.principalSubdivision || 'Current Location',
        country: data.countryName || '',
        countryCode: (data.countryCode || '').toUpperCase(),
        admin1: data.principalSubdivision || '',
        latitude: lat,
        longitude: lon,
      };

      geocodeCache.set(cacheKey, { data: result, expiry: Date.now() + GEOCODE_CACHE_TTL });
      res.json(result);
      return;
    }

    // Fallback placeholder
    const fallback = {
      name: 'Your Location',
      country: '',
      countryCode: '',
      admin1: '',
      latitude: lat,
      longitude: lon,
    };
    res.json(fallback);
  } catch (error: any) {
    console.error('Reverse geocode error:', error.message);
    res.json({
      name: 'Current Location',
      country: '',
      countryCode: '',
      latitude: lat,
      longitude: lon,
    });
  }
});

// API: Weather Data
app.get('/api/weather', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  const name = (req.query.name as string) || 'Location';
  const country = (req.query.country as string) || '';
  const countryCode = (req.query.countryCode as string) || '';
  const admin1 = (req.query.admin1 as string) || '';

  if (isNaN(lat) || isNaN(lon)) {
    res.status(400).json({ error: 'Valid latitude and longitude are required' });
    return;
  }

  const cacheKey = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    // Update location metadata if custom name was passed
    const cachedData = { ...cached.data };
    cachedData.location = {
      ...cachedData.location,
      name: name !== 'Location' ? name : cachedData.location.name,
      country: country || cachedData.location.country,
      countryCode: countryCode || cachedData.location.countryCode,
      admin1: admin1 || cachedData.location.admin1,
    };
    res.json(cachedData);
    return;
  }

  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'weather_code',
        'cloud_cover',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'dew_point_2m',
        'apparent_temperature',
        'precipitation_probability',
        'precipitation',
        'weather_code',
        'surface_pressure',
        'cloud_cover',
        'visibility',
        'wind_speed_10m',
        'wind_direction_10m',
        'uv_index',
        'is_day',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'sunrise',
        'sunset',
        'uv_index_max',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max',
      ].join(','),
      forecast_days: '16',
      timezone: 'auto',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }

    const raw = await response.json();
    const current = raw.current;
    const hourly = raw.hourly;
    const daily = raw.daily;

    const weatherMeta = getWeatherInfo(current.weather_code, current.is_day === 1);

    // Current hour index in hourly data
    const nowISO = current.time;
    let currentHourIndex = hourly.time.findIndex((t: string) => t >= nowISO);
    if (currentHourIndex === -1) currentHourIndex = 0;

    const currentDewPoint = hourly.dew_point_2m[currentHourIndex] ?? 0;
    const currentVisibility = (hourly.visibility[currentHourIndex] ?? 10000) / 1000; // km
    const currentUV = hourly.uv_index[currentHourIndex] ?? 0;

    const currentWeather = {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      tempMin: Math.round(daily.temperature_2m_min[0] ?? current.temperature_2m - 3),
      tempMax: Math.round(daily.temperature_2m_max[0] ?? current.temperature_2m + 3),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: current.wind_direction_10m,
      windDirectionCardinal: getCardinalDirection(current.wind_direction_10m),
      windGust: Math.round(current.wind_gusts_10m || current.wind_speed_10m),
      pressure: Math.round(current.surface_pressure),
      uvIndex: Math.round(currentUV * 10) / 10,
      uvLevel: getUVLevel(currentUV),
      visibility: Math.round(currentVisibility * 10) / 10,
      cloudCover: Math.round(current.cloud_cover),
      dewPoint: Math.round(currentDewPoint),
      weatherCode: current.weather_code,
      condition: weatherMeta.condition,
      icon: weatherMeta.icon,
      isDay: current.is_day === 1,
      sunrise: daily.sunrise[0] || '',
      sunset: daily.sunset[0] || '',
      lastUpdated: new Date().toISOString(),
    };

    // Format next 24-48 hours
    const hourlyItems: any[] = [];
    const maxHourly = Math.min(hourly.time.length, currentHourIndex + 25);
    for (let i = currentHourIndex; i < maxHourly; i++) {
      const isD = hourly.is_day[i] === 1;
      const hMeta = getWeatherInfo(hourly.weather_code[i], isD);
      hourlyItems.push({
        time: hourly.time[i],
        hourLabel: i === currentHourIndex ? 'Now' : formatHour(hourly.time[i]),
        temperature: Math.round(hourly.temperature_2m[i]),
        feelsLike: Math.round(hourly.apparent_temperature[i]),
        precipitationProbability: Math.round(hourly.precipitation_probability[i] ?? 0),
        precipitation: Math.round((hourly.precipitation[i] ?? 0) * 10) / 10,
        weatherCode: hourly.weather_code[i],
        condition: hMeta.condition,
        icon: hMeta.icon,
        isDay: isD,
        humidity: Math.round(hourly.relative_humidity_2m[i]),
        windSpeed: Math.round(hourly.wind_speed_10m[i]),
        windDirection: hourly.wind_direction_10m[i],
        uvIndex: hourly.uv_index[i] ?? 0,
      });
    }

    // Format 7 to 16-Day Daily Forecast with day's hourly chunk
    const dailyItems: any[] = [];
    const dailyCount = Math.min(daily.time.length, 16);
    for (let d = 0; d < dailyCount; d++) {
      const dateStr = daily.time[d];
      const { dayName, shortDay } = formatDayName(dateStr, d);
      const dMeta = getWeatherInfo(daily.weather_code[d], true);

      // Extract 24-hour chunk for this day
      const dayHourly: any[] = [];
      const dayPrefix = dateStr;
      for (let h = 0; h < hourly.time.length; h++) {
        if (hourly.time[h].startsWith(dayPrefix)) {
          const isD = hourly.is_day[h] === 1;
          const hMeta = getWeatherInfo(hourly.weather_code[h], isD);
          dayHourly.push({
            time: hourly.time[h],
            hourLabel: formatHour(hourly.time[h]),
            temperature: Math.round(hourly.temperature_2m[h]),
            feelsLike: Math.round(hourly.apparent_temperature[h]),
            precipitationProbability: Math.round(hourly.precipitation_probability[h] ?? 0),
            precipitation: Math.round((hourly.precipitation[h] ?? 0) * 10) / 10,
            weatherCode: hourly.weather_code[h],
            condition: hMeta.condition,
            icon: hMeta.icon,
            isDay: isD,
            humidity: Math.round(hourly.relative_humidity_2m[h]),
            windSpeed: Math.round(hourly.wind_speed_10m[h]),
            windDirection: hourly.wind_direction_10m[h],
            uvIndex: hourly.uv_index[h] ?? 0,
          });
        }
      }

      dailyItems.push({
        date: dateStr,
        dayName,
        shortDay,
        tempMax: Math.round(daily.temperature_2m_max[d]),
        tempMin: Math.round(daily.temperature_2m_min[d]),
        apparentTempMax: Math.round(daily.apparent_temperature_max[d]),
        apparentTempMin: Math.round(daily.apparent_temperature_min[d]),
        precipitationProbability: Math.round(daily.precipitation_probability_max[d] ?? 0),
        precipitationSum: Math.round((daily.precipitation_sum[d] ?? 0) * 10) / 10,
        weatherCode: daily.weather_code[d],
        condition: dMeta.condition,
        icon: dMeta.icon,
        sunrise: daily.sunrise[d] || '',
        sunset: daily.sunset[d] || '',
        uvIndexMax: Math.round((daily.uv_index_max[d] ?? 0) * 10) / 10,
        windSpeedMax: Math.round(daily.wind_speed_10m_max[d]),
        hourly: dayHourly,
      });
    }

    const payload = {
      location: {
        name,
        country,
        countryCode,
        admin1,
        latitude: lat,
        longitude: lon,
        timezone: raw.timezone,
        elevation: raw.elevation,
      },
      current: currentWeather,
      hourly: hourlyItems,
      daily: dailyItems,
      theme: weatherMeta.theme,
    };

    weatherCache.set(cacheKey, { data: payload, expiry: Date.now() + WEATHER_CACHE_TTL });
    res.json(payload);
  } catch (error: any) {
    console.error('Weather fetch error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve weather data', details: error.message });
  }
});

// GET /api/historical-analysis
app.get('/api/historical-analysis', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const name = (req.query.name as string) || 'Location';
    const country = (req.query.country as string) || '';
    const admin1 = (req.query.admin1 as string) || '';

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required' });
    }

    const analysis = await computeClimateAnalysis(lat, lon, name, country, admin1);
    res.json(analysis);
  } catch (error: any) {
    console.error('Historical analysis error:', error.message);
    res.status(500).json({ error: 'Failed to compute climate analysis', details: error.message });
  }
});

// POST /api/ai-climate-briefing
app.post('/api/ai-climate-briefing', async (req: Request, res: Response) => {
  try {
    const { analysis } = req.body;
    if (!analysis || !analysis.location) {
      return res.status(400).json({ error: 'Climate analysis payload is required' });
    }

    const briefing = await generateAICoverageReport(analysis);
    res.json(briefing);
  } catch (error: any) {
    console.error('AI climate briefing error:', error.message);
    res.status(500).json({ error: 'Failed to generate AI climate briefing', details: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
