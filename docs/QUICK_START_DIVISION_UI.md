# Quick Start Guide - Division UI

## Using Division Components

### Card Variants

```tsx
import { Card } from '@/components/ui/card';

// Default
<Card>Standard Card</Card>

// Tactical variant
<Card variant="tactical">Tactical Card</Card>

// HUD variant
<Card variant="hud">HUD Card</Card>

// Glass variant
<Card variant="glass">Glass Card</Card>
```

### Form Components

```tsx
import { Input, Select, Textarea } from '@/components/ui';

// Tactical styling
<Input variant="tactical" placeholder="Enter data..." />
<Select variant="tactical">...</Select>
<Textarea variant="tactical" />

// HUD styling
<Input variant="hud" />
```

### Alert Variants

```tsx
import { Alert } from '@/components/ui/alert';

<Alert variant="tactical">Tactical Alert</Alert>
<Alert variant="hud">HUD Alert</Alert>
<Alert variant="info">Info Alert</Alert>
<Alert variant="warning">Warning Alert</Alert>
<Alert variant="success">Success Alert</Alert>
```

### Tactical Components

```tsx
import {
  TacticalCard,
  TacticalOverlay,
  StatusBar,
  ProgressRing,
  TacticalLoader,
  TacticalAlert,
} from '@/components/hud';

// Tactical Card with overlay
<TacticalCard heading="Mission Status" accent="ember">
  Content here
</TacticalCard>

// Status Bar
<StatusBar value={75} max={100} label="Health" />

// Progress Ring
<ProgressRing value={60} label="Progress" />

// Tactical Loader
<TacticalLoader label="Analyzing..." />
```

### CSS Utilities

```tsx
// Scan line effect
<div className="division-scanline">Content</div>

// Glow effects
<div className="division-glow-ember">Glowing Element</div>
<h1 className="text-glow-ember">Glowing Text</h1>

// Corner brackets
<div className="division-corner-bracket">Bracketed Content</div>
```

### Design System

```tsx
import {
  DIVISION_THEMES,
  DIVISION_THEME_IDS,
  divisionColors,
  divisionGradients,
  HUD_DURATIONS,
  HUD_EASING,
} from '@/design';

// Access theme
const theme = DIVISION_THEMES['theme-division-agent'];

// Use colors
const orange = divisionColors.orange[400];

// Use gradients
const emberGradient = divisionGradients.ember;
```

---

## Theme Customization

The Division design system integrates with the existing ThemeCustomizer component. Users can:

- Select from 8 Division themes
- Customize primary/accent colors
- Adjust wallpaper settings
- Modify opacity and blur effects

---

## Performance Notes

- All tactical components are memoized
- CSS utilities use efficient animations
- Design tokens are static constants
- No runtime performance impact

---

**Ready to use!** All components are production-ready and fully typed.
