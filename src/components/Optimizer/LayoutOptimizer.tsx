import React, { useMemo, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const LayoutOptimizer = React.memo(function LayoutOptimizer({
  totalAreaSqft,
}: {
  totalAreaSqft: number;
}) {
  const [stallWidth, setStallWidth] = useState<number>(9); // ft
  const [stallDepth, setStallDepth] = useState<number>(18); // ft
  const [aisleWidth, setAisleWidth] = useState<number>(24); // ft two-way
  const [accessibleRatio, setAccessibleRatio] = useState<number>(0.02); // 2%

  const result = useMemo(() => {
    if (!Number.isFinite(totalAreaSqft) || totalAreaSqft <= 0) return null;
    const stallArea = stallWidth * stallDepth; // sqft
    const effectivePerStall = stallArea + (aisleWidth * stallWidth) / 2; // share aisle per two rows approx
    const stalls = Math.floor(totalAreaSqft / effectivePerStall);
    const accessible = Math.max(1, Math.round(stalls * accessibleRatio));
    const standard = Math.max(0, stalls - accessible);
    return { stalls, accessible, standard, stallArea: Math.round(stallArea) };
  }, [totalAreaSqft, stallWidth, stallDepth, aisleWidth, accessibleRatio]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parking Layout Optimizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div>
            <Label htmlFor="stallWidth" className="text-xs">
              Stall Width (ft)
            </Label>
            <Input
              id="stallWidth"
              type="number"
              step={0.5}
              value={stallWidth}
              onChange={(e) => setStallWidth(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="stallDepth" className="text-xs">
              Stall Depth (ft)
            </Label>
            <Input
              id="stallDepth"
              type="number"
              step={0.5}
              value={stallDepth}
              onChange={(e) => setStallDepth(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="aisleWidth" className="text-xs">
              Aisle Width (ft)
            </Label>
            <Input
              id="aisleWidth"
              type="number"
              step={1}
              value={aisleWidth}
              onChange={(e) => setAisleWidth(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="accessibleRatio" className="text-xs">
              Accessible Ratio (%)
            </Label>
            <Input
              id="accessibleRatio"
              type="number"
              step={0.5}
              value={accessibleRatio * 100}
              onChange={(e) => setAccessibleRatio((parseFloat(e.target.value) || 0) / 100)}
            />
          </div>
          <div className="flex items-end">
            <div className="text-xs text-muted-foreground">
              Total Area: {Math.round(totalAreaSqft).toLocaleString()} sq ft
            </div>
          </div>
        </div>
        {result ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            <div className="p-3 border rounded">
              <div className="text-xs text-muted-foreground">Estimated Stalls</div>
              <div className="text-xl font-bold">{result.stalls}</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-xs text-muted-foreground">Accessible (min)</div>
              <div className="text-xl font-bold">{result.accessible}</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-xs text-muted-foreground">Standard</div>
              <div className="text-xl font-bold">{result.standard}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Enter or measure area to see optimization.
          </div>
        )}
      </CardContent>
    </Card>
  );
});
