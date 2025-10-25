import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusinessData, defaultBusinessData } from "@/lib/calculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BusinessSettingsProps {
  data: BusinessData;
  onChange: (data: BusinessData) => void;
}

export function BusinessSettings({ data, onChange }: BusinessSettingsProps) {
  const updateField = (field: keyof BusinessData, value: number) => {
    onChange({ ...data, [field]: value });
  };

  // Load/save settings for persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pps.businessData");
      if (saved) {
        const parsed = JSON.parse(saved) as BusinessData;
        onChange(parsed);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = () => {
    try {
      localStorage.setItem("pps.businessData", JSON.stringify(data));
    } catch {}
  };

  const resetDefaults = () => {
    onChange({ ...defaultBusinessData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Settings</CardTitle>
        <CardDescription>
          Configure your labor rates, employees, and markup percentages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employees">Number of Employees</Label>
            <Input
              id="employees"
              type="number"
              min="1"
              value={data.employees}
              onChange={(e) => updateField("employees", parseFloat(e.target.value) || 1)}
            />
          </div>
          <div>
            <Label htmlFor="laborRate">Hourly Wage ($/hr)</Label>
            <Input
              id="laborRate"
              type="number"
              min="0"
              step="0.5"
              value={data.laborRate}
              onChange={(e) => updateField("laborRate", parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="overheadPercent">Overhead (%)</Label>
            <Input
              id="overheadPercent"
              type="number"
              min="0"
              max="100"
              step="1"
              value={data.overheadPercent}
              onChange={(e) => updateField("overheadPercent", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="profitPercent">Profit Margin (%)</Label>
            <Input
              id="profitPercent"
              type="number"
              min="0"
              max="100"
              step="1"
              value={data.profitPercent}
              onChange={(e) => updateField("profitPercent", parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Material Costs ($)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sealcoatPrice">Sealer (per gal)</Label>
              <Input
                id="sealcoatPrice"
                type="number"
                step="0.01"
                value={data.sealcoatPrice}
                onChange={(e) => updateField("sealcoatPrice", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="sandPrice">Sand (per bag)</Label>
              <Input
                id="sandPrice"
                type="number"
                step="0.01"
                value={data.sandPrice}
                onChange={(e) => updateField("sandPrice", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="fastDryPrice">Fast-Dry Additive (per bucket)</Label>
              <Input
                id="fastDryPrice"
                type="number"
                step="0.01"
                value={data.fastDryPrice}
                onChange={(e) => updateField("fastDryPrice", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="prepSealPrice">Primer (per bucket)</Label>
              <Input
                id="prepSealPrice"
                type="number"
                step="0.01"
                value={data.prepSealPrice}
                onChange={(e) => updateField("prepSealPrice", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="crackFillerPrice">Crack Filler (per box)</Label>
              <Input
                id="crackFillerPrice"
                type="number"
                step="0.01"
                value={data.crackFillerPrice}
                onChange={(e) => updateField("crackFillerPrice", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Travel & Fuel</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="gasPrice">Gas Price ($/gal)</Label>
              <Input
                id="gasPrice"
                type="number"
                step="0.001"
                value={data.gasPrice}
                onChange={(e) => updateField("gasPrice", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="chevyMPG">Chevy MPG</Label>
              <Input
                id="chevyMPG"
                type="number"
                step="0.1"
                value={data.chevyMPG}
                onChange={(e) => updateField("chevyMPG", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="dodgeMPG">Dodge MPG</Label>
              <Input
                id="dodgeMPG"
                type="number"
                step="0.1"
                value={data.dodgeMPG}
                onChange={(e) => updateField("dodgeMPG", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="propanePrice">Propane (per tank)</Label>
              <Input
                id="propanePrice"
                type="number"
                step="0.01"
                value={data.propanePrice}
                onChange={(e) => updateField("propanePrice", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Sealcoat Coverage & Productivity</h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <Label>Coat 1 gal/sq ft</Label>
              <Input
                type="number"
                step="0.0001"
                value={data.sealCoatCoverage1}
                onChange={(e) => updateField("sealCoatCoverage1", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Coat 2 gal/sq ft</Label>
              <Input
                type="number"
                step="0.0001"
                value={data.sealCoatCoverage2}
                onChange={(e) => updateField("sealCoatCoverage2", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Coat 3 gal/sq ft</Label>
              <Input
                type="number"
                step="0.0001"
                value={data.sealCoatCoverage3}
                onChange={(e) => updateField("sealCoatCoverage3", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Sand Ratio (lb/100gal)</Label>
              <Input
                type="number"
                step="0.1"
                value={data.sandRatio}
                onChange={(e) => updateField("sandRatio", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Crack Sealing Speed (ft/hr)</Label>
              <Input
                type="number"
                step="1"
                value={data.crackSealingSpeed}
                onChange={(e) => updateField("crackSealingSpeed", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Sealcoating Speed 1 (sq ft/hr)</Label>
              <Input
                type="number"
                step="1"
                value={data.sealcoatingSpeed1}
                onChange={(e) => updateField("sealcoatingSpeed1", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Sealcoating Speed 2/3 (sq ft/hr)</Label>
              <Input
                type="number"
                step="1"
                value={data.sealcoatingSpeed2}
                onChange={(e) => updateField("sealcoatingSpeed2", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Striping Rates ($)</h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <Label>Line</Label>
              <Input
                type="number"
                step="0.01"
                value={data.striping.line}
                onChange={(e) =>
                  onChange({
                    ...data,
                    striping: { ...data.striping, line: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div>
              <Label>Handicap</Label>
              <Input
                type="number"
                step="0.01"
                value={data.striping.handicap}
                onChange={(e) =>
                  onChange({
                    ...data,
                    striping: { ...data.striping, handicap: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div>
              <Label>Arrow Large</Label>
              <Input
                type="number"
                step="0.01"
                value={data.striping.arrowLarge}
                onChange={(e) =>
                  onChange({
                    ...data,
                    striping: { ...data.striping, arrowLarge: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div>
              <Label>Arrow Small</Label>
              <Input
                type="number"
                step="0.01"
                value={data.striping.arrowSmall}
                onChange={(e) =>
                  onChange({
                    ...data,
                    striping: { ...data.striping, arrowSmall: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div>
              <Label>Lettering</Label>
              <Input
                type="number"
                step="0.01"
                value={data.striping.lettering}
                onChange={(e) =>
                  onChange({
                    ...data,
                    striping: { ...data.striping, lettering: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div>
              <Label>Curb (per ft)</Label>
              <Input
                type="number"
                step="0.01"
                value={data.striping.curb}
                onChange={(e) =>
                  onChange({
                    ...data,
                    striping: { ...data.striping, curb: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Premium Services ($)</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label>Edge Pushing</Label>
              <Input
                type="number"
                step="0.01"
                value={data.premiumServices.edgePushing}
                onChange={(e) =>
                  onChange({
                    ...data,
                    premiumServices: {
                      ...data.premiumServices,
                      edgePushing: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>Weed Killer</Label>
              <Input
                type="number"
                step="0.01"
                value={data.premiumServices.weedKiller}
                onChange={(e) =>
                  onChange({
                    ...data,
                    premiumServices: {
                      ...data.premiumServices,
                      weedKiller: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>Crack Cleaning</Label>
              <Input
                type="number"
                step="0.01"
                value={data.premiumServices.crackCleaning}
                onChange={(e) =>
                  onChange({
                    ...data,
                    premiumServices: {
                      ...data.premiumServices,
                      crackCleaning: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>Power Washing</Label>
              <Input
                type="number"
                step="0.01"
                value={data.premiumServices.powerWashing}
                onChange={(e) =>
                  onChange({
                    ...data,
                    premiumServices: {
                      ...data.premiumServices,
                      powerWashing: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>Debris Removal</Label>
              <Input
                type="number"
                step="0.01"
                value={data.premiumServices.debrisRemoval}
                onChange={(e) =>
                  onChange({
                    ...data,
                    premiumServices: {
                      ...data.premiumServices,
                      debrisRemoval: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" onClick={saveSettings} variant="outline">
            Save Defaults
          </Button>
          <Button type="button" onClick={resetDefaults} variant="secondary">
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
