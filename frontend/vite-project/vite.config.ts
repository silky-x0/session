import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      "sbjct-benefit-flight-depend.trycloudflare.com"
    ]
  },

  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})


