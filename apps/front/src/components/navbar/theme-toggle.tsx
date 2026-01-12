import { Button } from "@/web/components/ui/button";
import { useTheme } from "@/web/lib/theme-provider";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<Button
			size="icon"
			variant="ghost"
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
		>
			<span className="text-xl dark:hidden">☀️</span>
			<span className="hidden text-xl dark:block">🌙</span>
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
