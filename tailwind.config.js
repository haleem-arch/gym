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
        background: '#05060f',
        surface: '#0c1020',
        primary: '#3b82f6',
        success: '#22c55e',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}
