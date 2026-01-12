import { Link } from "@tanstack/react-router";
import { UserMenu } from "@/web/components/navbar/user-menu";
import { Button } from "@/web/components/ui/button";

export function Header() {
	return (
		<div className="bg-background">
			<header className="fixed top-0 z-50 w-full bg-background/80 px-4 backdrop-blur-sm">
				<nav className="mx-auto flex max-w-5xl items-center justify-between py-1.5">
					<div className="flex items-center gap-2">
						<Link
							to="/"
							className="flex items-center gap-2 font-semibold text-lg text-primary"
						>
							<img src="/logo.svg" alt="TRAKI Logo" className="h-8 w-8" />
						</Link>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm" asChild>
							<Link to="/docs">Docs</Link>
						</Button>
						<Button variant="ghost" size="sm" asChild>
							<Link to="/privacy">Privacy</Link>
						</Button>
						<UserMenu />
					</div>
				</nav>
			</header>
			{/* Spacer to prevent content from going under fixed header */}
			<div className="h-12" />
		</div>
	);
}
