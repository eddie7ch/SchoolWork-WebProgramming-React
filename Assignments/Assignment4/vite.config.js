import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    css: {
      modules: {
        // Use non-scoped class names so tests can assert on class names
        // without unpredictable hash suffixes (e.g. .active stays 'active')
        classNameStrategy: 'non-scoped',
      },
    },
  },
})
