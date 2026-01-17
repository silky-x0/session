import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      "sbjct-benefit-flight-depend.trycloudflare.com",
      "mock-collab-editor.onrender.com",
    ],
  },

  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Yjs and WebSocket libraries
          'yjs-core': ['yjs', 'y-websocket', 'y-monaco'],
          // Split React and React DOM
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split Framer Motion (animations)
          'framer-motion': ['framer-motion'],
          // Split icons
          'lucide-react': ['lucide-react'],
          // Monaco will be lazy loaded separately
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
  },

  // Optimize Monaco - only include needed languages
  optimizeDeps: {
    include: ['@monaco-editor/react'],
  },

  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
