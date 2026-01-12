import { createFileRoute } from "@tanstack/react-router";
import {
	CheckCircle,
	Clock,
	Edit2,
	Facebook,
	Loader2,
	Plug,
	Plus,
	RefreshCw,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useSidebar } from "@/web/components/sidebar/sidebar-context";
import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import { CopyableId } from "@/web/components/ui/copyable-id";
import { DeleteDialog } from "@/web/components/ui/delete-dialog";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/web/components/ui/select";
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
	type Pixel,
	type PixelActivationStatus,
	type PlatformType,
	useActivatePixel,
	useCreatePixel,
	useDeletePixel,
	usePixelsList,
	useUpdatePixel,
} from "@/web/hooks/usePixels";
import { authClient } from "@/web/lib/auth-client";

export const Route = createFileRoute("/_protectedLayout/pixels")({
	component: PixelsPage,
});

// Platform Icon Components
const RedditIcon = () => (
	<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
		<path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
	</svg>
);

const PinterestIcon = () => (
	<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
		<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
	</svg>
);

const TikTokIcon = () => (
	<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
		<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
	</svg>
);

const FacebookIcon2 = () => <Facebook className="h-5 w-5" />;

const KwaiIcon = () => (
	<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
		<title>Kwai</title>
		<text
			x="12"
			y="17"
			fontFamily="system-ui, -apple-system, sans-serif"
			fontSize="16"
			fontWeight="600"
			textAnchor="middle"
		>
			KW
		</text>
	</svg>
);

const PLATFORM_ICONS: Record<PlatformType, React.FC> = {
	kwai: KwaiIcon,
	tiktok: TikTokIcon,
	reddit: RedditIcon,
	facebook: FacebookIcon2,
	pinterest: PinterestIcon,
};

const PLATFORM_LABELS: Record<PlatformType, string> = {
	kwai: "Kwai",
	tiktok: "TikTok",
	reddit: "Reddit",
	facebook: "Facebook",
	pinterest: "Pinterest",
};

const PLATFORM_DISABLED: Record<PlatformType, boolean> = {
	kwai: false,
	tiktok: false,
	reddit: false,
	facebook: false,
	pinterest: false,
};

const PLATFORM_BETA: Record<PlatformType, boolean> = {
	kwai: true,
	tiktok: true,
	reddit: true,
	facebook: true,
	pinterest: true,
};

// Status Badge Component
function StatusBadge({
	status,
	onClick,
	disabled,
}: {
	status: PixelActivationStatus | null;
	onClick?: () => void;
	disabled?: boolean;
}) {
	// Se status for "complete", mostra badge verde não clicável
	if (status === "complete") {
		return (
			<Badge
				variant="default"
				className="w-[100px] cursor-default justify-center bg-green-500 hover:bg-green-500"
			>
				<CheckCircle className="mr-1 h-3 w-3" />
				Active
			</Badge>
		);
	}

	// Se status for "running", mostra badge amarelo suave não clicável
	if (status === "running") {
		return (
			<Badge
				variant="default"
				className="w-[100px] cursor-default justify-center bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-300"
			>
				<Loader2 className="mr-1 h-3 w-3 animate-spin" />
				Running
			</Badge>
		);
	}

	// Se tiver outro status, mostra badge outline não clicável
	if (status) {
		return (
			<Badge
				variant="outline"
				className="w-[100px] cursor-default justify-center"
			>
				<Clock className="mr-1 h-3 w-3" />
				{status}
			</Badge>
		);
	}

	// Se não tiver status, mostra o botão "Activate" clicável
	return (
		<Button
			variant="outline"
			size="sm"
			className="h-7 w-[100px] px-3"
			onClick={onClick}
			disabled={disabled}
		>
			<Plug className="mr-1 h-3 w-3" />
			Activate
		</Button>
	);
}

function PixelsPage() {
	const { toast } = useToast();
	const { data: session } = authClient.useSession();

	// TanStack Query hooks
	const { data: pixels = [], isLoading, isFetching, refetch } = usePixelsList();
	const createPixelMutation = useCreatePixel();
	const updatePixelMutation = useUpdatePixel();
	const deletePixelMutation = useDeletePixel();
	const activatePixelMutation = useActivatePixel();

	// UI state
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingPixel, setEditingPixel] = useState<Pixel | null>(null);
	const [activatingPixelId, setActivatingPixelId] = useState<string | null>(
		null,
	);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedPixelToDelete, setSelectedPixelToDelete] =
		useState<Pixel | null>(null);

	// Form state
	const [formName, setFormName] = useState("");
	const [formPlatform, setFormPlatform] = useState<PlatformType>("reddit");
	const [formApiKey, setFormApiKey] = useState("");
	const [formPixelId, setFormPixelId] = useState("");
	const [formTestId, setFormTestId] = useState("");
	const [formIsActive, setFormIsActive] = useState(true);

	const maskApiKey = (apiKey: string) => {
		if (apiKey.length <= 8) return "***";
		return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
	};

	const handleCreatePixel = async () => {
		if (!formName || !formApiKey || !formPixelId) {
			toast({
				title: "Validation Error",
				description: "Name, API Key, and Pixel ID are required",
				variant: "destructive",
			});
			return;
		}

		try {
			await createPixelMutation.mutateAsync({
				name: formName,
				platform: formPlatform,
				apiKey: formApiKey,
				pixelId: formPixelId,
				testId: formTestId || undefined,
				isActive: formIsActive,
			});

			setIsCreateOpen(false);
			resetForm();
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleUpdatePixel = async () => {
		if (!editingPixel) return;

		if (!formName || !formApiKey || !formPixelId) {
			toast({
				title: "Validation Error",
				description: "Name, API Key, and Pixel ID are required",
				variant: "destructive",
			});
			return;
		}

		try {
			await updatePixelMutation.mutateAsync({
				id: editingPixel.id,
				data: {
					name: formName,
					platform: formPlatform,
					apiKey: formApiKey,
					pixelId: formPixelId,
					testId: formTestId || undefined,
					isActive: formIsActive,
				},
			});

			setEditingPixel(null);
			resetForm();
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleDeletePixelClick = (pixel: Pixel) => {
		setSelectedPixelToDelete(pixel);
		setIsDeleteDialogOpen(true);
	};

	const handleDeletePixelConfirm = async () => {
		if (!selectedPixelToDelete) return;
		try {
			await deletePixelMutation.mutateAsync(selectedPixelToDelete.id);
			setIsDeleteDialogOpen(false);
			setSelectedPixelToDelete(null);
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const openEditDialog = (pixel: Pixel) => {
		setEditingPixel(pixel);
		setFormName(pixel.name);
		setFormPlatform(pixel.platform as PlatformType);
		setFormApiKey(pixel.apiKey);
		setFormPixelId(pixel.pixelId);
		setFormTestId(pixel.testId || "");
		setFormIsActive(pixel.isActive);
	};

	const resetForm = () => {
		setFormName("");
		setFormPlatform("reddit");
		setFormApiKey("");
		setFormPixelId("");
		setFormTestId("");
		setFormIsActive(true);
		setEditingPixel(null);
	};

	const handleRefresh = async () => {
		try {
			await refetch();
			toast({
				title: "Refreshed",
				description: "Pixels list has been refreshed",
			});
		} catch {
			// Error silently handled - refetch failures are non-critical
		}
	};

	const handleToggleActive = async (pixel: Pixel) => {
		try {
			await updatePixelMutation.mutateAsync({
				id: pixel.id,
				data: {
					name: pixel.name,
					platform: pixel.platform,
					apiKey: pixel.apiKey,
					pixelId: pixel.pixelId,
					testId: pixel.testId,
					isActive: !pixel.isActive,
				},
			});
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleActivatePixel = async (pixelId: string) => {
		setActivatingPixelId(pixelId);
		try {
			await activatePixelMutation.mutateAsync(pixelId);
		} catch {
			// Error is already handled by the mutation's onError
		} finally {
			setActivatingPixelId(null);
		}
	};

	const { isExpanded } = useSidebar();

	return (
		<div className="flex h-full flex-col">
			<div
				className={`flex items-center gap-3 bg-background pt-8 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				<Plug className="h-4 w-4" />
				<h1 className="font-semibold text-base">Pixels</h1>
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
								Your Pixels
							</h2>
						</div>
						<div className="flex items-center justify-between gap-4">
							<p className="text-muted-foreground text-sm">
								Connected ad platforms for CAPI event replication
							</p>
							<div className="flex gap-1.5">
								<button
									type="button"
									onClick={handleRefresh}
									disabled={isFetching}
									className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
									title="Refresh pixels"
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
									<span className="hidden md:inline">Add Pixel</span>
								</button>
							</div>
						</div>
					</div>
					<div className="p-4">
						{isLoading ? (
							<div className="space-y-2">
								{[...Array(3)].map((_, i) => (
									<Skeleton key={i} className="h-12 w-full" />
								))}
							</div>
						) : pixels.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<Plug className="mb-4 h-12 w-12 text-muted-foreground" />
								<h3 className="mb-2 font-semibold text-lg">No Pixels Yet</h3>
								<p className="mb-4 text-muted-foreground text-sm">
									Add your first ad platform pixel to start replicating events
								</p>
								<Button
									onClick={() => setIsCreateOpen(true)}
									disabled={!session?.user?.id}
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Pixel
								</Button>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[150px]">Name</TableHead>
										<TableHead className="w-[100px]">Platform</TableHead>
										<TableHead className="w-[150px]">Pixel ID</TableHead>
										<TableHead className="w-[150px]">API Key</TableHead>
										<TableHead className="w-[100px]">Status</TableHead>
										<TableHead className="w-[120px] text-right">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{pixels.map((pixel) => (
										<TableRow key={pixel.id}>
											<TableCell className="w-[150px] font-medium text-sm">
												{pixel.name}
											</TableCell>
											<TableCell className="w-[100px]">
												<div className="flex items-center gap-1.5">
													{(() => {
														const IconComponent =
															PLATFORM_ICONS[pixel.platform as PlatformType];
														return <IconComponent />;
													})()}
													<span className="text-xs">
														{PLATFORM_LABELS[pixel.platform as PlatformType]}
													</span>
												</div>
											</TableCell>
											<TableCell className="w-[150px]">
												<CopyableId
													id={pixel.pixelId}
													onCopy={() => {
														toast({
															title: "Copied!",
															description: "Pixel ID copied to clipboard",
														});
													}}
												/>
											</TableCell>
											<TableCell className="w-[150px]">
												<CopyableId
													id={pixel.apiKey}
													displayValue={maskApiKey(pixel.apiKey)}
													onCopy={() => {
														toast({
															title: "Copied!",
															description: "API Key copied to clipboard",
														});
													}}
												/>
											</TableCell>
											<TableCell className="w-[100px]">
												<div className="flex items-center">
													<StatusBadge
														status={pixel.activationWorkflowStatus}
														onClick={() => handleActivatePixel(pixel.id)}
														disabled={activatingPixelId === pixel.id}
													/>
												</div>
											</TableCell>
											<TableCell className="w-[120px] text-right">
												<div className="flex items-center justify-end gap-1.5">
													<Switch
														checked={pixel.isActive}
														onCheckedChange={() => handleToggleActive(pixel)}
														variant="status"
													/>
													<Dialog
														open={editingPixel?.id === pixel.id}
														onOpenChange={(open) => {
															if (!open) {
																setEditingPixel(null);
																resetForm();
															}
														}}
													>
														<DialogTrigger asChild>
															<button
																type="button"
																className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
																onClick={() => openEditDialog(pixel)}
															>
																<Edit2 className="h-3.5 w-3.5" />
															</button>
														</DialogTrigger>
														<DialogContent className="max-w-2xl">
															<DialogHeader>
																<DialogTitle className="text-base">
																	Edit Pixel
																</DialogTitle>
																<DialogDescription className="text-xs">
																	Update the pixel details
																</DialogDescription>
															</DialogHeader>
															<div className="space-y-3 py-3">
																<div className="space-y-1.5">
																	<Label
																		htmlFor="edit-name"
																		className="text-xs"
																	>
																		Name *
																	</Label>
																	<Input
																		id="edit-name"
																		value={formName}
																		onChange={(e) =>
																			setFormName(e.target.value)
																		}
																	/>
																</div>

																<div className="space-y-2">
																	<Label htmlFor="edit-platform">
																		Platform *
																	</Label>
																	<Select
																		value={formPlatform}
																		onValueChange={(value) => {
																			const newPlatform = value as PlatformType;
																			setFormPlatform(newPlatform);
																			if (newPlatform === "pinterest") {
																				setFormTestId("");
																			}
																		}}
																	>
																		<SelectTrigger>
																			<SelectValue placeholder="Select platform" />
																		</SelectTrigger>
																		<SelectContent>
																			{(
																				Object.keys(
																					PLATFORM_LABELS,
																				) as PlatformType[]
																			).map((platform) => {
																				const IconComponent =
																					PLATFORM_ICONS[platform];
																				const isDisabled =
																					PLATFORM_DISABLED[platform];
																				const isBeta = PLATFORM_BETA[platform];
																				return (
																					<SelectItem
																						key={platform}
																						value={platform}
																						disabled={isDisabled}
																					>
																						<div className="flex items-center gap-2">
																							<IconComponent />
																							<span>
																								{PLATFORM_LABELS[platform]}
																							</span>
																							{isDisabled && (
																								<Badge
																									variant="secondary"
																									className="ml-2 text-xs"
																								>
																									Coming soon
																								</Badge>
																							)}
																							{!isDisabled && isBeta && (
																								<Badge
																									variant="outline"
																									className="ml-2 text-xs"
																								>
																									Beta
																								</Badge>
																							)}
																						</div>
																					</SelectItem>
																				);
																			})}
																		</SelectContent>
																	</Select>
																</div>

																<div className="space-y-2">
																	<Label htmlFor="edit-apiKey">
																		API Key / Bearer Token *
																	</Label>
																	<Input
																		id="edit-apiKey"
																		type="password"
																		value={formApiKey}
																		onChange={(e) =>
																			setFormApiKey(e.target.value)
																		}
																	/>
																</div>

																<div className="space-y-2">
																	<Label htmlFor="edit-pixelId">
																		Pixel ID *
																	</Label>
																	<Input
																		id="edit-pixelId"
																		value={formPixelId}
																		onChange={(e) =>
																			setFormPixelId(e.target.value)
																		}
																	/>
																</div>

																<div className="space-y-2">
																	<Label htmlFor="edit-testId">
																		Test ID (optional)
																	</Label>
																	<Input
																		id="edit-testId"
																		value={formTestId}
																		onChange={(e) =>
																			setFormTestId(e.target.value)
																		}
																		disabled={formPlatform === "pinterest"}
																	/>
																	{formPlatform === "pinterest" && (
																		<p className="text-muted-foreground text-xs">
																			Test ID is not available for Pinterest
																		</p>
																	)}
																</div>

																<div className="flex items-center space-x-2">
																	<Switch
																		id="edit-isActive"
																		checked={formIsActive}
																		onCheckedChange={setFormIsActive}
																		variant="status"
																	/>
																	<Label htmlFor="edit-isActive">
																		{formIsActive ? "Active" : "Inactive"}
																	</Label>
																</div>
															</div>
															<DialogFooter>
																<Button
																	variant="outline"
																	onClick={() => {
																		setEditingPixel(null);
																		resetForm();
																	}}
																	disabled={updatePixelMutation.isPending}
																>
																	Cancel
																</Button>
																<Button
																	onClick={handleUpdatePixel}
																	disabled={updatePixelMutation.isPending}
																>
																	{updatePixelMutation.isPending
																		? "Updating..."
																		: "Update Pixel"}
																</Button>
															</DialogFooter>
														</DialogContent>
													</Dialog>

													<button
														type="button"
														className="group flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
														onClick={() => handleDeletePixelClick(pixel)}
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

				{/* Info Card */}
				<div
					className="w-full rounded-lg border text-card-foreground shadow-sm"
					style={{ backgroundColor: "hsl(var(--background))" }}
				>
					<div className="border-border border-b px-6 py-4">
						<h2 className="flex items-center gap-2 font-medium text-foreground text-sm">
							<Plug className="h-4 w-4" />
							About Pixels
						</h2>
					</div>
					<div className="space-y-3 p-4 text-xs">
						<div>
							<h4 className="mb-2 font-semibold">What are Pixels?</h4>
							<p className="text-muted-foreground">
								Pixels allow your tracking system to replicate events to ad
								platforms like Reddit, TikTok, and Pinterest via their
								Conversion API (CAPI). This enables better attribution and
								optimization of your ad campaigns.
							</p>
						</div>
						<div>
							<h4 className="mb-2 font-semibold">How to use:</h4>
							<ol className="list-inside list-decimal space-y-1 text-muted-foreground">
								<li>Create an pixel with your ad platform credentials</li>
								<li>Link the pixel to your campaigns</li>
								<li>
									Events will automatically replicate to the ad platform when
									tracked
								</li>
							</ol>
						</div>
						<div>
							<h4 className="mb-1 font-semibold">Security:</h4>
							<p className="text-muted-foreground">
								Your API keys are stored securely and encrypted. They are never
								exposed in logs or to other users.
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
							<DialogTitle className="text-base">Create New Pixel</DialogTitle>
							<DialogDescription className="text-xs">
								Add a new ad platform pixel to replicate events via CAPI
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-3 py-3">
							<div className="space-y-1.5">
								<Label htmlFor="duplicate" className="text-xs">
									Duplicate from (optional)
								</Label>
								<Select
									value=""
									onValueChange={(value) => {
										const sourcePixel = pixels.find((i) => i.id === value);
										if (sourcePixel) {
											// Generate unique name with " - Copy" suffix
											const generateCopyName = (
												originalName: string,
											): string => {
												const existingNames = pixels.map((i) =>
													i.name.toLowerCase(),
												);
												let newName = `${originalName} - Copy`;
												let counter = 2;

												while (existingNames.includes(newName.toLowerCase())) {
													newName = `${originalName} - Copy ${counter}`;
													counter++;
												}

												return newName;
											};

											setFormName(generateCopyName(sourcePixel.name));
											setFormPlatform(sourcePixel.platform as PlatformType);
											setFormApiKey(sourcePixel.apiKey);
											setFormPixelId(sourcePixel.pixelId);
											setFormTestId(sourcePixel.testId || "");
											setFormIsActive(sourcePixel.isActive);
										}
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select an pixel to duplicate" />
									</SelectTrigger>
									<SelectContent>
										{pixels.map((pixel) => {
											const IconComponent =
												PLATFORM_ICONS[pixel.platform as PlatformType];
											return (
												<SelectItem key={pixel.id} value={pixel.id}>
													<div className="flex items-center gap-2">
														<IconComponent />
														<span>{pixel.name}</span>
													</div>
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
								<p className="text-muted-foreground text-xs">
									Select an existing pixel to copy its settings
								</p>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="name" className="text-xs">
									Name *
								</Label>
								<Input
									id="name"
									placeholder="e.g., Reddit Prod Account"
									value={formName}
									onChange={(e) => setFormName(e.target.value)}
								/>
								<p className="text-muted-foreground text-xs">
									Name must be unique
								</p>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="platform" className="text-xs">
									Platform *
								</Label>
								<Select
									value={formPlatform}
									onValueChange={(value) => {
										const newPlatform = value as PlatformType;
										setFormPlatform(newPlatform);
										if (newPlatform === "pinterest") {
											setFormTestId("");
										}
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select platform" />
									</SelectTrigger>
									<SelectContent>
										{(Object.keys(PLATFORM_LABELS) as PlatformType[]).map(
											(platform) => {
												const IconComponent = PLATFORM_ICONS[platform];
												const isDisabled = PLATFORM_DISABLED[platform];
												const isBeta = PLATFORM_BETA[platform];
												return (
													<SelectItem
														key={platform}
														value={platform}
														disabled={isDisabled}
													>
														<div className="flex items-center gap-2">
															<IconComponent />
															<span>{PLATFORM_LABELS[platform]}</span>
															{isDisabled && (
																<Badge
																	variant="secondary"
																	className="ml-2 text-xs"
																>
																	Coming soon
																</Badge>
															)}
															{!isDisabled && isBeta && (
																<Badge
																	variant="outline"
																	className="ml-2 text-xs"
																>
																	Beta
																</Badge>
															)}
														</div>
													</SelectItem>
												);
											},
										)}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="apiKey" className="text-xs">
									API Key / Bearer Token *
								</Label>
								<Input
									id="apiKey"
									type="password"
									placeholder="Bearer token for authentication"
									value={formApiKey}
									onChange={(e) => setFormApiKey(e.target.value)}
								/>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="pixelId" className="text-xs">
									Pixel ID *
								</Label>
								<Input
									id="pixelId"
									placeholder="e.g., a2_ht44fea5nw70"
									value={formPixelId}
									onChange={(e) => setFormPixelId(e.target.value)}
								/>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="testId" className="text-xs">
									Test ID (optional)
								</Label>
								<Input
									id="testId"
									placeholder="e.g., t2_1gghedogzz"
									value={formTestId}
									onChange={(e) => setFormTestId(e.target.value)}
									disabled={formPlatform === "pinterest"}
								/>
								{formPlatform === "pinterest" && (
									<p className="text-muted-foreground text-xs">
										Test ID is not available for Pinterest
									</p>
								)}
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
								disabled={createPixelMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreatePixel}
								disabled={createPixelMutation.isPending}
							>
								{createPixelMutation.isPending ? "Creating..." : "Create Pixel"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Delete Dialog */}
				<DeleteDialog
					isOpen={isDeleteDialogOpen}
					selectedCount={1}
					selectedEventIds={
						selectedPixelToDelete ? [selectedPixelToDelete.id] : []
					}
					onOpenChange={setIsDeleteDialogOpen}
					onConfirm={handleDeletePixelConfirm}
				/>
			</div>
		</div>
	);
}
