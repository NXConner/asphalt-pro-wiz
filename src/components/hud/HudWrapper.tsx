import { memo } from 'react';

import { TacticalHudOverlay, type TacticalHudOverlayProps } from './TacticalHudOverlay';
import { useTheme } from '@/contexts/ThemeContext';

export const HudWrapper = memo(function HudWrapper(props: TacticalHudOverlayProps) {
  const { preferences } = useTheme();

  if (!preferences.showHud) {
    return null;
  }

  return <TacticalHudOverlay {...props} />;
});
