import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusinessData } from "@/lib/calculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BusinessSettingsProps {
  data: BusinessData;
  onChange: (data: BusinessData) => void;
}

export function BusinessSettings({ data, onChange }: BusinessSettingsProps) {
  const updateField = (field: keyof BusinessData, value: number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Settings</CardTitle>
        <CardDescription>Configure your labor rates, employees, and markup percentages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employees">Number of Employees</Label>
            <Input
              id="employees"
              type="number"
              min="1"
              value={data.employees}
              onChange={(e) => updateField('employees', parseFloat(e.target.value) || 1)}
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
              onChange={(e) => updateField('laborRate', parseFloat(e.target.value) || 0)}
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
              onChange={(e) => updateField('overheadPercent', parseFloat(e.target.value) || 0)}
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
              onChange={(e) => updateField('profitPercent', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
