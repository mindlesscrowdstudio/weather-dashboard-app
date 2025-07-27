import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use process.cwd() which is available in all contexts
      "@": path.resolve(process.cwd(), "src"),
    },
  },
})
