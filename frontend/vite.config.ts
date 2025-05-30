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
  plugins: [react(),noAttr()
  ],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000'
    }
  },
  build: {
    outDir: '../rogerlib/static'  // Build directly to backend folder
  }

})

