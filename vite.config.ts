import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    define: {
      "import.meta.env.TMDB_API_KEY": JSON.stringify(env.TMDB_API_KEY ?? ""),
      "import.meta.env.GOOGLE_CLIENT_ID": JSON.stringify(env.GOOGLE_CLIENT_ID ?? ""),
    },
    server: {
      host: "localhost",
      port: 5173,
      open: true,
      proxy: {
        "/api": {
          target: "http://localhost:8787",
          changeOrigin: true,
        },
      },
    },
  };
});
