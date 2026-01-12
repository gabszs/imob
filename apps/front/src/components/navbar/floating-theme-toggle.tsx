import { Button } from "@/web/components/ui/button";
import { useTheme } from "@/web/lib/theme-provider";

export function FloatingThemeToggle() {
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		// If system or light, switch to dark
		// If dark, switch to light
		if (theme === "dark") {
			setTheme("light");
		} else {
			setTheme("dark");
		}
	};

	// Determine current effective theme for display
	const isDark =
		theme === "dark" ||
		(theme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);

	return (
		<div className="fixed right-6 bottom-6 z-50">
			<Button
				size="icon"
				variant="outline"
				className="h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-110"
				onClick={toggleTheme}
			>
				<span className={`text-2xl ${isDark ? "hidden" : ""}`}>☀️</span>
				<span className={`text-2xl ${isDark ? "" : "hidden"}`}>🌙</span>
				<span className="sr-only">Toggle theme</span>
			</Button>
		</div>
	);
}
