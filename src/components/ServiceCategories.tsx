import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceCategoriesProps {
  cleaningRepair: boolean;
  sealcoating: boolean;
  striping: boolean;
  onChange: (category: string, value: boolean) => void;
}

export function ServiceCategories({
  cleaningRepair,
  sealcoating,
  striping,
  onChange,
}: ServiceCategoriesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Categories</CardTitle>
        <CardDescription>Select which services to include in this estimate</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="cleaning-repair"
            checked={cleaningRepair}
            onCheckedChange={(checked) => onChange("includeCleaningRepair", checked as boolean)}
          />
          <Label htmlFor="cleaning-repair" className="cursor-pointer font-semibold">
            Cleaning & Crack Repair
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="sealcoating"
            checked={sealcoating}
            onCheckedChange={(checked) => onChange("includeSealcoating", checked as boolean)}
          />
          <Label htmlFor="sealcoating" className="cursor-pointer font-semibold">
            Sealcoating
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="striping"
            checked={striping}
            onCheckedChange={(checked) => onChange("includeStriping", checked as boolean)}
          />
          <Label htmlFor="striping" className="cursor-pointer font-semibold">
            Line Striping
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
