import type { CSSProperties } from 'react';

import { HUD_FONTS } from './tokens';

type LetterSpacingVar =
  | '--hud-letter-spacing-body'
  | '--hud-letter-spacing-tight'
  | '--hud-letter-spacing-compact'
  | '--hud-letter-spacing-wide'
  | '--hud-letter-spacing-ultra';

type LineHeightVar =
  | '--hud-line-height-display'
  | '--hud-line-height-title'
  | '--hud-line-height-heading'
  | '--hud-line-height-body'
  | '--hud-line-height-compact';

type SizeVar =
  | '--hud-type-display-xxl'
  | '--hud-type-display-xl'
  | '--hud-type-display-lg'
  | '--hud-type-title-lg'
  | '--hud-type-title-md'
  | '--hud-type-heading-lg'
  | '--hud-type-heading-md'
  | '--hud-type-heading-sm'
  | '--hud-type-body-lg'
  | '--hud-type-body-md'
  | '--hud-type-body-sm'
  | '--hud-type-body-xs'
  | '--hud-type-mono-xs'
  | '--hud-type-eyebrow';

type WeightVar =
  | '--hud-weight-display'
  | '--hud-weight-heading'
  | '--hud-weight-body'
  | '--hud-weight-mono';

export type HudTypographyToken =
  | 'display-xxl'
  | 'display-xl'
  | 'display-lg'
  | 'title-lg'
  | 'title-md'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'body-xs'
  | 'mono-xs'
  | 'eyebrow';

interface HudTypographyScale {
  sizeVar: SizeVar;
  lineHeightVar: LineHeightVar;
  letterSpacingVar: LetterSpacingVar;
  fontFamily: keyof typeof HUD_FONTS;
  weightVar: WeightVar;
  uppercase?: boolean;
}

const makeScale = (config: HudTypographyScale) => config;

export const HUD_TYPOGRAPHY_SCALES: Record<HudTypographyToken, HudTypographyScale> = {
  'display-xxl': makeScale({
    sizeVar: '--hud-type-display-xxl',
    lineHeightVar: '--hud-line-height-display',
    letterSpacingVar: '--hud-letter-spacing-ultra',
    fontFamily: 'display',
    weightVar: '--hud-weight-display',
    uppercase: true,
  }),
  'display-xl': makeScale({
    sizeVar: '--hud-type-display-xl',
    lineHeightVar: '--hud-line-height-display',
    letterSpacingVar: '--hud-letter-spacing-ultra',
    fontFamily: 'display',
    weightVar: '--hud-weight-display',
    uppercase: true,
  }),
  'display-lg': makeScale({
    sizeVar: '--hud-type-display-lg',
    lineHeightVar: '--hud-line-height-display',
    letterSpacingVar: '--hud-letter-spacing-wide',
    fontFamily: 'display',
    weightVar: '--hud-weight-display',
    uppercase: true,
  }),
  'title-lg': makeScale({
    sizeVar: '--hud-type-title-lg',
    lineHeightVar: '--hud-line-height-title',
    letterSpacingVar: '--hud-letter-spacing-wide',
    fontFamily: 'heading',
    weightVar: '--hud-weight-heading',
    uppercase: true,
  }),
  'title-md': makeScale({
    sizeVar: '--hud-type-title-md',
    lineHeightVar: '--hud-line-height-title',
    letterSpacingVar: '--hud-letter-spacing-compact',
    fontFamily: 'heading',
    weightVar: '--hud-weight-heading',
    uppercase: true,
  }),
  'heading-lg': makeScale({
    sizeVar: '--hud-type-heading-lg',
    lineHeightVar: '--hud-line-height-heading',
    letterSpacingVar: '--hud-letter-spacing-compact',
    fontFamily: 'heading',
    weightVar: '--hud-weight-heading',
    uppercase: true,
  }),
  'heading-md': makeScale({
    sizeVar: '--hud-type-heading-md',
    lineHeightVar: '--hud-line-height-heading',
    letterSpacingVar: '--hud-letter-spacing-tight',
    fontFamily: 'heading',
    weightVar: '--hud-weight-heading',
  }),
  'heading-sm': makeScale({
    sizeVar: '--hud-type-heading-sm',
    lineHeightVar: '--hud-line-height-heading',
    letterSpacingVar: '--hud-letter-spacing-tight',
    fontFamily: 'heading',
    weightVar: '--hud-weight-heading',
  }),
  'body-lg': makeScale({
    sizeVar: '--hud-type-body-lg',
    lineHeightVar: '--hud-line-height-body',
    letterSpacingVar: '--hud-letter-spacing-body',
    fontFamily: 'body',
    weightVar: '--hud-weight-body',
  }),
  'body-md': makeScale({
    sizeVar: '--hud-type-body-md',
    lineHeightVar: '--hud-line-height-body',
    letterSpacingVar: '--hud-letter-spacing-body',
    fontFamily: 'body',
    weightVar: '--hud-weight-body',
  }),
  'body-sm': makeScale({
    sizeVar: '--hud-type-body-sm',
    lineHeightVar: '--hud-line-height-body',
    letterSpacingVar: '--hud-letter-spacing-body',
    fontFamily: 'body',
    weightVar: '--hud-weight-body',
  }),
  'body-xs': makeScale({
    sizeVar: '--hud-type-body-xs',
    lineHeightVar: '--hud-line-height-compact',
    letterSpacingVar: '--hud-letter-spacing-body',
    fontFamily: 'body',
    weightVar: '--hud-weight-body',
  }),
  'mono-xs': makeScale({
    sizeVar: '--hud-type-mono-xs',
    lineHeightVar: '--hud-line-height-compact',
    letterSpacingVar: '--hud-letter-spacing-tight',
    fontFamily: 'mono',
    weightVar: '--hud-weight-mono',
  }),
  eyebrow: makeScale({
    sizeVar: '--hud-type-eyebrow',
    lineHeightVar: '--hud-line-height-compact',
    letterSpacingVar: '--hud-letter-spacing-ultra',
    fontFamily: 'heading',
    weightVar: '--hud-weight-heading',
    uppercase: true,
  }),
};

export interface HudTypographyOptions {
  letterSpacingOverride?: string;
  uppercase?: boolean;
  fontWeightOverride?: number | string;
}

export function resolveHudTypography(
  token: HudTypographyToken,
  options: HudTypographyOptions = {},
): CSSProperties {
  const scale = HUD_TYPOGRAPHY_SCALES[token];
  return {
    fontFamily: HUD_FONTS[scale.fontFamily],
    fontSize: `var(${scale.sizeVar})`,
    lineHeight: `var(${scale.lineHeightVar})`,
    letterSpacing: options.letterSpacingOverride
      ? options.letterSpacingOverride
      : `var(${scale.letterSpacingVar})`,
    fontWeight: options.fontWeightOverride ?? `var(${scale.weightVar})`,
    textTransform: options.uppercase ?? scale.uppercase ? 'uppercase' : undefined,
  } satisfies CSSProperties;
}

export function mergeHudTypography(
  base: HudTypographyToken,
  overrides: CSSProperties = {},
  options: HudTypographyOptions = {},
): CSSProperties {
  return {
    ...resolveHudTypography(base, options),
    ...overrides,
  };
}

