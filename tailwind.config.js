/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F1FAFE",
          100: "#DFF4FC",
          200: "#BFEAF8",
          300: "#91D8F1",
          400: "#63C6EA",

          // MAIN BRAND COLOR
          500: "#43B5E3",

          // HOVER
          600: "#319ECC",

          700: "#287FA5",
          800: "#276988",
          900: "#245871",
          950: "#16384A",
        },

        secondary: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
          950: "#083344",
        },

        accent: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },

        heading: "#0F172A",
        body: "#334155",
        muted: "#64748B",
        ink: "#1F2937",
        border: "#E2E8F0",

        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F8FAFC",
          sand: "#FAF8F2",
        },
      },

      fontFamily: {
        body: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },

      boxShadow: {
        card: "0 8px 30px rgba(15, 23, 42, 0.08)",
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },

  plugins: [],
};
