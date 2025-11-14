import { useMediaQuery } from './useMediaQuery';

export type LayoutMode = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveLayout {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  mode: LayoutMode;
  /** Whether to show full HUD overlay */
  showFullHud: boolean;
  /** Whether panels should stack vertically */
  stackPanels: boolean;
  /** Whether to use wizard-style flow for estimator */
  useWizardFlow: boolean;
}

/**
 * Hook for responsive layout behavior across mobile/tablet/desktop
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const mode: LayoutMode = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    mode,
    showFullHud: isDesktop,
    stackPanels: isMobile || isTablet,
    useWizardFlow: isMobile,
  };
}
