import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#10141F",
        surface: "#1B2233",
        surface2: "#262F45",
        blue: {
          DEFAULT: "#4C7DFF",
          deep: "#3A64D8",
        },
        mint: "#34D399",
        violet: "#A78BFA",
        rust: "#F16571",
        fg: "#F2F4F9",
        muted: "#8B93A8",
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
