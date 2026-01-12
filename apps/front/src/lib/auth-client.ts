import { adminClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [emailOTPClient(), adminClient()],
	baseURL: import.meta.env.VITE_SERVER_URL + "/api/auth",
	fetchOptions: {
		credentials: "include",
	},
	socialProviders: {
		google: {
			enabled: true,
		},
		github: {
			enabled: true,
		},
	},
});
