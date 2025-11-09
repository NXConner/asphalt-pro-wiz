import { motion } from 'framer-motion';
import {
  GripVertical,
  Pin,
  PinOff,
  Bookmark,
  Zap,
  AlertCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { memo } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HudHeaderProps {
  missionName: string;
  missionGlyph: string;
  isMobile: boolean;
  isPinned: boolean;
  isExpanded: boolean;
  showQuickShortcuts: boolean;
  accentMotion: any;
  accentTransition: any;
  onTogglePin: () => void;
  onToggleExpand: () => void;
  onQuickAction: (action: string) => void;
}

export const HudHeader = memo(function HudHeader({
  missionName,
  missionGlyph,
  isMobile,
  isPinned,
  isExpanded,
  showQuickShortcuts,
  accentMotion,
  accentTransition,
  onTogglePin,
  onToggleExpand,
  onQuickAction,
}: HudHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-border/30 p-4 touch-manipulation">
      {!isMobile && (
        <button
          className={cn(
            'touch-none',
            isPinned ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing',
          )}
          aria-label={isPinned ? 'HUD is pinned' : 'Drag to reposition HUD'}
          disabled={isPinned}
        >
          <GripVertical
            className={cn(
              'h-5 w-5',
              isPinned ? 'text-muted-foreground/40' : 'text-muted-foreground',
            )}
          />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h2 className="truncate text-base font-semibold uppercase tracking-wide text-foreground">
          {missionName || 'Mission Brief'}
        </h2>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!isMobile && showQuickShortcuts && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onQuickAction('bookmark')}
              className="h-8 w-8 p-0"
              aria-label="Bookmark location"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onQuickAction('refresh')}
              className="h-8 w-8 p-0"
              aria-label="Refresh data"
            >
              <Zap className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onQuickAction('alert')}
              className="h-8 w-8 p-0"
              aria-label="Trigger alert"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          </>
        )}
        {!isMobile && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onTogglePin}
            className="h-8 w-8 p-0"
            aria-label={isPinned ? 'Unpin HUD' : 'Pin HUD'}
          >
            {isPinned ? <Pin className="h-4 w-4 text-primary" /> : <PinOff className="h-4 w-4" />}
          </Button>
        )}
        <motion.span
          className={cn(
            'rounded-full border border-primary/40 px-3 py-1 text-[0.72rem] font-semibold tracking-[0.35em]',
            'bg-primary/10 text-primary-foreground',
          )}
          initial={accentMotion.initial as any}
          animate={accentMotion.animate as any}
          transition={accentTransition as any}
        >
          {missionGlyph}
        </motion.span>
        {isMobile && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleExpand}
            className="h-9 w-9 p-0"
            aria-label={isExpanded ? 'Collapse HUD' : 'Expand HUD'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </header>
  );
});
