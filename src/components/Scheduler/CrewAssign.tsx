import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMissionSchedulerContext } from '@/modules/scheduler';

const DAY_OPTIONS: Array<{
  id: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
  label: string;
}> = [
  { id: 'sun', label: 'Sun' },
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
];

export function CrewAssign() {
  const { crewMembers, addCrewMember, updateCrewMember, removeCrewMember, setCrewAvailability } =
    useMissionSchedulerContext();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [maxHours, setMaxHours] = useState(10);
  const [availability, setAvailability] = useState<
    ('sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat')[]
  >(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);

  const crewList = useMemo(() => crewMembers ?? [], [crewMembers]);

  const toggleAvailability = (day: (typeof DAY_OPTIONS)[number]['id'], checked: boolean) => {
    setAvailability((prev) =>
      checked ? Array.from(new Set([...prev, day])) : prev.filter((value) => value !== day),
    );
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    const member = addCrewMember({
      name: name.trim(),
      role: role.trim() || 'Crew',
      maxHoursPerDay: Math.max(4, Math.min(16, Number(maxHours) || 8)),
      availability,
    });
    setName('');
    setRole('');
    setMaxHours(10);
    setAvailability(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
    return member;
  };

  const updateHours = (memberId: string, value: number) => {
    const crew = crewList.find((item) => item.id === memberId);
    if (!crew) return;
    updateCrewMember({ ...crew, maxHoursPerDay: Math.max(4, Math.min(16, value)) });
  };

  return (
    <Card className="border-white/10 bg-slate-950/75">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-100">
          Crew Roster & Availability
        </CardTitle>
        <p className="text-xs text-slate-300/80">
          Map your two full-time + one part-time roster, track daily availability, and enforce max
          shift hours.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-1">
            <Label className="text-xs uppercase tracking-[0.3em] text-slate-200">Name</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g., Nate"
              data-testid="crew-name-input"
            />
          </div>
          <div className="md:col-span-1">
            <Label className="text-xs uppercase tracking-[0.3em] text-slate-200">Role</Label>
            <Input
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Lead, Operator"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.3em] text-slate-200">
              Max Hours / Day
            </Label>
            <Input
              type="number"
              min={4}
              max={16}
              value={maxHours}
              onChange={(event) => setMaxHours(Number(event.target.value))}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAdd}
              className="w-full"
              variant="tactical"
              data-testid="crew-add"
            >
              Add Crew Member
            </Button>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-7">
          {DAY_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-200"
            >
              <Checkbox
                checked={availability.includes(option.id)}
                onCheckedChange={(checked) => toggleAvailability(option.id, Boolean(checked))}
              />
              {option.label}
            </label>
          ))}
        </div>

        <div className="space-y-3">
          {crewList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-[11px] uppercase tracking-[0.25em] text-slate-300/70">
              Add your crew to unlock mission assignments and capacity forecasting.
            </div>
          ) : (
            crewList.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-white/15 bg-slate-900/70 p-4 text-sm text-slate-100 shadow-[0_18px_40px_rgba(8,12,24,0.45)]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-50">
                      {member.name}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300/80">
                      {member.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="border-cyan-400/40 bg-cyan-400/10 text-[10px] uppercase tracking-[0.3em] text-cyan-100"
                    >
                      {member.maxHoursPerDay} hrs
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => removeCrewMember(member.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-[auto_auto] md:items-center">
                  <div className="flex flex-wrap gap-2">
                    {DAY_OPTIONS.map((option) => (
                      <label
                        key={`${member.id}-${option.id}`}
                        className={`flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.25em] ${
                          member.availability?.includes(option.id)
                            ? 'border border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
                            : 'border border-white/10 bg-white/5 text-slate-300/70'
                        }`}
                      >
                        <Checkbox
                          checked={member.availability?.includes(option.id) ?? true}
                          onCheckedChange={(checked) =>
                            setCrewAvailability(
                              member.id,
                              checked
                                ? Array.from(new Set([...(member.availability ?? []), option.id]))
                                : (
                                    member.availability ?? DAY_OPTIONS.map((value) => value.id)
                                  ).filter((value) => value !== option.id),
                            )
                          }
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[11px] uppercase tracking-[0.25em] text-slate-300/70">
                      Shift Cap
                    </Label>
                    <Input
                      type="number"
                      min={4}
                      max={16}
                      value={member.maxHoursPerDay}
                      onChange={(event) => updateHours(member.id, Number(event.target.value))}
                      className="h-8 w-20"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
