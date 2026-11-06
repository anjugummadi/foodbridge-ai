/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        foodbridge: {
          dark: "#0F3E2E",      // Deep Forest Green from topbar
          primary: "#16A34A",   // Vivid Emerald Green
          accent: "#22C55E",    // Bright Accent Green from Dashboard active pill
          surface: "#F8FAFC",
        }
      }
    },
  },
  plugins: [],
}