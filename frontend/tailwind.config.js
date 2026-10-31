/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#080c14",
          surface: "#0e1526",
          card: "#131c31",
          border: "#1e293b",
          primary: "#38bdf8",
          secondary: "#a855f7",
          accent: "#6366f1",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        }
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(56, 189, 248, 0.3)',
        'glow-violet': '0 0 25px -5px rgba(168, 85, 247, 0.3)',
      }
    },
  },
  plugins: [],
}
