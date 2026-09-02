import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14152B",
        navy: {
          DEFAULT: "#1B2145",
          light: "#2A3164",
        },
        parchment: "#FAF6EC",
        paper: "#FFFDF8",
        gold: {
          DEFAULT: "#C8922F",
          deep: "#9C701F",
          light: "#EACB8B",
        },
        rose: "#B5506B",
        moss: "#5B7A5E",
        rust: "#B5482F",
        slate: "#6B7086",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-plex)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
