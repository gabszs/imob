import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Loader } from "@/web/components/navbar/loader";
import { NotFound } from "@/web/components/not-found";
import { authClient } from "@/web/lib/auth-client";

export const Route = createFileRoute("/_protectedLayout")({
	component: ProtectedLayout,
	notFoundComponent: NotFound,
});

function ProtectedLayout() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Loader />;
	}

	if (!session?.user) {
		return <Navigate to="/sign-in" />;
	}

	return <Outlet />;
}
