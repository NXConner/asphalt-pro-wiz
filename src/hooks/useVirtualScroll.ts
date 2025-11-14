import { useEffect, useRef, useState, useCallback, type MutableRefObject } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollResult {
  virtualItems: Array<{ index: number; start: number; end: number }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  scrollRef: MutableRefObject<HTMLElement | null>;
}

/**
 * Hook for virtualizing large lists to improve performance
 * Only renders visible items plus overscan buffer
 */
export function useVirtualScroll(
  itemCount: number,
  { itemHeight, containerHeight, overscan = 3 }: VirtualScrollOptions,
): VirtualScrollResult {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLElement | null>(null);

  const visibleCount = Math.max(1, Math.ceil(containerHeight / itemHeight));
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + overscan * 2);

  const virtualItems: VirtualScrollResult['virtualItems'] = [];
  for (let i = startIndex; i <= endIndex; i += 1) {
    virtualItems.push({
      index: i,
      start: i * itemHeight,
      end: (i + 1) * itemHeight,
    });
  }

  const totalHeight = itemCount * itemHeight;

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    setScrollTop(target.scrollTop);
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const element = scrollRef.current;
      if (!element) return;
      element.scrollTo({
        top: index * itemHeight,
        behavior: 'smooth',
      });
    },
    [itemHeight],
  );

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setScrollTop((previous) => Math.min(previous, Math.max(totalHeight - containerHeight, 0)));
  }, [containerHeight, totalHeight]);

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    scrollRef,
  };
}
