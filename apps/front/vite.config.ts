import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [
			tailwindcss(),
			tanstackRouter({
				target: "react",
				autoCodeSplitting: true,
			}),
			react(),
		],
		resolve: {
			alias: {
				"@/front": path.resolve(__dirname, "./src"),
				"@/web": path.resolve(__dirname, "./src"),
				"@/server": path.resolve(__dirname, "../server/src"),
			},
		},
		server: {
			port: Number(env.VITE_PORT) || 3002,
			host: true,
		},
	};
});
