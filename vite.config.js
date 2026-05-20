import { defineConfig, loadEnv } from 'vite'
import react                     from '@vitejs/plugin-react'
import path                      from 'path'
import { fileURLToPath }         from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // Load env variables for the current mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 5173,
      // Proxy API calls in dev to avoid CORS issues during development
      proxy: {
        '/api': {
          target     : env.VITE_API_BASE_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure     : false,
        },
      },
    },

    build: {
      outDir       : 'dist',
      sourcemap    : false,        // disable in prod for security
      minify       : 'esbuild',
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          // Code splitting — keeps initial bundle small
          manualChunks: {
            'react-vendor' : ['react', 'react-dom'],
            'router'       : ['react-router-dom'],
            'firebase'     : ['firebase/app', 'firebase/auth'],
            'ui'           : ['lucide-react', 'react-hot-toast'],
            'axios'        : ['axios'],
          },
        },
      },
    },

    preview: {
      port: 4173,
    },

    // Ensure environment variables are properly typed
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  }
})