import type { Config } from "tailwindcss";

/**
 * Elkjøp "Old Stock Cockpit" — Dark Mode Design System v1.0
 * Tokens transcribed directly from the approved Visual Design Specification.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FOUNDATION — surfaces & borders (light theme)
        sunken: "#EAEEF4", // recessed wells, table headers
        base: "#F4F6F9", // app background
        surface: {
          1: "#FFFFFF", // cards, panels
          2: "#F7F9FC", // popovers, modals, hover panels
          3: "#EEF2F8", // hover / active row
        },
        hairline: {
          subtle: "#E7EBF1", // card hairlines
          DEFAULT: "#DBE1EA", // inputs, dividers
          strong: "#C5CDD9", // focus rings, hover
        },
        // BRAND — Elkjøp navy / blue / green
        brand: {
          navy: "#0E2A47", // dark chrome (nav rail / brand bar)
          "navy-soft": "#16365A", // borders / hover within navy
          blue: "#2E6FF2", // structure, links, info
          "blue-soft": "#E9F0FF", // tinted info fills
          green: "#0E8C43", // primary action, go (deep, on white)
          "green-soft": "#E7F6EE", // positive / recovered tint
        },
        // TEXT — on light
        ink: {
          primary: "#14253B",
          secondary: "#51627A",
          tertiary: "#8A98AC",
          disabled: "#B4BECB",
        },
        // DATA-VIZ — categorical (max 6), tuned for light bg
        viz: {
          phones: "#3B7DF5",
          tablets: "#0EA09A",
          watches: "#7C5CFF",
          accessories: "#DD8A12",
        },
        // RISK TIERS — legible on white
        risk: {
          critical: "#E5484D",
          high: "#E5800B",
          watch: "#BE8A00",
          healthy: "#15924C",
        },
      },
      fontFamily: {
        sans: ["var(--font-schibsted)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // value / lineHeight / letterSpacing from the spec
        display: ["46px", { lineHeight: "1.02", letterSpacing: "-0.035em", fontWeight: "700" }],
        h1: ["30px", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" }],
        h2: ["22px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        h3: ["16px", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["14.5px", { lineHeight: "1.55" }],
        label: ["13px", { lineHeight: "1.3", fontWeight: "500" }],
        overline: ["11px", { lineHeight: "1.2", letterSpacing: "0.12em", fontWeight: "600" }],
        kpi: ["36px", { lineHeight: "1.0", fontWeight: "700" }],
        "kpi-sm": ["28px", { lineHeight: "1.0", fontWeight: "700" }],
      },
      spacing: {
        // 4px base / 8px rhythm scale tokens
        s1: "4px",
        s2: "8px",
        s3: "12px",
        s4: "16px",
        s5: "20px",
        s6: "24px",
        s8: "32px",
        s10: "40px",
        s12: "48px",
        s16: "64px",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        card: "14px",
        lg: "16px",
        pill: "999px",
        badge: "7px",
      },
      maxWidth: {
        content: "1168px",
        measure: "68ch",
      },
      boxShadow: {
        // elevation tokens (light theme: soft navy-tinted shadows)
        e1: "0 1px 2px rgba(16,40,70,0.06), 0 1px 3px rgba(16,40,70,0.05)",
        e2: "0 10px 28px -8px rgba(16,40,70,0.16), 0 2px 6px rgba(16,40,70,0.06)",
        e3: "0 28px 64px -16px rgba(16,40,70,0.26), 0 4px 12px rgba(16,40,70,0.08)",
        "glow-green": "0 8px 22px -6px rgba(14,140,67,0.45)",
        "glow-focus": "0 0 0 3px rgba(46,111,242,0.35)",
      },
      transitionTimingFunction: {
        "ease-out-soft": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        "150": "150ms",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "blink-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        shake: {
          "10%, 90%": { transform: "translateX(-1px)" },
          "20%, 80%": { transform: "translateX(2px)" },
          "30%, 50%, 70%": { transform: "translateX(-4px)" },
          "40%, 60%": { transform: "translateX(4px)" },
        },
        "grow-bar": {
          from: { transform: "scaleY(0)" },
          to: { transform: "scaleY(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s infinite",
        "count-up": "count-up 0.5s ease-out-soft both",
        "blink-live": "blink-live 1.6s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        shake: "shake 0.5s",
        "grow-bar": "grow-bar 0.5s ease-out-soft both",
      },
    },
  },
  plugins: [],
};

export default config;
