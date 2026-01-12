import { createFileRoute, Navigate } from "@tanstack/react-router";
import {
	Ban,
	CheckCircle,
	ChevronDown,
	ChevronRight,
	Copy,
	Key,
	Plus,
	RefreshCw,
	Shield,
	Trash2,
	UserCog,
	Users,
	X,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSidebar } from "@/web/components/sidebar/sidebar-context";
import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import { CopyableId } from "@/web/components/ui/copyable-id";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/web/components/ui/dialog";
import { Input } from "@/web/components/ui/input";
import { Label } from "@/web/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/web/components/ui/select";
import { Skeleton } from "@/web/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/web/components/ui/table";
import { Textarea } from "@/web/components/ui/textarea";
import { useToast } from "@/web/hooks/use-toast";
import { authClient } from "@/web/lib/auth-client";

export const Route = createFileRoute("/_protectedLayout/admin")({
	component: AdminPage,
});

interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string | null;
	createdAt: Date;
	updatedAt: Date;
	role?: string;
	banned?: boolean;
	banReason?: string | null;
	banExpires?: Date | null;
}

interface Session {
	id: string;
	token: string;
	userId: string;
	expiresAt: Date;
	ipAddress?: string | null;
	userAgent?: string | null;
	impersonatedBy?: string | null;
	timezone?: string | null;
	city?: string | null;
	country?: string | null;
	region?: string | null;
	regionCode?: string | null;
	colo?: string | null;
	latitude?: string | null;
	longitude?: string | null;
}

function getCountryFlag(countryCode: string): string {
	const codePoints = countryCode
		.toUpperCase()
		.split("")
		.map((char) => 127397 + char.charCodeAt(0));
	return String.fromCodePoint(...codePoints);
}

function AdminPage() {
	const { data: session } = authClient.useSession();
	const { toast } = useToast();

	// Check if user is admin
	const isAdmin = session?.user?.role === "admin";

	// States
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [userSessions, setUserSessions] = useState<Session[]>([]);
	const [isLoadingSessions, setIsLoadingSessions] = useState(false);

	// Dialogs
	const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
	const [isSetRoleOpen, setIsSetRoleOpen] = useState(false);
	const [isBanUserOpen, setIsBanUserOpen] = useState(false);
	const [isUnbanUserOpen, setIsUnbanUserOpen] = useState(false);
	const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(false);
	const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
	const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);

	// Form states
	const [createUserForm, setCreateUserForm] = useState({
		email: "",
		password: "",
		name: "",
		role: "user",
	});
	const [newRole, setNewRole] = useState("user");
	const [banForm, setBanForm] = useState({
		reason: "",
		expiresInDays: "",
	});
	const [newPassword, setNewPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");
	const [isCopied, setIsCopied] = useState(false);

	// Load users
	useEffect(() => {
		if (isAdmin) {
			loadUsers();
		}
	}, [isAdmin]);

	const loadUsers = async () => {
		setIsLoading(true);
		try {
			const result = await authClient.admin.listUsers({
				query: {},
			});
			setUsers((result.data?.users || []) as User[]);
		} catch (error) {
			console.error("Failed to load users:", error);
			toast({
				title: "Error",
				description: "Failed to load users",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const loadUserSessions = async (userId: string) => {
		setIsLoadingSessions(true);
		try {
			const result = await authClient.admin.listUserSessions({
				userId,
			});
			setUserSessions((result.data?.sessions || []) as Session[]);
		} catch (error) {
			console.error("Failed to load sessions:", error);
			toast({
				title: "Error",
				description: "Failed to load user sessions",
				variant: "destructive",
			});
		} finally {
			setIsLoadingSessions(false);
		}
	};

	const toggleUserExpand = (userId: string) => {
		const newExpanded = new Set(expandedUsers);
		if (newExpanded.has(userId)) {
			newExpanded.delete(userId);
			if (selectedUserId === userId) {
				setSelectedUserId(null);
				setUserSessions([]);
			}
		} else {
			newExpanded.add(userId);
			setSelectedUserId(userId);
			loadUserSessions(userId);
		}
		setExpandedUsers(newExpanded);
	};

	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			await authClient.admin.createUser({
				email: createUserForm.email,
				password: createUserForm.password,
				name: createUserForm.name,
				role: createUserForm.role as "user" | "admin",
			});
			toast({
				title: "Success",
				description: "User successfully created",
			});
			setIsCreateUserOpen(false);
			setCreateUserForm({ email: "", password: "", name: "", role: "user" });
			loadUsers();
		} catch (error) {
			console.error("Failed to create user:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to create user",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSetRole = async () => {
		if (!selectedUserId) return;
		setIsSubmitting(true);
		try {
			await authClient.admin.setRole({
				userId: selectedUserId,
				role: newRole as "user" | "admin",
			});
			toast({
				title: "Success",
				description: "User role updated successfully",
			});
			setIsSetRoleOpen(false);
			loadUsers();
		} catch (error) {
			console.error("Failed to set role:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to set role",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleBanUser = async () => {
		if (!selectedUserId) return;
		setIsSubmitting(true);
		try {
			await authClient.admin.banUser({
				userId: selectedUserId,
				banReason: banForm.reason,
				banExpiresIn: banForm.expiresInDays
					? Number.parseInt(banForm.expiresInDays, 10) * 24 * 60 * 60
					: undefined,
			});
			toast({
				title: "Success",
				description: "User banned successfully",
			});
			setIsBanUserOpen(false);
			setBanForm({ reason: "", expiresInDays: "" });
			loadUsers();
		} catch (error) {
			console.error("Failed to ban user:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to ban user",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUnbanUser = async () => {
		if (!selectedUserId) return;
		setIsSubmitting(true);
		try {
			await authClient.admin.unbanUser({
				userId: selectedUserId,
			});
			toast({
				title: "Success",
				description: "User unbanned successfully",
			});
			setIsUnbanUserOpen(false);
			loadUsers();
		} catch (error) {
			console.error("Failed to unban user:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to unban user",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSetPassword = async () => {
		if (!selectedUserId) return;
		setIsSubmitting(true);
		try {
			await authClient.admin.setUserPassword({
				userId: selectedUserId,
				newPassword: newPassword,
			});
			toast({
				title: "Success",
				description: "Password updated successfully",
			});
			setIsSetPasswordOpen(false);
			setNewPassword("");
		} catch (error) {
			console.error("Failed to set password:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to set password",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRevokeSession = async (sessionToken: string) => {
		try {
			await authClient.admin.revokeUserSession({
				sessionToken,
			});
			toast({
				title: "Success",
				description: "Session revoked successfully",
			});
			if (selectedUserId) {
				loadUserSessions(selectedUserId);
			}
		} catch (error) {
			console.error("Failed to revoke session:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to revoke session",
				variant: "destructive",
			});
		}
	};

	const handleRevokeUserSessions = async (userId: string) => {
		try {
			await authClient.admin.revokeUserSessions({
				userId,
			});
			toast({
				title: "Success",
				description: "All user sessions revoked successfully",
			});
			if (selectedUserId === userId) {
				loadUserSessions(userId);
			}
		} catch (error) {
			console.error("Failed to revoke sessions:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to revoke user sessions",
				variant: "destructive",
			});
		}
	};

	const handleImpersonate = async () => {
		if (!selectedUserId) return;
		setIsSubmitting(true);
		try {
			await authClient.admin.impersonateUser({
				userId: selectedUserId,
			});
			toast({
				title: "Success",
				description: "Impersonation started. Opening in new tab...",
			});

			// Open in new tab instead of reloading current page
			setTimeout(() => {
				const newTab = window.open(window.location.origin, "_blank");
				if (!newTab) {
					toast({
						title: "Popup Blocked",
						description: "Please allow popups for this site and try again.",
						variant: "destructive",
					});
				}
				setIsSubmitting(false);
				setIsImpersonateOpen(false);
			}, 500);
		} catch (error) {
			console.error("Failed to impersonate:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to impersonate user",
				variant: "destructive",
			});
			setIsSubmitting(false);
		}
	};

	const handleCopyEmail = () => {
		if (selectedUserId) {
			const user = users.find((u) => u.id === selectedUserId);
			if (user?.email) {
				navigator.clipboard.writeText(user.email);
				setIsCopied(true);
				setTimeout(() => setIsCopied(false), 2000);
				toast({
					title: "Copied",
					description: "Email copied to clipboard",
				});
			}
		}
	};

	const handleDeleteUser = async () => {
		if (!selectedUserId) return;
		setIsSubmitting(true);
		try {
			await authClient.admin.removeUser({
				userId: selectedUserId,
			});
			toast({
				title: "Success",
				description: "User deleted successfully",
			});
			setIsDeleteUserOpen(false);
			loadUsers();
		} catch (error) {
			console.error("Failed to delete user:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to delete user",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const formatDate = (date: Date | string | number | null | undefined) => {
		if (!date) return "N/A";
		try {
			return new Date(date).toLocaleString("en-US", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return "Invalid date";
		}
	};

	const { isExpanded } = useSidebar();

	if (!isAdmin) {
		return <Navigate to="/" />;
	}

	return (
		<div className="flex h-full flex-col">
			<div
				className={`flex items-center gap-3 bg-background pt-8 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				<Shield className="h-4 w-4" />
				<h1 className="font-semibold text-base">Admin Panel</h1>
			</div>
			<div
				className={`flex-1 overflow-y-scroll pt-3 pb-5 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				<div className="space-y-4">
					<div
						className="w-full rounded-lg border text-card-foreground shadow-sm"
						style={{ backgroundColor: "hsl(var(--background))" }}
					>
						<div className="border-border border-b px-6 py-4">
							<div className="mb-3">
								<h2 className="flex items-center gap-2 font-medium text-foreground text-sm">
									<Users className="h-4 w-4" />
									Users Management
								</h2>
							</div>
							<div className="flex items-center justify-between gap-4">
								<p className="text-muted-foreground text-sm">
									{users.length === 0
										? "No users yet"
										: `Showing ${users.length} user${users.length === 1 ? "" : "s"}`}
								</p>
								<div className="flex gap-1.5">
									<button
										type="button"
										onClick={loadUsers}
										disabled={isLoading}
										className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent"
										title="Refresh users"
									>
										<RefreshCw
											className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
										/>
									</button>
									<button
										type="button"
										onClick={() => setIsCreateUserOpen(true)}
										className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-medium text-sm transition-colors hover:bg-accent"
									>
										<Plus className="h-4 w-4" />
										<span className="hidden md:inline">Create User</span>
									</button>
								</div>
							</div>
						</div>
						<div className="p-4">
							{isLoading ? (
								<div className="space-y-3">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
								</div>
							) : users.length === 0 ? (
								<div className="py-12 text-center">
									<Users className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
									<h3 className="mb-2 font-medium text-sm">No Users</h3>
									<p className="mb-4 text-muted-foreground text-xs">
										Create your first user to get started
									</p>
									<Button
										onClick={() => setIsCreateUserOpen(true)}
										className="gap-2"
									>
										<Plus className="h-4 w-4" />
										Create User
									</Button>
								</div>
							) : (
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-[50px]" />
												<TableHead>Name</TableHead>
												<TableHead>Email</TableHead>
												<TableHead>Role</TableHead>
												<TableHead>Status</TableHead>
												<TableHead className="w-[100px] text-right">
													Actions
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{users.map((user) => (
												<>
													<TableRow
														key={user.id}
														className="cursor-pointer"
														onClick={() => toggleUserExpand(user.id)}
													>
														<TableCell>
															<button
																type="button"
																className="flex h-6 w-6 items-center justify-center rounded-md border-0 bg-transparent p-0 transition-colors hover:bg-accent"
																onClick={(e) => {
																	e.stopPropagation();
																	toggleUserExpand(user.id);
																}}
															>
																{expandedUsers.has(user.id) ? (
																	<ChevronDown className="h-4 w-4" />
																) : (
																	<ChevronRight className="h-4 w-4" />
																)}
															</button>
														</TableCell>
														<TableCell className="max-w-[150px] truncate font-medium text-sm">
															{user.name}
														</TableCell>
														<TableCell className="text-muted-foreground text-xs">
															{user.email}
														</TableCell>
														<TableCell className="text-xs">
															<Badge variant="secondary">
																{user.role || "user"}
															</Badge>
														</TableCell>
														<TableCell className="text-xs">
															{user.banned ? (
																<Badge variant="destructive">
																	<Ban className="mr-1 h-3 w-3" />
																	Banned
																</Badge>
															) : (
																<Badge variant="outline">
																	<CheckCircle className="mr-1 h-3 w-3" />
																	Active
																</Badge>
															)}
														</TableCell>
														<TableCell className="text-right">
															<div
																className="flex items-center justify-end gap-1.5"
																onClick={(e) => e.stopPropagation()}
															>
																<button
																	type="button"
																	className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
																	onClick={() => {
																		setSelectedUserId(user.id);
																		setNewRole(user.role || "user");
																		setIsSetRoleOpen(true);
																	}}
																	title="Set Role"
																>
																	<UserCog className="h-3.5 w-3.5" />
																</button>
																{user.banned ? (
																	<button
																		type="button"
																		className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
																		onClick={() => {
																			setSelectedUserId(user.id);
																			setIsUnbanUserOpen(true);
																		}}
																		title="Unban User"
																	>
																		<CheckCircle className="h-3.5 w-3.5 text-green-600" />
																	</button>
																) : (
																	<button
																		type="button"
																		className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
																		onClick={() => {
																			setSelectedUserId(user.id);
																			setIsBanUserOpen(true);
																		}}
																		title="Ban User"
																	>
																		<Ban className="h-3.5 w-3.5 text-orange-600" />
																	</button>
																)}
																<button
																	type="button"
																	className="group flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
																	onClick={() => {
																		setSelectedUserId(user.id);
																		setDeleteConfirmation("");
																		setIsDeleteUserOpen(true);
																	}}
																	title="Delete User"
																>
																	<Trash2 className="h-3.5 w-3.5 group-hover:text-red-500" />
																</button>
															</div>
														</TableCell>
													</TableRow>
													{expandedUsers.has(user.id) && (
														<TableRow key={`${user.id}-expanded`}>
															<TableCell colSpan={6} className="bg-muted/50">
																<div className="space-y-3 p-3">
																	<h4 className="font-semibold text-xs">
																		User Details
																	</h4>
																	{/* User Details */}
																	<div className="grid gap-3 md:grid-cols-2">
																		<div className="flex items-center gap-2">
																			<span className="text-muted-foreground text-xs">
																				User ID:
																			</span>
																			<CopyableId
																				id={user.id}
																				onCopy={() => {
																					toast({
																						title: "Copied!",
																						description:
																							"User ID copied to clipboard",
																					});
																				}}
																			/>
																		</div>
																		<div>
																			<span className="text-muted-foreground text-xs">
																				Created:
																			</span>
																			<span className="ml-2 text-xs">
																				{formatDate(user.createdAt)}
																			</span>
																		</div>
																		<div>
																			<span className="font-medium text-xs">
																				Email Verified:
																			</span>
																			<Badge
																				variant={
																					user.emailVerified
																						? "default"
																						: "outline"
																				}
																				className="ml-2 text-xs"
																			>
																				{user.emailVerified ? "Yes" : "No"}
																			</Badge>
																		</div>
																		{user.banned && (
																			<>
																				<div>
																					<span className="text-muted-foreground text-xs">
																						Ban Reason:
																					</span>
																					<span className="ml-2 text-xs">
																						{user.banReason || "N/A"}
																					</span>
																				</div>
																				<div>
																					<span className="text-muted-foreground text-xs">
																						Ban Expires:
																					</span>
																					<span className="ml-2 text-xs">
																						{formatDate(user.banExpires)}
																					</span>
																				</div>
																			</>
																		)}
																	</div>

																	{/* Actions */}
																	<div className="flex flex-wrap gap-1.5 pt-1.5">
																		<button
																			type="button"
																			onClick={() => {
																				setSelectedUserId(user.id);
																				setIsSetPasswordOpen(true);
																			}}
																			className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent"
																		>
																			<Key className="h-4 w-4" />
																			<span className="hidden md:inline">
																				Set Password
																			</span>
																		</button>
																		<button
																			type="button"
																			onClick={() => {
																				setSelectedUserId(user.id);
																				setIsImpersonateOpen(true);
																			}}
																			className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent"
																		>
																			<UserCog className="h-4 w-4" />
																			<span className="hidden md:inline">
																				Impersonate
																			</span>
																		</button>
																		<button
																			type="button"
																			onClick={() =>
																				handleRevokeUserSessions(user.id)
																			}
																			className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent"
																		>
																			<XCircle className="h-4 w-4" />
																			<span className="hidden md:inline">
																				Revoke All Sessions
																			</span>
																		</button>
																	</div>

																	{/* Sessions */}
																	<div className="rounded-lg border bg-background p-3">
																		<div className="mb-1.5 flex items-center justify-between">
																			<h4 className="font-semibold text-xs">
																				Active Sessions
																			</h4>
																			<button
																				type="button"
																				onClick={() =>
																					loadUserSessions(user.id)
																				}
																				disabled={isLoadingSessions}
																				className="flex h-6 w-6 items-center justify-center rounded-md border border-transparent transition-colors hover:bg-accent disabled:opacity-50"
																				title="Refresh sessions"
																			>
																				<RefreshCw
																					className={`h-3.5 w-3.5 ${isLoadingSessions ? "animate-spin" : ""}`}
																				/>
																			</button>
																		</div>
																		{userSessions.length === 0 ? (
																			<p className="text-muted-foreground text-xs">
																				No active sessions
																			</p>
																		) : (
																			<div className="space-y-1.5">
																				{userSessions.map((sess) => {
																					const location = [
																						sess.city,
																						sess.region,
																					]
																						.filter(Boolean)
																						.join(", ");
																					const countryWithFlag = sess.country
																						? `${sess.country} ${getCountryFlag(sess.country)}`
																						: null;

																					return (
																						<div
																							key={sess.id}
																							className="flex items-start justify-between rounded border bg-muted/50 p-2"
																						>
																							<div className="flex-1 space-y-1">
																								<div className="flex items-center gap-2">
																									<span className="text-muted-foreground text-xs">
																										Session ID:
																									</span>
																									<span className="font-mono text-xs">
																										{sess.id}
																									</span>
																								</div>

																								<div className="grid grid-cols-2 gap-x-4 gap-y-1">
																									<div className="flex items-center gap-2">
																										<span className="text-muted-foreground text-xs">
																											IP:
																										</span>
																										<span className="text-xs">
																											{sess.ipAddress || "N/A"}
																										</span>
																									</div>

																									{sess.userAgent && (
																										<div className="flex items-center gap-2">
																											<span className="text-muted-foreground text-xs">
																												Device:
																											</span>
																											<span className="truncate text-xs">
																												{sess.userAgent}
																											</span>
																										</div>
																									)}

																									{location && (
																										<div className="flex items-center gap-2">
																											<span className="text-muted-foreground text-xs">
																												Location:
																											</span>
																											<span className="text-xs">
																												{location}
																											</span>
																										</div>
																									)}

																									{countryWithFlag && (
																										<div className="flex items-center gap-2">
																											<span className="text-muted-foreground text-xs">
																												Country:
																											</span>
																											<span className="text-xs">
																												{countryWithFlag}
																											</span>
																										</div>
																									)}

																									{sess.timezone && (
																										<div className="flex items-center gap-2">
																											<span className="text-muted-foreground text-xs">
																												Timezone:
																											</span>
																											<span className="text-xs">
																												{sess.timezone}
																											</span>
																										</div>
																									)}

																									<div className="flex items-center gap-2">
																										<span className="text-muted-foreground text-xs">
																											Expires:
																										</span>
																										<span className="text-xs">
																											{formatDate(
																												sess.expiresAt,
																											)}
																										</span>
																									</div>
																								</div>

																								{sess.impersonatedBy && (
																									<Badge
																										variant="secondary"
																										className="text-xs"
																									>
																										Impersonated by:{" "}
																										{sess.impersonatedBy}
																									</Badge>
																								)}
																							</div>

																							<button
																								type="button"
																								onClick={() =>
																									handleRevokeSession(
																										sess.token,
																									)
																								}
																								className="flex h-6 w-6 items-center justify-center rounded-md border border-transparent transition-colors hover:bg-accent"
																								title="Revoke session"
																							>
																								<X className="h-3.5 w-3.5" />
																							</button>
																						</div>
																					);
																				})}
																			</div>
																		)}
																	</div>
																</div>
															</TableCell>
														</TableRow>
													)}
												</>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</div>
					</div>

					{/* Create User Dialog */}
					<Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
						<DialogContent>
							<form onSubmit={handleCreateUser}>
								<DialogHeader>
									<DialogTitle className="text-base">
										Create New User
									</DialogTitle>
									<DialogDescription className="text-xs">
										Add a new user to the system.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-3 py-3">
									<div className="grid gap-1.5">
										<Label htmlFor="create-name" className="text-xs">
											Name *
										</Label>
										<Input
											id="create-name"
											value={createUserForm.name}
											onChange={(e) =>
												setCreateUserForm({
													...createUserForm,
													name: e.target.value,
												})
											}
											required
										/>
									</div>
									<div className="grid gap-1.5">
										<Label htmlFor="create-email" className="text-xs">
											Email *
										</Label>
										<Input
											id="create-email"
											type="email"
											value={createUserForm.email}
											onChange={(e) =>
												setCreateUserForm({
													...createUserForm,
													email: e.target.value,
												})
											}
											required
										/>
									</div>
									<div className="grid gap-1.5">
										<Label htmlFor="create-password" className="text-xs">
											Password *
										</Label>
										<Input
											id="create-password"
											type="password"
											value={createUserForm.password}
											onChange={(e) =>
												setCreateUserForm({
													...createUserForm,
													password: e.target.value,
												})
											}
											required
										/>
									</div>
									<div className="grid gap-1.5">
										<Label htmlFor="create-role" className="text-xs">
											Role
										</Label>
										<Select
											value={createUserForm.role}
											onValueChange={(value) =>
												setCreateUserForm({ ...createUserForm, role: value })
											}
										>
											<SelectTrigger id="create-role">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="user">User</SelectItem>
												<SelectItem value="admin">Admin</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsCreateUserOpen(false)}
										disabled={isSubmitting}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={isSubmitting}>
										{isSubmitting ? "Creating..." : "Create User"}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>

					{/* Set Role Dialog */}
					<Dialog open={isSetRoleOpen} onOpenChange={setIsSetRoleOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="text-base">Set User Role</DialogTitle>
								<DialogDescription className="text-xs">
									Change the user's role.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-3 py-3">
								<div className="grid gap-1.5">
									<Label htmlFor="new-role" className="text-xs">
										Role
									</Label>
									<Select value={newRole} onValueChange={setNewRole}>
										<SelectTrigger id="new-role">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="user">User</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsSetRoleOpen(false)}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button onClick={handleSetRole} disabled={isSubmitting}>
									{isSubmitting ? "Updating..." : "Update Role"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* Ban User Dialog */}
					<Dialog open={isBanUserOpen} onOpenChange={setIsBanUserOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="text-base">Ban User</DialogTitle>
								<DialogDescription className="text-xs">
									Temporarily or permanently ban this user.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-3 py-3">
								<div className="grid gap-1.5">
									<Label htmlFor="ban-reason" className="text-xs">
										Reason
									</Label>
									<Textarea
										id="ban-reason"
										value={banForm.reason}
										onChange={(e) =>
											setBanForm({ ...banForm, reason: e.target.value })
										}
										placeholder="Enter ban reason..."
									/>
								</div>
								<div className="grid gap-1.5">
									<Label htmlFor="ban-expires" className="text-xs">
										Expires In (days, leave empty for permanent)
									</Label>
									<Input
										id="ban-expires"
										type="number"
										min="1"
										value={banForm.expiresInDays}
										onChange={(e) =>
											setBanForm({ ...banForm, expiresInDays: e.target.value })
										}
										placeholder="Optional"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsBanUserOpen(false)}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button
									onClick={handleBanUser}
									disabled={isSubmitting}
									variant="destructive"
								>
									{isSubmitting ? "Banning..." : "Ban User"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* Unban User Dialog */}
					<Dialog open={isUnbanUserOpen} onOpenChange={setIsUnbanUserOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="text-base">Unban User</DialogTitle>
								<DialogDescription className="text-xs">
									Are you sure you want to unban this user? They will regain
									access to the platform.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsUnbanUserOpen(false)}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button onClick={handleUnbanUser} disabled={isSubmitting}>
									{isSubmitting ? "Unbanning..." : "Unban User"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* Set Password Dialog */}
					<Dialog open={isSetPasswordOpen} onOpenChange={setIsSetPasswordOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="text-base">
									Set User Password
								</DialogTitle>
								<DialogDescription className="text-xs">
									Set a new password for this user.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-3 py-3">
								<div className="grid gap-1.5">
									<Label htmlFor="new-password" className="text-xs">
										New Password *
									</Label>
									<Input
										id="new-password"
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										required
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsSetPasswordOpen(false)}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button onClick={handleSetPassword} disabled={isSubmitting}>
									{isSubmitting ? "Updating..." : "Set Password"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* Impersonate Dialog */}
					<Dialog open={isImpersonateOpen} onOpenChange={setIsImpersonateOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="text-base">
									Impersonate User
								</DialogTitle>
								<DialogDescription className="text-xs">
									You are about to sign in as this user. You will have full
									access to their account.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsImpersonateOpen(false)}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button onClick={handleImpersonate} disabled={isSubmitting}>
									{isSubmitting ? "Impersonating..." : "Impersonate"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* Delete User Dialog */}
					<Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="text-base">Delete User</DialogTitle>
								<DialogDescription className="space-y-2 text-xs">
									<div>Are you sure you want to delete this user?</div>
									<div className="font-medium text-red-500">
										This can not be undone.
									</div>
								</DialogDescription>
							</DialogHeader>

							<div className="flex flex-col gap-4 py-4">
								<div className="space-y-3">
									<div className="flex items-center gap-2 text-sm">
										<span className="text-muted-foreground">Type</span>
										<div
											className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-xs hover:bg-muted"
											onClick={handleCopyEmail}
											title="Click to copy"
										>
											<span>
												{users.find((u) => u.id === selectedUserId)?.email ||
													""}
											</span>
											{isCopied ? (
												<span className="font-bold text-green-500">✓</span>
											) : (
												<Copy className="h-3 w-3 text-muted-foreground" />
											)}
										</div>
										<span className="text-muted-foreground">to confirm.</span>
									</div>

									<Input
										value={deleteConfirmation}
										onChange={(e) => setDeleteConfirmation(e.target.value)}
										placeholder="Enter user email"
										className="font-mono"
										autoComplete="off"
										autoCorrect="off"
										spellCheck="false"
									/>
								</div>
							</div>

							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsDeleteUserOpen(false)}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button
									onClick={handleDeleteUser}
									className={
										deleteConfirmation ===
										users.find((u) => u.id === selectedUserId)?.email
											? "bg-red-500 hover:bg-red-600"
											: "cursor-not-allowed opacity-50"
									}
									disabled={
										isSubmitting ||
										deleteConfirmation !==
											users.find((u) => u.id === selectedUserId)?.email
									}
								>
									{isSubmitting ? "Deleting..." : "Delete User"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	);
}
