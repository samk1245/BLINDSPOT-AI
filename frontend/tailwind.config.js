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
          void: "#03060f",
          dark: "#060a17",
          panel: "#0b1122",
          card: "#0f172a",
          border: "#1e293b",
          cyan: "#00d2ff",
          sky: "#38bdf8",
          gold: "#e2b65c",
          amber: "#ffaa33",
          violet: "#9a6cff",
          magenta: "#d946ef",
          emerald: "#10b981",
          rose: "#ff4d4d",
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(0, 210, 255, 0.45)',
        'neon-gold': '0 0 20px -3px rgba(226, 182, 92, 0.45)',
        'neon-violet': '0 0 20px -3px rgba(154, 108, 255, 0.45)',
        'neon-rose': '0 0 20px -3px rgba(255, 77, 77, 0.45)',
        'hud-card': '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
