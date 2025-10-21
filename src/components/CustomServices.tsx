import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

export type CustomService = {
  id: string;
  name: string;
  type: "flat" | "perUnit" | "perSqFt" | "perLinearFt";
  unitPrice: number;
  quantity?: number;
  notes?: string;
};

interface CustomServicesProps {
  totalArea: number;
  crackLength: number;
  value: CustomService[];
  onChange: (services: CustomService[]) => void;
}

export function CustomServices({ totalArea, crackLength, value, onChange }: CustomServicesProps) {
  const [services, setServices] = useState<CustomService[]>(value);

  useEffect(() => setServices(value), [value]);

  useEffect(() => {
    onChange(services);
    try {
      localStorage.setItem("pps.customServices", JSON.stringify(services));
    } catch {}
  }, [services]);

  useEffect(() => {
    if (value.length === 0) {
      try {
        const raw = localStorage.getItem("pps.customServices");
        if (raw) {
          const parsed = JSON.parse(raw) as CustomService[];
          setServices(parsed);
        }
      } catch {}
    }
  }, []);

  const computed = useMemo(() => {
    return services.map((svc) => {
      let qty = 1;
      switch (svc.type) {
        case "flat":
          qty = 1;
          break;
        case "perUnit":
          qty = Math.max(0, svc.quantity ?? 0);
          break;
        case "perSqFt":
          qty = totalArea;
          break;
        case "perLinearFt":
          qty = crackLength;
          break;
      }
      const cost = (svc.unitPrice || 0) * qty;
      return { id: svc.id, name: svc.name, cost, qty, type: svc.type };
    });
  }, [services, totalArea, crackLength]);

  const addService = () => {
    setServices((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "Custom Service",
        type: "flat",
        unitPrice: 0,
        quantity: 1,
      },
    ]);
  };

  const updateService = (id: string, patch: Partial<CustomService>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Services</CardTitle>
        <CardDescription>
          Add bespoke services and pricing models (flat, per-unit, per sq ft, per linear ft)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <Button variant="outline" onClick={addService}>
            <Plus className="h-4 w-4 mr-2" /> Add Service
          </Button>
        </div>

        <div className="space-y-4">
          {services.map((svc) => (
            <div key={svc.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border p-3 rounded-md">
              <div className="md:col-span-3">
                <Label>Name</Label>
                <Input value={svc.name} onChange={(e) => updateService(svc.id, { name: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Type</Label>
                <Select value={svc.type} onValueChange={(v: any) => updateService(svc.id, { type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="perUnit">Per Unit</SelectItem>
                    <SelectItem value="perSqFt">Per Sq Ft</SelectItem>
                    <SelectItem value="perLinearFt">Per Linear Ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Unit Price ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={svc.unitPrice}
                  onChange={(e) => updateService(svc.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              {svc.type === "perUnit" && (
                <div className="md:col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={svc.quantity ?? 0}
                    onChange={(e) => updateService(svc.id, { quantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <Label>Computed Cost</Label>
                <div className="p-2 border rounded-md bg-muted">
                  ${computed.find((c) => c.id === svc.id)?.cost.toFixed(2) || "0.00"}
                </div>
              </div>
              <div className="md:col-span-1 flex md:justify-end">
                <Button variant="ghost" size="icon" onClick={() => removeService(svc.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
