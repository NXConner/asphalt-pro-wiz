import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
          heading: ["var(--hud-font-heading)", "Rajdhani", "sans-serif"],
          display: ["var(--hud-font-display)", "Orbitron", "sans-serif"],
          body: ["var(--hud-font-body)", "Rajdhani", "sans-serif"],
          mono: ["var(--hud-font-mono)", "Share Tech Mono", "monospace"],
      },
      fontWeight: {
          "hud-display": "var(--hud-weight-display)",
          "hud-heading": "var(--hud-weight-heading)",
          "hud-body": "var(--hud-weight-body)",
          "hud-mono": "var(--hud-weight-mono)",
      },
      letterSpacing: {
          "hud-body": "var(--hud-letter-spacing-body)",
          "hud-tight": "var(--hud-letter-spacing-tight)",
          "hud-compact": "var(--hud-letter-spacing-compact)",
          "hud-wide": "var(--hud-letter-spacing-wide)",
          "hud-ultra": "var(--hud-letter-spacing-ultra)",
      },
      lineHeight: {
          "hud-display": "var(--hud-line-height-display)",
          "hud-title": "var(--hud-line-height-title)",
          "hud-heading": "var(--hud-line-height-heading)",
          "hud-body": "var(--hud-line-height-body)",
          "hud-compact": "var(--hud-line-height-compact)",
      },
      fontSize: {
          "hud-display-xxl": [
            "var(--hud-type-display-xxl)",
            {
              lineHeight: "var(--hud-line-height-display)",
              letterSpacing: "var(--hud-letter-spacing-ultra)",
              fontWeight: "var(--hud-weight-display)",
            },
          ],
          "hud-display-xl": [
            "var(--hud-type-display-xl)",
            {
              lineHeight: "var(--hud-line-height-display)",
              letterSpacing: "var(--hud-letter-spacing-ultra)",
              fontWeight: "var(--hud-weight-display)",
            },
          ],
          "hud-display-lg": [
            "var(--hud-type-display-lg)",
            {
              lineHeight: "var(--hud-line-height-display)",
              letterSpacing: "var(--hud-letter-spacing-wide)",
              fontWeight: "var(--hud-weight-display)",
            },
          ],
          "hud-title-lg": [
            "var(--hud-type-title-lg)",
            {
              lineHeight: "var(--hud-line-height-title)",
              letterSpacing: "var(--hud-letter-spacing-wide)",
              fontWeight: "var(--hud-weight-heading)",
            },
          ],
          "hud-title-md": [
            "var(--hud-type-title-md)",
            {
              lineHeight: "var(--hud-line-height-title)",
              letterSpacing: "var(--hud-letter-spacing-compact)",
              fontWeight: "var(--hud-weight-heading)",
            },
          ],
          "hud-heading-lg": [
            "var(--hud-type-heading-lg)",
            {
              lineHeight: "var(--hud-line-height-heading)",
              letterSpacing: "var(--hud-letter-spacing-compact)",
              fontWeight: "var(--hud-weight-heading)",
            },
          ],
          "hud-heading-md": [
            "var(--hud-type-heading-md)",
            {
              lineHeight: "var(--hud-line-height-heading)",
              letterSpacing: "var(--hud-letter-spacing-tight)",
              fontWeight: "var(--hud-weight-heading)",
            },
          ],
          "hud-heading-sm": [
            "var(--hud-type-heading-sm)",
            {
              lineHeight: "var(--hud-line-height-heading)",
              letterSpacing: "var(--hud-letter-spacing-tight)",
              fontWeight: "var(--hud-weight-heading)",
            },
          ],
          "hud-body-lg": [
            "var(--hud-type-body-lg)",
            {
              lineHeight: "var(--hud-line-height-body)",
              letterSpacing: "var(--hud-letter-spacing-body)",
              fontWeight: "var(--hud-weight-body)",
            },
          ],
          "hud-body-md": [
            "var(--hud-type-body-md)",
            {
              lineHeight: "var(--hud-line-height-body)",
              letterSpacing: "var(--hud-letter-spacing-body)",
              fontWeight: "var(--hud-weight-body)",
            },
          ],
          "hud-body-sm": [
            "var(--hud-type-body-sm)",
            {
              lineHeight: "var(--hud-line-height-body)",
              letterSpacing: "var(--hud-letter-spacing-body)",
              fontWeight: "var(--hud-weight-body)",
            },
          ],
          "hud-body-xs": [
            "var(--hud-type-body-xs)",
            {
              lineHeight: "var(--hud-line-height-compact)",
              letterSpacing: "var(--hud-letter-spacing-body)",
              fontWeight: "var(--hud-weight-body)",
            },
          ],
          "hud-mono-xs": [
            "var(--hud-type-mono-xs)",
            {
              lineHeight: "var(--hud-line-height-compact)",
              letterSpacing: "var(--hud-letter-spacing-tight)",
              fontWeight: "var(--hud-weight-mono)",
              fontFamily: "var(--hud-font-mono)",
            },
          ],
          "hud-eyebrow": [
            "var(--hud-type-eyebrow)",
            {
              lineHeight: "var(--hud-line-height-compact)",
              letterSpacing: "var(--hud-letter-spacing-ultra)",
              fontWeight: "var(--hud-weight-heading)",
              textTransform: "uppercase",
            },
          ],
        },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          hover: "hsl(var(--secondary-hover))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          hover: "hsl(var(--accent-hover))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
          "hud-scanline": {
            "0%": { opacity: "0", transform: "translateY(-30%)" },
            "20%": { opacity: "0.4" },
            "50%": { opacity: "0.6" },
            "100%": { opacity: "0", transform: "translateY(120%)" },
          },
          "hud-pulse": {
            "0%": { opacity: "0.35", transform: "scale3d(0.92,0.92,1)" },
            "30%": { opacity: "0.7", transform: "scale3d(1.02,1.02,1)" },
            "60%": { opacity: "0.45", transform: "scale3d(0.98,0.98,1)" },
            "100%": { opacity: "0.35", transform: "scale3d(0.92,0.92,1)" },
          },
          "hud-glitch": {
            "0%": { clipPath: "inset(10% 0 90% 0)", transform: "translate(-2px,-1px)" },
            "20%": { clipPath: "inset(30% 0 60% 0)", transform: "translate(2px,1px)" },
            "40%": { clipPath: "inset(50% 0 30% 0)", transform: "translate(-1px,0)" },
            "60%": { clipPath: "inset(80% 0 10% 0)", transform: "translate(1px,-1px)" },
            "80%": { clipPath: "inset(20% 0 70% 0)", transform: "translate(-2px,0)" },
            "100%": { clipPath: "inset(0 0 0 0)", transform: "translate(0,0)" },
          },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
          "hud-scanline": "hud-scanline 2.4s cubic-bezier(0.22,1,0.36,1) infinite",
          "hud-pulse": "hud-pulse 2.6s cubic-bezier(0.34,0,0.69,1) infinite",
          "hud-glitch": "hud-glitch 0.7s steps(2, jump-start) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
