import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/web/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/web/components/ui/card";
import { useTheme } from "@/web/lib/theme-provider";

export const Route = createFileRoute("/_protectedLayout/settings/appearance")({
	component: AppearanceSettings,
});

function AppearanceSettings() {
	const { setTheme, theme } = useTheme();

	const themeOptions = [
		{
			id: "light",
			label: "Light",
			description: "Light mode with bright colors",
			icon: Sun,
		},
		{
			id: "dark",
			label: "Dark",
			description: "Dark mode with muted colors",
			icon: Moon,
		},
		{
			id: "system",
			label: "System",
			description: "Follow system theme preference",
			icon: Sun,
		},
	] as const;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-semibold text-2xl">Appearance</h1>
				<p className="text-muted-foreground text-sm">
					Customize the appearance of your application
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Theme</CardTitle>
					<CardDescription>Choose your preferred theme mode</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{themeOptions.map((option) => {
						const isActive = theme === option.id;
						const Icon = option.icon;
						return (
							<Button
								key={option.id}
								variant={isActive ? "secondary" : "ghost"}
								className="flex h-auto w-full items-center justify-start gap-3 px-4 py-3 text-left"
								onClick={() => setTheme(option.id)}
							>
								<Icon className="h-5 w-5 flex-shrink-0" />
								<div className="flex flex-col gap-1">
									<span className="font-medium text-sm">{option.label}</span>
									<span className="text-muted-foreground text-xs">
										{option.description}
									</span>
								</div>
							</Button>
						);
					})}
				</CardContent>
			</Card>
		</div>
	);
}
