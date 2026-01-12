import { Link, useRouterState } from "@tanstack/react-router";
import {
	BarChart3,
	BookText,
	ChevronLeft,
	ChevronRight,
	Globe,
	Key,
	Link2,
	LogOut,
	Map,
	Megaphone,
	Network,
	Puzzle,
	Settings,
	Shield,
	Sparkles,
	UserLock,
} from "lucide-react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/web/components/ui/avatar";
import { Button } from "@/web/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/web/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/web/components/ui/tooltip";
import { authClient } from "@/web/lib/auth-client";
import { cn } from "@/web/lib/utils";
import { useSidebar } from "./sidebar-context";

const getInitials = (
	user: { name?: string | null; email?: string | null } | null | undefined,
) => {
	if (!user) return "U";
	if (user.name) {
		const names = user.name.trim().split(/\s+/);
		if (names.length >= 2) {
			return `${names[0][0]}${names[1][0]}`.toUpperCase();
		}
		return names[0][0].toUpperCase();
	}
	return user.email?.[0].toUpperCase() ?? "U";
};
interface NavItem {
	to: string;
	icon: React.ReactNode;
	label: string;
	adminOnly?: boolean;
}
const mainNavItems: NavItem[] = [
	{ to: "/map", icon: <Map className="h-5 w-5" />, label: "Map" },
	{
		to: "/analytics",
		icon: <BarChart3 className="h-5 w-5" />,
		label: "Analytics",
	},
	{
		to: "/campaigns",
		icon: <Megaphone className="h-5 w-5" />,
		label: "Campaigns",
	},
	{ to: "/events", icon: <Sparkles className="h-5 w-5" />, label: "Events" },
	{ to: "/traces", icon: <Network className="h-5 w-5" />, label: "Traces" },
	{ to: "/pixels", icon: <Link2 className="h-5 w-5" />, label: "Pixels" },
];
const developerNavItems: NavItem[] = [
	{ to: "/domains", icon: <Globe className="h-5 w-5" />, label: "Domains" },
	{ to: "/api-keys", icon: <Key className="h-5 w-5" />, label: "API Keys" },
	{
		to: "/integrations",
		icon: <Puzzle className="h-5 w-5" />,
		label: "Integrations",
	},
	{
		to: "/admin",
		icon: <Shield className="h-5 w-5" />,
		label: "Admin",
		adminOnly: true,
	},
];

export function CollapsibleSidebar() {
	const { isExpanded, setIsExpanded } = useSidebar();
	const { data: session } = authClient.useSession();
	const routerState = useRouterState();
	const user = session?.user;
	const initials = getInitials(user);
	const isActive = (path: string) => {
		return routerState.location.pathname === path;
	};
	return (
		<TooltipProvider delayDuration={0}>
			<div
				className={cn(
					"flex h-full flex-col border-border border-r bg-background transition-all duration-300",
					isExpanded ? "w-64" : "w-16",
				)}
			>
				<div className="flex h-14 items-center justify-between border-border px-3">
					{isExpanded ? (
						<>
							<Link
								to="/analytics"
								className="flex items-center gap-2 font-semibold text-lg text-primary"
							>
								<img src="/logo.svg" alt="TRAKI Logo" className="h-8 w-8" />
								<span>traki</span>
							</Link>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => setIsExpanded(false)}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
						</>
					) : (
						<button
							type="button"
							className="group mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent"
							onClick={() => setIsExpanded(true)}
						>
							<img
								src="/logo.svg"
								alt="TRAKI Logo"
								className="h-8 w-8 group-hover:hidden"
							/>
							<ChevronRight className="hidden h-5 w-5 group-hover:block" />
						</button>
					)}
				</div>
				<div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pt-1pb-3">
					{mainNavItems.map((item) => (
						<NavButton
							key={item.to}
							to={item.to}
							icon={item.icon}
							label={item.label}
							isExpanded={isExpanded}
							isActive={isActive(item.to)}
						/>
					))}
					{isExpanded && (
						<div className="border-border border-t px-3 pt-2 pb-2">
							<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
								Developer
							</p>
						</div>
					)}
					{developerNavItems
						.filter((item) => !item.adminOnly || user?.role === "admin")
						.map((item) => (
							<NavButton
								key={item.to}
								to={item.to}
								icon={item.icon}
								label={item.label}
								isExpanded={isExpanded}
								isActive={isActive(item.to)}
							/>
						))}
				</div>
				<div className="border-border border-t p-3">
					{isExpanded ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="flex w-full items-center gap-3 rounded-xl border border-border bg-accent/50 p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
								>
									<Avatar className="h-8 w-8">
										{user?.image && (
											<AvatarImage src={user.image} alt={user.name || "User"} />
										)}
										<AvatarFallback className="bg-primary font-semibold text-primary-foreground text-sm">
											{initials}
										</AvatarFallback>
									</Avatar>
									<div className="flex min-w-0 flex-1 flex-col text-left">
										<p className="truncate font-medium text-sm">
											{user?.name || "User"}
										</p>
									</div>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" side="top">
								<DropdownMenuLabel className="font-normal">
									<p className="text-muted-foreground text-xs leading-none">
										{user?.email}
									</p>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link to="/settings">
										<Settings className="size-4" />
										<span>Settings</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link to="/docs">
										<BookText className="size-4" />
										<span>Docs</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link to="/privacy">
										<UserLock className="size-4" />
										<span>Privacy Policy</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => {
										authClient.signOut({
											fetchOptions: {
												onSuccess: () => {
													window.location.href = "/";
												},
											},
										});
									}}
								>
									<LogOut className="size-4" />
									<span>Sign Out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-accent/50 font-semibold text-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
								>
									<Avatar className="h-8 w-8">
										{user?.image && (
											<AvatarImage src={user.image} alt={user.name || "User"} />
										)}
										<AvatarFallback className="bg-primary font-semibold text-primary-foreground text-sm">
											{initials}
										</AvatarFallback>
									</Avatar>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" side="right">
								<DropdownMenuLabel className="font-normal">
									<p className="text-muted-foreground text-xs leading-none">
										{user?.email}
									</p>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link to="/settings">
										<Settings className="size-4" />
										<span>Settings</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link to="/docs">
										<BookText className="size-4" />
										<span>Docs</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link to="/privacy">
										<UserLock className="size-4" />
										<span>Privacy Policy</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => {
										authClient.signOut({
											fetchOptions: {
												onSuccess: () => {
													window.location.href = "/";
												},
											},
										});
									}}
								>
									<LogOut className="size-4" />
									<span>Sign Out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>
		</TooltipProvider>
	);
}
interface NavButtonProps {
	to: string;
	icon: React.ReactNode;
	label: string;
	isExpanded: boolean;
	isActive: boolean;
}
function NavButton({ to, icon, label, isExpanded, isActive }: NavButtonProps) {
	const button = (
		<Button
			variant="ghost"
			className={cn(
				"w-full justify-start gap-3 border border-transparent py-3 hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600",
				!isExpanded && "justify-center px-2",
				isActive &&
					"border-gray-300 bg-accent pl-4 shadow-sm dark:border-gray-600",
			)}
			asChild
		>
			<Link to={to}>
				{icon}
				{isExpanded && <span className="text-sm">{label}</span>}
			</Link>
		</Button>
	);
	if (!isExpanded) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>{button}</TooltipTrigger>
				<TooltipContent side="right">
					<p>{label}</p>
				</TooltipContent>
			</Tooltip>
		);
	}
	return button;
}
