import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Blackout {
  id: string;
  title: string;
  start: string; // ISO datetime-local
  end: string; // ISO datetime-local
}

const STORAGE_KEY = 'pps:schedule:blackouts';

function loadBlackouts(): Blackout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Blackout[]) : [];
  } catch {
    return [];
  }
}

function saveBlackouts(items: Blackout[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function BlackoutEditor() {
  const [items, setItems] = useState<Blackout[]>([]);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    setItems(loadBlackouts());
  }, []);

  const add = () => {
    if (!title || !start || !end) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next = [...items, { id, title, start, end }];
    setItems(next);
    saveBlackouts(next);
    setTitle('');
    setStart('');
    setEnd('');
  };

  const remove = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveBlackouts(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduler Blackout Windows</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <div>
            <Label className="text-xs">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sunday Services"
            />
          </div>
          <div>
            <Label className="text-xs">Start</Label>
            <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">End</Label>
            <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div>
            <Button onClick={add}>Add</Button>
          </div>
        </div>
        <div className="space-y-2">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">No blackouts defined.</div>
          )}
          {items.map((b) => (
            <div key={b.id} className="flex items-center justify-between border rounded p-2">
              <div>
                <div className="font-medium text-sm">{b.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(b.start).toLocaleString()} → {new Date(b.end).toLocaleString()}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(b.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
