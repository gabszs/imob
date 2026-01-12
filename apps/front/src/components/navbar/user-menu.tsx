import { Link } from "@tanstack/react-router";
import { BookText, LogOutIcon, SettingsIcon, UserLock } from "lucide-react";
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
import { authClient } from "@/web/lib/auth-client";

const getFirstName = (
	user: { name?: string | null; email?: string | null } | null | undefined,
) => {
	if (!user) {
		return null;
	}
	return user.name?.trim().split(/\s+/)[0] ?? null;
};

const getInitials = (
	user: { name?: string | null; email?: string | null } | null | undefined,
) => {
	if (!user) return "U";

	if (user.name) {
		return user.name
			.split(" ")
			.map((part) => part.charAt(0))
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}

	return user.email?.charAt(0).toUpperCase() || "U";
};

export function UserMenu() {
	const { data: session } = authClient.useSession();

	if (!session || !session.user) {
		return (
			<Button variant="outline" asChild>
				<Link to="/sign-in">Sign In</Link>
			</Button>
		);
	}

	const displayFirstName = getFirstName(session.user) ?? "User";
	const initials = getInitials(session.user);
	const userImage = session.user.image;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="h-9 gap-2 px-3 hover:bg-accent"
				>
					<Avatar className="size-6">
						{userImage && (
							<AvatarImage src={userImage} alt={displayFirstName} />
						)}
						<AvatarFallback className="text-xs">{initials}</AvatarFallback>
					</Avatar>
					<span className="font-semibold text-sm">{displayFirstName}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex items-center gap-3">
						<Avatar className="size-10">
							{userImage && (
								<AvatarImage
									src={userImage}
									alt={session.user.name || "User"}
								/>
							)}
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div className="flex flex-col space-y-1">
							<p className="font-medium text-sm leading-none">
								{session.user.name || "User"}
							</p>
							<p className="text-muted-foreground text-xs leading-none">
								{session.user.email}
							</p>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link to="/settings">
						<SettingsIcon className="size-4" />
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
					<LogOutIcon className="size-4" />
					<span>Sign Out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
