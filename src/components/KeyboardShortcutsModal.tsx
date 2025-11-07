import { useState } from 'react';
import { Command, Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Kbd } from '@/components/common/Kbd';
import { useKeyboard } from '@/contexts/KeyboardContext';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  const { shortcuts } = useKeyboard();
  const [search, setSearch] = useState('');

  const shortcutsByCategory = {
    General: shortcuts.filter(s => s.description && ['Open command palette', 'Focus search', 'Close modals'].includes(s.description)),
    HUD: shortcuts.filter(s => s.description && s.description.toLowerCase().includes('hud')),
  };

  const filteredShortcuts = Object.entries(shortcutsByCategory).reduce((acc, [category, items]) => {
    const filtered = items.filter(s => 
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.key.toLowerCase().includes(search.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  const formatShortcut = (shortcut: typeof shortcuts[0]) => {
    const keys = [];
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.shift) keys.push('Shift');
    if (shortcut.alt) keys.push('Alt');
    if (shortcut.meta) keys.push('Cmd');
    keys.push(shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase());
    return keys;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Label htmlFor="shortcut-search" className="sr-only">
              Search shortcuts
            </Label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="shortcut-search"
              placeholder="Search shortcuts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {Object.entries(filteredShortcuts).map(([category, items]) => (
                <div key={category}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map((shortcut, idx) => (
                      <div
                        key={`${category}-${idx}`}
                        className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
                      >
                        <span className="text-sm text-foreground">
                          {shortcut.description}
                        </span>
                        <div className="flex gap-1">
                          {formatShortcut(shortcut).map((key, i) => (
                            <Kbd key={i}>{key}</Kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(filteredShortcuts).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="mb-3 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No shortcuts found matching "{search}"
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
