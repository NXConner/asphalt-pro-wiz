import { loadMapSettings } from './mapSettings';

export interface CurrentWeather {
  temperatureF: number;
  windMph: number;
  humidityPct: number;
  precipitationMm: number;
  precipitationChancePct?: number;
  condition?: string;
}

export interface DailyForecast {
  date: string;
  tempMinF: number;
  tempMaxF: number;
  precipitationMm: number;
  precipitationChancePct?: number;
}

export interface WeatherBundle {
  current: CurrentWeather;
  daily: DailyForecast[];
  hourlyNext6hPopPct?: number[]; // probability of precipitation for next 6 hours (0-100)
}

function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}
function msToMph(ms: number): number {
  return ms * 2.23694;
}

export async function getWeather(lat: number, lon: number): Promise<WeatherBundle | null> {
  const { openWeatherApiKey } = loadMapSettings();
  if (openWeatherApiKey) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=imperial&appid=${openWeatherApiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const current: CurrentWeather = {
          temperatureF: data.current.temp,
          windMph: data.current.wind_speed,
          humidityPct: data.current.humidity,
          precipitationMm: (data.current.rain?.['1h'] || 0) + (data.current.snow?.['1h'] || 0),
          precipitationChancePct: data.hourly?.[0]?.pop
            ? Math.round(data.hourly[0].pop * 100)
            : undefined,
          condition: data.current.weather?.[0]?.main,
        };
        interface OpenWeatherDaily {
          dt: number;
          temp: { min: number; max: number };
          rain?: number | { '1h'?: number };
          snow?: number | { '1h'?: number };
          pop?: number;
        }
        interface OpenWeatherHourly {
          pop?: number;
        }
        const daily: DailyForecast[] = (data.daily || []).slice(0, 7).map((d: OpenWeatherDaily) => {
          const rainValue =
            typeof d.rain === 'number' ? d.rain : typeof d.rain === 'object' && d.rain ? 0 : 0;
          const snowValue =
            typeof d.snow === 'number' ? d.snow : typeof d.snow === 'object' && d.snow ? 0 : 0;
          return {
            date: new Date(d.dt * 1000).toISOString().slice(0, 10),
            tempMinF: d.temp.min,
            tempMaxF: d.temp.max,
            precipitationMm: rainValue + snowValue,
            precipitationChancePct: d.pop ? Math.round(d.pop * 100) : undefined,
          };
        });
        const hourlyNext6hPopPct: number[] = (data.hourly || [])
          .slice(0, 6)
          .map((h: OpenWeatherHourly) => Math.round((h.pop || 0) * 100));
        return { current, daily, hourlyNext6hPopPct };
      }
    } catch {}
  }

  // Fallback to Open-Meteo (no key)
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m&hourly=precipitation_probability,temperature_2m,wind_speed_10m&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const current: CurrentWeather = {
      temperatureF: cToF(data.current.temperature_2m),
      windMph: msToMph((data.current.wind_speed_10m ?? 0) / 3.6), // km/h to m/s to mph
      humidityPct: data.current.relative_humidity_2m,
      precipitationMm: data.current.precipitation ?? 0,
      precipitationChancePct: data.hourly?.precipitation_probability?.[0],
    };
    const daily: DailyForecast[] = (data.daily?.time || []).map((t: string, idx: number) => ({
      date: t,
      tempMinF: cToF(data.daily.temperature_2m_min[idx]),
      tempMaxF: cToF(data.daily.temperature_2m_max[idx]),
      precipitationMm: data.daily.precipitation_sum[idx] ?? 0,
    }));
    const hourlyNext6hPopPct: number[] = (data.hourly?.precipitation_probability || [])
      .slice(0, 6)
      .map((v: number) => Math.round(v ?? 0));
    return { current, daily, hourlyNext6hPopPct };
  } catch {
    return null;
  }
}

export function getWorkRecommendations(weather: WeatherBundle): string[] {
  const out: string[] = [];
  const cur = weather.current;
  const today = weather.daily[0];

  // Sealcoating recommendations
  if (today.precipitationMm > 1 || (cur.precipitationChancePct ?? 0) > 40) {
    out.push('Sealcoating: Postpone due to precipitation risk.');
  } else if (cur.temperatureF < 50) {
    out.push('Sealcoating: Caution, low temps may slow curing.');
  } else if (cur.windMph > 15) {
    out.push('Sealcoating: Caution, high winds may cause overspray.');
  } else {
    out.push('Sealcoating: Good conditions.');
  }

  // Crack repair
  if (today.precipitationMm > 0.5) {
    out.push('Crack Repair: Moisture likely; ensure cracks are dry before filling.');
  } else {
    out.push('Crack Repair: Favorable if substrate is dry.');
  }

  // Line striping
  if ((cur.precipitationChancePct ?? 0) > 30 || today.precipitationMm > 0.5) {
    out.push('Line Striping: Delay to avoid paint washout.');
  } else if (cur.temperatureF < 55) {
    out.push('Line Striping: Low temperatures may affect adhesion; use fast-dry additive.');
  } else {
    out.push('Line Striping: Good to proceed.');
  }

  return out;
}
