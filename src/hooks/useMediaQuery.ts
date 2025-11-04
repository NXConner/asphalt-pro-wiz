import { useState, useEffect } from 'react';

/**
 * Hook for responsive design with media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoint hooks
 */
export function useIsSmall() {
  return useMediaQuery('(max-width: 640px)');
}

export function useIsMedium() {
  return useMediaQuery('(min-width: 641px) and (max-width: 768px)');
}

export function useIsLarge() {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsXLarge() {
  return useMediaQuery('(min-width: 1025px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)');
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersDarkMode() {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersHighContrast() {
  return useMediaQuery('(prefers-contrast: high)');
}
