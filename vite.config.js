import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React y React Router en su propio chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // AG Grid es muy grande, separarlo en su propio chunk
          'ag-grid': ['ag-grid-community', 'ag-grid-enterprise', 'ag-grid-react'],

          // Cube.js en su propio chunk
          'cube-vendor': ['@cubejs-client/core'],

          // Todas las definiciones de niveles en un chunk separado
          'level-definitions': [
            './src/pages/dashboard/levels/categoria.js',
            './src/pages/dashboard/levels/cliente.js',
            './src/pages/dashboard/levels/vendedor.js',
            './src/pages/dashboard/levels/canal.js',
            './src/pages/dashboard/levels/zona.js',
            './src/pages/dashboard/levels/marca.js',
            './src/pages/dashboard/levels/centro.js',
            './src/pages/dashboard/levels/numero_factura.js',
            './src/pages/dashboard/levels/familia.js',
            './src/pages/dashboard/levels/jefe_categoria.js',
            './src/pages/dashboard/levels/region.js',
            './src/pages/dashboard/levels/origen.js',
            './src/pages/dashboard/levels/sociedad.js',
            './src/pages/dashboard/levels/um_venta.js',
            './src/pages/dashboard/levels/direccion.js',
            './src/pages/dashboard/levels/especialidad.js',
            './src/pages/dashboard/levels/gerencia.js',
            './src/pages/dashboard/levels/sucursal.js',
            './src/pages/dashboard/levels/holding.js',
          ],
        },
      },
    },
    // Aumentar el límite de advertencia para AG Grid que es inevitablemente grande
    chunkSizeWarningLimit: 1000,
  },
})
