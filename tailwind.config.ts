import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["var(--font-arabic)", "Tahoma", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#eefbf3",
          100: "#d6f5e1",
          200: "#aeebc6",
          300: "#7adba8",
          400: "#45c285",
          500: "#22a86b",
          600: "#168656",
          700: "#136a47",
          800: "#12543a",
          900: "#104632",
          950: "#06281c"
        }
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
