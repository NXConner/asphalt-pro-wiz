import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { PortalSnapshot, PortalSnapshotCostSummary, PortalSnapshotItem } from '@/types';
import { formatCurrency } from '@/utils/formatters';

function sanitizeNumber(value: unknown, fallback = 0): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return value;
}

function parseSnapshotPayload(raw: string): PortalSnapshot {
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Snapshot payload must be a JSON object.');
  }
  return parsed as PortalSnapshot;
}

function coerceItem(entry: unknown): PortalSnapshotItem | null {
  if (!entry || typeof entry !== 'object') return null;
  const candidate = entry as Record<string, unknown>;
  const name =
    (typeof candidate.name === 'string' && candidate.name) ||
    (typeof candidate.item === 'string' && candidate.item) ||
    (typeof candidate.label === 'string' && candidate.label) ||
    undefined;
  const amountCandidate =
    (typeof candidate.cost === 'number' && candidate.cost) ??
    (typeof candidate.value === 'number' && candidate.value) ??
    (typeof candidate.amount === 'number' && candidate.amount) ??
    undefined;
  if (!name || typeof amountCandidate !== 'number' || Number.isNaN(amountCandidate)) {
    return null;
  }
  return { name, cost: amountCandidate };
}

function extractCostSummary(
  snapshot: PortalSnapshot | null,
): PortalSnapshotCostSummary | undefined {
  if (!snapshot || !snapshot.costs) return undefined;
  if (Array.isArray(snapshot.costs)) return undefined;
  return snapshot.costs;
}

function normalizeItems(snapshot: PortalSnapshot | null): PortalSnapshotItem[] {
  if (!snapshot) return [];
  const pools: Array<PortalSnapshot['customerItems']> = [
    snapshot.customerItems,
    snapshot.items,
    Array.isArray(snapshot.costs) ? snapshot.costs : snapshot.costs?.items,
  ];

  const normalized: PortalSnapshotItem[] = [];
  pools.forEach((pool) => {
    if (!Array.isArray(pool)) return;
    pool.forEach((entry) => {
      const coerced = coerceItem(entry);
      if (coerced) {
        normalized.push(coerced);
      }
    });
  });

  return normalized;
}

function resolveTotals(snapshot: PortalSnapshot | null, items: PortalSnapshotItem[]) {
  const summary = extractCostSummary(snapshot);
  const itemsTotal = items.reduce((acc, item) => acc + item.cost, 0);
  const subtotal = sanitizeNumber(snapshot?.subtotal ?? summary?.subtotal ?? itemsTotal);
  const tax = sanitizeNumber(snapshot?.tax ?? summary?.tax ?? 0);
  const explicitTotal = snapshot?.total ?? summary?.total;
  const total =
    typeof explicitTotal === 'number' && !Number.isNaN(explicitTotal)
      ? explicitTotal
      : sanitizeNumber(subtotal + tax);

  return { subtotal, tax, total };
}

// Lightweight, read-only portal for customers
// MVP: enter a code (future), or paste a tokenized estimate snapshot
// For now, supports manual paste of a JSON snapshot to preview totals.

export default function Portal() {
  const [snapshot, setSnapshot] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<PortalSnapshot | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const s = url.searchParams.get('s');
    if (s) {
      try {
        const decoded = atob(s);
        setSnapshot(decoded);
        const parsed = parseSnapshotPayload(decoded);
        setData(parsed);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Invalid snapshot';
        setError(errorMessage);
      }
    }
  }, []);

  const items = useMemo(() => normalizeItems(data), [data]);
  const totals = useMemo(() => resolveTotals(data, items), [data, items]);

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
                  const parsed = parseSnapshotPayload(snapshot);
                  setData(parsed);
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
                  const url = new URL(window.location.href);
                  url.searchParams.set('s', encoded);
                  window.history.replaceState({}, '', url.toString());
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
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(totals.total)}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{formatCurrency(totals.tax)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-primary">{formatCurrency(totals.total)}</span>
                </div>
              </div>
              {items.length > 0 && (
                <div>
                  <div className="text-sm font-semibold mb-2">Included Services</div>
                  <div className="space-y-1">
                    {items.map((it, idx) => (
                      <div key={idx} className="flex justify-between border-b py-2 text-sm">
                        <span>{it.name}</span>
                        <span className="font-medium">{formatCurrency(it.cost)}</span>
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
