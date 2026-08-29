import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        sidebar: {
          DEFAULT: "#1E1E2D",
          hover: "#2A2A3C",
          active: "#33334A",
        },
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          DEFAULT: "#4F46E5",
        },
        success: {
          DEFAULT: "#22C55E",
          bg: "#DCFCE7",
          text: "#15803D",
        },
        warning: {
          DEFAULT: "#F59E0B",
          bg: "#FEF3C7",
          text: "#B45309",
        },
        danger: {
          DEFAULT: "#EF4444",
          bg: "#FEE2E2",
          text: "#B91C1C",
        },
        info: {
          DEFAULT: "#3B82F6",
          bg: "#DBEAFE",
          text: "#1D4ED8",
        },
        surface: "#F8FAFC",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
