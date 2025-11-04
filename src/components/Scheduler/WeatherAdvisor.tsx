import { useEffect, useMemo, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { loadMapSettings } from '@/lib/mapSettings';

interface ForecastBlock {
  dt: number;
  pop: number; // probability of precipitation 0..1
  main?: { temp?: number };
  weather?: Array<{ description?: string }>;
}

export function WeatherAdvisor({ coords }: { coords: [number, number] | null }) {
  const [forecast, setForecast] = useState<ForecastBlock[]>([]);
  const [popThreshold, setPopThreshold] = useState<number>(30);

  useEffect(() => {
    const settings = loadMapSettings();
    const apiKey =
      settings.openWeatherApiKey || (import.meta as any)?.env?.VITE_OPENWEATHER_API_KEY;
    if (!apiKey || !coords) return;
    const [lat, lon] = coords;
    (async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`,
        );
        const json = await res.json();
        const list: ForecastBlock[] = json?.list || [];
        setForecast(list);
      } catch {}
    })();
  }, [coords]);

  const windows = useMemo(() => {
    const threshold = popThreshold / 100;
    const ok = forecast.filter((b) => (b.pop ?? 0) <= threshold);
    return ok.slice(0, 8); // next ~24h (3h blocks)
  }, [forecast, popThreshold]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather Advisor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Max Precipitation Probability ({popThreshold}%)</Label>
          <Slider
            value={[popThreshold]}
            min={0}
            max={100}
            step={5}
            onValueChange={(v) => setPopThreshold(v?.[0] ?? 30)}
          />
        </div>
        {windows.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Set OpenWeather API key in Map settings and choose a location to see suggested windows.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {windows.map((b) => (
              <div key={b.dt} className="border rounded p-2 text-sm">
                <div className="font-medium">{new Date(b.dt * 1000).toLocaleString()}</div>
                <div className="text-muted-foreground">
                  POP {Math.round((b.pop ?? 0) * 100)}% • {Math.round(b.main?.temp ?? 0)}°F •{' '}
                  {b.weather?.[0]?.description || '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
