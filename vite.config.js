import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    })
  ],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    open: true, // Apre automaticamente il browser
    cors: true, // Abilita CORS
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'clsx': path.resolve(__dirname, 'node_modules/clsx/dist/clsx.js')
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'clsx',
    ],
    exclude: ['@mui/material/Unstable_Grid2']
  }
})
