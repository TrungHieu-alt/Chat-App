import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { readdirSync, cpSync, statSync } from 'fs'

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
    {
      // plugin nhỏ ép copy toàn bộ src/assets vào dist/assets
      name: 'copy-all-assets',
      closeBundle() {
        const srcDir = path.resolve(__dirname, 'src/assets')
        const destDir = path.resolve(__dirname, 'dist/assets')
        try {
          cpSync(srcDir, destDir, { recursive: true })
          console.log('✅ Copied all assets from src/assets to dist/assets')
        } catch (err) {
          console.warn('⚠️ No assets folder found or copy failed:', err.message)
        }
      },
    },
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
