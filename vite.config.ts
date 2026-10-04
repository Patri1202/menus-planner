// Importa la función de configuración oficial de Vite
import { defineConfig } from 'vite'

// Importa el plugin oficial que le enseña a Vite cómo compilar código React (.tsx)
import react from '@vitejs/plugin-react'

// Importa el plugin que conecta el compilador de Tailwind CSS directamente con Vite
import tailwindcss from '@tailwindcss/vite'

// Exporta la configuración final que usará Vite al ejecutarse
export default defineConfig({
  // Array de plugins activos en nuestro proyecto
  plugins: [
    // Activa la compilación de componentes React
    react(),
    // Activa la detección y generación automática de clases de Tailwind
    tailwindcss(),
  ],
})