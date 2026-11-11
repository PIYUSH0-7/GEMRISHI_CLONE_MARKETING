// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig(({ mode }) => {

//   const env = loadEnv(mode, process.cwd(), "");
// 	const BASE_URL = env.VITE_BASE_SITE_URL;
//   return {
// 		base: BASE_URL,
// 		plugins: [react(), tailwindcss()],
// 	};
// })

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const BASE_URL = env.VITE_BASE_SITE_URL;

  return {
    base: BASE_URL,

    plugins: [
      react(),
      tailwindcss(),
    ],

    server: {
      port: 5174,
      proxy: {
        "/public": "http://localhost:7788",
        "/uploads": "http://localhost:7788",
        "/api": "http://localhost:7788",
      },
    },

    build: {
      emptyOutDir: false,
    },
  };
});
