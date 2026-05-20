/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: '#111827',
        primary: '#3b82f6',
        success: '#22c55e',
        danger: '#ef4444',
        accent: '#ff6b35',
        secondary: '#0076c0',
        border: '#30363d',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
