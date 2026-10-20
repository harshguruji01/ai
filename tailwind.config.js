/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050811',
          card: '#0c1222',
          border: '#1e293b',
          neon: '#00ffcc',
          neonPink: '#ff007f',
          neonPurple: '#a855f7'
        }
      }
    },
  },
  plugins: [],
};
