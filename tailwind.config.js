/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: '#111827',
        primary: '#3b82f6',
        success: '#22c55e',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}
