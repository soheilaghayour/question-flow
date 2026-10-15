/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Every icon is a decorative stroke glyph: set the shared attributes once
    // here so an .svg file holds only geometry and a new icon can't forget
    // aria-hidden. currentColor lets the icon inherit the surrounding text color.
    svgr({
      svgrOptions: {
        svgProps: {
          'aria-hidden': 'true',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '2',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@jobs': fileURLToPath(new URL('./jobs', import.meta.url)),
      '@profile': fileURLToPath(new URL('./profile.json', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
})
