/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const noAttr = () => {
  return {
    name: "no-attribute",
    transformIndexHtml(html) {
      return html.replace(`crossorigin`, "");
    },
  }
}

export default defineConfig({
  plugins: [react(),noAttr()],
  root: '../frontend/',
  publicDir: 'public/',
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTest.ts'],
    globals: true,
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'bundle.roger.js', // Output JS files as [name].js
        assetFileNames: '[name].[ext]', // Output assets as [name].[ext]
        chunkFileNames: 'bundle.roger.js' // Output chunk files as [name].js
      }
    },
    outDir: '../rogerlib/static/assets/'  // Build directly to backend folder
  },

})

