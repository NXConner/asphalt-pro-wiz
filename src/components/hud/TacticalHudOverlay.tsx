import { motion } from 'framer-motion';
import { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { HudAlerts } from './HudAlerts';
import { HudFooter } from './HudFooter';
import { HudFullContent } from './HudFullContent';
import { HudHeader } from './HudHeader';
import { HudMiniContent } from './HudMiniContent';

import { useTheme } from '@/contexts/ThemeContext';
import { resolveHudAnimationPreset } from '@/design';
import { useIsMobile } from '@/hooks/use-mobile';
import { useHudGestures } from '@/hooks/useHudGestures';
import { cn } from '@/lib/utils';


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
      preferences.hudPinned,
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
      {/* Header */}
      <HudHeader
        missionName={missionName}
        missionGlyph={missionGlyph}
        isMobile={isMobile}
        isPinned={preferences.hudPinned}
        isExpanded={isExpanded}
        showQuickShortcuts={preferences.hudQuickShortcuts}
        accentMotion={accentMotion}
        accentTransition={accentTransition}
        onTogglePin={() => setHudPinned(!preferences.hudPinned)}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        onQuickAction={handleQuickAction}
      />

      {/* Alerts */}
      <HudAlerts
        alerts={alerts}
        alertAnimation={preferences.hudAlertAnimation}
        alertMotion={alertMotion}
        alertTransition={alertTransition}
      />

      {/* Body - collapsible on mobile */}
      {(!isMobile || isExpanded) && (
        <motion.div
          className="flex-1 space-y-3 overflow-y-auto p-4"
          initial={panelMotion.initial as any}
          animate={panelMotion.animate as any}
          transition={panelTransition as any}
        >
          {preferences.hudMiniMode ? (
            <HudMiniContent
              formattedCost={formattedCost}
              formattedArea={formattedArea}
              environment={environment}
            />
          ) : (
            <HudFullContent
              formattedCost={formattedCost}
              formattedArea={formattedArea}
              formattedTravel={formattedTravel}
              formattedCoords={formattedCoords}
              formattedWindow={formattedWindow}
              updatedLabel={updatedLabel}
              missionPhase={missionPhase}
              isMobile={isMobile}
              environment={environment}
              watchers={watchers}
              flags={flags}
            />
          )}
        </motion.div>
      )}

      {/* Footer - compact view on mobile when collapsed */}
      {isMobile && !isExpanded && (
        <HudFooter
          formattedCost={formattedCost}
          formattedArea={formattedArea}
          formattedTravel={formattedTravel}
        />
      )}
    </motion.div>
  );
});
