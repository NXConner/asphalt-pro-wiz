import { useEffect, useRef, useState } from 'react';

interface IntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

/**
 * Hook for using Intersection Observer API
 * Useful for lazy loading, infinite scroll, and visibility tracking
 */
export function useIntersectionObserver(
  options: IntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const element = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !element) return;

    const observerOptions = { threshold, root, rootMargin };

    observerRef.current = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, observerOptions);

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, root, rootMargin, frozen]);

  return {
    ref: elementRef,
    entry,
    isIntersecting: !!entry?.isIntersecting,
  };
}
