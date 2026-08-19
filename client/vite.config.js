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
    },
  },
});