/** @type {import('tailwindcss').Config} */
const themeColors = require("./lib/themeColors.json");

module.exports = {
  // NOTE: We added "./app" here because that is where your index.tsx is
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app/(tabs)/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        app: {
          bg: themeColors.light.bg,
          surface: themeColors.light.surface,
          "surface-alt": themeColors.light.surfaceAlt,
          text: themeColors.light.text,
          "muted-text": themeColors.light.mutedText,
          border: themeColors.light.border,

          primary: themeColors.light.primary,
          "on-primary": themeColors.light.onPrimary,

          secondary: themeColors.light.secondary,
          "on-secondary": themeColors.light.onSecondary,

          accent: themeColors.light.accent,
          "on-accent": themeColors.light.onAccent,

          danger: themeColors.light.danger,
          "on-danger": themeColors.light.onDanger,

          "tab-inactive": themeColors.light.tabInactive,
          skeleton: themeColors.light.skeleton,
          star: themeColors.light.star,
        },
        "app-dark": {
          bg: themeColors.dark.bg,
          surface: themeColors.dark.surface,
          "surface-alt": themeColors.dark.surfaceAlt,
          text: themeColors.dark.text,
          "muted-text": themeColors.dark.mutedText,
          border: themeColors.dark.border,

          primary: themeColors.dark.primary,
          "on-primary": themeColors.dark.onPrimary,

          secondary: themeColors.dark.secondary,
          "on-secondary": themeColors.dark.onSecondary,

          accent: themeColors.dark.accent,
          "on-accent": themeColors.dark.onAccent,

          danger: themeColors.dark.danger,
          "on-danger": themeColors.dark.onDanger,

          "tab-inactive": themeColors.dark.tabInactive,
          skeleton: themeColors.dark.skeleton,
          star: themeColors.dark.star,
        },
      },
    },
  },
  plugins: [],
};
