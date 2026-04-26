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
        'nude': '#F5F5DC',
        'miuccha-gold': '#D4AF37',
      },
      fontFamily: {
        'serif': ['"Playfair Display"', 'serif'],
        'sans': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
