//https://vite.dev/config/ 
/// <reference types="vitest" />

import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    css: true,
  },
  resolve: {
    alias: {
      // Use process.cwd() which is available in all contexts
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  
})
