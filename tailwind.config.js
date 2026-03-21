/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#f8f8f8",
          surfaceBg: "#E2E8F0",
        },
        surface: {
          DEFAULT: "#ffffff",
          soft: "#f3f4f6",
          muted: "#f2f4f5",
        },
        text: {
          primary: "#1f2a44",
          secondary: "#8d8991",
          muted: "#b9b5bf",
        },
        border: {
          DEFAULT: "#ececec",
          soft: "#f1f1f1",
        },
        primary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#36c98d",
          500: "#21a777",
          600: "#1f9570",
          700: "#19785a",
        },
        secondary: "#c4fb22",
        success: {
          400: "#38d996",
          500: "#2fcf88",
          600: "#23b06f",
        },
        danger: {
          400: "#ff7a66",
          500: "#ff6b57",
          600: "#ef5b46",
        },
        chip: {
          bg: "#f3f4f6",
          text: "#6f7380",
          active: "#27b781",
        },
        label: "#8f949e",
        summary: {
          bg: "#21a777",
          divider: "#48bd94",
          text: "#ffffff",
        },
        category: {
          blueSoft: "#eaf1ff",
          blue: "#4f8df7",
          orangeSoft: "#fff4e8",
          orange: "#f4a24a",
          greenSoft: "#ebf8ef",
          green: "#48c67f",
          purpleSoft: "#f3ebff",
          purple: "#a86cf7",
        },
      },
      borderRadius: {
        sm: "0.75rem",
        md: "1rem",
        lg: "1.25rem",
        xl: "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        card: "0 2px 10px rgba(31, 42, 68, 0.05)",
      },
      fontFamily: {
        "poppins-thin": ["PoppinsThin"],
        poppins: ["PoppinsRegular"],
        "poppins-medium": ["PoppinsMedium"],
        "poppins-semibold": ["PoppinsSemiBold"],
        "poppins-bold": ["PoppinsBold"],
      },
    },
  },
  plugins: [],
};
