import { createFileRoute, Navigate } from "@tanstack/react-router";
import { LandingPage } from "@/web/components/LandingPage";
import { Loader } from "@/web/components/navbar/loader";
import { authClient } from "@/web/lib/auth-client";

export const Route = createFileRoute("/")({
	component: IndexPage,
});

function IndexPage() {
	const { data: session, isPending } = authClient.useSession();

	// Show loader while checking authentication
	if (isPending) {
		return <Loader />;
	}

	// If user is logged in, redirect to analytics
	if (session?.user) {
		return <Navigate to="/analytics" />;
	}

	// If user is not logged in, show landing page with login
	return <LandingPage />;
}
