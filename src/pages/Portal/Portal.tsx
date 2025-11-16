import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface PortalSnapshot {
  id: string;
  subtotal: number;
  tax: number;
  total: number;
  items?: Array<{ name: string; cost: number }>;
  costs?: Array<{ name: string; cost: number }>;
  jobName?: string;
  customerAddress?: string;
  customerItems?: Array<{ name: string; cost: number }>;
}

// Lightweight, read-only portal for customers
// MVP: enter a code (future), or paste a tokenized estimate snapshot
// For now, supports manual paste of a JSON snapshot to preview totals.

export default function Portal() {
  const [snapshot, setSnapshot] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<PortalSnapshot | null>(null);

  useEffect(() => {
    const url = new URL(location.href);
    const s = url.searchParams.get('s');
    if (s) {
      try {
        const decoded = atob(s);
        setSnapshot(decoded);
        const json = JSON.parse(decoded);
        setData(json);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Invalid snapshot';
        setError(errorMessage);
      }
    }
  }, []);

  const totals = useMemo(() => {
    const c = data?.costs as { total?: number } | undefined;
    return { total: Number(c?.total || 0) };
  }, [data]);

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <h1 className="sr-only">Customer Portal</h1>
      <Card>
        <CardHeader>
          <CardTitle>Customer Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste a proposal snapshot provided by your contractor to view a read-only summary. No
            data is uploaded.
          </p>
          <Textarea
            rows={8}
            value={snapshot}
            onChange={(e) => setSnapshot(e.target.value)}
            placeholder="Paste snapshot JSON here"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setError('');
                try {
                  const json = JSON.parse(snapshot);
                  setData(json);
                } catch (e) {
                  const errorMessage = e instanceof Error ? e.message : 'Invalid JSON';
                  setError(errorMessage);
                  setData(null);
                }
              }}
            >
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  const encoded = btoa(snapshot);
                  const url = new URL(location.href);
                  url.searchParams.set('s', encoded);
                  history.replaceState({}, '', url.toString());
                } catch {}
              }}
            >
              Share Link
            </Button>
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}

          {data && (
            <div className="space-y-4">
              <Separator />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-muted-foreground">Job</div>
                  <div className="text-lg font-semibold">{data?.jobName || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">{data?.customerAddress || ''}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Estimated Total</div>
                  <div className="text-2xl font-bold text-primary">${totals.total.toFixed(2)}</div>
                </div>
              </div>
              {Array.isArray(data?.customerItems) && data.customerItems.length > 0 && (
                <div>
                  <div className="text-sm font-semibold mb-2">Included Services</div>
                  <div className="space-y-1">
                    {data.customerItems.map((it, idx) => (
                      <div key={idx} className="flex justify-between border-b py-2 text-sm">
                        <span>{it.item}</span>
                        <span className="font-medium">{it.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
