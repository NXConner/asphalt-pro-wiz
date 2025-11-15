## Design System (Phase 4 Foundation)

The Pavement Performance Suite UI is driven by codified design tokens plus reusable HUD-inspired components. This document captures the core rules so designers and engineers can extend the system consistently.

### 1. Color System

| Token | Description | Default Value |
| --- | --- | --- |
| `--primary` | Mission accent color (progress, CTAs) | `25 100% 55%` (SHD orange) |
| `--accent` | Secondary accent; analytics highlights | `197 88% 56%` |
| `--background` | Main canvas background | `226 55% 5%` |
| `--card` | Card/HUD panels | `225 50% 8%` |
| `--ring` | Focus rings + keylines | Matches `--primary` |
| `--hud-grid-opacity` | Density of grid overlay | `0.22` default; configurable per theme |

Theme presets live in `src/design/themes/index.ts`, exposing a dozen Division-inspired schemes (Agent, Rogue, Dark Zone, Tech, Stealth, Combat, Tactical, Sunrise, Evensong, Revival, Celestial). Each preset composes the CSS custom properties at runtime, so switching themes is instant and works across Tailwind, shadcn/ui, and custom HUD layers.

### 2. Typography Scale

| Usage | Token/Class | Spec |
| --- | --- | --- |
| Eyebrow | `font-mono text-[0.55rem] tracking-[0.55em] uppercase` | For mission phases, statuses |
| Display Heading | `font-display text-4xl sm:text-5xl tracking-[0.28em] uppercase` | Command center hero headings |
| Section Title | `text-lg sm:text-xl font-semibold` | Panel headers, TacticalCard titles |
| Body | `text-sm leading-relaxed` | Default copy |
| Microcopy | `text-xs tracking-[0.35em] uppercase` | Chip labels, stat captions |

Typography helpers are exposed via `src/design/typography.ts` plus Tailwind classes defined in `tailwind.config.ts`.

### 3. Spacing & Radii

| Token | Size |
| --- | --- |
| `--hud-radius-xs` | `0.5rem` |
| `--hud-radius-md` | `1.25rem` (default for cards/panels) |
| `--hud-radius-xl` | `1.75rem` |
| `--hud-gap` | `1.25rem` (grid gutter) |

Spacing + radii constants are co-located in `src/design/system/config.ts` and consumed by CanvasPanel, ResponsiveCanvas layouts, and the new Tactical components.

### 4. Core Components

| Component | Location | Purpose |
| --- | --- | --- |
| `CanvasPanel` | `src/modules/layout/CanvasPanel.tsx` | Structural wrapper with eyebrow, tone, and collapse support |
| `TacticalCard` (new) | `src/components/ui/tactical-card.tsx` | HUD-grade gradient cards w/ tone presets for mission intel |
| `TacticalButton` (new) | `src/components/ui/tactical-button.tsx` | Glow-capable button with icon/badge slots for touch targets |
| `PriorityCard` | `src/components/ui/priority-card.tsx` | Priority-coded collapsible sections (critical/high/etc.) |
| `MobileWizardStepper/Footer` | `src/modules/estimate/EstimatorStudio.tsx` | Mobile-first wizard controls for Estimator Studio |

### 5. Wallpaper & Theme Customization

- Wallpaper presets defined in `src/modules/layout/wallpapers.ts`.
- Custom uploads handled by `ThemeWallpaperManager`, now optimized via `useImageOptimization` to resize/compress before persisting.
- `useWallpaperLibrary` persists uploads in localStorage and synthesizes theme metadata (tone → particle preset mapping).

### 6. Accessibility & Motion

- ESLint config bundles `eslint-plugin-jsx-a11y` (recommended + strict) and additional HUD-specific rules.
- Mobile-first components (BottomSheet, MobileNav, wizard footer) respect focus management, keyboard interactions, and accessible labels.
- Motion tokens live in `src/design/motion.ts` and are exposed as Tailwind utilities.

### 7. How to Extend

1. Define new color/spacing tokens in `src/design/tokens.ts`.
2. Compose a theme variant in `src/design/themes/index.ts`.
3. Use `TacticalCard` + `TacticalButton` for new panels to get gradients, keylines, and badges for free.
4. Update `docs/DESIGN_SYSTEM.md` as new primitives or guidelines are added.

This file, alongside `docs/CONTAINERIZATION.md`, completes Phase 4’s documentation requirement while the new Tactical components push the UI component library forward.
