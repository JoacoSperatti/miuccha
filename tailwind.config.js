/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'leather': '#8B4513',
        'leather-dark': '#5D2E0A',
        'miuccha-cream': '#F3ECE7', 
        'miuccha-pink-bg': '#C37D8D',
        'miuccha-pink-text': '#D3A3B0', 
        'miuccha-lime': '#E3F285', 
      },
      fontFamily: {
        'serif': ['"Playfair Display"', 'serif'],
        'sans': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
