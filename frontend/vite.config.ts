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
    sourcemap: false, // Disable source maps in production to save memory
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Monaco Editor (largest dependency)
          'monaco-editor': ['@monaco-editor/react'],
          // Split Yjs and WebSocket libraries
          'yjs-core': ['yjs', 'y-websocket', 'y-monaco'],
          // Split React and React DOM
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split Framer Motion (animations)
          'framer-motion': ['framer-motion'],
          // Split icons
          'lucide-react': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit
    minify: 'esbuild', // Use esbuild for fast minification
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
