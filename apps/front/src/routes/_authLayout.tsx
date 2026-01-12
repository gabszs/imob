import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Loader } from "@/web/components/navbar/loader";
import { NotFound } from "@/web/components/not-found";
import { authClient } from "@/web/lib/auth-client";

export const Route = createFileRoute("/_authLayout")({
	component: AuthLayout,
	notFoundComponent: NotFound,
});

function AuthLayout() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Loader />;
	}

	if (!session?.user) {
		return <Outlet />;
	}

	return <Navigate to="/analytics" />;
}
