import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { memo, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HudZoomControlsProps {
  zoom: number; // 0.5 to 2.0
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  onZoomChange: (zoom: number) => void;
  onReset?: () => void;
  className?: string;
}

/**
 * HUD Zoom Controls Component
 * 
 * Provides zoom in/out controls for the HUD with reset functionality.
 */
export const HudZoomControls = memo(function HudZoomControls({
  zoom,
  minZoom = 0.5,
  maxZoom = 2.0,
  step = 0.1,
  onZoomChange,
  onReset,
  className,
}: HudZoomControlsProps) {
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(maxZoom, zoom + step);
    onZoomChange(newZoom);
  }, [zoom, maxZoom, step, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(minZoom, zoom - step);
    onZoomChange(newZoom);
  }, [zoom, minZoom, step, onZoomChange]);

  const handleFitToScreen = useCallback(() => {
    onZoomChange(1.0);
  }, [onZoomChange]);

  const handleReset = useCallback(() => {
    onZoomChange(1.0);
    onReset?.();
  }, [onZoomChange, onReset]);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className={cn('flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm border border-border/30 rounded-lg', className)}>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleZoomOut}
        disabled={zoom <= minZoom}
        className="h-8 w-8 p-0"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 min-w-[80px] justify-center">
        <span className="text-sm font-mono text-muted-foreground">{zoomPercent}%</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleFitToScreen}
          className="h-8 w-8 p-0"
          aria-label="Fit to screen"
          title="Fit to screen (100%)"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleZoomIn}
        disabled={zoom >= maxZoom}
        className="h-8 w-8 p-0"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      {onReset && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReset}
          className="h-8 w-8 p-0 ml-2"
          aria-label="Reset zoom"
          title="Reset zoom and position"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

