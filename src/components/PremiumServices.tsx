import { CheckCircle2, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PREMIUM_SERVICES, STANDARD_SERVICES } from '@/lib/serviceCatalog';

interface PremiumServicesProps {
  edgePushing: boolean;
  weedKiller: boolean;
  crackCleaning: boolean;
  powerWashing: boolean;
  debrisRemoval: boolean;
  onChange: (service: string, value: boolean) => void;
  onAddCustomService?: (serviceId: string) => void;
  addedServiceNames?: string[];
}

export function PremiumServices({
  edgePushing,
  weedKiller,
  crackCleaning,
  powerWashing,
  debrisRemoval,
  onChange,
  onAddCustomService,
  addedServiceNames = [],
}: PremiumServicesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Premium Services</CardTitle>
        <CardDescription>
          Additional professional services to enhance durability, safety, appearance, and lifecycle
          value. Premium options are priced higher due to added materials, specialized equipment,
          skilled labor time, logistics, and documentation that collectively deliver longer-lasting,
          lower-risk outcomes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Included</Badge>
            <h4 className="font-semibold">Standard Expected Services</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STANDARD_SERVICES.map((svc) => (
              <div key={svc.id} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">{svc.name}</div>
                  <div className="text-sm text-muted-foreground">{svc.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge>Core Premium Add-ons</Badge>
            <p className="text-sm text-muted-foreground">
              These integrate with the estimator&apos;s pricing model.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edge-pushing"
                checked={edgePushing}
                onCheckedChange={(checked) => onChange('premiumEdgePushing', checked as boolean)}
              />
              <Label htmlFor="edge-pushing" className="cursor-pointer">
                Edge Pushing — Restore clean asphalt edges for better sealing and appearance
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="weed-killer"
                checked={weedKiller}
                onCheckedChange={(checked) => onChange('premiumWeedKiller', checked as boolean)}
              />
              <Label htmlFor="weed-killer" className="cursor-pointer">
                Vegetation Control (Weed Killer) — Prevent growth through sealed areas
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="crack-cleaning"
                checked={crackCleaning}
                onCheckedChange={(checked) => onChange('premiumCrackCleaning', checked as boolean)}
              />
              <Label htmlFor="crack-cleaning" className="cursor-pointer">
                Professional Crack Cleaning — Heat-lance cleaning for maximum bond
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="power-washing"
                checked={powerWashing}
                onCheckedChange={(checked) => onChange('premiumPowerWashing', checked as boolean)}
              />
              <Label htmlFor="power-washing" className="cursor-pointer">
                Power Washing — Heavy cleaning for a contaminant-free surface
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="debris-removal"
                checked={debrisRemoval}
                onCheckedChange={(checked) => onChange('premiumDebrisRemoval', checked as boolean)}
              />
              <Label htmlFor="debris-removal" className="cursor-pointer">
                Debris Removal — Heavy debris hauling and proper disposal
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Expanded Premium Options</Badge>
            <p className="text-sm text-muted-foreground">
              Add these to estimate as custom services.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PREMIUM_SERVICES.filter(
              (svc) =>
                ![
                  'edge-pushing',
                  'weed-killer',
                  'crack-cleaning',
                  'power-washing',
                  'debris-removal',
                ].includes(svc.id),
            ).map((svc) => {
              const alreadyAdded = addedServiceNames.includes(svc.name);
              return (
                <div key={svc.id} className="border rounded-md p-3 space-y-2 bg-card">
                  <div className="flex items-center justify-between">
                    <a
                      href={`/service/${svc.id}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {svc.name}
                    </a>
                    <Badge variant="secondary">
                      {svc.unitType === 'flat'
                        ? 'Flat'
                        : svc.unitType === 'perUnit'
                          ? 'Per Unit'
                          : svc.unitType === 'perSqFt'
                            ? 'Per Sq Ft'
                            : 'Per Linear Ft'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{svc.description}</div>
                  {svc.justification && (
                    <div className="text-xs text-muted-foreground">
                      Why premium: {svc.justification}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-sm">
                      Default: ${'{'}svc.defaultUnitPrice.toFixed(2){'}'}{' '}
                      {svc.unitType === 'perSqFt'
                        ? '/sq ft'
                        : svc.unitType === 'perLinearFt'
                          ? '/lf'
                          : svc.unitType === 'perUnit'
                            ? '/unit'
                            : ''}
                    </div>
                    <Button
                      size="sm"
                      variant={alreadyAdded ? 'secondary' : 'outline'}
                      disabled={alreadyAdded || !onAddCustomService}
                      onClick={() => onAddCustomService && onAddCustomService(svc.id)}
                    >
                      {alreadyAdded ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
