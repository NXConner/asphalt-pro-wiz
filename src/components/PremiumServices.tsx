import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PremiumServicesProps {
  edgePushing: boolean;
  weedKiller: boolean;
  crackCleaning: boolean;
  powerWashing: boolean;
  debrisRemoval: boolean;
  onChange: (service: string, value: boolean) => void;
}

export function PremiumServices({
  edgePushing,
  weedKiller,
  crackCleaning,
  powerWashing,
  debrisRemoval,
  onChange,
}: PremiumServicesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Premium Services</CardTitle>
        <CardDescription>Additional professional services to enhance the project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="edge-pushing"
            checked={edgePushing}
            onCheckedChange={(checked) => onChange('premiumEdgePushing', checked as boolean)}
          />
          <Label htmlFor="edge-pushing" className="cursor-pointer">
            Edge Pushing - Push back asphalt edges for clean lines
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="weed-killer"
            checked={weedKiller}
            onCheckedChange={(checked) => onChange('premiumWeedKiller', checked as boolean)}
          />
          <Label htmlFor="weed-killer" className="cursor-pointer">
            Weed Killer Application - Prevent vegetation growth in cracks
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="crack-cleaning"
            checked={crackCleaning}
            onCheckedChange={(checked) => onChange('premiumCrackCleaning', checked as boolean)}
          />
          <Label htmlFor="crack-cleaning" className="cursor-pointer">
            Professional Crack Cleaning - Deep clean cracks before filling
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="power-washing"
            checked={powerWashing}
            onCheckedChange={(checked) => onChange('premiumPowerWashing', checked as boolean)}
          />
          <Label htmlFor="power-washing" className="cursor-pointer">
            Power Washing - High-pressure cleaning of asphalt surface
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="debris-removal"
            checked={debrisRemoval}
            onCheckedChange={(checked) => onChange('premiumDebrisRemoval', checked as boolean)}
          />
          <Label htmlFor="debris-removal" className="cursor-pointer">
            Debris Removal - Complete site cleanup and debris hauling
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
