import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { AppBackground } from "@/web/components/background";
import { FloatingThemeToggle } from "@/web/components/navbar/floating-theme-toggle";
import { Header } from "@/web/components/navbar/header";
import { NotFound } from "@/web/components/not-found";
import { CollapsibleSidebar } from "@/web/components/sidebar/CollapsibleSidebar";
import { SidebarProvider } from "@/web/components/sidebar/sidebar-context";
import { Toaster } from "@/web/components/ui/sonner";
import { authClient } from "@/web/lib/auth-client";
import type { AuthContextValue } from "@/web/lib/auth-context";
import type { orpc } from "@/web/lib/orpc";
import { ThemeProvider } from "@/web/lib/theme-provider";
import "../index.css";

export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
	auth: AuthContextValue;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	notFoundComponent: NotFound,
	head: () => ({
		meta: [
			{
				title: "traki",
			},
			{
				name: "description",
				content:
					"traki is a starter kit for full-stack React Vite apps deployed to Cloudflare Workers",
			},
		],
	}),
});

function RootComponent() {
	const routerState = useRouterState();
	const { data: session } = authClient.useSession();
	const isAuthPage = routerState.location.pathname.startsWith("/sign-");
	const isLandingPage = routerState.location.pathname === "/";
	const isPrivacyPage = routerState.location.pathname === "/privacy";
	const isDocsPage = routerState.location.pathname === "/docs";
	const isLoggedIn = !!session?.user;

	// Show header on landing, auth, privacy and docs pages when NOT logged in
	const showHeader =
		(isLandingPage || isAuthPage || isPrivacyPage || isDocsPage) && !isLoggedIn;
	// Show sidebar when logged in and not on auth pages
	const showSidebar = isLoggedIn && !isAuthPage;

	return (
		<>
			<HeadContent />
			<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
				<SidebarProvider>
					<AppBackground />
					{showSidebar ? (
						// Layout with sidebar for authenticated pages
						<div className="relative z-10 flex h-svh">
							<CollapsibleSidebar />
							<div className="flex-1 overflow-auto">
								<Outlet />
							</div>
						</div>
					) : (
						// Layout without sidebar for landing and auth pages
						<div className="relative z-10 grid h-svh grid-rows-[auto_1fr]">
							{showHeader && <Header />}
							<Outlet />
						</div>
					)}
					<FloatingThemeToggle />
					<Toaster richColors />
				</SidebarProvider>
			</ThemeProvider>
		</>
	);
}
