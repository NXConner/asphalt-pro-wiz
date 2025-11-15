import { Printer, Download } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Costs, CostBreakdown } from '@/lib/calculations';

interface CustomerInvoiceProps {
  jobName: string;
  customerAddress: string;
  costs: Costs;
  breakdown: CostBreakdown[];
  onPrint: () => void;
}

export const CustomerInvoice = React.memo(function CustomerInvoice({
  jobName,
  customerAddress,
  costs,
  breakdown,
  onPrint,
}: CustomerInvoiceProps) {
  const [taxRatePct, setTaxRatePct] = useState<number>(0);
  const [discountPct, setDiscountPct] = useState<number>(0);
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Group items for customer-friendly summary
  const customerBreakdown = useMemo(
    () =>
      breakdown
        .filter((item) => !item.item.includes('Overhead') && !item.item.includes('Profit'))
        .map((item) => {
          if (item.item.startsWith('Sealcoat'))
            return {
              item: 'Sealcoating',
              value: item.value.split('→').pop()?.trim() || item.value,
            };
          if (item.item === 'Sand')
            return {
              item: 'Sealcoating Additives',
              value: item.value.split('→').pop()?.trim() || item.value,
            };
          if (item.item === 'Fast-Dry Additive')
            return {
              item: 'Sealcoating Additives',
              value: item.value.split('→').pop()?.trim() || item.value,
            };
          if (item.item === 'Crack Filler' || item.item === 'Propane Tanks')
            return {
              item: 'Cleaning & Crack Repair',
              value: item.value.split('→').pop()?.trim() || item.value,
            };
          if (item.item === 'Striping') return { item: 'Parking Lot Striping', value: item.value };
          if (item.item === 'Oil Spot Primer')
            return {
              item: 'Surface Preparation',
              value: item.value.split('→').pop()?.trim() || item.value,
            };
          if (
            item.item === 'Edge Pushing' ||
            item.item.startsWith('Weed') ||
            item.item.startsWith('Professional Crack Cleaning') ||
            item.item === 'Power Washing' ||
            item.item === 'Debris Removal'
          ) {
            return { item: 'Premium Services', value: item.value };
          }
          if (item.item.startsWith('Labor'))
            return { item: 'Labor', value: item.value.split('→').pop()?.trim() || item.value };
          if (item.item === 'Fuel Cost') return { item: 'Travel', value: item.value };
          if (item.item === 'Total Area') return { item: 'Measured Area', value: item.value };
          return item;
        })
        .reduce<Record<string, number>>((acc, cur) => {
          const numeric = parseFloat(cur.value.replace(/[^0-9.]/g, '')) || 0;
          acc[cur.item] = (acc[cur.item] || 0) + numeric;
          return acc;
        }, {}),
    [breakdown],
  );

  const customerItems = useMemo(
    () =>
      Object.entries(customerBreakdown)
        .filter(([k]) => !['Measured Area'].includes(k))
        .map(([k, v]) => ({ item: k, value: `$${v.toFixed(2)}` })),
    [customerBreakdown],
  );

  const totals = useMemo(() => {
    const base = costs.total;
    const discount = Math.max(0, Math.min(100, discountPct));
    const afterDiscount = base * (1 - discount / 100);
    const tax = Math.max(0, Math.min(100, taxRatePct));
    const taxAmount = afterDiscount * (tax / 100);
    const grand = afterDiscount + taxAmount;
    return { base, discountPct: discount, afterDiscount, taxPct: tax, taxAmount, grand };
  }, [costs.total, taxRatePct, discountPct]);

  return (
    <Card className="print:shadow-none">
      <CardHeader className="space-y-4 pb-8">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl font-bold">CONNER</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Asphalt Maintenance & Repair</p>
            <p className="text-sm text-muted-foreground">337 Ayers Orchard Rd, Stuart, VA 24171</p>
            <p className="text-sm text-muted-foreground">Phone: (276) 692-8534</p>
          </div>
          <div className="text-right print:hidden">
            <Button variant="outline" size="sm" onClick={onPrint} className="mr-2">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Download className="h-4 w-4 mr-2" />
              Save PDF
            </Button>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">ESTIMATE FOR:</h3>
            <p className="font-medium text-lg">{jobName || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">{customerAddress || 'N/A'}</p>
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">ESTIMATE DATE:</h3>
            <p className="font-medium">{today}</p>
            <p className="text-sm text-muted-foreground mt-2">Valid for 30 days</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-4">Included Services (Summary)</h3>
          <div className="space-y-2">
            {customerItems.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b">
                <span className="text-sm">{item.item}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="bg-muted/50 p-6 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">Subtotal</span>
            <span className="text-2xl font-semibold">${totals.base.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label htmlFor="discountPct" className="text-xs text-muted-foreground">
                Discount (%)
              </label>
              <input
                id="discountPct"
                className="w-full h-9 rounded border bg-background px-2"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={discountPct}
                onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label htmlFor="taxRatePct" className="text-xs text-muted-foreground">
                Tax Rate (%)
              </label>
              <input
                id="taxRatePct"
                className="w-full h-9 rounded border bg-background px-2"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={taxRatePct}
                onChange={(e) => setTaxRatePct(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">After Discount</div>
              <div className="text-lg font-semibold">${totals.afterDiscount.toFixed(2)}</div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Tax</span>
            <span className="text-sm font-medium">${totals.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold">Total Estimate</span>
            <span className="text-3xl font-bold text-primary">${totals.grand.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-2 pt-4">
          <p>
            <strong>Payment Terms:</strong> 50% deposit required to begin work. Remaining balance
            due upon completion.
          </p>
          <p>
            <strong>Warranty:</strong> All work is guaranteed for one year from date of completion.
          </p>
          <p>
            <strong>Note:</strong> Work is subject to suitable weather conditions. We will
            communicate any weather-related schedule changes promptly.
          </p>
        </div>

        <div className="border-t pt-6 mt-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-muted-foreground mb-4">Customer Acceptance</p>
              <div className="border-b border-foreground/20 pb-1 mb-2"></div>
              <p className="text-xs text-muted-foreground">Signature</p>
              <div className="border-b border-foreground/20 pb-1 mb-2 mt-8"></div>
              <p className="text-xs text-muted-foreground">Date</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-4">Contractor</p>
              <div className="border-b border-foreground/20 pb-1 mb-2">Nathan Conner</div>
              <p className="text-xs text-muted-foreground">Signature</p>
              <div className="border-b border-foreground/20 pb-1 mb-2 mt-8">{today}</div>
              <p className="text-xs text-muted-foreground">Date</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CustomerInvoice.displayName = 'CustomerInvoice';
