import { LocationData, WeatherResponse, ClimateAnalysisResponse } from '../types/weather';

export const DEFAULT_LOCATIONS: LocationData[] = [
  {
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    admin1: 'England',
    latitude: 51.5085,
    longitude: -0.1257,
  },
  {
    name: 'New York',
    country: 'United States',
    countryCode: 'US',
    admin1: 'New York',
    latitude: 40.7143,
    longitude: -74.006,
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    admin1: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.6917,
  },
  {
    name: 'Lagos',
    country: 'Nigeria',
    countryCode: 'NG',
    admin1: 'Lagos',
    latitude: 6.4541,
    longitude: 3.3947,
  },
  {
    name: 'Paris',
    country: 'France',
    countryCode: 'FR',
    admin1: 'Île-de-France',
    latitude: 48.8534,
    longitude: 2.3488,
  },
  {
    name: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    admin1: 'New South Wales',
    latitude: -33.8678,
    longitude: 151.2073,
  },
];

export async function searchLocations(query: string): Promise<LocationData[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
    if (!res.ok) {
      throw new Error(`Search failed: ${res.statusText}`);
    }
    const data = await res.json();
    return data.results || [];
  } catch (err: any) {
    console.error('Error searching locations:', err);
    throw err;
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationData> {
  try {
    const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
    if (!res.ok) {
      throw new Error(`Reverse geocode failed: ${res.statusText}`);
    }
    const data = await res.json();
    return {
      name: data.name || 'Current Location',
      country: data.country || '',
      countryCode: data.countryCode || '',
      admin1: data.admin1 || '',
      latitude: lat,
      longitude: lon,
    };
  } catch (err) {
    console.warn('Reverse geocode fallback:', err);
    return {
      name: 'Current Location',
      country: '',
      countryCode: '',
      latitude: lat,
      longitude: lon,
    };
  }
}

export async function fetchWeather(location: LocationData): Promise<WeatherResponse> {
  try {
    const params = new URLSearchParams({
      lat: location.latitude.toString(),
      lon: location.longitude.toString(),
      name: location.name,
      country: location.country,
      countryCode: location.countryCode,
      admin1: location.admin1 || '',
    });

    const res = await fetch(`/api/weather?${params.toString()}`);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.details || errBody.error || `Weather request failed with code ${res.status}`);
    }

    const data: WeatherResponse = await res.json();
    return data;
  } catch (err: any) {
    console.error('Fetch weather error:', err);
    throw err;
  }
}

export async function fetchHistoricalAnalysis(location: LocationData): Promise<ClimateAnalysisResponse> {
  try {
    const params = new URLSearchParams({
      lat: location.latitude.toString(),
      lon: location.longitude.toString(),
      name: location.name,
      country: location.country,
      admin1: location.admin1 || '',
    });

    const res = await fetch(`/api/historical-analysis?${params.toString()}`);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.details || errBody.error || `Climate analysis failed with code ${res.status}`);
    }

    const data: ClimateAnalysisResponse = await res.json();
    return data;
  } catch (err: any) {
    console.error('Fetch historical analysis error:', err);
    throw err;
  }
}

export async function fetchAIBriefing(analysis: ClimateAnalysisResponse): Promise<{ text: string; generatedAt: string }> {
  try {
    const res = await fetch('/api/ai-climate-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.details || errBody.error || `AI briefing request failed with code ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Fetch AI briefing error:', err);
    throw err;
  }
}

