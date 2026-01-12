import { createFileRoute } from "@tanstack/react-router";
import { Edit2, Key, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSidebar } from "@/web/components/sidebar/sidebar-context";
import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import { CopyableId } from "@/web/components/ui/copyable-id";
import { DeleteConfirmDialog } from "@/web/components/ui/delete-confirm-dialog";
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
import { Label } from "@/web/components/ui/label";
import { Skeleton } from "@/web/components/ui/skeleton";
import { Switch } from "@/web/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/web/components/ui/table";
import { useToast } from "@/web/hooks/use-toast";
import {
	type ApiKey,
	useApiKeysList,
	useCreateApiKey,
	useDeleteApiKey,
	useUpdateApiKey,
} from "@/web/hooks/useApiKeys";
import { authClient } from "@/web/lib/auth-client";

export const Route = createFileRoute("/_protectedLayout/api-keys")({
	component: ApiKeysPage,
});

function ApiKeysPage() {
	const { toast } = useToast();
	const { data: session } = authClient.useSession();

	// TanStack Query hooks
	const {
		data: apiKeys = [],
		isLoading,
		isFetching,
		refetch,
	} = useApiKeysList();
	const createApiKeyMutation = useCreateApiKey();
	const updateApiKeyMutation = useUpdateApiKey();
	const deleteApiKeyMutation = useDeleteApiKey();

	// UI state
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingKey, setDeletingKey] = useState<ApiKey | null>(null);

	// Form state
	const [formName, setFormName] = useState("");
	const [formType, setFormType] = useState<"internal" | "external">("external");
	const [formIsActive, setFormIsActive] = useState(true);

	const handleCreateKey = async () => {
		if (!formName.trim()) {
			toast({
				title: "Validation Error",
				description: "Name is required",
				variant: "destructive",
			});
			return;
		}

		try {
			await createApiKeyMutation.mutateAsync({
				name: formName,
				type: formType,
				isActive: formIsActive,
			});

			setIsCreateOpen(false);
			resetForm();
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleUpdateKey = async () => {
		if (!editingKey) return;

		if (!formName.trim()) {
			toast({
				title: "Validation Error",
				description: "Name is required",
				variant: "destructive",
			});
			return;
		}

		try {
			await updateApiKeyMutation.mutateAsync({
				id: editingKey.id,
				data: {
					name: formName,
					type: formType,
					isActive: formIsActive,
				},
			});

			resetForm();
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleDeleteKey = async () => {
		if (!deletingKey) return;

		try {
			await deleteApiKeyMutation.mutateAsync(deletingKey.id);
			setDeleteDialogOpen(false);
			setDeletingKey(null);
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const openDeleteDialog = (key: ApiKey) => {
		setDeletingKey(key);
		setDeleteDialogOpen(true);
	};

	const openEditDialog = (key: ApiKey) => {
		setEditingKey(key);
		setFormName(key.name);
		setFormType(key.type as "internal" | "external");
		setFormIsActive(key.isActive);
	};

	const resetForm = () => {
		setFormName("");
		setFormType("external");
		setFormIsActive(true);
		setEditingKey(null);
	};

	const handleRefresh = async () => {
		try {
			await refetch();
			toast({
				title: "Refreshed",
				description: "API keys list has been refreshed",
			});
		} catch {
			// Error silently handled - refetch failures are non-critical
		}
	};

	const handleToggleActive = async (key: ApiKey) => {
		try {
			await updateApiKeyMutation.mutateAsync({
				id: key.id,
				data: {
					name: key.name,
					type: key.type,
					isActive: !key.isActive,
				},
			});
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const { isExpanded } = useSidebar();

	return (
		<div className="flex h-full flex-col">
			<div
				className={`flex items-center gap-3 bg-background pt-8 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				<Key className="h-4 w-4" />
				<h1 className="font-semibold text-base">API Keys</h1>
			</div>
			<div
				className={`flex-1 overflow-y-scroll pt-3 pb-5 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				<div
					className="w-full rounded-lg border text-card-foreground shadow-sm"
					style={{ backgroundColor: "hsl(var(--background))" }}
				>
					<div className="border-border border-b px-6 py-4">
						<div className="mb-3">
							<h2 className="font-medium text-foreground text-sm">
								Your API Keys
							</h2>
						</div>
						<div className="flex items-center justify-between gap-4">
							<p className="text-muted-foreground text-sm">
								{apiKeys.length === 0
									? "No API keys yet. Create one to get started."
									: `You have ${apiKeys.length} API key${apiKeys.length === 1 ? "" : "s"}`}
							</p>
							<div className="flex gap-1.5">
								<button
									type="button"
									onClick={handleRefresh}
									disabled={isFetching}
									className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
									title="Refresh API keys"
								>
									<RefreshCw
										className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
									/>
									<span className="hidden md:inline">Refresh</span>
								</button>
								<button
									type="button"
									disabled={!session?.user?.id}
									onClick={() => setIsCreateOpen(true)}
									className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-medium text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
								>
									<Plus className="h-4 w-4" />
									<span className="hidden md:inline">Create API Key</span>
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
						) : apiKeys.length === 0 ? (
							<div className="py-8 text-center">
								<Key className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
								<h3 className="mb-1 font-medium text-sm">No API Keys</h3>
								<p className="mb-3 text-muted-foreground text-xs">
									Get started by creating your first API key
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[150px]">Name</TableHead>
										<TableHead className="w-[120px]">Created</TableHead>
										<TableHead className="w-[100px]">Type</TableHead>
										<TableHead className="w-[200px]">API Key</TableHead>
										<TableHead className="w-[100px] text-right">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{apiKeys.map((key) => (
										<TableRow key={key.id}>
											<TableCell className="font-medium text-sm">
												{key.name}
											</TableCell>
											<TableCell className="text-xs">
												{(() => {
													if (!key.createdAt) return "N/A";
													const date =
														typeof key.createdAt === "number"
															? new Date(key.createdAt * 1000)
															: new Date(key.createdAt);
													return Number.isNaN(date.getTime())
														? "Invalid Date"
														: date.toLocaleDateString();
												})()}
											</TableCell>
											<TableCell>
												<Badge variant="outline" className="text-xs">
													{key.type === "internal" ? "Internal" : "External"}
												</Badge>
											</TableCell>
											<TableCell className="pr-2">
												<CopyableId
													id={key.key || key.id}
													onCopy={() => {
														toast({
															title: "Copied!",
															description: key.key
																? "API Key copied to clipboard"
																: "API Key ID copied to clipboard",
														});
													}}
												/>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1.5">
													<Switch
														checked={key.isActive}
														onCheckedChange={() => handleToggleActive(key)}
														variant="status"
													/>
													<Dialog
														open={editingKey?.id === key.id}
														onOpenChange={(open) => {
															if (open) {
																openEditDialog(key);
															} else {
																resetForm();
															}
														}}
													>
														<DialogTrigger asChild>
															<button
																type="button"
																className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:hover:border-gray-600"
																disabled={!session?.user?.id}
															>
																<Edit2 className="h-3.5 w-3.5" />
															</button>
														</DialogTrigger>
														<DialogContent>
															<DialogHeader>
																<DialogTitle className="text-base">
																	Edit API Key
																</DialogTitle>
																<DialogDescription className="text-xs">
																	Update the name and status of your API key
																</DialogDescription>
															</DialogHeader>
															<div className="space-y-3 py-3">
																<div className="space-y-1.5">
																	<Label
																		htmlFor="edit-name"
																		className="text-xs"
																	>
																		Name
																	</Label>
																	<Input
																		id="edit-name"
																		value={formName}
																		onChange={(e) =>
																			setFormName(e.target.value)
																		}
																	/>
																</div>
																<div className="space-y-1.5">
																	<Label className="text-xs">Type</Label>
																	<div className="grid grid-cols-2 gap-3">
																		<button
																			type="button"
																			onClick={() => setFormType("external")}
																			className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all active:scale-95 ${
																				formType === "external"
																					? "border-black bg-muted/50 dark:border-white"
																					: "border-border hover:border-gray-400 dark:hover:border-gray-600"
																			}`}
																		>
																			<span className="font-medium text-sm">
																				External
																			</span>
																			<span className="mt-1 text-muted-foreground text-xs">
																				Public API access
																			</span>
																		</button>
																		<button
																			type="button"
																			onClick={() => setFormType("internal")}
																			className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all active:scale-95 ${
																				formType === "internal"
																					? "border-black bg-muted/50 dark:border-white"
																					: "border-border hover:border-gray-400 dark:hover:border-gray-600"
																			}`}
																		>
																			<span className="font-medium text-sm">
																				Internal
																			</span>
																			<span className="mt-1 text-muted-foreground text-xs">
																				Internal use only
																			</span>
																		</button>
																	</div>
																</div>
																<div className="flex items-center space-x-2">
																	<Switch
																		id="edit-isActive"
																		checked={formIsActive}
																		onCheckedChange={setFormIsActive}
																		variant="status"
																	/>
																	<Label
																		htmlFor="edit-isActive"
																		className="text-xs"
																	>
																		{formIsActive ? "Active" : "Inactive"}
																	</Label>
																</div>
															</div>
															<DialogFooter>
																<Button
																	variant="outline"
																	onClick={() => resetForm()}
																	disabled={updateApiKeyMutation.isPending}
																>
																	Cancel
																</Button>
																<Button
																	onClick={handleUpdateKey}
																	disabled={
																		!formName.trim() ||
																		updateApiKeyMutation.isPending ||
																		!session?.user?.id
																	}
																>
																	{updateApiKeyMutation.isPending
																		? "Updating..."
																		: "Update"}
																</Button>
															</DialogFooter>
														</DialogContent>
													</Dialog>

													<button
														type="button"
														className="group flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
														onClick={() => openDeleteDialog(key)}
														title="Delete API key"
													>
														<Trash2 className="h-3.5 w-3.5 group-hover:text-red-500" />
													</button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</div>
				</div>

				{/* Info Cards */}
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<div
						className="w-full rounded-lg border text-card-foreground shadow-sm"
						style={{ backgroundColor: "hsl(var(--background))" }}
					>
						<div className="border-border border-b px-6 py-4">
							<h2 className="font-medium text-foreground text-sm">
								Redirect Endpoint
							</h2>
						</div>
						<div className="space-y-3 p-4 text-muted-foreground text-xs">
							<p>
								Use the redirect endpoint to track campaigns with query
								parameters:
							</p>
							<pre className="rounded-md bg-muted p-3 text-xs">
								GET /v1/redirect/:campaign_id?redirect_url=URL&api_key=YOUR_KEY
							</pre>
							<div className="space-y-1">
								<p className="font-medium text-foreground">Parameters:</p>
								<ul className="list-inside list-disc space-y-1">
									<li>
										<code className="rounded bg-muted px-1">campaign_id</code>:
										UUID in path
									</li>
									<li>
										<code className="rounded bg-muted px-1">redirect_url</code>:
										Target URL
									</li>
									<li>
										<code className="rounded bg-muted px-1">api_key</code>: Your
										API key
									</li>
									<li>Additional query params are forwarded to redirect_url</li>
								</ul>
							</div>
						</div>
					</div>

					<div
						className="w-full rounded-lg border text-card-foreground shadow-sm"
						style={{ backgroundColor: "hsl(var(--background))" }}
					>
						<div className="border-border border-b px-6 py-4">
							<h2 className="font-medium text-foreground text-sm">
								Other Endpoints (Bearer Token)
							</h2>
						</div>
						<div className="space-y-3 p-4 text-muted-foreground text-xs">
							<p>
								For other API endpoints, include your API key in the
								Authorization header:
							</p>
							<pre className="rounded-md bg-muted p-3 text-xs">
								Authorization: Bearer YOUR_API_KEY
							</pre>
							<div className="space-y-1">
								<p className="font-medium text-foreground">Example:</p>
								<pre className="rounded-md bg-muted p-3 text-xs">
									{
										'curl -H "Authorization: Bearer YOUR_KEY" \\\n  https://api.example.com/v1/endpoint'
									}
								</pre>
							</div>
						</div>
					</div>
				</div>

				{/* Security Best Practices */}
				<div
					className="mt-4 w-full rounded-lg border text-card-foreground shadow-sm"
					style={{ backgroundColor: "hsl(var(--background))" }}
				>
					<div className="border-border border-b px-6 py-4">
						<h2 className="font-medium text-foreground text-sm">
							Security Best Practices
						</h2>
					</div>
					<div className="space-y-3 p-4 text-muted-foreground text-xs">
						<ul className="list-inside list-disc space-y-1">
							<li>Never share your API keys publicly</li>
							<li>Rotate keys regularly</li>
							<li>Use different keys for different environments</li>
							<li>Disable unused keys immediately</li>
							<li>Store keys securely using environment variables</li>
						</ul>
					</div>
				</div>

				{/* Delete Dialog */}
				<DeleteConfirmDialog
					isOpen={deleteDialogOpen}
					onOpenChange={setDeleteDialogOpen}
					onConfirm={handleDeleteKey}
					itemName={deletingKey?.name || ""}
					itemType="API Key"
					isDeleting={deleteApiKeyMutation.isPending}
				/>

				{/* Create Dialog */}
				<Dialog
					open={isCreateOpen}
					onOpenChange={(open) => {
						setIsCreateOpen(open);
						if (!open) resetForm();
					}}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle className="text-base">
								Create New API Key
							</DialogTitle>
							<DialogDescription className="text-xs">
								Create a new API key to access the platform programmatically
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-3 py-3">
							<div className="space-y-1.5">
								<Label htmlFor="name" className="text-xs">
									Name
								</Label>
								<Input
									id="name"
									placeholder="e.g. Production Key"
									value={formName}
									onChange={(e) => setFormName(e.target.value)}
								/>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Type</Label>
								<div className="grid grid-cols-2 gap-3">
									<button
										type="button"
										onClick={() => setFormType("external")}
										className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all active:scale-95 ${
											formType === "external"
												? "border-black bg-muted/50 dark:border-white"
												: "border-border hover:border-gray-400 dark:hover:border-gray-600"
										}`}
									>
										<span className="font-medium text-sm">External</span>
										<span className="mt-1 text-muted-foreground text-xs">
											Public API access
										</span>
									</button>
									<button
										type="button"
										onClick={() => setFormType("internal")}
										className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all active:scale-95 ${
											formType === "internal"
												? "border-black bg-muted/50 dark:border-white"
												: "border-border hover:border-gray-400 dark:hover:border-gray-600"
										}`}
									>
										<span className="font-medium text-sm">Internal</span>
										<span className="mt-1 text-muted-foreground text-xs">
											Internal use only
										</span>
									</button>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									id="isActive"
									checked={formIsActive}
									onCheckedChange={setFormIsActive}
									variant="status"
								/>
								<Label htmlFor="isActive" className="text-xs">
									{formIsActive ? "Active" : "Inactive"}
								</Label>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => {
									setIsCreateOpen(false);
									resetForm();
								}}
								disabled={createApiKeyMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreateKey}
								disabled={
									!formName.trim() ||
									createApiKeyMutation.isPending ||
									!session?.user?.id
								}
							>
								{createApiKeyMutation.isPending ? "Creating..." : "Create"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
