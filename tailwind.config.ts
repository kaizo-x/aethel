import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFBF7",
          100: "#FBF9F5",
          200: "#F3EFEA",
          300: "#EAE4DC",
          400: "#DDD5CA",
        },
        charcoal: {
          900: "#1A1918",
          800: "#2B2A28",
          700: "#3D3B39",
          600: "#575553",
          500: "#757270",
          400: "#9A9794",
        },
        forest: {
          DEFAULT: "#1B3B36",
          light: "#28564F",
          dark: "#122724",
          surface: "#F0F5F4",
        },
        ochre: {
          DEFAULT: "#C89047",
          light: "#DEAA67",
          dark: "#A37233",
          surface: "#FAF4EB",
        },
        atelier: {
          border: "#E5DFD7",
          borderStrong: "#D5CCC1",
          card: "#FFFFFF",
          subtle: "#F6F3EE",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        atelier: "0 1px 3px rgba(26, 25, 24, 0.04), 0 1px 2px rgba(26, 25, 24, 0.03)",
        "atelier-md": "0 4px 12px rgba(26, 25, 24, 0.06), 0 1px 3px rgba(26, 25, 24, 0.04)",
        "atelier-lg": "0 12px 28px rgba(26, 25, 24, 0.08), 0 2px 6px rgba(26, 25, 24, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
