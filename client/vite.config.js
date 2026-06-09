import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const BACKEND_URL = "http://localhost:2024";

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: BACKEND_URL,
          changeOrigin: true,
        },
        "/assets": {
          target: BACKEND_URL,
          changeOrigin: true,
        },
      },
    },
    build: {
      sourcemap: mode === "development", // hanya aktif saat dev
      minify: mode === "production" ? "terser" : false, // terser di production, none di dev
      terserOptions: {
        compress: {
          drop_console: mode === "production", // hapus console.log di production
          drop_debugger: mode === "production", // hapus debugger di production
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"], // pisahkan vendor bundle
          },
        },
      },
    },
  };
});
