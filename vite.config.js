import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Verificamos si existe el archivo temporal coming-soon.txt en la raíz
const isComingSoon = fs.existsSync(path.resolve(__dirname, 'coming-soon.txt'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __COMING_SOON__: JSON.stringify(isComingSoon),
  }
})

