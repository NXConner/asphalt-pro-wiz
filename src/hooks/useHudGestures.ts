import { useEffect, useMemo, useRef } from 'react';

import type { HudGestureSensitivity } from '@/lib/theme';

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface HudGestureCallbacks {
  onPinch?: (scaleDelta: number, meta: { origin: { x: number; y: number } }) => void;
  onSwipe?: (direction: SwipeDirection, meta: { velocity: number }) => void;
  onTap?: (meta: {
    double: boolean;
    position: { x: number; y: number };
    pointerType: string;
  }) => void;
}

export interface HudGestureOptions extends HudGestureCallbacks {
  enabled?: boolean;
  sensitivity?: HudGestureSensitivity;
}

interface PointerState {
  id: number;
  x: number;
  y: number;
  time: number;
  pointerType: string;
}

const SENSITIVITY_MULTIPLIER: Record<HudGestureSensitivity, number> = {
  conservative: 1.35,
  standard: 1,
  aggressive: 0.7,
};

export function useHudGestures<T extends HTMLElement>(
  ref: React.RefObject<T>,
  { enabled = true, sensitivity = 'standard', onPinch, onSwipe, onTap }: HudGestureOptions,
) {
  const pointersRef = useRef<Map<number, PointerState>>(new Map());
  const lastTapRef = useRef<number>(0);
  const swipeOriginRef = useRef<PointerState | null>(null);

  const thresholds = useMemo(() => {
    const multiplier = SENSITIVITY_MULTIPLIER[sensitivity] ?? 1;
    return {
      swipe: 42 * multiplier,
      pinch: 0.045 * multiplier,
      doubleTapMs: 300,
    };
  }, [sensitivity]);

  useEffect(() => {
    if (!enabled) return;
    const element = ref.current;
    if (!element) return;
    const pointerSet = pointersRef.current;

    const handlePointerDown = (event: PointerEvent) => {
      element.setPointerCapture(event.pointerId);
      const state: PointerState = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        time: performance.now(),
        pointerType: event.pointerType,
      };
      pointerSet.set(event.pointerId, state);

      if (pointerSet.size === 1) {
        swipeOriginRef.current = state;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const stored = pointerSet.get(event.pointerId);
      if (!stored) return;

      const updated: PointerState = { ...stored, x: event.clientX, y: event.clientY };
      pointerSet.set(event.pointerId, updated);

      if (pointerSet.size >= 2 && onPinch) {
        const [first, second] = Array.from(pointerSet.values());
        const initialDistance = distanceBetween(stored, second.id === stored.id ? first : second);
        const currentDistance = distanceBetween(updated, second.id === updated.id ? first : second);
        if (initialDistance === 0) return;
        const delta = (currentDistance - initialDistance) / initialDistance;
        if (Math.abs(delta) >= thresholds.pinch) {
          onPinch(delta, {
            origin: {
              x: (first.x + second.x) / 2,
              y: (first.y + second.y) / 2,
            },
          });
        }
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const stored = pointerSet.get(event.pointerId);
      if (!stored) return;

      const released: PointerState = {
        ...stored,
        x: event.clientX,
        y: event.clientY,
        time: performance.now(),
      };

      if (pointerSet.size === 1 && swipeOriginRef.current && onSwipe) {
        const dx = released.x - swipeOriginRef.current.x;
        const dy = released.y - swipeOriginRef.current.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= thresholds.swipe) {
          const direction = resolveSwipeDirection(dx, dy);
          const elapsed = (released.time - swipeOriginRef.current.time) / 1000;
          const velocity = elapsed > 0 ? distance / elapsed : distance;
          onSwipe(direction, { velocity });
        }
      }

      if (pointerSet.size === 1 && onTap) {
        const now = performance.now();
        const double = now - lastTapRef.current <= thresholds.doubleTapMs;
        if (!double) {
          lastTapRef.current = now;
        } else {
          lastTapRef.current = 0;
        }
        onTap({
          double,
          position: { x: released.x, y: released.y },
          pointerType: released.pointerType,
        });
      }

      element.releasePointerCapture(event.pointerId);
      pointerSet.delete(event.pointerId);
      if (pointerSet.size === 0) {
        swipeOriginRef.current = null;
      }
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }
      pointerSet.delete(event.pointerId);
      if (pointerSet.size === 0) {
        swipeOriginRef.current = null;
      }
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerCancel);
      pointerSet.clear();
      swipeOriginRef.current = null;
    };
  }, [enabled, thresholds, ref, onPinch, onSwipe, onTap]);
}

function distanceBetween(a: PointerState, b: PointerState): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function resolveSwipeDirection(dx: number, dy: number): SwipeDirection {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}
