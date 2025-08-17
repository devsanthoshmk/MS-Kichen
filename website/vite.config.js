import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
    resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'
    }
    },
  server: {
    host: '0.0.0.0',           // Listen on all interfaces
    strictPort: true,          // Prevent port auto-change
    allowedHosts: [
      'living-prawn-broadly.ngrok-free.app'
    ],
    hmr: {
      clientPort: 443,          // Force HMR to use HTTPS port for ngrok
    }
  }
})
