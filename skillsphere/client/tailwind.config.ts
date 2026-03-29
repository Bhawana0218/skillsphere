/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        blob: "blob 15s infinite",
        "gradient-x": "gradient-x 8s ease infinite",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(20px, -10px) scale(1.1)" },
          "50%": { transform: "translate(10px, 20px) scale(0.95)" },
          "75%": { transform: "translate(-15px, 10px) scale(1.05)" },
        },
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
      colors: {
        primary: "#6366F1",
        secondary: "#22C55E",
        accent: "#0EA5E9",
        dark: "#0F172A",
        card: "#1E293B",
      },
    },
  },
  plugins: [],
};
