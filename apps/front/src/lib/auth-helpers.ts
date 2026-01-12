import { authClient } from "./auth-client";

let cachedHeaders: HeadersInit | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get authentication headers for API requests
 * Centralized function to avoid duplication across client wrappers
 * Uses caching to avoid excessive getSession() calls
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
	const now = Date.now();

	// Return cached headers if still valid
	if (cachedHeaders && now - cacheTimestamp < CACHE_DURATION) {
		return cachedHeaders;
	}

	const session = await authClient.getSession();
	if (!session?.data?.session?.token) {
		throw new Error("Not authenticated");
	}

	cachedHeaders = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${session.data.session.token}`,
	};
	cacheTimestamp = now;

	return cachedHeaders;
}
