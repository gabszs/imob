import { hc } from "hono/client";
import type { AppType } from "@/server/index";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8787";

// Create Hono RPC client
export const honoClient = hc<AppType>(API_BASE_URL, {
	init: {
		credentials: "include",
	},
});

export type HonoClient = typeof honoClient;
