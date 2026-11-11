import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const BASE_URL = env.BASE_URL;

	return {
		base: BASE_URL,
		plugins: [react(), tailwindcss()],
		server: {
			proxy: {
				"/public/uploads": {
					target: "http://localhost:7788",
					changeOrigin: true,
				},
				"/uploads": {
					target: "http://localhost:7788",
					changeOrigin: true,
				},
			},
		},
		build: {
			emptyOutDir: false,
		},
	};
});
