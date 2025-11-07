import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TimerReset, ChevronDown, Maximize2, Minimize2, GripVertical, Pin, PinOff, Zap, Bookmark, AlertCircle } from 'lucide-react';
import { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { mergeHudTypography, resolveHudAnimationPreset } from '@/design';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { CollapsibleHudSection } from './CollapsibleHudSection';
import { Button } from '@/components/ui/button';
import { useHudGestures } from '@/hooks/useHudGestures';

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export interface TacticalHudOverlayProps {
  missionName: string;
  missionStatus: string;
  missionPhase?: string;
  totalAreaSqFt: number;
  totalCost?: number | null;
  travelMiles?: number;
  coordinates?: [number, number] | null;
  scheduleWindow?: { start: string; end: string } | null;
  lastUpdatedIso?: string | null;
  environment?: {
    tempF?: number;
    conditions?: string;
    riskLevel?: 'low' | 'medium' | 'high';
  };
  flags?: Array<{ id: string; label: string; active: boolean }>;
  watchers?: Array<{ label: string; value: string; tone?: 'ok' | 'warn' | 'critical' }>;
  className?: string;
}

const watcherTone: Record<NonNullable<TacticalHudOverlayProps['watchers']>[number]['tone'], string> = {
  ok: 'text-success',
  warn: 'text-warning',
  critical: 'text-destructive',
};

const riskTone: Record<'low' | 'medium' | 'high', string> = {
  low: 'text-success',
  medium: 'text-warning',
  high: 'text-destructive',
};

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export const TacticalHudOverlay = memo(function TacticalHudOverlay(
  {
    missionName,
    missionStatus,
    missionPhase,
    totalAreaSqFt,
    totalCost,
    travelMiles,
    coordinates,
    scheduleWindow,
    lastUpdatedIso,
    environment,
    flags,
    watchers,
    className,
  }: TacticalHudOverlayProps,
) {
  const {
    preferences,
    setHudPosition,
    setHudPinned,
    setHudSize,
    setHudLayoutPreset,
    setHudMiniMode,
    setHudMultiMonitorStrategy,
  } = useTheme();
  const animationPreset = useMemo(
    () => resolveHudAnimationPreset(preferences.hudAnimationPreset),
    [preferences.hudAnimationPreset],
  );
  const containerMotion = animationPreset.container;
  const panelMotion = animationPreset.panel;
  const accentMotion = animationPreset.accent;
  const alertMotion = animationPreset.alert;
  const containerInitial = containerMotion.initial ?? {};
  const containerAnimate = containerMotion.animate ?? {};
  const containerExit = containerMotion.exit ?? {};
  const containerInitialRecord = containerInitial as Record<string, unknown>;
  const containerAnimateRecord = containerAnimate as Record<string, unknown>;
  const containerExitRecord = containerExit as Record<string, unknown>;
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [isVisible, setIsVisible] = useState(true);
  const [proximityScale, setProximityScale] = useState(1);
    const [, setMousePosition] = useState({ x: 0, y: 0 });
  const [alerts, setAlerts] = useState<Array<{ id: string; message: string; type: 'info' | 'warning' | 'error' }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clampPosition = useCallback(
    (x: number, y: number) => {
      if (typeof window === 'undefined') {
        return { x, y };
      }
      const hudWidth = preferences.hudMiniMode ? 280 : preferences.hudSize.width;
      const hudHeight = preferences.hudMiniMode ? 200 : preferences.hudSize.height;
      const maxX = Math.max(0, window.innerWidth - hudWidth);
      const maxY = Math.max(0, window.innerHeight - hudHeight);
      return {
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY)),
      };
    },
    [preferences.hudMiniMode, preferences.hudSize.height, preferences.hudSize.width],
  );
  
  // Alert system
  const triggerAlert = useCallback((message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 5000);
  }, []);
  
    useEffect(() => {
      const handleResize = () => {
        if (!isMobile) {
          setHudMultiMonitorStrategy(preferences.hudMultiMonitorStrategy);
        }
        if (preferences.hudLayoutPreset !== 'custom' && !isMobile) {
          window.dispatchEvent(new CustomEvent('hudLayoutUpdate'));
        }
      };
    
    const handleLayoutShortcut = (e: CustomEvent<string>) => {
      if (e.detail) {
        setHudLayoutPreset(e.detail as any);
      }
    };
    
    const handleProfileShortcut = (e: CustomEvent<number>) => {
      const profileIndex = e.detail;
      const profile = preferences.hudProfiles[profileIndex];
      if (profile) {
        const { loadHudProfile } = require('@/lib/theme');
        loadHudProfile(profile.name);
        triggerAlert(`Loaded profile: ${profile.name}`, 'info');
      }
    };
    
      const handleHudNudge = (event: CustomEvent<{ dx?: number; dy?: number; magnitude?: number }>) => {
        if (preferences.hudPinned) return;
        const detail = event.detail ?? {};
        const stepBase = Math.max(10, preferences.hudGridSize) * (detail.magnitude ?? 1);
        const base = preferences.hudPosition ?? { x: 0, y: 0 };
        const next = clampPosition(base.x + (detail.dx ?? 0) * stepBase, base.y + (detail.dy ?? 0) * stepBase);
        if (next.x !== base.x || next.y !== base.y) {
          setHudPosition(next);
        }
      };

      window.addEventListener('resize', handleResize);
    window.addEventListener('setHudLayout', handleLayoutShortcut as EventListener);
    window.addEventListener('loadHudProfile', handleProfileShortcut as EventListener);
      window.addEventListener('nudgeHud', handleHudNudge as EventListener);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('setHudLayout', handleLayoutShortcut as EventListener);
        window.removeEventListener('loadHudProfile', handleProfileShortcut as EventListener);
        window.removeEventListener('nudgeHud', handleHudNudge as EventListener);
    };
    }, [
      preferences.hudLayoutPreset,
      preferences.hudProfiles,
      preferences.hudMultiMonitorStrategy,
      isMobile,
      setHudLayoutPreset,
      setHudMultiMonitorStrategy,
      clampPosition,
      preferences.hudGridSize,
      preferences.hudPosition,
      setHudPosition,
      triggerAlert,
    ]);
  
    useEffect(() => {
      if (!isMobile) {
        setHudMultiMonitorStrategy(preferences.hudMultiMonitorStrategy);
      }
    }, [isMobile, preferences.hudMultiMonitorStrategy, setHudMultiMonitorStrategy]);
  
  const formattedCost = typeof totalCost === 'number' ? currencyFormatter.format(totalCost) : '—';
  const formattedArea = totalAreaSqFt > 0 ? `${numberFormatter.format(totalAreaSqFt)} sq ft` : 'Awaiting draw';
  const formattedTravel = typeof travelMiles === 'number' && travelMiles > 0
    ? `${numberFormatter.format(travelMiles)} mi RT`
    : 'Pending capture';

  const formattedCoords = coordinates
    ? `${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`
    : 'No lock';

  const formattedWindow = scheduleWindow
    ? `${shortDateFormatter.format(new Date(scheduleWindow.start))} → ${shortDateFormatter.format(
        new Date(scheduleWindow.end),
      )}`
    : 'Not scheduled';

  const updatedLabel = lastUpdatedIso ? shortDateFormatter.format(new Date(lastUpdatedIso)) : 'live';

  const missionGlyph = missionStatus.toUpperCase();

  // Auto-hide logic
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    if (preferences.hudAutoHide && !isMobile) {
      setIsVisible(true);
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, preferences.hudAutoHideDelay);
    }
  }, [preferences.hudAutoHide, preferences.hudAutoHideDelay, isMobile]);

  useEffect(() => {
    if (preferences.hudAutoHide && !isMobile) {
      resetHideTimer();
      return () => {
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
      };
    } else {
      setIsVisible(true);
    }
  }, [preferences.hudAutoHide, preferences.hudAutoHideDelay, isMobile, resetHideTimer]);

  // Proximity effect
  useEffect(() => {
    if (!preferences.hudProximityEffect || isMobile || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );
      
      if (distance < preferences.hudProximityDistance) {
        const scale = 1 + (1 - distance / preferences.hudProximityDistance) * 0.05;
        setProximityScale(scale);
      } else {
        setProximityScale(1);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [preferences.hudProximityEffect, preferences.hudProximityDistance, isMobile]);

  // Quick shortcuts
  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'bookmark':
        triggerAlert('Location bookmarked', 'info');
        break;
      case 'refresh':
        triggerAlert('Data refreshed', 'info');
        break;
      case 'alert':
        triggerAlert('Alert triggered', 'warning');
        break;
    }
  }, [triggerAlert]);

  const handlePinch = useCallback(
    (scaleDelta: number) => {
      if (preferences.hudPinned) return;
      const multiplier = 1 + scaleDelta;
      if (!Number.isFinite(multiplier) || multiplier === 1) return;
      const nextWidth = Math.round(preferences.hudSize.width * multiplier);
      const nextHeight = Math.round(preferences.hudSize.height * (1 + scaleDelta * 0.6));
      setHudSize({
        width: Math.max(300, Math.min(800, nextWidth)),
        height: Math.max(400, Math.min(900, nextHeight)),
      });
    },
    [preferences.hudPinned, preferences.hudSize.height, preferences.hudSize.width, setHudSize],
  );

  const handleSwipe = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right', { velocity }: { velocity: number }) => {
      const basePosition = preferences.hudPosition ?? { x: 0, y: 0 };
      const gridStep = Math.max(12, preferences.hudGridSize);
      let nextPosition = basePosition;
      let shouldUpdatePosition = false;

      switch (direction) {
        case 'left':
          nextPosition = clampPosition(basePosition.x - gridStep, basePosition.y);
          shouldUpdatePosition = true;
          break;
        case 'right':
          nextPosition = clampPosition(basePosition.x + gridStep, basePosition.y);
          shouldUpdatePosition = true;
          break;
        case 'up':
          if (velocity > 1200) {
            setHudMiniMode(false);
          } else {
            nextPosition = clampPosition(basePosition.x, basePosition.y - gridStep);
            shouldUpdatePosition = true;
          }
          break;
        case 'down':
          if (velocity > 1200) {
            setHudMiniMode(true);
          } else {
            nextPosition = clampPosition(basePosition.x, basePosition.y + gridStep);
            shouldUpdatePosition = true;
          }
          break;
      }

      if (shouldUpdatePosition && (nextPosition.x !== basePosition.x || nextPosition.y !== basePosition.y)) {
        setHudPosition(nextPosition);
      }
    },
    [
      clampPosition,
      preferences.hudGridSize,
      preferences.hudPosition,
      setHudMiniMode,
      setHudPosition,
    ],
  );

  const handleTap = useCallback(
    ({ double, pointerType }: { double: boolean; pointerType: string }) => {
      if (pointerType !== 'touch' && pointerType !== 'pen') return;
      if (double) {
        setHudMiniMode(!preferences.hudMiniMode);
        triggerAlert(preferences.hudMiniMode ? 'Expanded HUD' : 'Collapsed to Mini HUD', 'info');
      } else {
        setHudPinned(!preferences.hudPinned);
        triggerAlert(preferences.hudPinned ? 'HUD pinned in place' : 'HUD free to drag', 'info');
      }
    },
    [preferences.hudMiniMode, preferences.hudPinned, setHudMiniMode, setHudPinned, triggerAlert],
  );

  useHudGestures(containerRef, {
    enabled: !preferences.hudPinned,
    sensitivity: preferences.hudGestureSensitivity,
    onPinch: handlePinch,
    onSwipe: handleSwipe,
    onTap: handleTap,
  });

  // Transition presets
  const transitionConfig = {
    smooth: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    instant: { duration: 0, ease: 'linear' as const },
    bouncy: { duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] },
    slow: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }[preferences.hudTransitionPreset];
  const containerTransition = useMemo(
    () => ({ ...(containerMotion.transition ?? {}), ...transitionConfig }),
    [containerMotion.transition, transitionConfig],
  );
  const panelTransition = panelMotion.transition ?? transitionConfig;
  const accentTransition = accentMotion.transition ?? transitionConfig;
  const alertTransition = alertMotion.transition ?? transitionConfig;

  useEffect(() => {
    if (!preferences.hudKeyboardNavigation) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.altKey || event.ctrlKey) return;
      const target = containerRef.current;
      if (!target) return;
      const active = document.activeElement;
      if (active && active !== target && !target.contains(active)) return;

      const step = Math.max(10, preferences.hudGridSize) * (event.shiftKey ? 2 : 1);
      const base = preferences.hudPosition ?? { x: 0, y: 0 };
      let handled = true;

      switch (event.key) {
        case 'ArrowUp': {
          const next = clampPosition(base.x, base.y - step);
          if (next.y !== base.y) setHudPosition(next);
          break;
        }
        case 'ArrowDown': {
          const next = clampPosition(base.x, base.y + step);
          if (next.y !== base.y) setHudPosition(next);
          break;
        }
        case 'ArrowLeft': {
          const next = clampPosition(base.x - step, base.y);
          if (next.x !== base.x) setHudPosition(next);
          break;
        }
        case 'ArrowRight': {
          const next = clampPosition(base.x + step, base.y);
          if (next.x !== base.x) setHudPosition(next);
          break;
        }
        default:
          handled = false;
      }

      if (handled) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    clampPosition,
    preferences.hudKeyboardNavigation,
    preferences.hudGridSize,
    preferences.hudPosition,
    setHudPosition,
  ]);

  // Theme variant styles
  const themeVariantStyles = {
    default: {
      backdropFilter: `blur(${preferences.hudBlur}px)`,
      backgroundColor: `hsl(var(--card) / ${preferences.hudOpacity})`,
      border: 'border-border/50',
    },
    minimal: {
      backdropFilter: 'blur(8px)',
      backgroundColor: 'hsl(var(--background) / 0.8)',
      border: 'border-border/30',
    },
    tactical: {
      backdropFilter: `blur(${preferences.hudBlur}px)`,
      backgroundColor: 'hsl(var(--card) / 0.95)',
      border: 'border-primary/40',
    },
    glass: {
      backdropFilter: 'blur(20px)',
      backgroundColor: 'hsl(var(--card) / 0.3)',
      border: 'border-border/20',
    },
    solid: {
      backdropFilter: 'none',
      backgroundColor: 'hsl(var(--card))',
      border: 'border-border',
    },
  }[preferences.hudThemeVariant];

    return (
      <motion.div
        ref={containerRef}
        role="region"
        tabIndex={0}
        aria-label="Mission heads-up display"
        data-hud-animation={preferences.hudAnimationPreset}
        initial={{
          ...containerInitial,
          opacity: isNumber(containerInitialRecord.opacity) ? (containerInitialRecord.opacity as number) : 0,
          x: isMobile ? 0 : isNumber(containerInitialRecord.x) ? (containerInitialRecord.x as number) : 20,
          y: isMobile ? 20 : isNumber(containerInitialRecord.y) ? (containerInitialRecord.y as number) : 0,
        }}
        animate={{
          ...containerAnimate,
          opacity: isVisible ? 1 : 0.2,
          x: preferences.hudPosition?.x ?? 0,
          y: preferences.hudPosition?.y ?? 0,
          width: isMobile ? '100%' : preferences.hudMiniMode ? '280px' : `${preferences.hudSize.width}px`,
          height: isMobile ? (isExpanded ? '85vh' : 80) : preferences.hudMiniMode ? 'auto' : `${preferences.hudSize.height}px`,
          scale: isVisible
            ? preferences.hudProximityEffect
              ? proximityScale
              : isNumber(containerAnimateRecord.scale)
                ? (containerAnimateRecord.scale as number)
                : 1
            : 0.95,
        }}
        exit={{
          ...containerExit,
          opacity: isNumber(containerExitRecord.opacity) ? (containerExitRecord.opacity as number) : 0,
          x: isMobile ? 0 : isNumber(containerExitRecord.x) ? (containerExitRecord.x as number) : 20,
          y: isMobile ? 20 : isNumber(containerExitRecord.y) ? (containerExitRecord.y as number) : 0,
        }}
        transition={containerTransition as any}
        drag={!isMobile && !preferences.hudPinned}
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={{
          top: 0,
          left: 0,
          right:
            typeof window !== 'undefined'
              ? Math.max(0, window.innerWidth - (preferences.hudMiniMode ? 280 : preferences.hudSize.width))
              : 0,
          bottom:
            typeof window !== 'undefined'
              ? Math.max(0, window.innerHeight - (preferences.hudMiniMode ? 200 : preferences.hudSize.height))
              : 0,
        }}
        onDragEnd={(_, info) => {
          if (!isMobile && !preferences.hudPinned) {
            let newX = info.point.x;
            let newY = info.point.y;

            if (preferences.hudGridSnap) {
              const gridSize = preferences.hudGridSize;
              newX = Math.round(newX / gridSize) * gridSize;
              newY = Math.round(newY / gridSize) * gridSize;
            }

            const nextPosition = clampPosition(newX, newY);
            const basePosition = preferences.hudPosition ?? { x: 0, y: 0 };
            if (nextPosition.x !== basePosition.x || nextPosition.y !== basePosition.y) {
              setHudPosition(nextPosition);
            }
          }
        }}
        onFocus={() => {
          if (preferences.hudAutoHide && !isMobile) {
            resetHideTimer();
          }
        }}
        onMouseEnter={() => {
        if (preferences.hudAutoHide && !isMobile) {
          resetHideTimer();
        }
      }}
      onMouseLeave={() => {
        if (preferences.hudAutoHide && !isMobile) {
          resetHideTimer();
        }
      }}
      className={cn(
          'pointer-events-auto fixed z-[60] flex flex-col overflow-hidden shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60',
        isMobile
          ? 'bottom-0 left-0 right-0 rounded-t-3xl border-t border-x'
          : 'rounded-2xl border',
        themeVariantStyles.border,
        className,
      )}
      style={{
        backdropFilter: themeVariantStyles.backdropFilter,
        backgroundColor: themeVariantStyles.backgroundColor,
        transition: preferences.hudAnimationsEnabled ? 'backdrop-filter 0.3s ease, background-color 0.3s ease' : 'none',
      }}
    >
      {/* Header with drag handle and expand/collapse */}
      <header className="flex items-center gap-3 border-b border-border/30 p-4 touch-manipulation">
        {!isMobile && (
          <button
            className={cn(
              'touch-none',
              preferences.hudPinned ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
            )}
            aria-label={preferences.hudPinned ? 'HUD is pinned' : 'Drag to reposition HUD'}
            disabled={preferences.hudPinned}
          >
            <GripVertical className={cn('h-5 w-5', preferences.hudPinned ? 'text-muted-foreground/40' : 'text-muted-foreground')} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="truncate text-base font-semibold uppercase tracking-wide text-foreground">
            {missionName || 'Mission Brief'}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isMobile && preferences.hudQuickShortcuts && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleQuickAction('bookmark')}
                className="h-8 w-8 p-0"
                aria-label="Bookmark location"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleQuickAction('refresh')}
                className="h-8 w-8 p-0"
                aria-label="Refresh data"
              >
                <Zap className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleQuickAction('alert')}
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
              onClick={() => setHudPinned(!preferences.hudPinned)}
              className="h-8 w-8 p-0"
              aria-label={preferences.hudPinned ? 'Unpin HUD' : 'Pin HUD'}
            >
              {preferences.hudPinned ? (
                <Pin className="h-4 w-4 text-primary" />
              ) : (
                <PinOff className="h-4 w-4" />
              )}
            </Button>
          )}
            <motion.span
            className={cn(
              'rounded-full border border-primary/40 px-3 py-1 text-[0.72rem] font-semibold tracking-[0.35em]',
              'bg-primary/10 text-primary-foreground',
            )}
              initial={accentMotion.initial}
              animate={accentMotion.animate}
              transition={accentTransition as any}
          >
            {missionGlyph}
            </motion.span>
          {isMobile && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-9 w-9 p-0"
              aria-label={isExpanded ? 'Collapse HUD' : 'Expand HUD'}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </header>

      {/* Alerts */}
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
              initial={{
                opacity: alertMotion.initial?.opacity ?? 0,
                y: (alertMotion.initial?.y as number) ?? -20,
                ...(alertMotion.initial ?? {}),
              }}
              animate={{
                ...(alertMotion.animate ?? {}),
                opacity: 1,
                y: 0,
              ...(preferences.hudAlertAnimation === 'pulse' && {
                scale: [1, 1.05, 1],
                transition: { repeat: 2, duration: 0.5 }
              }),
              ...(preferences.hudAlertAnimation === 'shake' && {
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.5 }
              }),
              ...(preferences.hudAlertAnimation === 'bounce' && {
                y: [0, -10, 0],
                transition: { repeat: 2, duration: 0.3 }
              }),
              ...(preferences.hudAlertAnimation === 'glow' && {
                boxShadow: [
                  '0 0 0px hsl(var(--primary) / 0)',
                  '0 0 20px hsl(var(--primary) / 0.5)',
                  '0 0 0px hsl(var(--primary) / 0)'
                ],
                transition: { repeat: 2, duration: 0.5 }
              })
            }}
              exit={{
                opacity: alertMotion.exit?.opacity ?? 0,
                y: (alertMotion.exit?.y as number) ?? -20,
                ...(alertMotion.exit ?? {}),
              }}
              transition={alertTransition as any}
            className={cn(
              'absolute top-16 left-4 right-4 rounded-lg border p-3 text-sm backdrop-blur-sm z-50',
              alert.type === 'error' && 'border-destructive bg-destructive/20 text-destructive-foreground',
              alert.type === 'warning' && 'border-warning bg-warning/20 text-warning-foreground',
              alert.type === 'info' && 'border-primary bg-primary/20 text-primary-foreground'
            )}
          >
            {alert.message}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Body - collapsible on mobile */}
        {(!isMobile || isExpanded) && (
          <motion.div
            className="flex-1 space-y-3 overflow-y-auto p-4"
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            transition={panelTransition as any}
          >
          {/* Mini Mode - Compact View */}
          {preferences.hudMiniMode ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Budget</span>
                  <p className="font-semibold text-foreground">{formattedCost}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Area</span>
                  <p className="font-semibold text-foreground">{formattedArea}</p>
                </div>
              </div>
              {environment && (
                <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-2 py-1 text-xs">
                  {typeof environment.tempF === 'number' && (
                    <span className="text-foreground/85">{environment.tempF.toFixed(0)}°F</span>
                  )}
                  {environment.riskLevel && (
                    <span className={cn('uppercase text-[0.65rem]', riskTone[environment.riskLevel])}>
                      {environment.riskLevel}
                    </span>
                  )}
          </motion.div>
              )}
            </div>
          ) : (
            <>
              {/* Mission Details */}
              <CollapsibleHudSection title="Mission Details" defaultOpen={true}>
            <div className="grid gap-3">
              <OverlayMetric label="Mission Budget" value={formattedCost} accent="accent" />
              <OverlayMetric label="Surface Footprint" value={formattedArea} accent="secondary" />
              <OverlayMetric label="Travel Logistics" value={formattedTravel} accent="primary" />
            </div>

            <div className="mt-3 grid gap-2">
              <OverlayCallout
                label="Site Coordinates"
                value={formattedCoords}
                icon={<Sparkles className="h-4 w-4" />}
              />
              <OverlayCallout
                label="Schedule Window"
                value={formattedWindow}
                icon={<TimerReset className="h-4 w-4" />}
              />
            </div>
          </CollapsibleHudSection>

          {/* Telemetry */}
          <CollapsibleHudSection 
            title="Mission Telemetry" 
            defaultOpen={!isMobile}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Updated {updatedLabel}</span>
                {missionPhase && (
                  <span className="text-xs text-muted-foreground">{missionPhase}</span>
                )}
              </div>

              {environment && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-xs">
                  <span className="text-[0.58rem] text-muted-foreground uppercase tracking-wider">SITE CONDITIONS</span>
                  {typeof environment.tempF === 'number' && (
                    <span className="text-foreground/85">{environment.tempF.toFixed(0)}°F</span>
                  )}
                  {environment.conditions && (
                    <span className="text-foreground/70">{environment.conditions}</span>
                  )}
                  {environment.riskLevel && (
                    <span className={cn('uppercase tracking-[0.35em]', riskTone[environment.riskLevel])}>
                      {environment.riskLevel} risk
                    </span>
                  )}
                </div>
              )}

              {watchers && watchers.length > 0 && (
                <div className="grid gap-2">
                  {watchers.map((watcher) => (
                    <div
                      key={watcher.label}
                      className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-3 py-2"
                    >
                      <span className="text-xs text-muted-foreground">{watcher.label}</span>
                      <span className={cn('text-sm uppercase tracking-[0.35em]', watcher.tone ? watcherTone[watcher.tone] : 'text-foreground')}>
                        {watcher.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleHudSection>

          {/* Flags */}
          {flags && flags.length > 0 && (
            <CollapsibleHudSection title="Active Flags" defaultOpen={!isMobile}>
              <ul className="flex flex-wrap gap-2">
                {flags.map((flag) => (
                  <li
                    key={flag.id}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.68rem]',
                      flag.active
                        ? 'border-success/50 bg-success/15 text-success-foreground'
                        : 'border-border/30 bg-muted/20 text-muted-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-2.5 w-2.5 rounded-full',
                        flag.active ? 'bg-success shadow-[0_0_12px_hsl(var(--success)/0.6)]' : 'bg-muted-foreground',
                      )}
                    />
                    {flag.label}
                  </li>
                ))}
              </ul>
            </CollapsibleHudSection>
          )}
            </>
          )}
        </div>
      )}

      {/* Footer - compact view on mobile when collapsed */}
      {isMobile && !isExpanded && (
        <div className="grid grid-cols-3 gap-2 border-t border-border/30 px-4 py-2 text-xs">
          <div>
            <span className="text-muted-foreground">Budget</span>
            <p className="font-semibold text-foreground">{formattedCost}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Area</span>
            <p className="font-semibold text-foreground">{formattedArea}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Travel</span>
            <p className="font-semibold text-foreground">{formattedTravel}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
});

interface OverlayMetricProps {
  label: string;
  value: string;
  accent?: 'primary' | 'secondary' | 'accent';
}

function OverlayMetric({ label, value, accent = 'primary' }: OverlayMetricProps) {
  const accentClass =
    accent === 'primary'
      ? 'text-primary-foreground'
      : accent === 'secondary'
        ? 'text-secondary-foreground'
        : 'text-accent-foreground';

  return (
    <article className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
      <span className="text-[0.58rem] text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className={cn('mt-1 text-sm font-mono', accentClass)}>{value}</p>
    </article>
  );
}

interface OverlayCalloutProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function OverlayCallout({ label, value, icon }: OverlayCalloutProps) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
      <div>
        <span className="text-[0.58rem] text-muted-foreground uppercase tracking-wider">{label}</span>
        <p className="text-sm text-foreground/85 font-mono">{value}</p>
      </div>
      {icon && <span className="text-accent/80">{icon}</span>}
    </article>
  );
}

export type { OverlayMetricProps as TacticalHudOverlayMetricProps };
