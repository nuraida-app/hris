import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL;

  console.log("Current mode:", mode);
  console.log("Using API URL:", apiUrl);

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": apiUrl,
        "/assets": apiUrl,
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
