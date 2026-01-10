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
