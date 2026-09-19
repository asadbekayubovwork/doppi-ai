/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Page ground, driven by the CSS variables in `app/styles/base.css`.
        // Channel triplets (not hex) so `bg-ground/80` keeps working.
        ground: "rgb(var(--bg-ground-rgb) / <alpha-value>)",
        raised: "rgb(var(--bg-raised-rgb) / <alpha-value>)",
        // Landing palette, taken from ElevenLabs' warm neutrals: `sand-25` is
        // the page ground, 950 the ink, and the steps between carry borders
        // (200), muted copy (500) and hover states.
        sand: {
          25: "#FDFCFC",
          50: "#FAF8F8",
          100: "#F5F3F1",
          200: "#EBE8E4",
          300: "#D7D2CC",
          400: "#A59F97",
          500: "#777169",
          600: "#59544F",
          700: "#44403B",
          800: "#292524",
          900: "#1C1917",
          950: "#0C0A09",
        },
        // The live accent on the landing, kept for things that are live or
        // moving: status dots, waveforms, the orbit's travelling light.
        signal: "#FF4704",
        // Hover accent for cards and blocks: the border glow, lit orbit
        // chips, step markers. Deep blue, hsl(221 46% 38%).
        cobalt: "#34508C",
        primary: {
          10: "#EAEFFF",
          20: "#BDCCFF",
          30: "#8FA8FF",
          40: "#6185FF",
          50: "#3362FF",
          60: "#204CDD",
          70: "#1139BB",
          80: "#062899",
          90: "#001C77",
          100: "#001455",
        },
        secondary: {
          10: "#F5F5F5",
          20: "#E0E0E0",
          30: "#CCCCCC",
          40: "#B8B8B8",
          50: "#A3A3A3",
          60: "#8F8F8F",
          70: "#7A7A7A",
          80: "#666666",
          90: "#525252",
          100: "#3D3D3D",
        },
        danger: {
          10: "#FFEAEA",
          20: "#FFBDBD",
          30: "#FF8F8F",
          40: "#FF6161",
          50: "#FF3333",
          60: "#DD2020",
          70: "#BB1111",
          80: "#990606",
          90: "#770000",
          100: "#550000",
        },
        success: {
          10: "#F1FFE8",
          20: "#D0FFC1",
          30: "#AFFF97",
          40: "#8EFF6C",
          50: "#6CFB40",
          60: "#74F316",
          70: "#56CA00",
          80: "#45A100",
          90: "#337800",
          100: "#225000",
        },
        warning: {
          10: "#FFF8E5",
          20: "#FFEBB7",
          30: "#FFDE8A",
          40: "#FFB355",
          50: "#FFC42E",
          60: "#FFB700",
          70: "#D69A00",
          80: "#AD7C00",
          90: "#855F00",
          100: "#5C4200",
        },
        gray: {
          DEFAULT: "#919099",
          200: "#EAECF0",
          300: "#F5F7FF",
          400: "#A5A5A5",
          500: "#4F4F4F",
        },
        white: {
          DEFAULT: "#FFFFFF",
        },
        black: {
          DEFAULT: "#000000",
        },
      },
      lineHeight: {
        125: "125%",
        150: "150%",
        140: "140%",
      },
    },
  },
  plugins: [],
}
