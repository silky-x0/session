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
          // Yjs core
          'yjs-core': ['yjs'],
          // y-monaco binds Yjs to Monaco - contains Monaco code
          'yjs-monaco': ['y-monaco'],
          // Split React and React DOM
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split Framer Motion (animations)
          'framer-motion': ['framer-motion'],
          // Split icons
          'lucide-react': ['lucide-react'],
          // Monaco Editor
          'monaco-editor': ['@monaco-editor/react', 'monaco-editor'],
          // NOTE: no manual chunk for livekit — splitting it away from
          // its CJS dep `loglevel` breaks default-import interop
          // (`Ms.default.getLogger is not a function`). React.lazy on
          // VideoCall already code-splits it.
        },
      },
    },
    chunkSizeWarningLimit: 2500,
    minify: 'esbuild',
  },

  // LiveKit packages and their CJS dependency `loglevel` must be pre-bundled
  // explicitly because VideoCall is lazy-loaded (so Vite's initial scan misses them).
  // Pre-bundling them converts loglevel's CJS export to ESM so .getLogger is defined.
  optimizeDeps: {
    include: [
      '@monaco-editor/react',
      '@livekit/components-react',
      '@livekit/components-core',
      'livekit-client',
      'loglevel',
    ],
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
