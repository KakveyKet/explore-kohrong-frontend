/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF8FF",
          100: "#DBEEFE",
          200: "#BFE2FE",
          300: "#93D1FD",
          400: "#60B8FA",
          500: "#258FF3",
          600: "#1675E3",
          700: "#125CBD",
          800: "#164E98",
          900: "#17437A",
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

        ocean: {
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
        heading: ["Poppins", "sans-serif"],

        body: ["Inter", "sans-serif"],
      },

      boxShadow: {
        card: "0 4px 20px rgba(15, 23, 42, 0.07)",

        soft: "0 8px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },

  plugins: [],
};
