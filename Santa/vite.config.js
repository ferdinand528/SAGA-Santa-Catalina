import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Agregamos el bloque de configuración para Vitest
  test: {
    globals: true,           // Permite usar describe, it y expect sin importarlos
    environment: 'jsdom',    // Simula el DOM para poder testear componentes de React
  },
})