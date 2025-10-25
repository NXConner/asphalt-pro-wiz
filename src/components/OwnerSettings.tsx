import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface OwnerSettingsProps {
  waterPercent: number;
  onWaterPercentChange: (v: number) => void;
  sealerType: string;
  onSealerTypeChange: (v: string) => void;
  sandType: string;
  onSandTypeChange: (v: string) => void;
}

export function OwnerSettings({
  waterPercent,
  onWaterPercentChange,
  sealerType,
  onSealerTypeChange,
  sandType,
  onSandTypeChange,
}: OwnerSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner Mixing & Materials</CardTitle>
        <CardDescription>Visible only when Owner Mode is enabled</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Sealer Type</Label>
            <Select value={sealerType} onValueChange={onSealerTypeChange as any}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PMM">PMM (Default)</SelectItem>
                <SelectItem value="Asphalt Emulsion">Asphalt Emulsion</SelectItem>
                <SelectItem value="Coal Tar">Coal Tar</SelectItem>
                <SelectItem value="Acrylic">Acrylic</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Water Percentage (0-30%)</Label>
            <Input
              type="number"
              min={0}
              max={30}
              step={1}
              value={waterPercent}
              onChange={(e) => onWaterPercentChange(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Sand Type</Label>
            <Select value={sandType} onValueChange={onSandTypeChange as any}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Black Beauty">Black Beauty</SelectItem>
                <SelectItem value="Black Diamond">Black Diamond</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
