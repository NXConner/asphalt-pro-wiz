export type Hsl = `${number} ${number}% ${number}%`;

export interface DesignTokens {
  background: Hsl;
  foreground: Hsl;
  primary: Hsl;
  primaryForeground: Hsl;
  secondary: Hsl;
  secondaryForeground: Hsl;
  accent: Hsl;
  accentForeground: Hsl;
  muted: Hsl;
  mutedForeground: Hsl;
  destructive: Hsl;
  destructiveForeground: Hsl;
  border: Hsl;
  input: Hsl;
  ring: Hsl;
  card: Hsl;
  cardForeground: Hsl;
  radiusPx: number;
}

function readVar(style: CSSStyleDeclaration, name: string): string {
  return style.getPropertyValue(name).trim();
}

export function getDesignTokens(): DesignTokens {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const parseHsl = (v: string) => (v || "0 0% 0%") as Hsl;
  const parsePx = (v: string) => {
    const n = parseInt(v || "0", 10);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    background: parseHsl(readVar(style, "--background")),
    foreground: parseHsl(readVar(style, "--foreground")),
    primary: parseHsl(readVar(style, "--primary")),
    primaryForeground: parseHsl(readVar(style, "--primary-foreground")),
    secondary: parseHsl(readVar(style, "--secondary")),
    secondaryForeground: parseHsl(readVar(style, "--secondary-foreground")),
    accent: parseHsl(readVar(style, "--accent")),
    accentForeground: parseHsl(readVar(style, "--accent-foreground")),
    muted: parseHsl(readVar(style, "--muted")),
    mutedForeground: parseHsl(readVar(style, "--muted-foreground")),
    destructive: parseHsl(readVar(style, "--destructive")),
    destructiveForeground: parseHsl(readVar(style, "--destructive-foreground")),
    border: parseHsl(readVar(style, "--border")),
    input: parseHsl(readVar(style, "--input")),
    ring: parseHsl(readVar(style, "--ring")),
    card: parseHsl(readVar(style, "--card")),
    cardForeground: parseHsl(readVar(style, "--card-foreground")),
    radiusPx: parsePx(readVar(style, "--radius")),
  };
}

export const THEME_NAMES = [
  "default",
  "emerald",
  "sunset",
  "royal",
  "crimson",
  "forest",
  "ocean",
  "amber",
  "mono",
  "cyber",
  // Extended palette
  "slate",
  "rose",
  "midnight",
  "canary",
  "copper",
  "sage",
] as const;

export type ThemeNameFromTokens = typeof THEME_NAMES[number];
