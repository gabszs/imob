import {
	createFileRoute,
	Link,
	Navigate,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { cn } from "@/web/lib/utils";

export const Route = createFileRoute("/_protectedLayout/settings")({
	component: SettingsLayout,
});

const SETTINGS_NAV_ITEMS = [
	{
		to: "/settings/profile",
		label: "Profile",
		description: "View and edit your profile",
	},
	{
		to: "/settings/usage",
		label: "Usage",
		description: "View your usage statistics",
	},
	{
		to: "/settings/appearance",
		label: "Appearance",
		description: "Customize theme and UI",
	},
] as const;

function SettingsLayout() {
	const location = useRouterState({ select: (state) => state.location });
	const activePath = location.pathname ?? "";

	const navigationItems = SETTINGS_NAV_ITEMS.map((item) => {
		const isActive =
			activePath === item.to || activePath.startsWith(`${item.to}/`);
		return { ...item, isActive };
	});

	// Redirect if on /settings root
	if (activePath === "/settings" || activePath === "/settings/") {
		return <Navigate to="/settings/profile" replace />;
	}

	return (
		<div className="container mx-auto w-full min-w-0 max-w-[90vw] px-3 py-8 sm:max-w-4xl sm:px-4">
			<div className="mx-auto flex w-full gap-6">
				{/* Sidebar navigation */}
				<aside className="hidden w-64 flex-shrink-0 md:block">
					<div className="sticky top-20">
						<h2 className="mb-4 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
							Settings
						</h2>
						<div className="space-y-2">
							{navigationItems.map((item) => (
								<Link
									key={item.to}
									to={item.to}
									className={cn(
										"block rounded-lg border px-4 py-3 transition",
										item.isActive
											? "border-primary bg-primary/10 text-primary"
											: "border-transparent bg-muted/40 text-foreground hover:border-muted hover:bg-muted",
									)}
									preload="intent"
								>
									<div className="font-semibold text-sm">{item.label}</div>
									<p className="text-muted-foreground text-xs">
										{item.description}
									</p>
								</Link>
							))}
						</div>
					</div>
				</aside>

				{/* Mobile navigation - tabs style */}
				<div className="flex w-full flex-col md:hidden">
					<div className="mb-4 flex gap-2 overflow-x-auto">
						{navigationItems.map((item) => (
							<Link
								key={item.to}
								to={item.to}
								className={cn(
									"flex-shrink-0 rounded-lg border px-4 py-2 text-sm transition",
									item.isActive
										? "border-primary bg-primary/10 font-semibold text-primary"
										: "border-muted bg-muted/40 text-foreground hover:bg-muted",
								)}
								preload="intent"
							>
								{item.label}
							</Link>
						))}
					</div>
					<div className="flex-1">
						<Outlet />
					</div>
				</div>

				{/* Main content for desktop */}
				<section className="hidden min-w-0 flex-1 md:block">
					<Outlet />
				</section>
			</div>
		</div>
	);
}
