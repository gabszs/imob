import { createFileRoute } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/web/components/ui/card";

export const Route = createFileRoute("/_protectedLayout/settings/usage")({
	component: UsagePage,
});

function UsagePage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-semibold text-2xl">Usage</h1>
				<p className="text-muted-foreground text-sm">
					View your usage statistics and activity
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Usage Statistics</CardTitle>
					<CardDescription>
						Track your activity and resource usage
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div className="rounded-lg border bg-card p-4">
							<div className="flex flex-col">
								<span className="text-muted-foreground text-xs uppercase tracking-wide">
									Total Requests
								</span>
								<span className="mt-2 font-bold text-2xl">-</span>
								<span className="text-muted-foreground text-xs">
									Coming soon
								</span>
							</div>
						</div>

						<div className="rounded-lg border bg-card p-4">
							<div className="flex flex-col">
								<span className="text-muted-foreground text-xs uppercase tracking-wide">
									This Month
								</span>
								<span className="mt-2 font-bold text-2xl">-</span>
								<span className="text-muted-foreground text-xs">
									Coming soon
								</span>
							</div>
						</div>

						<div className="rounded-lg border bg-card p-4">
							<div className="flex flex-col">
								<span className="text-muted-foreground text-xs uppercase tracking-wide">
									Last 7 Days
								</span>
								<span className="mt-2 font-bold text-2xl">-</span>
								<span className="text-muted-foreground text-xs">
									Coming soon
								</span>
							</div>
						</div>
					</div>

					<div className="rounded-lg border p-6 text-center">
						<p className="text-muted-foreground text-sm">
							Usage tracking features are coming soon. Check back later for
							detailed statistics about your activity.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
