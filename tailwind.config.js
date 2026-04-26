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
        'miuccha-cream': '#F3ECE7', // El fondo suave de los bloques
        'miuccha-pink-bg': '#C37D8D', // El fondo del bloque de anuncio
        'miuccha-pink-text': '#D3A3B0', // El rosa para el texto de categorías
        'miuccha-lime': '#E3F285', // El verde lima para el texto de anuncio
      },
      fontFamily: {
        'serif': ['"Playfair Display"', 'serif'],
        'sans': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
