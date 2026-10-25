import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'

// Build marker shown in the footer so a deployed build can be identified at a glance.
const commit = (() => { try { return execSync('git rev-parse --short HEAD').toString().trim() } catch { return 'local' } })()
const builtAt = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
const BUILD_ID = `${commit} · ${builtAt}`
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
})
