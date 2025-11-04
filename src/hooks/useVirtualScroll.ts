import { useEffect, useRef, useState, useCallback } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollResult {
  virtualItems: Array<{ index: number; start: number; end: number }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
}

/**
 * Hook for virtualizing large lists to improve performance
 * Only renders visible items plus overscan buffer
 */
export function useVirtualScroll(
  itemCount: number,
  { itemHeight, containerHeight, overscan = 3 }: VirtualScrollOptions
): VirtualScrollResult {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLElement | null>(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + overscan * 2);

  const virtualItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
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
      if (scrollElementRef.current) {
        const position = index * itemHeight;
        scrollElementRef.current.scrollTop = position;
      }
    },
    [itemHeight]
  );

  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
  };
}
