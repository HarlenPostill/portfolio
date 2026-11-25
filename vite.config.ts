import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  define: {
    // The footer year baked into the prerendered HTML.
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
})
