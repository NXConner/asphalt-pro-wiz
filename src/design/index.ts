/**
 * Division Design System
 * Centralized exports for all design system modules
 */

// Export from existing design system if available, otherwise from new files
export * from './motion';
export * from './gradients';
export { divisionThemes, type DivisionTheme } from './themes';
export * from './tokens';
export * from './typography';
export * from './system';

// Re-export missing items that components expect
// These should come from the existing design system
export { HUD_DURATIONS, HUD_EASING, PARTICLE_PRESETS, type ParticlePresetKey } from './motion';
export { toCSSProperties } from './tokens';
export { mergeHudTypography } from './typography';
export { DIVISION_THEMES, DIVISION_THEME_IDS, type DivisionThemeDefinition } from './themes';
export { DEFAULT_WALLPAPER_ID, DIVISION_WALLPAPERS, type WallpaperDefinition } from './themes';
