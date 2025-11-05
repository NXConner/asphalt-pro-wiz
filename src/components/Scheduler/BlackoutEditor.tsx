import { addHours, nextSunday, setHours, setMinutes } from 'date-fns';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useMissionSchedulerContext } from '@/modules/scheduler';

function defaultSundayServiceWindow() {
  const upcomingSunday = nextSunday(new Date());
  const start = setMinutes(setHours(upcomingSunday, 8), 0);
  const end = setMinutes(setHours(upcomingSunday, 13), 0);
  return { start, end };
}

export function BlackoutEditor() {
  const { blackouts, addBlackout, removeBlackout } = useMissionSchedulerContext();
  const sundayWindow = defaultSundayServiceWindow();

  const [title, setTitle] = useState('Sunday Worship Services');
  const [start, setStart] = useState<string>(formatDateTimeLocal(sundayWindow.start));
  const [end, setEnd] = useState<string>(formatDateTimeLocal(sundayWindow.end));

  const handleAdd = () => {
    if (!title.trim() || !start || !end) return;
    if (new Date(end) <= new Date(start)) return;
    addBlackout({ title: title.trim(), start: new Date(start).toISOString(), end: new Date(end).toISOString() });
    const nextBlock = defaultSundayServiceWindow();
    setTitle('Sunday Worship Services');
    setStart(formatDateTimeLocal(addHours(nextBlock.start, 7 * 24)));
    setEnd(formatDateTimeLocal(addHours(nextBlock.end, 7 * 24)));
  };

  const handleQuickAdd = () => {
    setTitle('Sunday Worship Services');
    setStart(formatDateTimeLocal(sundayWindow.start));
    setEnd(formatDateTimeLocal(sundayWindow.end));
  };

  return (
    <Card className="border-white/10 bg-slate-950/80">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-100">
          Protected Windows & Church Events
        </CardTitle>
        <p className="text-xs text-slate-300/80">
          Guard Sunday services, bible studies, school dismissals, and community events from heavy equipment.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4 md:items-end">
          <div className="md:col-span-1">
            <Label className="text-xs uppercase tracking-[0.3em] text-slate-200">Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g., Sunday Worship" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.3em] text-slate-200">Start</Label>
            <Input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.3em] text-slate-200">End</Label>
            <Input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex-1" variant="tactical">
              Add Window
            </Button>
            <Button type="button" variant="ghost" onClick={handleQuickAdd}>
              Sunday
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {blackouts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-[11px] uppercase tracking-[0.25em] text-slate-300/70">
              No protected windows yet. Add Sunday 8am-1pm to keep the campus clear during services.
            </div>
          ) : (
            blackouts.map((window) => (
              <div
                key={window.id}
                className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-50">{window.title}</p>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-200/80">
                    {new Date(window.start).toLocaleString()} → {new Date(window.end).toLocaleString()}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeBlackout(window.id)}>
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
