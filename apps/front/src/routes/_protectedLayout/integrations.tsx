import { createFileRoute } from "@tanstack/react-router";
import {
	Check,
	ChevronDown,
	ChevronRight,
	Copy,
	Edit2,
	Eye,
	EyeOff,
	Plug,
	Plus,
	RefreshCw,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import { useSidebar } from "@/web/components/sidebar/sidebar-context";
import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import { DeleteDialog } from "@/web/components/ui/delete-dialog";
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
import { Textarea } from "@/web/components/ui/textarea";
import { useToast } from "@/web/hooks/use-toast";
import {
	type Integration,
	useCreateIntegration,
	useDeleteIntegration,
	useIntegrationsList,
	useUpdateIntegration,
	useUploadIntegrationImage,
} from "@/web/hooks/useIntegrations";
import { authClient } from "@/web/lib/auth-client";

export const Route = createFileRoute("/_protectedLayout/integrations")({
	component: IntegrationsPage,
});

function IntegrationsPage() {
	const { toast } = useToast();
	const { data: session } = authClient.useSession();

	// TanStack Query hooks
	const {
		data: integrations = [],
		isLoading,
		isFetching,
		refetch,
	} = useIntegrationsList();
	const createIntegrationMutation = useCreateIntegration();
	const updateIntegrationMutation = useUpdateIntegration();
	const deleteIntegrationMutation = useDeleteIntegration();
	const uploadImageMutation = useUploadIntegrationImage();

	// UI state
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingIntegration, setEditingIntegration] =
		useState<Integration | null>(null);
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [visibleMappings, setVisibleMappings] = useState<Set<string>>(
		new Set(),
	);
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedIntegrationToDelete, setSelectedIntegrationToDelete] =
		useState<Integration | null>(null);

	// Form state
	const [formName, setFormName] = useState("");
	const [formMapping, setFormMapping] = useState("");
	const [formImageKey, setFormImageKey] = useState("");
	const [formImageFile, setFormImageFile] = useState<File | null>(null);
	const [formIsActive, setFormIsActive] = useState(true);

	const toggleMappingVisibility = (id: string) => {
		setVisibleMappings((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	const toggleRow = (integrationId: string) => {
		setExpandedRows((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(integrationId)) {
				newSet.delete(integrationId);
			} else {
				newSet.add(integrationId);
			}
			return newSet;
		});
	};

	const handleCopyId = (integration: Integration) => {
		navigator.clipboard.writeText(integration.id);
		setCopiedId(integration.id);
		toast({
			title: "Copied!",
			description: "Integration ID copied to clipboard",
		});
		setTimeout(() => setCopiedId(null), 2000);
	};

	const handleCreateIntegration = async () => {
		if (!formName || !formMapping) {
			toast({
				title: "Validation Error",
				description: "Name and Mapping are required",
				variant: "destructive",
			});
			return;
		}

		try {
			let imageKey: string | null = null;

			// Upload image first if file is selected
			if (formImageFile) {
				try {
					const fileExtension = formImageFile.name.split(".").pop();
					const filename = `${formName}.${fileExtension}`;
					const uploadResponse = await uploadImageMutation.mutateAsync({
						file: formImageFile,
						filename,
					});
					imageKey = uploadResponse.file_key;
				} catch (uploadError) {
					// Error already handled by mutation
					return;
				}
			}

			await createIntegrationMutation.mutateAsync({
				name: formName,
				mapping: formMapping,
				imageKey: imageKey,
				isActive: formIsActive,
			});

			setIsCreateOpen(false);
			resetForm();
		} catch {
			// Error already handled by mutation
		}
	};

	const handleUpdateIntegration = async () => {
		if (!editingIntegration) return;

		if (!formName || !formMapping) {
			toast({
				title: "Validation Error",
				description: "Name and Mapping are required",
				variant: "destructive",
			});
			return;
		}

		try {
			let imageKey: string | null = formImageKey || null;

			// Upload new image if file is selected
			if (formImageFile) {
				try {
					const fileExtension = formImageFile.name.split(".").pop();
					const filename = `${formName}.${fileExtension}`;
					const uploadResponse = await uploadImageMutation.mutateAsync({
						file: formImageFile,
						filename,
					});
					imageKey = uploadResponse.file_key;
				} catch (uploadError) {
					// Error already handled by mutation
					return;
				}
			}

			await updateIntegrationMutation.mutateAsync({
				id: editingIntegration.id,
				data: {
					name: formName,
					mapping: formMapping,
					imageKey: imageKey,
					isActive: formIsActive,
				},
			});

			setEditingIntegration(null);
			resetForm();
		} catch {
			// Error already handled by mutation
		}
	};

	const handleDeleteIntegrationClick = (integration: Integration) => {
		setSelectedIntegrationToDelete(integration);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteIntegrationConfirm = async () => {
		if (!selectedIntegrationToDelete) return;
		try {
			await deleteIntegrationMutation.mutateAsync(
				selectedIntegrationToDelete.id,
			);
			setIsDeleteDialogOpen(false);
			setSelectedIntegrationToDelete(null);
		} catch {
			// Error already handled by mutation
		}
	};

	const openEditDialog = (integration: Integration) => {
		setEditingIntegration(integration);
		setFormName(integration.name);
		setFormMapping(integration.mapping);
		setFormImageKey(integration.imageKey || "");
		setFormIsActive(integration.isActive);
	};

	const resetForm = () => {
		setFormName("");
		setFormMapping("");
		setFormImageKey("");
		setFormImageFile(null);
		setFormIsActive(true);
		setEditingIntegration(null);
	};

	const handleRefresh = async () => {
		if (!session?.user?.id) {
			toast({
				title: "Error",
				description: "User session not available",
				variant: "destructive",
			});
			return;
		}

		await refetch();
		toast({
			title: "Refreshed",
			description: "Integrations list has been refreshed",
		});
	};

	const maskMapping = (mapping: string) => {
		if (mapping.length <= 20) return mapping.slice(0, 10) + "...";
		return `${mapping.slice(0, 10)}...${mapping.slice(-10)}`;
	};

	const handleToggleActive = async (integration: Integration) => {
		try {
			await updateIntegrationMutation.mutateAsync({
				id: integration.id,
				data: {
					name: integration.name,
					mapping: integration.mapping,
					imageKey: integration.imageKey,
					isActive: !integration.isActive,
				},
			});
		} catch {
			// Error already handled by mutation
		}
	};

	const { isExpanded } = useSidebar();

	return (
		<div className="flex h-full flex-col">
			<div
				className={`flex items-center gap-3 bg-background pt-8 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				<Plug className="h-4 w-4" />
				<h1 className="font-semibold text-base">Integrations</h1>
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
								Your Integrations
							</h2>
						</div>
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1">
								<p className="text-muted-foreground text-sm">
									{integrations.length === 0
										? "No integrations yet"
										: `Showing ${integrations.length} integration${integrations.length === 1 ? "" : "s"}`}
								</p>
							</div>
							<div className="flex gap-1.5">
								<button
									type="button"
									onClick={handleRefresh}
									disabled={isFetching}
									className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent"
									title="Refresh integrations"
								>
									<RefreshCw
										className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
									/>
								</button>
								<button
									type="button"
									onClick={() => setIsCreateOpen(true)}
									disabled={!session?.user?.id}
									className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-medium text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50"
								>
									<Plus className="h-4 w-4" />
									<span className="hidden md:inline">Add Integration</span>
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
						) : integrations.length === 0 ? (
							<div className="py-12 text-center">
								<Plug className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
								<h3 className="mb-2 font-medium text-sm">
									No Integrations Yet
								</h3>
								<p className="mb-4 text-muted-foreground text-xs">
									Add your first integration to start mapping events
								</p>
								<Button
									onClick={() => setIsCreateOpen(true)}
									disabled={!session?.user?.id}
									className="gap-2"
								>
									<Plus className="h-4 w-4" />
									Add Integration
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[50px]" />
											<TableHead>Name</TableHead>
											<TableHead>Mapping</TableHead>
											<TableHead>Integration ID</TableHead>
											<TableHead className="w-[100px] text-right">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{integrations.map((integration) => (
											<>
												<TableRow
													key={integration.id}
													className="cursor-pointer"
													onClick={() => toggleRow(integration.id)}
												>
													<TableCell>
														<button
															type="button"
															className="flex h-6 w-6 items-center justify-center rounded-md border-0 bg-transparent p-0 transition-colors hover:bg-accent"
															onClick={(e) => {
																e.stopPropagation();
																toggleRow(integration.id);
															}}
														>
															{expandedRows.has(integration.id) ? (
																<ChevronDown className="h-4 w-4" />
															) : (
																<ChevronRight className="h-4 w-4" />
															)}
														</button>
													</TableCell>
													<TableCell className="max-w-[150px] truncate font-medium text-sm">
														<div className="flex items-center gap-1.5">
															<div className="flex h-6 w-6 shrink-0 items-center justify-center">
																{integration.imageKey ? (
																	import.meta.env.VITE_SERVER_URL?.includes(
																		"localhost",
																	) ||
																	import.meta.env.VITE_SERVER_URL?.includes(
																		"127.0.0.1",
																	) ? (
																		<div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
																			<Plug className="h-4 w-4 text-muted-foreground" />
																		</div>
																	) : (
																		<>
																			<img
																				src={`https://s3.traki.io/${integration.imageKey}`}
																				alt={integration.name}
																				className="h-6 w-6 rounded object-cover"
																				onError={(e) => {
																					console.error(
																						`Failed to load image for ${integration.name}:`,
																						`https://s3.traki.io/${integration.imageKey}`,
																					);
																					e.currentTarget.style.display =
																						"none";
																					const fallback =
																						e.currentTarget.nextElementSibling;
																					if (
																						fallback instanceof HTMLElement &&
																						fallback.classList.contains(
																							"fallback-icon",
																						)
																					) {
																						fallback.classList.remove("hidden");
																					}
																				}}
																				onLoad={() => {
																					console.log(
																						`Successfully loaded image for ${integration.name}:`,
																						`https://s3.traki.io/${integration.imageKey}`,
																					);
																				}}
																			/>
																			<div className="fallback-icon hidden">
																				<Plug className="h-4 w-4 text-muted-foreground" />
																			</div>
																		</>
																	)
																) : (
																	<Plug className="h-4 w-4 text-muted-foreground" />
																)}
															</div>
															<span>{integration.name}</span>
														</div>
													</TableCell>
													<TableCell className="text-muted-foreground text-xs">
														<div className="flex items-center gap-1.5">
															<code className="rounded bg-muted px-2 py-1 font-mono text-xs">
																{visibleMappings.has(integration.id)
																	? integration.mapping
																	: maskMapping(integration.mapping)}
															</code>
															<button
																type="button"
																className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
																onClick={(e) => {
																	e.stopPropagation();
																	toggleMappingVisibility(integration.id);
																}}
															>
																{visibleMappings.has(integration.id) ? (
																	<EyeOff className="h-3.5 w-3.5" />
																) : (
																	<Eye className="h-3.5 w-3.5" />
																)}
															</button>
														</div>
													</TableCell>
													<TableCell className="text-muted-foreground text-xs">
														<div className="flex items-center gap-1.5">
															<code className="rounded bg-muted px-2 py-1 font-mono text-xs">
																{integration.id.slice(0, 8)}...
															</code>
															<button
																type="button"
																className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
																onClick={(e) => {
																	e.stopPropagation();
																	handleCopyId(integration);
																}}
															>
																{copiedId === integration.id ? (
																	<Check className="h-3.5 w-3.5 text-green-500" />
																) : (
																	<Copy className="h-3.5 w-3.5" />
																)}
															</button>
														</div>
													</TableCell>
													<TableCell
														className="text-right"
														onClick={(e) => e.stopPropagation()}
													>
														<div className="flex items-center justify-end gap-1.5">
															<Switch
																checked={integration.isActive}
																onCheckedChange={() =>
																	handleToggleActive(integration)
																}
																variant="status"
															/>
															<button
																type="button"
																className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
																onClick={(e) => {
																	e.stopPropagation();
																	openEditDialog(integration);
																}}
															>
																<Edit2 className="h-3.5 w-3.5" />
															</button>
															<Dialog
																open={editingIntegration?.id === integration.id}
																onOpenChange={(open) => {
																	if (!open) {
																		setEditingIntegration(null);
																		resetForm();
																	}
																}}
															>
																<DialogContent className="max-w-2xl">
																	<DialogHeader>
																		<DialogTitle className="text-base">
																			Edit Integration
																		</DialogTitle>
																		<DialogDescription className="text-xs">
																			Update the integration details
																		</DialogDescription>
																	</DialogHeader>
																	<div className="grid gap-3 py-3">
																		{/* Name */}
																		<div className="grid gap-1.5">
																			<Label
																				htmlFor="edit-name"
																				className="text-xs"
																			>
																				Name *
																			</Label>
																			<Input
																				id="edit-name"
																				placeholder="e.g., TikTok Events"
																				value={formName}
																				onChange={(e) =>
																					setFormName(e.target.value)
																				}
																			/>
																		</div>

																		{/* Image Upload */}
																		<div className="grid gap-1.5">
																			<Label
																				htmlFor="edit-imageFile"
																				className="text-xs"
																			>
																				Integration Image
																			</Label>
																			{!formImageFile ? (
																				<>
																					<Input
																						id="edit-imageFile"
																						type="file"
																						accept="image/*,image/svg+xml,.svg"
																						onChange={(e) => {
																							const file = e.target.files?.[0];
																							if (file) {
																								setFormImageFile(file);
																							}
																						}}
																					/>
																					{formImageKey && (
																						<p className="text-muted-foreground text-xs">
																							Current image: {formImageKey}
																						</p>
																					)}
																				</>
																			) : (
																				<div className="flex items-center gap-3 rounded-md border p-3">
																					<img
																						src={URL.createObjectURL(
																							formImageFile,
																						)}
																						alt="Preview"
																						className="h-16 w-16 rounded object-cover"
																					/>
																					<div className="flex-1">
																						<p className="font-medium text-sm">
																							{formImageFile.name}
																						</p>
																						<p className="text-muted-foreground text-xs">
																							{(
																								formImageFile.size / 1024
																							).toFixed(2)}{" "}
																							KB
																						</p>
																					</div>
																					<Button
																						type="button"
																						variant="ghost"
																						size="icon"
																						onClick={() =>
																							setFormImageFile(null)
																						}
																						className="h-8 w-8"
																					>
																						<X className="h-4 w-4" />
																					</Button>
																				</div>
																			)}
																		</div>

																		{/* Mapping field */}
																		<div className="grid gap-1.5">
																			<Label
																				htmlFor="edit-mapping"
																				className="text-xs"
																			>
																				Mapping Data *
																			</Label>
																			<Textarea
																				id="edit-mapping"
																				placeholder="Paste your mapping data here..."
																				value={formMapping}
																				onChange={(e) =>
																					setFormMapping(e.target.value)
																				}
																				className="max-h-[400px] resize-none overflow-y-auto font-mono text-xs"
																				rows={12}
																			/>
																			<p className="text-muted-foreground text-xs">
																				Paste the mapping data for this
																				integration
																			</p>
																		</div>

																		{/* Status row */}
																		<div className="flex items-center space-x-2">
																			<Switch
																				id="edit-isActive"
																				checked={formIsActive}
																				onCheckedChange={setFormIsActive}
																				variant="status"
																			/>
																			<Label
																				htmlFor="edit-isActive"
																				className="cursor-pointer text-xs"
																			>
																				{formIsActive ? "Active" : "Inactive"}
																			</Label>
																		</div>
																	</div>
																	<DialogFooter>
																		<Button
																			variant="outline"
																			onClick={() => {
																				setEditingIntegration(null);
																				resetForm();
																			}}
																			disabled={
																				updateIntegrationMutation.isPending
																			}
																		>
																			Cancel
																		</Button>
																		<Button
																			onClick={handleUpdateIntegration}
																			disabled={
																				updateIntegrationMutation.isPending
																			}
																		>
																			{updateIntegrationMutation.isPending
																				? "Updating..."
																				: "Update Integration"}
																		</Button>
																	</DialogFooter>
																</DialogContent>
															</Dialog>

															<button
																type="button"
																className="group flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
																onClick={() =>
																	handleDeleteIntegrationClick(integration)
																}
															>
																<Trash2 className="h-3.5 w-3.5 group-hover:text-red-500" />
															</button>
														</div>
													</TableCell>
												</TableRow>
												{expandedRows.has(integration.id) && (
													<TableRow key={`${integration.id}-expanded`}>
														<TableCell colSpan={5} className="bg-muted/50">
															<div className="space-y-3 p-3">
																<h4 className="font-semibold text-xs">
																	Integration Details
																</h4>
																{/* Mapping Data */}
																<div className="space-y-1.5">
																	<p className="font-medium text-muted-foreground text-xs">
																		Mapping Data
																	</p>
																	<div className="rounded-lg border bg-background p-3">
																		<pre className="overflow-x-auto font-mono text-xs leading-relaxed">
																			{integration.mapping}
																		</pre>
																	</div>
																</div>

																{/* Additional Info */}
																<div className="grid gap-3 border-t pt-3 sm:grid-cols-2 lg:grid-cols-3">
																	<div className="space-y-1">
																		<p className="font-medium text-muted-foreground text-xs">
																			Integration ID
																		</p>
																		<code className="block rounded bg-muted px-2 py-1 font-mono text-xs">
																			{integration.id}
																		</code>
																	</div>
																	{integration.imageKey && (
																		<div className="space-y-1">
																			<p className="font-medium text-muted-foreground text-xs">
																				Image Key
																			</p>
																			<code className="block rounded bg-muted px-2 py-1 font-mono text-xs">
																				{integration.imageKey}
																			</code>
																		</div>
																	)}
																	<div className="space-y-1">
																		<p className="font-medium text-muted-foreground text-xs">
																			Status
																		</p>
																		<Badge
																			variant={
																				integration.isActive
																					? "default"
																					: "secondary"
																			}
																			className="text-xs"
																		>
																			{integration.isActive
																				? "Active"
																				: "Inactive"}
																		</Badge>
																	</div>
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

				{/* Info Card */}
				<div
					className="w-full rounded-lg border text-card-foreground shadow-sm"
					style={{ backgroundColor: "hsl(var(--background))" }}
				>
					<div className="border-border border-b px-6 py-4">
						<div className="mb-3">
							<h2 className="flex items-center gap-2 font-medium text-foreground text-sm">
								<Plug className="h-4 w-4" />
								About Integrations
							</h2>
						</div>
					</div>
					<div className="space-y-3 p-4 text-sm">
						<div>
							<h4 className="mb-1.5 font-semibold text-xs">
								What are Integrations?
							</h4>
							<p className="text-muted-foreground text-xs">
								Integrations allow you to connect external services by storing
								mapping data that can be used to transform and route events.
							</p>
						</div>
						<div>
							<h4 className="mb-1.5 font-semibold text-xs">How to use:</h4>
							<ol className="list-inside list-decimal space-y-1 text-muted-foreground text-xs">
								<li>Create an integration with a name</li>
								<li>Paste your mapping data</li>
								<li>
									Toggle the status to activate or deactivate the integration
								</li>
							</ol>
						</div>
						<div>
							<h4 className="mb-1.5 font-semibold text-xs">Mapping Data:</h4>
							<p className="text-muted-foreground text-xs">
								Store any mapping configuration or data needed for your
								integration. This can be JSON, text, or any format your
								application requires.
							</p>
						</div>
					</div>
				</div>
				{/* Create Dialog */}
				<Dialog
					open={isCreateOpen}
					onOpenChange={(open) => {
						setIsCreateOpen(open);
						if (!open) resetForm();
					}}
				>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle className="text-base">
								Create New Integration
							</DialogTitle>
							<DialogDescription className="text-xs">
								Add a new external integration
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-3 py-3">
							{/* Top row: Name */}
							<div className="grid gap-1.5">
								<Label htmlFor="name" className="text-xs">
									Name *
								</Label>
								<Input
									id="name"
									placeholder="e.g., TikTok Events"
									value={formName}
									onChange={(e) => setFormName(e.target.value)}
								/>
							</div>

							{/* Image Upload */}
							<div className="grid gap-1.5">
								<Label htmlFor="imageFile" className="text-xs">
									Integration Image
								</Label>
								{!formImageFile ? (
									<Input
										id="imageFile"
										type="file"
										accept="image/*,image/svg+xml,.svg"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												setFormImageFile(file);
											}
										}}
									/>
								) : (
									<div className="flex items-center gap-3 rounded-md border p-3">
										<img
											src={URL.createObjectURL(formImageFile)}
											alt="Preview"
											className="h-16 w-16 rounded object-cover"
										/>
										<div className="flex-1">
											<p className="font-medium text-sm">
												{formImageFile.name}
											</p>
											<p className="text-muted-foreground text-xs">
												{(formImageFile.size / 1024).toFixed(2)} KB
											</p>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => setFormImageFile(null)}
											className="h-8 w-8"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								)}
							</div>

							{/* Mapping field */}
							<div className="grid gap-1.5">
								<Label htmlFor="mapping" className="text-xs">
									Mapping Data *
								</Label>
								<Textarea
									id="mapping"
									placeholder="Paste your mapping data here..."
									value={formMapping}
									onChange={(e) => setFormMapping(e.target.value)}
									className="max-h-[400px] resize-none overflow-y-auto font-mono text-xs"
									rows={12}
								/>
								<p className="text-muted-foreground text-xs">
									Paste the mapping data for this integration
								</p>
							</div>

							{/* Status row */}
							<div className="flex items-center space-x-2">
								<Switch
									id="isActive"
									checked={formIsActive}
									onCheckedChange={setFormIsActive}
									variant="status"
								/>
								<Label htmlFor="isActive" className="cursor-pointer text-xs">
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
								disabled={createIntegrationMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreateIntegration}
								disabled={createIntegrationMutation.isPending}
							>
								{createIntegrationMutation.isPending
									? "Creating..."
									: "Create Integration"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Delete Dialog */}
				<DeleteDialog
					isOpen={isDeleteDialogOpen}
					selectedCount={1}
					selectedEventIds={
						selectedIntegrationToDelete ? [selectedIntegrationToDelete.id] : []
					}
					onOpenChange={setIsDeleteDialogOpen}
					onConfirm={handleDeleteIntegrationConfirm}
				/>
			</div>
		</div>
	);
}
