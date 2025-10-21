import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

export function ThemeCustomizer() {
  const [primaryHue, setPrimaryHue] = useState(210);

  const applyTheme = (hue: number) => {
    setPrimaryHue(hue);
    document.documentElement.style.setProperty('--primary', `${hue} 100% 50%`);
    document.documentElement.style.setProperty('--primary-foreground', `${hue} 10% 95%`);
  };

  const presets = [
    { name: 'Blue', hue: 210 },
    { name: 'Green', hue: 142 },
    { name: 'Orange', hue: 25 },
    { name: 'Purple', hue: 270 },
    { name: 'Red', hue: 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Customizer
        </CardTitle>
        <CardDescription>Customize your invoice theme colors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="primary-hue">Primary Color Hue ({primaryHue}°)</Label>
          <input
            id="primary-hue"
            type="range"
            min="0"
            max="360"
            value={primaryHue}
            onChange={(e) => applyTheme(parseInt(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-lg appearance-none cursor-pointer mt-2"
          />
        </div>

        <div>
          <Label>Color Presets</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyTheme(preset.hue)}
                style={{ 
                  borderColor: `hsl(${preset.hue} 100% 50%)`,
                  color: `hsl(${preset.hue} 100% 35%)`
                }}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
