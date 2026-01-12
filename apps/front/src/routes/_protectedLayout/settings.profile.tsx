import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Camera,
	Laptop,
	Loader2,
	Monitor,
	Smartphone,
	Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/web/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/web/components/ui/dialog";
import { Input } from "@/web/components/ui/input";
import { Separator } from "@/web/components/ui/separator";
import { useAppForm } from "@/web/components/ui/tanstack-form";
import { authClient } from "@/web/lib/auth-client";
import { useAuth } from "@/web/lib/auth-context";
import { orpc } from "@/web/lib/orpc";

export const Route = createFileRoute("/_protectedLayout/settings/profile")({
	component: ProfilePage,
});

// Define user profile interface
interface UserProfile {
	id: string;
	name: string | null;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: string | Date;
	updatedAt: string | Date;
}

const FormSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(50, "Name cannot be longer than 50 characters"),
});

function getInitials(
	name: string | null | undefined,
	email: string | null | undefined,
): string {
	if (name && name.length > 0) {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase();
	}
	if (email && email.length > 0) {
		return email.split("@")[0].slice(0, 2).toUpperCase();
	}
	return "??";
}

function getDeviceIcon(userAgent?: string) {
	if (!userAgent) return <Monitor className="h-4 w-4" />;
	if (userAgent.toLowerCase().includes("mobile")) {
		return <Smartphone className="h-4 w-4" />;
	}
	return <Laptop className="h-4 w-4" />;
}

function SessionDeviceInfo({ userAgent }: { userAgent?: string | null }) {
	const deviceInfo = useQuery({
		...orpc.profile.getDeviceInfo.queryOptions({
			input: {
				userAgent: userAgent || null,
			},
		}),
		enabled: !!userAgent,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});

	return (
		<span className="text-sm">
			{deviceInfo.isLoading
				? "Loading..."
				: deviceInfo.data || "Unknown Device"}
		</span>
	);
}

function getCountryFlag(countryCode: string): string {
	// Convert country code to flag emoji
	// Each country code letter corresponds to a regional indicator symbol
	const codePoints = countryCode
		.toUpperCase()
		.split("")
		.map((char) => 127397 + char.charCodeAt(0));
	return String.fromCodePoint(...codePoints);
}

function getLocationDisplay(session: Session): string | null {
	const parts: string[] = [];

	if (session.city) parts.push(session.city);
	if (session.region) parts.push(session.region);
	if (session.country) {
		const flag = getCountryFlag(session.country);
		parts.push(`${session.country} ${flag}`);
	}

	return parts.length > 0 ? parts.join(", ") : null;
}

// Session type
interface Session {
	id: string;
	token: string;
	userAgent?: string | null;
	ipAddress?: string | null;
	city?: string | null;
	country?: string | null;
	region?: string | null;
	timezone?: string | null;
	[key: string]: unknown;
}

function ProfilePage() {
	const [isEditing, setIsEditing] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [terminatingSession, setTerminatingSession] = useState<string>();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const auth = useAuth();

	const profile = useQuery(orpc.profile.getProfile.queryOptions());
	const sessions = useQuery(orpc.profile.listSessions.queryOptions());

	const updateMutation = useMutation(
		orpc.profile.updateProfile.mutationOptions({
			onSuccess: () => {
				profile.refetch();
				setIsEditing(false);
				toast.success("Profile updated successfully");
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update profile");
			},
		}),
	);

	const revokeSessionMutation = useMutation(
		orpc.profile.revokeSession.mutationOptions({
			onSuccess: () => {
				toast.success("Session terminated successfully");
				sessions.refetch();
				setTerminatingSession(undefined);
			},
			onError: (error) => {
				toast.error(error.message || "Failed to terminate session");
				setTerminatingSession(undefined);
			},
		}),
	);

	const form = useAppForm({
		defaultValues: {
			name: "",
		},
		validators: {
			onChange: FormSchema,
		},
		onSubmit: async ({ value }) => {
			if (profile.data) {
				const userData = profile.data as unknown as UserProfile;
				updateMutation.mutate({
					name: value.name.trim(),
					image: userData.image || undefined,
				});
			}
		},
	});

	// Update form when profile data loads
	if (profile.data) {
		const userData = profile.data as unknown as UserProfile;
		if (form.getFieldValue("name") === "") {
			form.setFieldValue("name", userData.name || "New User");
		}
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		const img = new Image();
		img.src = URL.createObjectURL(file);
		img.onload = () => {
			if (img.width > 512 || img.height > 512) {
				toast.error("Image must be 512x512 pixels or smaller");
				return;
			}

			const reader = new FileReader();
			reader.onload = async (e) => {
				const base64Image = e.target?.result as string;
				if (!profile.data) return;

				const userData = profile.data as unknown as UserProfile;
				updateMutation.mutate({
					name: userData.name || "New User",
					image: base64Image,
				});
			};
			reader.readAsDataURL(file);
		};
	};

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = "/";
				},
			},
		});
	};

	const handleDeleteAccount = async () => {
		setIsDeleting(true);
		try {
			// TODO: Implement delete account API call
			// await trpc.user.deleteAccount.mutate();

			toast.success("Account deleted successfully");
			setIsDeleteDialogOpen(false);
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						window.location.href = "/";
					},
				},
			});
		} catch (_error) {
			toast.error("Failed to delete account");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-semibold text-2xl">Profile</h1>
				<p className="text-muted-foreground text-sm">
					Manage your account information
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
					<CardDescription>
						Update your profile details and photo
					</CardDescription>
				</CardHeader>

				{/* Profile Section */}
				{profile.isLoading ? (
					<CardContent className="flex items-center justify-center py-8">
						<div className="text-center text-muted-foreground">
							<Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
							Loading profile...
						</div>
					</CardContent>
				) : !profile.data ? (
					<CardContent className="py-6">
						<div className="text-center text-muted-foreground">
							Profile not available
						</div>
					</CardContent>
				) : (
					<CardContent className="pb-0">
						{(() => {
							const userData = profile.data as unknown as UserProfile;
							return (
								<div className="flex flex-col items-center space-y-6 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
									<div className="group relative flex-shrink-0">
										<div
											className={`relative h-24 w-24 overflow-hidden rounded-full bg-muted ${isEditing ? "ring-2 ring-primary ring-offset-2" : ""}`}
										>
											{userData.image ? (
												<img
													src={userData.image}
													alt={userData.name || "User"}
													className="h-full w-full rounded-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center rounded-full bg-primary font-bold text-3xl text-primary-foreground">
													{getInitials(userData.name, userData.email)}
												</div>
											)}
											<Button
												variant="ghost"
												size="icon"
												className={`absolute inset-0 flex h-full w-full items-center justify-center bg-black/50 transition-opacity ${isEditing ? "opacity-100 hover:opacity-80" : "opacity-0 group-hover:opacity-100"}`}
												onClick={() => fileInputRef.current?.click()}
											>
												{isEditing ? (
													<Camera className="h-5 w-5 text-white" />
												) : (
													<span className="text-sm text-white">Change</span>
												)}
											</Button>
										</div>
										<input
											ref={fileInputRef}
											type="file"
											accept="image/*"
											className="hidden"
											onChange={handleFileChange}
										/>
									</div>
									<div className="w-full flex-1 text-center sm:text-left">
										{isEditing ? (
											<form.AppForm>
												<form
													onSubmit={(e) => {
														e.preventDefault();
														e.stopPropagation();
														void form.handleSubmit();
													}}
													className="space-y-4"
												>
													<form.AppField name="name">
														{(field) => (
															<field.FormItem>
																<field.FormLabel>Display Name</field.FormLabel>
																<field.FormControl>
																	<div className="relative">
																		<Input
																			value={field.state.value}
																			onChange={(e) =>
																				field.handleChange(e.target.value)
																			}
																			onBlur={field.handleBlur}
																			className="pr-12"
																			maxLength={20}
																			disabled={updateMutation.isPending}
																		/>
																		<span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground text-xs">
																			{field.state.value.length}/20
																		</span>
																	</div>
																</field.FormControl>
																<field.FormMessage />
															</field.FormItem>
														)}
													</form.AppField>
													<div className="flex space-x-2">
														<form.Subscribe>
															{(state) => (
																<Button
																	type="submit"
																	disabled={
																		!state.canSubmit ||
																		state.isSubmitting ||
																		updateMutation.isPending
																	}
																>
																	{updateMutation.isPending
																		? "Saving..."
																		: "Save"}
																</Button>
															)}
														</form.Subscribe>
														<Button
															variant="outline"
															onClick={() => {
																setIsEditing(false);
																form.setFieldValue(
																	"name",
																	userData.name || "New User",
																);
															}}
														>
															Cancel
														</Button>
													</div>
												</form>
											</form.AppForm>
										) : (
											<div className="space-y-4">
												<div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
													<div className="space-y-2">
														<h3 className="font-semibold text-xl">
															{userData.name || "New User"}
														</h3>
														<div className="space-y-0.5">
															<p className="text-muted-foreground text-sm">
																{userData.email}
															</p>
															<p className="font-mono text-muted-foreground/60 text-xs">
																ID: {userData.id}
															</p>
														</div>
														<p className="text-muted-foreground/70 text-xs">
															Member since{" "}
															{new Date(
																userData.createdAt,
															).toLocaleDateString()}
														</p>
													</div>
													<Button
														variant="outline"
														size="sm"
														className="flex-shrink-0 self-center sm:self-start"
														onClick={() => setIsEditing(true)}
													>
														Edit
													</Button>
												</div>
											</div>
										)}
									</div>
								</div>
							);
						})()}
					</CardContent>
				)}
			</Card>

			{/* Active Sessions Card */}
			<Card>
				<CardHeader>
					<CardTitle>Active Sessions</CardTitle>
					<CardDescription>
						Manage devices that are currently signed in to your account
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					{sessions.isLoading ? (
						<div className="py-4 text-center text-muted-foreground">
							<Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
							Loading sessions...
						</div>
					) : sessions.error ? (
						<div className="py-4 text-center text-muted-foreground">
							Error loading sessions
						</div>
					) : !sessions.data || sessions.data.length === 0 ? (
						<div className="py-4 text-center text-muted-foreground">
							No active sessions found
						</div>
					) : (
						sessions.data
							.filter((session: Session) => session.userAgent != null)
							.map((session: Session) => {
								const isCurrentSession =
									session.token === auth.session?.session?.token;
								const sessionId = session.id || session.token;
								const isTerminating = terminatingSession === sessionId;

								const location = getLocationDisplay(session);

								return (
									<div
										key={session.id || session.token}
										className="flex items-start justify-between rounded border p-3"
									>
										<div className="flex flex-1 items-center gap-3">
											{getDeviceIcon(session.userAgent || undefined)}
											<div className="flex-1 space-y-0.5">
												<div className="flex items-center gap-2">
													<SessionDeviceInfo
														userAgent={session.userAgent || undefined}
													/>
													{isCurrentSession && (
														<Badge variant="default" className="text-xs">
															Current
														</Badge>
													)}
												</div>
												{location && <div className="text-sm">{location}</div>}
											</div>
										</div>
										<Button
											variant="ghost"
											size="sm"
											className="flex-shrink-0 text-destructive text-xs hover:bg-destructive/10"
											disabled={
												isTerminating || revokeSessionMutation.isPending
											}
											onClick={async () => {
												if (isCurrentSession) {
													handleSignOut();
												} else {
													setTerminatingSession(sessionId);
													revokeSessionMutation.mutate({
														token: session.token,
													});
												}
											}}
										>
											{isTerminating ? (
												<>
													<Loader2 className="mr-1 h-3 w-3 animate-spin" />
													Terminating...
												</>
											) : isCurrentSession ? (
												"Sign Out"
											) : (
												"Terminate"
											)}
										</Button>
									</div>
								);
							})
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Account Actions</CardTitle>
					<CardDescription>Manage your account settings</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-sm">Sign Out</p>
							<p className="text-muted-foreground text-xs">
								Sign out of your account on this device
							</p>
						</div>
						<Button variant="outline" onClick={handleSignOut}>
							Sign Out
						</Button>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-sm">Delete Account</p>
							<p className="text-muted-foreground text-xs">
								Permanently delete your account and all associated data
							</p>
						</div>
						<Dialog
							open={isDeleteDialogOpen}
							onOpenChange={setIsDeleteDialogOpen}
						>
							<DialogTrigger asChild>
								<Button
									variant="outline"
									className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Delete Account</DialogTitle>
									<DialogDescription>
										Are you sure you want to delete your account? This action
										cannot be undone and will permanently remove all your data.
									</DialogDescription>
								</DialogHeader>
								<DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
									<Button
										variant="outline"
										onClick={() => setIsDeleteDialogOpen(false)}
										disabled={isDeleting}
										className="w-full sm:w-auto"
									>
										Cancel
									</Button>
									<Button
										variant="destructive"
										onClick={handleDeleteAccount}
										disabled={isDeleting}
										className="w-full sm:w-auto"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										{isDeleting ? "Deleting..." : "Delete Account"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
