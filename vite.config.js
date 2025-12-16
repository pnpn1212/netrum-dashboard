import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    proxy: {
      "/lite": {
        target: "https://node.netrumlabs.dev",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
