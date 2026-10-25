import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#FAF7F2",
          50: "#FFFFFF",
          100: "#FAF7F2",
          200: "#F4EFE6",
          300: "#EBE3D5",
          400: "#DFD4C0",
        },
        charcoal: {
          DEFAULT: "#1C1917",
          900: "#141211",
          800: "#1C1917",
          700: "#292524",
          600: "#44403C",
          500: "#57534E",
          400: "#78716C",
          300: "#A8A29E",
          200: "#D6D3D1",
        },
        gold: {
          DEFAULT: "#D97706",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        alert: {
          red: "#DC2626",
          amber: "#D97706",
          green: "#15803D",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        "subtle": "0 1px 3px 0 rgba(28, 25, 23, 0.04), 0 1px 2px -1px rgba(28, 25, 23, 0.04)",
        "card": "0 4px 20px -2px rgba(28, 25, 23, 0.06), 0 2px 6px -1px rgba(28, 25, 23, 0.04)",
        "elevated": "0 12px 32px -4px rgba(28, 25, 23, 0.08), 0 4px 12px -2px rgba(28, 25, 23, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
