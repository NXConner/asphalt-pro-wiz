import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CrewMember {
  id: string;
  name: string;
  role: string;
}

const STORAGE_KEY = 'pps:schedule:crew';

function loadCrew(): CrewMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CrewMember[]) : [];
  } catch {
    return [];
  }
}

function saveCrew(items: CrewMember[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function CrewAssign() {
  const [items, setItems] = useState<CrewMember[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => setItems(loadCrew()), []);

  const add = () => {
    if (!name.trim()) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next = [...items, { id, name: name.trim(), role: role.trim() }];
    setItems(next);
    saveCrew(next);
    setName('');
    setRole('');
  };

  const remove = (id: string) => {
    const next = items.filter((m) => m.id !== id);
    setItems(next);
    saveCrew(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crew Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
          <div>
            <Label className="text-xs">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Crew member name"
            />
          </div>
          <div>
            <Label className="text-xs">Role</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Lead, Operator"
            />
          </div>
          <div>
            <Button onClick={add}>Add</Button>
          </div>
        </div>
        <div className="space-y-2">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">No crew assigned.</div>
          )}
          {items.map((m) => (
            <div key={m.id} className="flex items-center justify-between border rounded p-2">
              <div>
                <div className="font-medium text-sm">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.role || '—'}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(m.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
