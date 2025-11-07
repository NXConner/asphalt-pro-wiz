import { Palette } from 'lucide-react';
import { useState } from 'react';

import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function ThemeCommandCenter() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="lg"
        >
          <Palette className="mr-2 h-4 w-4" /> Theme Lab
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto bg-slate-950/95 sm:max-w-4xl">
        <SheetHeader className="space-y-2 pb-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold uppercase tracking-[0.35em] text-slate-100">
            <Palette className="h-5 w-5" /> Theme Command Center
          </SheetTitle>
          <p className="text-xs text-slate-300/70">
            Personalize palettes, wallpapers, and accessibility surfaces. Changes apply instantly across the Pavement Performance Suite.
          </p>
        </SheetHeader>
        <div className="pb-6">
          <ThemeCustomizer />
        </div>
        <SheetFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <SheetClose asChild>
            <Button type="button" variant="ghost" className="text-slate-200">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

