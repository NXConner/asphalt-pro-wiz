# UI Component Library (v1.0.0)

_Last Updated: 2025-11-06_

## Overview

The Pavement Performance Suite ships with a token-driven UI foundation that guarantees visual consistency across themes, responsive viewports, and adaptive wallpaper atmospheres. All primitives in `src/components/ui` draw from a canonical design system published in `src/design/system`. This document outlines those foundations, the binding between tokens and components, and the workflows for extending or validating the library.

## Canonical Design Tokens

Design tokens originate from `DESIGN_SYSTEM` and `CANONICAL_DESIGN_TOKENS` exports. They are grouped into colors, typography, spacing, radii, shadows, transitions, and breakpoints.

- **Color set** — Semantic CSS variables (`--background`, `--primary`, etc.) automatically adjust with theme presets and hue overrides.
- **Spacing & Radii** — Numeric scales exposed via `DESIGN_SPACING_SCALE` and `DESIGN_RADII` power consistent container rhythm.
- **Typography** — HUD-scale typography tokens (e.g., `--hud-type-heading-lg`) back Tailwind aliases such as `text-hud-heading-lg`.
- **Shadows & Transitions** — Shadow intensity tokens (`--shadow-md`) and transition curves unify elevation and motion.
- **Breakpoints** — `DESIGN_BREAKPOINTS` mirrors Tailwind configuration, guaranteeing parity between design docs and build-time utilities.

### Accessing Tokens in Code

```ts
import {
  DESIGN_SYSTEM,
  CANONICAL_DESIGN_TOKENS,
  DESIGN_BREAKPOINTS,
} from '@/lib/designSystem';

console.table(CANONICAL_DESIGN_TOKENS.colors.map(({ token, value }) => ({ token, value })));
```

## Core Component Bindings

| Component | Base Class Source | Primary Tokens | Notes |
|-----------|------------------|----------------|-------|
| `Button` | `getComponentBaseClass('button')` | `--primary`, `--ring`, `--radius` | Variants extend base semantics; tactical and command styles add bespoke visuals. |
| `Input` | `getComponentBaseClass('input')` | `--input`, `--foreground`, `--ring` | File inputs inherit tokenized decorations via `file:` utilities. |
| `Textarea` | `getComponentBaseClass('textarea')` | `--input`, `--ring`, `--radius` | Adds resize affordance while preserving tokenized focus states. |
| `SelectTrigger` | `getComponentBaseClass('select')` | `--input`, `--ring` | Integrates seamlessly with Radix content portal styling. |
| `Card` | `getComponentBaseClass('card')` | `--card`, `--card-foreground`, `--shadow-md` | Inherits blur + glass treatment for holo surfaces. |
| `DialogContent` | `getComponentBaseClass('modal')` | `--popover`, `--shadow-xl`, `--ring` | Maintains animated entry/exit states while aligning with tokenized overlays. |

To retrieve classes programmatically:

```ts
import { getComponentBaseClass } from '@/lib/designSystem';

const buttonBase = getComponentBaseClass('button');
```

## Multi-Theme & Wallpaper Pipeline

- `ThemeProvider` (in `src/contexts/ThemeContext.tsx`) orchestrates persisted preferences and applies CSS variables via `applyThemePreferences`.
- Wallpaper selection leverages `ThemeWallpaperManager`, `useWallpaperLibrary`, and new CSS hooks (`--app-wallpaper`, `--wallpaper-opacity`, `--wallpaper-blur`).
- The global stylesheet (`src/index.css`) renders wallpapers through `body::before`, respecting blur/opacity tokens and falling back to mission-default gradients.
- High contrast and hue overrides propagate through the same pathway, ensuring accessibility-compliant focus treatments.

### Adding New Theme Presets

1. Define overrides in `src/design/system/catalog.ts` via `createPreset` helpers.
2. Reference recommended wallpapers to deliver cohesive visuals.
3. Include tests or visual snapshots to validate the palette under light/dark modes.

## Responsive & Accessibility Guarantees

- Responsive grids (`sm`, `md`, `lg`) are codified through Tailwind utilities and validated by unit tests (`tests/ui/responsiveLayouts.test.tsx`).
- ESLint enforces `jsx-a11y` rules; primitives expose ARIA-friendly APIs and avoid implicit semantics.
- `DESIGN_BREAKPOINTS` ensures documentation stays aligned with runtime breakpoints, preventing drift between UX specs and implementation.

## Example: Mission Planner Panel

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MissionPlannerPanel() {
  return (
    <Card className="max-w-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-hud-heading-lg tracking-[0.28em]">
          Parking Lot Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Campus identifier" aria-label="Campus identifier" />
        <Input placeholder="Surface measurements" aria-label="Surface measurements" />
        <div className="flex justify-end gap-3">
          <Button variant="outline">Preview</Button>
          <Button variant="default">Deploy Plan</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Extending the Library

1. Generate a style definition in `src/design/system/components.ts`, adding token metadata and base classes.
2. Consume the base via `getComponentBaseClass` in the component implementation.
3. Document the addition here and create targeted tests to ensure token usage.
4. Run `npm run lint` and `npm run test:unit` to catch regressions before committing.

## Validation Checklist

- [ ] Tokens are registered in `CANONICAL_DESIGN_TOKENS` with descriptions.
- [ ] Component base classes reference design tokens instead of hard-coded values.
- [ ] Multi-theme wallpapers render correctly after uploads (verify via Theme Command Center).
- [ ] Responsive layouts hold at `sm`, `md`, and `lg` breakpoints.
- [ ] Accessibility linting passes with `npm run lint`.

