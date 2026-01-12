import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useMemo } from "react";
import ReactDOM from "react-dom/client";
import {
	type AuthContextValue,
	AuthProvider,
	useAuth,
} from "@/web/lib/auth-context";
import { orpc, queryClient } from "@/web/lib/orpc";
import { routeTree } from "./routeTree.gen";

// Create router with wrapped query client
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	context: { queryClient, orpc, auth: {} as AuthContextValue },
	Wrap: function WrapComponent({ children }) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	},
});

function AppRouter() {
	const auth = useAuth();
	const routerContext = useMemo(() => ({ queryClient, orpc, auth }), [auth]);

	return <RouterProvider router={router} context={routerContext} />;
}

// Register router for typesafety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Render the app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<AuthProvider>
			<AppRouter />
		</AuthProvider>,
	);
}
