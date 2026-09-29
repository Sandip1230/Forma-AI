import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Forwards fetch("/api/...") calls (see src/services/api.js) to the
      // Express server so `npm run dev` doesn't need VITE_API_URL set or a
      // second CORS hop during local development.
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      // checkHealth() in src/services/api.js hits /health (not /api/health)
      // since that's where the Express route lives, so it needs its own
      // proxy entry or dev-mode requests fall through to Vite's SPA index.
      "/health": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});