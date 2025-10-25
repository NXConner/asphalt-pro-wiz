import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWeather, getWorkRecommendations, type WeatherBundle } from "@/lib/weather";

interface WeatherCardProps {
  coords: [number, number] | null;
}

export const WeatherCard = ({ coords }: WeatherCardProps) => {
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const loc = coords ?? [36.7388, -80.2692];
      setLoading(true);
      try {
        const w = await getWeather(loc[0], loc[1]);
        setWeather(w);
      } finally {
        setLoading(false);
      }
    };
    void load();
    // coords dep split to avoid complex expressions false positive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.[0], coords?.[1]]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather & Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {loading && <div className="text-muted-foreground">Loading weather…</div>}
        {!loading && weather && (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{Math.round(weather.current.temperatureF)}°F</div>
              <div className="text-muted-foreground">
                Wind {Math.round(weather.current.windMph)} mph · Humidity{" "}
                {Math.round(weather.current.humidityPct)}%
                {weather.current.precipitationChancePct !== undefined &&
                  ` · Precip ${weather.current.precipitationChancePct}%`}
              </div>
            </div>
            {weather.hourlyNext6hPopPct && (
              <div className="text-xs text-muted-foreground">
                Next 6h precip chance: {weather.hourlyNext6hPopPct.join("% · ")}%
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              {weather.daily.slice(0, 4).map((d) => (
                <div key={d.date} className="p-2 rounded border">
                  <div className="text-xs text-muted-foreground">
                    {new Date(d.date).toLocaleDateString()}
                  </div>
                  <div className="font-semibold">
                    {Math.round(d.tempMaxF)}° / {Math.round(d.tempMinF)}°
                  </div>
                  <div className="text-xs">Precip {Math.round(d.precipitationMm)}mm</div>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="font-semibold">Crew Guidance</div>
              <ul className="list-disc pl-5 space-y-1">
                {getWorkRecommendations(weather).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {!loading && !weather && <div className="text-muted-foreground">Weather unavailable.</div>}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
