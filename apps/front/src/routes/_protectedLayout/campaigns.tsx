import { createFileRoute } from "@tanstack/react-router";
import {
	Check,
	ChevronDown,
	ChevronRight,
	Code,
	Copy,
	ExternalLink,
	Link as LinkIcon,
	Megaphone,
	Pencil,
	Plus,
	RefreshCw,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { CampaignPixelsSection } from "@/web/components/CampaignPixelsSection";
import { useSidebar } from "@/web/components/sidebar/sidebar-context";
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
import { Textarea } from "@/web/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/web/components/ui/tooltip";
import { useToast } from "@/web/hooks/use-toast";
import { useApiKeysList } from "@/web/hooks/useApiKeys";
import {
	type Campaign,
	type CampaignCreate,
	useCampaignsList,
	useCreateCampaign,
	useDeleteCampaign,
	useUpdateCampaign,
} from "@/web/hooks/useCampaigns";
import { useIntegrationsList } from "@/web/hooks/useIntegrations";

export const Route = createFileRoute("/_protectedLayout/campaigns")({
	component: CampaignsPage,
});

function CampaignsPage() {
	const { toast } = useToast();

	// TanStack Query hooks
	const {
		data: campaigns = [],
		isLoading,
		isFetching,
		refetch,
	} = useCampaignsList();
	const { data: apiKeysData = [] } = useApiKeysList();
	const { data: integrations = [] } = useIntegrationsList();
	const createCampaignMutation = useCreateCampaign();
	const updateCampaignMutation = useUpdateCampaign();
	const deleteCampaignMutation = useDeleteCampaign();

	// UI state
	const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(
		null,
	);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
		null,
	);

	// Generate Link Dialog state
	const [isGenerateLinkDialogOpen, setIsGenerateLinkDialogOpen] =
		useState(false);
	const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
	const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>("");
	const [selectedIntegrationId, setSelectedIntegrationId] =
		useState<string>("");
	const [manualRedirectUrl, setManualRedirectUrl] = useState<string>("");
	const [copiedLink, setCopiedLink] = useState(false);
	const [copiedWebhook, setCopiedWebhook] = useState(false);

	// Generate Script Dialog state
	const [isGenerateScriptDialogOpen, setIsGenerateScriptDialogOpen] =
		useState(false);
	const [scriptCampaignId, setScriptCampaignId] = useState<string>("");
	const [scriptApiKeyId, setScriptApiKeyId] = useState<string>("");
	const [scriptIntegrationId, setScriptIntegrationId] = useState<string>("");
	const [scriptCheckoutUrl, setScriptCheckoutUrl] = useState<string>("");

	// Form state
	const [formData, setFormData] = useState<CampaignCreate>({
		name: "",
		link: "",
		socialMediaCampaignId: "",
		isActive: true,
		eventReplication: false,
	});

	const handleRefresh = async () => {
		try {
			await refetch();
			toast({
				title: "Refreshed",
				description: "Campaigns list has been refreshed",
			});
		} catch {
			// Error silently handled - refetch failures are non-critical
		}
	};

	const toggleExpand = (campaignId: string) => {
		setExpandedCampaignId(
			expandedCampaignId === campaignId ? null : campaignId,
		);
	};

	const handleToggleActive = async (campaign: Campaign) => {
		try {
			await updateCampaignMutation.mutateAsync({
				id: campaign.id,
				data: {
					isActive: !campaign.isActive,
				},
			});
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleToggleEventReplication = async (campaign: Campaign) => {
		try {
			await updateCampaignMutation.mutateAsync({
				id: campaign.id,
				data: {
					eventReplication: !campaign.eventReplication,
				},
			});
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleCreateClick = () => {
		setFormData({
			name: "",
			link: "",
			socialMediaCampaignId: "",
			isActive: true,
			eventReplication: false,
		});
		setIsCreateDialogOpen(true);
	};

	const handleEditClick = (campaign: Campaign) => {
		setSelectedCampaign(campaign);
		setFormData({
			name: campaign.name,
			link: campaign.link,
			socialMediaCampaignId: campaign.socialMediaCampaignId || "",
			isActive: campaign.isActive,
			eventReplication: campaign.eventReplication,
		});
		setIsEditDialogOpen(true);
	};

	const handleDeleteClick = (campaign: Campaign) => {
		setSelectedCampaign(campaign);
		setIsDeleteDialogOpen(true);
	};

	const handleCreateSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await createCampaignMutation.mutateAsync(formData);
			setIsCreateDialogOpen(false);
			resetForm();
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedCampaign) return;

		try {
			await updateCampaignMutation.mutateAsync({
				id: selectedCampaign.id,
				data: {
					name: formData.name,
					link: formData.link,
					socialMediaCampaignId: formData.socialMediaCampaignId || undefined,
					isActive: formData.isActive,
					eventReplication: formData.eventReplication,
				},
			});
			setIsEditDialogOpen(false);
			resetForm();
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleDeleteConfirm = async () => {
		if (!selectedCampaign) return;

		try {
			await deleteCampaignMutation.mutateAsync(selectedCampaign.id);
			setIsDeleteDialogOpen(false);
			setSelectedCampaign(null);
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			link: "",
			socialMediaCampaignId: "",
			isActive: true,
			eventReplication: false,
		});
		setSelectedCampaign(null);
	};

	const formatDate = (date?: Date | number | string) => {
		if (!date) return "N/A";
		try {
			return new Date(date).toLocaleString("en-US", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			});
		} catch {
			return "N/A";
		}
	};

	// Generate Link Dialog functions
	const handleGenerateLinkClick = () => {
		setSelectedCampaignId("");
		setSelectedApiKeyId("");
		setSelectedIntegrationId("");
		setManualRedirectUrl("");
		setCopiedLink(false);

		setIsGenerateLinkDialogOpen(true);
	};

	const generateWebhookUrl = (): string => {
		if (!selectedIntegrationId) return "";

		const selectedIntegration = integrations.find(
			(i) => i.id === selectedIntegrationId,
		);
		if (!selectedIntegration) return "";

		const baseUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;
		return `${baseUrl}/v1/events?integration=${selectedIntegration.name}`;
	};

	const generateRedirectUrl = (): string => {
		if (!selectedCampaignId || !selectedApiKeyId) return "";

		const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
		const selectedApiKey = apiKeysData.find((k) => k.id === selectedApiKeyId);

		if (!selectedApiKey) return "";

		const redirectUrl =
			selectedIntegrationId && generateWebhookUrl()
				? generateWebhookUrl()
				: manualRedirectUrl || selectedCampaign?.link || "";

		if (!redirectUrl) return "";

		const baseUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;
		return `${baseUrl}/v1/redirect/${selectedCampaignId}?redirect_url=${encodeURIComponent(redirectUrl)}&api_key=${selectedApiKey.key || selectedApiKey.id}`;
	};

	const handleCopyGeneratedLink = () => {
		const url = generateRedirectUrl();
		if (!url) {
			toast({
				title: "Error",
				description: "Please fill in all required fields",
				variant: "destructive",
			});
			return;
		}

		navigator.clipboard.writeText(url);
		setCopiedLink(true);
		toast({
			title: "Copied!",
			description: "Redirect link copied to clipboard",
		});
		setTimeout(() => setCopiedLink(false), 2000);
	};

	// Generate Script Dialog functions
	const handleGenerateScriptClick = () => {
		setScriptCampaignId("");
		setScriptApiKeyId("");
		setScriptIntegrationId("");
		setScriptCheckoutUrl("");

		setIsGenerateScriptDialogOpen(true);
	};

	const generateScriptWebhookUrl = (): string => {
		if (!scriptIntegrationId) return "";

		const selectedIntegration = integrations.find(
			(i) => i.id === scriptIntegrationId,
		);
		if (!selectedIntegration) return "";

		const baseUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;
		return `${baseUrl}/v1/events?integration=${selectedIntegration.name}`;
	};

	const generateScript = (): string => {
		const selectedApiKey = apiKeysData.find((k) => k.id === scriptApiKeyId);
		const apiKeyValue =
			selectedApiKey?.key || selectedApiKey?.id || "[YOUR_API_KEY]";
		const campaignIdValue = scriptCampaignId || "[CAMPAIGN_ID]";

		const checkoutUrlAttr = scriptCheckoutUrl
			? `\n  checkout_url="${scriptCheckoutUrl}"`
			: "";

		return `<script
  src="https://s3.traki.io/traki.js"
  api_key="${apiKeyValue}"
  campaign_id="${campaignIdValue}"${checkoutUrlAttr}>
</script>`;
	};

	const handleCopyScript = () => {
		const script = generateScript();
		if (!scriptCampaignId || !scriptApiKeyId) {
			toast({
				title: "Error",
				description: "Please select both campaign and API key",
				variant: "destructive",
			});
			return;
		}

		navigator.clipboard.writeText(script);
		toast({
			title: "Copied!",
			description: "Script copied to clipboard",
		});
	};

	const { isExpanded } = useSidebar();

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div
				className={`flex items-center gap-3 bg-background pt-8 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				<Megaphone className="h-4 w-4" />
				<h1 className="font-semibold text-base">Campaigns</h1>
			</div>
			<div
				className={`flex-1 overflow-y-scroll pt-3 pb-5 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				{/* Main Campaigns Card */}
				<div
					className="w-full rounded-lg border text-card-foreground shadow-sm"
					style={{ backgroundColor: "hsl(var(--background))" }}
				>
					<div className="border-border border-b px-6 py-4">
						<div className="mb-3">
							<h2 className="font-medium text-foreground text-sm">
								Campaigns List
							</h2>
						</div>
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1">
								<p className="text-muted-foreground text-sm">
									{campaigns.length === 0
										? "No campaigns yet"
										: `Showing ${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}`}
								</p>
							</div>
							<div className="flex gap-1.5">
								<button
									type="button"
									onClick={handleRefresh}
									disabled={isFetching}
									className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent"
									title="Refresh campaigns"
								>
									<RefreshCw
										className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
									/>
								</button>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												type="button"
												onClick={handleGenerateLinkClick}
												disabled={campaigns.length === 0}
												className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${campaigns.length === 0 ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50" : "border-border bg-background hover:bg-accent"}`}
											>
												<LinkIcon className="h-4 w-4" />
												<span className="hidden md:inline">Generate Link</span>
											</button>
										</TooltipTrigger>
										<TooltipContent side="bottom" className="max-w-sm">
											<p className="font-semibold">Generate Redirect Link</p>
											<p className="mt-1">
												Generate a trackable redirect link for your campaign
												that captures user data.
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												type="button"
												onClick={handleGenerateScriptClick}
												disabled={campaigns.length === 0}
												className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${campaigns.length === 0 ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50" : "border-border bg-background hover:bg-accent"}`}
											>
												<Code className="h-4 w-4" />
												<span className="hidden md:inline">
													Generate Script
												</span>
											</button>
										</TooltipTrigger>
										<TooltipContent side="bottom" className="max-w-sm">
											<p className="font-semibold">Generate Tracking Script</p>
											<p className="mt-1">
												Generate a JavaScript snippet to track user interactions
												on your website for this campaign.
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<button
								type="button"
								onClick={handleCreateClick}
								className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-medium text-sm transition-colors hover:bg-accent"
							>
								<Plus className="h-4 w-4" />
								New Campaign
							</button>
						</div>
					</div>
					<div className="p-4">
						{isLoading ? (
							<div className="space-y-3">
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
							</div>
						) : campaigns.length === 0 ? (
							<div className="py-12 text-center">
								<Megaphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
								<h3 className="mb-2 font-medium text-lg">No Campaigns</h3>
								<p className="mb-4 text-muted-foreground text-sm">
									Create your first campaign to get started
								</p>
								<Button onClick={handleCreateClick} className="gap-2">
									<Plus className="h-4 w-4" />
									Create Campaign
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[50px]" />
											<TableHead className="w-[200px]">Name</TableHead>
											<TableHead className="w-[200px]">Created At</TableHead>
											<TableHead>Event Replication</TableHead>
											<TableHead className="w-[100px] text-right">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{campaigns.map((campaign) => (
											<>
												<TableRow
													key={campaign.id}
													className="cursor-pointer"
													onClick={() => toggleExpand(campaign.id)}
												>
													<TableCell>
														<button
															type="button"
															className="flex h-6 w-6 items-center justify-center rounded-md border-0 bg-transparent p-0 transition-colors hover:bg-accent"
															onClick={(e) => {
																e.stopPropagation();
																toggleExpand(campaign.id);
															}}
														>
															{expandedCampaignId === campaign.id ? (
																<ChevronDown className="h-4 w-4" />
															) : (
																<ChevronRight className="h-4 w-4" />
															)}
														</button>
													</TableCell>
													<TableCell className="max-w-[150px] truncate font-medium text-sm">
														{campaign.name}
													</TableCell>
													<TableCell className="text-muted-foreground text-xs">
														{formatDate(campaign.createdAt)}
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-1.5">
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger asChild>
																		<div>
																			<Switch
																				checked={campaign.eventReplication}
																				onCheckedChange={() =>
																					handleToggleEventReplication(campaign)
																				}
																				onClick={(e) => e.stopPropagation()}
																				variant="status"
																			/>
																		</div>
																	</TooltipTrigger>
																	<TooltipContent
																		side="top"
																		className="max-w-md"
																	>
																		<p className="font-semibold">
																			Event Replication{" "}
																			{campaign.eventReplication
																				? "Enabled"
																				: "Disabled"}
																		</p>
																		<p className="mt-1 text-xs">
																			{campaign.eventReplication
																				? "Events from this campaign are being replicated to your active integrations."
																				: "Enable to replicate events from this campaign to your integrations."}
																		</p>
																		{campaign.eventReplication ? (
																			<div className="mt-3">
																				<EventReplicationEnabledIcon />
																				<p className="mt-2 text-center text-muted-foreground text-xs">
																					Event replicated to all pixels
																					simultaneously
																				</p>
																			</div>
																		) : (
																			<div className="mt-3">
																				<EventReplicationDisabledIcon />
																				<p className="mt-2 text-center text-muted-foreground text-xs">
																					Events sent to one pixel at a time
																				</p>
																			</div>
																		)}
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
															<span className="text-muted-foreground text-xs">
																{campaign.eventReplication
																	? "Enabled"
																	: "Disabled"}
															</span>
														</div>
													</TableCell>
													<TableCell className="text-right">
														<div className="flex items-center justify-end gap-1.5">
															<Switch
																checked={campaign.isActive}
																onCheckedChange={() =>
																	handleToggleActive(campaign)
																}
																onClick={(e) => e.stopPropagation()}
																variant="status"
															/>
															<button
																type="button"
																className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
																onClick={(e) => {
																	e.stopPropagation();
																	handleEditClick(campaign);
																}}
															>
																<Pencil className="h-3.5 w-3.5" />
															</button>
															<button
																type="button"
																className="group flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
																onClick={(e) => {
																	e.stopPropagation();
																	handleDeleteClick(campaign);
																}}
															>
																<Trash2 className="h-3.5 w-3.5 group-hover:text-red-500" />
															</button>
														</div>
													</TableCell>
												</TableRow>
												{expandedCampaignId === campaign.id && (
													<TableRow key={`${campaign.id}-expanded`}>
														<TableCell colSpan={5} className="bg-muted/50">
															<div className="space-y-3 p-3">
																<h4 className="font-semibold text-xs">
																	Campaign Details
																</h4>
																<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
																	<DetailItem
																		label="Campaign ID"
																		value={campaign.id}
																	/>
																	{campaign.socialMediaCampaignId && (
																		<DetailItem
																			label="Social Media Campaign ID"
																			value={campaign.socialMediaCampaignId}
																		/>
																	)}
																	<DetailItem
																		label="User ID"
																		value={campaign.userId}
																	/>
																	<DetailItem
																		label="Updated At"
																		value={formatDate(campaign.updatedAt)}
																	/>
																	<DetailItem
																		label="Link"
																		value={
																			<a
																				href={campaign.link}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
																				onClick={(e) => e.stopPropagation()}
																			>
																				<span className="max-w-[300px] truncate">
																					{campaign.link}
																				</span>
																				<ExternalLink className="h-3 w-3 shrink-0" />
																			</a>
																		}
																		className="md:col-span-2 lg:col-span-3"
																	/>
																</div>

																{/* Campaign Pixels Section */}
																<CampaignPixelsSection
																	campaignId={campaign.id}
																/>
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

				{/* Create Dialog */}
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogContent>
						<form onSubmit={handleCreateSubmit}>
							<DialogHeader>
								<DialogTitle className="text-base">
									Create New Campaign
								</DialogTitle>
								<DialogDescription className="text-xs">
									Add a new campaign to track your marketing efforts.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-3 py-3">
								<div className="grid gap-1.5">
									<Label htmlFor="create-name" className="text-xs">
										Name *
									</Label>
									<Input
										id="create-name"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder="Summer Sale 2024"
										required
									/>
								</div>
								<div className="grid gap-1.5">
									<Label htmlFor="create-link" className="text-xs">
										Link (optional)
										<span className="ml-1 text-muted-foreground text-xs">
											- Campaign destination URL
										</span>
									</Label>
									<Input
										id="create-link"
										type="url"
										value={formData.link}
										onChange={(e) =>
											setFormData({ ...formData, link: e.target.value })
										}
										placeholder="https://example.com/landing-page"
									/>
								</div>
								<div className="grid gap-1.5">
									<Label htmlFor="create-campaignId" className="text-xs">
										Campaign ID (optional)
										<span className="ml-1 text-muted-foreground text-xs">
											- Social media campaign ID
										</span>
									</Label>
									<Input
										id="create-campaignId"
										value={formData.socialMediaCampaignId || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												socialMediaCampaignId: e.target.value,
											})
										}
										placeholder="summer-2024"
									/>
								</div>
								<div className="flex flex-row items-center gap-4">
									<div className="flex items-center space-x-2">
										<Switch
											id="create-isActive"
											checked={formData.isActive ?? true}
											onCheckedChange={(checked) =>
												setFormData({ ...formData, isActive: checked })
											}
											variant="status"
										/>
										<Label htmlFor="create-isActive" className="text-xs">
											{formData.isActive ? "Active" : "Inactive"}
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<Switch
											id="create-eventReplication"
											checked={formData.eventReplication ?? false}
											onCheckedChange={(checked) =>
												setFormData({ ...formData, eventReplication: checked })
											}
										/>
										<Label
											htmlFor="create-eventReplication"
											className="text-xs"
										>
											Event Replication
										</Label>
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsCreateDialogOpen(false)}
									disabled={createCampaignMutation.isPending}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={createCampaignMutation.isPending}
								>
									{createCampaignMutation.isPending
										? "Creating..."
										: "Create Campaign"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>

				{/* Edit Dialog */}
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent>
						<form onSubmit={handleEditSubmit}>
							<DialogHeader>
								<DialogTitle className="text-base">Edit Campaign</DialogTitle>
								<DialogDescription className="text-xs">
									Update campaign information.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-3 py-3">
								<div className="grid gap-1.5">
									<Label htmlFor="edit-name" className="text-xs">
										Name *
									</Label>
									<Input
										id="edit-name"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder="Summer Sale 2024"
										required
									/>
								</div>
								<div className="grid gap-1.5">
									<Label htmlFor="edit-link" className="text-xs">
										Link (optional)
										<span className="ml-1 text-muted-foreground text-xs">
											- Campaign destination URL
										</span>
									</Label>
									<Input
										id="edit-link"
										type="url"
										value={formData.link}
										onChange={(e) =>
											setFormData({ ...formData, link: e.target.value })
										}
										placeholder="https://example.com/landing-page"
									/>
								</div>
								<div className="grid gap-1.5">
									<Label htmlFor="edit-campaignId" className="text-xs">
										Campaign ID (optional)
										<span className="ml-1 text-muted-foreground text-xs">
											- Social media campaign ID
										</span>
									</Label>
									<Input
										id="edit-campaignId"
										value={formData.socialMediaCampaignId || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												socialMediaCampaignId: e.target.value,
											})
										}
										placeholder="summer-2024"
									/>
								</div>
								<div className="flex flex-row items-center gap-4">
									<div className="flex items-center space-x-2">
										<Switch
											id="edit-isActive"
											checked={formData.isActive ?? true}
											onCheckedChange={(checked) =>
												setFormData({ ...formData, isActive: checked })
											}
											variant="status"
										/>
										<Label htmlFor="edit-isActive" className="text-xs">
											{formData.isActive ? "Active" : "Inactive"}
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<Switch
											id="edit-eventReplication"
											checked={formData.eventReplication ?? false}
											onCheckedChange={(checked) =>
												setFormData({ ...formData, eventReplication: checked })
											}
										/>
										<Label htmlFor="edit-eventReplication" className="text-xs">
											Event Replication
										</Label>
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsEditDialogOpen(false)}
									disabled={updateCampaignMutation.isPending}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={updateCampaignMutation.isPending}
								>
									{updateCampaignMutation.isPending
										? "Saving..."
										: "Save Changes"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>

				{/* Delete Dialog */}
				<DeleteDialog
					isOpen={isDeleteDialogOpen}
					selectedCount={1}
					selectedEventIds={selectedCampaign ? [selectedCampaign.id] : []}
					onOpenChange={setIsDeleteDialogOpen}
					onConfirm={handleDeleteConfirm}
				/>

				{/* Generate Link Dialog */}
				<Dialog
					open={isGenerateLinkDialogOpen}
					onOpenChange={setIsGenerateLinkDialogOpen}
				>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle className="text-base">
								Generate Redirect Link
							</DialogTitle>
							<DialogDescription className="text-xs">
								Generate a trackable redirect link for your campaign
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-3 py-3">
							<div className="grid gap-1.5">
								<Label htmlFor="link-campaign" className="text-xs">
									Campaign *
								</Label>
								<Select
									value={selectedCampaignId}
									onValueChange={setSelectedCampaignId}
								>
									<SelectTrigger id="link-campaign">
										<SelectValue placeholder="Select a campaign" />
									</SelectTrigger>
									<SelectContent>
										{campaigns.map((campaign) => (
											<SelectItem key={campaign.id} value={campaign.id}>
												{campaign.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-1.5">
								<Label htmlFor="link-api-key" className="text-xs">
									API Key *
								</Label>
								<Select
									value={selectedApiKeyId}
									onValueChange={setSelectedApiKeyId}
								>
									<SelectTrigger id="link-api-key">
										<SelectValue placeholder="Select an API key" />
									</SelectTrigger>
									<SelectContent>
										{apiKeysData
											.filter((key) => key.isActive)
											.map((key) => (
												<SelectItem key={key.id} value={key.id}>
													{key.name}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
								{apiKeysData.filter((k) => k.isActive).length === 0 && (
									<p className="text-muted-foreground text-xs">
										No active API keys available. Please create one first.
									</p>
								)}
							</div>

							<div className="grid gap-1.5">
								<Label htmlFor="link-redirect-url" className="text-xs">
									Redirect URL (optional)
									<span className="ml-1 text-muted-foreground text-xs">
										- Where users will be redirected
									</span>
								</Label>
								<Input
									id="link-redirect-url"
									type="url"
									placeholder="https://example.com/landing-page"
									value={manualRedirectUrl}
									onChange={(e) => setManualRedirectUrl(e.target.value)}
								/>
							</div>

							<div className="grid gap-1.5">
								<Label htmlFor="link-integration" className="text-xs">
									Payment Integration (optional)
									<span className="ml-1 text-muted-foreground text-xs">
										- Automatically generate webhook URL
									</span>
								</Label>
								<div className="flex gap-2">
									<Select
										value={selectedIntegrationId}
										onValueChange={setSelectedIntegrationId}
									>
										<SelectTrigger id="link-integration">
											<SelectValue placeholder="Select a payment integration" />
										</SelectTrigger>
										<SelectContent>
											{integrations
												.filter((integration) => integration.isActive)
												.map((integration) => (
													<SelectItem
														key={integration.id}
														value={integration.id}
													>
														{integration.name}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
									{selectedIntegrationId && (
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setSelectedIntegrationId("")}
											className="shrink-0"
											type="button"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</div>
								{integrations.filter((i) => i.isActive).length === 0 && (
									<p className="text-muted-foreground text-xs">
										No active integrations available.
									</p>
								)}
							</div>

							{selectedIntegrationId && generateWebhookUrl() && (
								<div className="grid gap-1.5">
									<Label className="text-xs">Webhook URL</Label>
									<div className="flex gap-2">
										<Input
											value={generateWebhookUrl()}
											readOnly
											className="font-mono text-xs"
										/>
										<Button
											variant="outline"
											size="icon"
											onClick={() => {
												navigator.clipboard.writeText(generateWebhookUrl());
												setCopiedWebhook(true);
												setTimeout(() => setCopiedWebhook(false), 2000);
												toast({
													title: "Copied!",
													description: "Webhook URL copied to clipboard",
												});
											}}
											className="shrink-0"
											type="button"
										>
											{copiedWebhook ? (
												<Check className="h-4 w-4" />
											) : (
												<Copy className="h-4 w-4" />
											)}
										</Button>
									</div>
								</div>
							)}

							{generateRedirectUrl() && (
								<div className="grid gap-1.5">
									<Label className="text-xs">Generated Link</Label>
									<div className="flex gap-2">
										<Input
											value={generateRedirectUrl()}
											readOnly
											className="font-mono text-xs"
										/>
										<Button
											variant="outline"
											size="icon"
											onClick={() => {
												navigator.clipboard.writeText(generateRedirectUrl());
												setCopiedLink(true);
												setTimeout(() => setCopiedLink(false), 2000);
											}}
											className="shrink-0"
											type="button"
										>
											{copiedLink ? (
												<Check className="h-4 w-4" />
											) : (
												<Copy className="h-4 w-4" />
											)}
										</Button>
									</div>
								</div>
							)}
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsGenerateLinkDialogOpen(false)}
							>
								Close
							</Button>
							<Button
								onClick={handleCopyGeneratedLink}
								disabled={!generateRedirectUrl()}
							>
								<Copy className="mr-2 h-4 w-4" />
								Copy Link
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Generate Script Dialog */}
				<Dialog
					open={isGenerateScriptDialogOpen}
					onOpenChange={setIsGenerateScriptDialogOpen}
				>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle className="text-base">
								Generate Tracking Script
							</DialogTitle>
							<DialogDescription className="text-xs">
								Generate a tracking script to embed on your website
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-3 py-3">
							<div className="grid gap-1.5">
								<Label htmlFor="script-campaign" className="text-xs">
									Campaign *
								</Label>
								<Select
									value={scriptCampaignId}
									onValueChange={setScriptCampaignId}
								>
									<SelectTrigger id="script-campaign">
										<SelectValue placeholder="Select a campaign" />
									</SelectTrigger>
									<SelectContent>
										{campaigns.map((campaign) => (
											<SelectItem key={campaign.id} value={campaign.id}>
												{campaign.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-1.5">
								<Label htmlFor="script-api-key" className="text-xs">
									API Key *
								</Label>
								<Select
									value={scriptApiKeyId}
									onValueChange={setScriptApiKeyId}
								>
									<SelectTrigger id="script-api-key">
										<SelectValue placeholder="Select an API key" />
									</SelectTrigger>
									<SelectContent>
										{apiKeysData
											.filter((key) => key.isActive)
											.map((key) => (
												<SelectItem key={key.id} value={key.id}>
													{key.name}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
								{apiKeysData.filter((k) => k.isActive).length === 0 && (
									<p className="text-muted-foreground text-xs">
										No active API keys available. Please create one first.
									</p>
								)}
							</div>

							<div className="grid gap-1.5">
								<Label htmlFor="script-integration" className="text-xs">
									Payment Integration (optional)
									<span className="ml-1 text-muted-foreground text-xs">
										- Automatically generate webhook URL
									</span>
								</Label>
								<div className="flex gap-2">
									<Select
										value={scriptIntegrationId}
										onValueChange={setScriptIntegrationId}
									>
										<SelectTrigger id="script-integration">
											<SelectValue placeholder="Select a payment integration" />
										</SelectTrigger>
										<SelectContent>
											{integrations
												.filter((integration) => integration.isActive)
												.map((integration) => (
													<SelectItem
														key={integration.id}
														value={integration.id}
													>
														{integration.name}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
									{scriptIntegrationId && (
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setScriptIntegrationId("")}
											className="shrink-0"
											type="button"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</div>
								{integrations.filter((i) => i.isActive).length === 0 && (
									<p className="text-muted-foreground text-xs">
										No active integrations available.
									</p>
								)}
							</div>

							<div className="grid gap-1.5">
								<Label htmlFor="script-checkout-url" className="text-xs">
									Checkout URL (optional)
									<span className="ml-1 text-muted-foreground text-xs">
										- URL pattern to detect checkout pages
									</span>
								</Label>
								<Input
									id="script-checkout-url"
									type="text"
									placeholder="/checkout,/payment,https://example.com/checkout"
									value={scriptCheckoutUrl}
									onChange={(e) => setScriptCheckoutUrl(e.target.value)}
								/>
								<p className="text-muted-foreground text-xs">
									Supports multiple patterns separated by commas. Can be URL
									strings or regex patterns.
								</p>
							</div>

							{scriptIntegrationId && generateScriptWebhookUrl() && (
								<div className="grid gap-1.5">
									<Label className="text-xs">Webhook URL</Label>
									<div className="flex gap-2">
										<Input
											value={generateScriptWebhookUrl()}
											readOnly
											className="font-mono text-xs"
										/>
										<Button
											variant="outline"
											size="icon"
											onClick={() => {
												navigator.clipboard.writeText(
													generateScriptWebhookUrl(),
												);
												toast({
													title: "Copied!",
													description: "Webhook URL copied to clipboard",
												});
											}}
											className="shrink-0"
											type="button"
										>
											<Copy className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}

							{generateScript() && (
								<div className="grid gap-1.5">
									<Label className="text-xs">Generated Script</Label>
									<Textarea
										value={generateScript()}
										readOnly
										className="resize-none bg-muted font-mono text-xs"
										rows={5}
									/>
								</div>
							)}
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsGenerateScriptDialogOpen(false)}
							>
								Close
							</Button>
							<Button onClick={handleCopyScript} disabled={!generateScript()}>
								<Copy className="mr-2 h-4 w-4" />
								Copy Script
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}

function EventReplicationEnabledIcon() {
	return (
		<div className="relative h-32 w-full">
			<svg
				className="h-full w-full"
				viewBox="0 0 300 120"
				role="img"
				aria-label="Event replication enabled - broadcast to all pixels"
			>
				<defs>
					<pattern
						id="grid-replication-enabled"
						width="10"
						height="10"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 10 0 L 0 0 0 10"
							fill="none"
							stroke="currentColor"
							strokeWidth="0.3"
							className="text-border"
						/>
					</pattern>
				</defs>
				<rect
					width="300"
					height="120"
					fill="url(#grid-replication-enabled)"
					opacity="0.2"
				/>

				{/* User node (left) */}
				<rect
					x="10"
					y="50"
					width="30"
					height="20"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className="text-foreground"
					rx="2"
				/>
				<text
					x="25"
					y="63"
					textAnchor="middle"
					className="fill-current font-mono text-[8px] text-foreground"
				>
					USER
				</text>

				{/* TRAKI node (center) */}
				<rect
					x="125"
					y="50"
					width="50"
					height="20"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					className="text-foreground"
					rx="2"
				/>
				<text
					x="150"
					y="63"
					textAnchor="middle"
					className="fill-current font-bold font-mono text-[9px] text-foreground"
				>
					TRAKI
				</text>

				{/* Pixel nodes (right) */}
				{[
					{ y: 20, label: "FB-PIXEL", id: "pixel-fb" },
					{ y: 50, label: "TTK-PIXEL", id: "pixel-tik" },
					{ y: 80, label: "RDT-PIXEL", id: "pixel-rdt" },
				].map((pixel) => (
					<g key={pixel.id}>
						<rect
							x="245"
							y={pixel.y}
							width="45"
							height="20"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="text-border"
							rx="2"
						/>
						<text
							x="267.5"
							y={pixel.y + 13}
							textAnchor="middle"
							className="fill-current font-mono text-[7px] text-foreground"
						>
							{pixel.label}
						</text>
					</g>
				))}

				{/* Connection lines */}
				{/* User -> TRAKI */}
				<line
					x1="40"
					y1="60"
					x2="125"
					y2="60"
					stroke="currentColor"
					strokeWidth="1.5"
					className="text-foreground/20"
					strokeDasharray="3,3"
				/>

				{/* TRAKI -> Pixels */}
				{[
					{ y: 30, id: "line-fb" },
					{ y: 60, id: "line-tik" },
					{ y: 90, id: "line-rdt" },
				].map((line) => (
					<line
						key={line.id}
						x1="175"
						y1="60"
						x2="245"
						y2={line.y}
						stroke="currentColor"
						strokeWidth="1.5"
						className="text-foreground/20"
						strokeDasharray="3,3"
					/>
				))}

				{/* Path definitions */}
				<path
					id="path-user-traki"
					d="M 40 60 L 125 60 L 175 60"
					fill="none"
					stroke="none"
				/>
				<path
					id="path-traki-fb"
					d="M 175 60 L 245 30"
					fill="none"
					stroke="none"
				/>
				<path
					id="path-traki-tik"
					d="M 175 60 L 245 60"
					fill="none"
					stroke="none"
				/>
				<path
					id="path-traki-rdt"
					d="M 175 60 L 245 90"
					fill="none"
					stroke="none"
				/>

				{/* First event cycle: Blue origin -> broadcasts to all */}
				{/* Blue event: User -> TRAKI (0-2s) */}
				<circle r="2.5" fill="#3b82f6">
					<animateMotion dur="2s" repeatCount="indefinite" begin="0s">
						<mpath href="#path-user-traki" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="2s"
						begin="0s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>
				{/* Blue broadcast: TRAKI -> FB (2-4s) */}
				<circle r="2.5" fill="#3b82f6">
					<animateMotion dur="2s" repeatCount="indefinite" begin="2s">
						<mpath href="#path-traki-fb" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="2s"
						begin="2s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>
				{/* Red broadcast: TRAKI -> TIK (2-4s) */}
				<circle r="2.5" fill="#ef4444">
					<animateMotion dur="2s" repeatCount="indefinite" begin="2s">
						<mpath href="#path-traki-tik" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="2s"
						begin="2s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>
				{/* Orange broadcast: TRAKI -> RDT (2-4s) */}
				<circle r="2.5" fill="#f97316">
					<animateMotion dur="2s" repeatCount="indefinite" begin="2s">
						<mpath href="#path-traki-rdt" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="2s"
						begin="2s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>

				{/* Second event cycle: Red origin -> broadcasts to all */}
				{/* Red event: User -> TRAKI (2-4s) */}
				<circle r="2.5" fill="#ef4444">
					<animateMotion dur="2s" repeatCount="indefinite" begin="2s">
						<mpath href="#path-user-traki" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="2s"
						begin="2s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>
				{/* Blue broadcast: TRAKI -> FB (4-6s) */}
				<circle r="2.5" fill="#3b82f6">
					<animateMotion dur="2s" repeatCount="indefinite" begin="4s">
						<mpath href="#path-traki-fb" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="2s"
						begin="4s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>
				{/* Red broadcast: TRAKI -> TIK (4-6s) */}
				<circle r="2.5" fill="#ef4444">
					<animateMotion dur="2s" repeatCount="indefinite" begin="4s">
						<mpath href="#path-traki-tik" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="2s"
						begin="4s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>
				{/* Orange broadcast: TRAKI -> RDT (4-6s) */}
				<circle r="2.5" fill="#f97316">
					<animateMotion dur="2s" repeatCount="indefinite" begin="4s">
						<mpath href="#path-traki-rdt" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="2s"
						begin="4s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>

				{/* Third event cycle: Orange origin -> broadcasts to all */}
				{/* Orange event: User -> TRAKI (4-6s) */}
				<circle r="2.5" fill="#f97316">
					<animateMotion dur="2s" repeatCount="indefinite" begin="4s">
						<mpath href="#path-user-traki" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="2s"
						begin="4s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>
				{/* Blue broadcast: TRAKI -> FB (6-8s, wraps to 0-2s) */}
				<circle r="2.5" fill="#3b82f6">
					<animateMotion dur="2s" repeatCount="indefinite" begin="6s">
						<mpath href="#path-traki-fb" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="2s"
						begin="6s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>
				{/* Red broadcast: TRAKI -> TIK (6-8s, wraps to 0-2s) */}
				<circle r="2.5" fill="#ef4444">
					<animateMotion dur="2s" repeatCount="indefinite" begin="6s">
						<mpath href="#path-traki-tik" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="2s"
						begin="6s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>
				{/* Orange broadcast: TRAKI -> RDT (6-8s, wraps to 0-2s) */}
				<circle r="2.5" fill="#f97316">
					<animateMotion dur="2s" repeatCount="indefinite" begin="6s">
						<mpath href="#path-traki-rdt" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="2s"
						begin="6s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>

				{/* Receive indicators on pixels (all at once) */}
				{[
					{ y: 30, id: "indicator-fb-enabled", color: "#3b82f6" },
					{ y: 60, id: "indicator-tik-enabled", color: "#ef4444" },
					{ y: 90, id: "indicator-rdt-enabled", color: "#f97316" },
				].map((indicator) => (
					<circle
						key={indicator.id}
						cx="267.5"
						cy={indicator.y + 10}
						r="3"
						fill={indicator.color}
						opacity="0"
					>
						<animate
							attributeName="opacity"
							values="0;1;0"
							dur="0.6s"
							begin="3.6s"
							repeatCount="indefinite"
							repeatDur="6s"
						/>
					</circle>
				))}
			</svg>
		</div>
	);
}

function EventReplicationDisabledIcon() {
	return (
		<div className="relative h-32 w-full">
			<svg
				className="h-full w-full"
				viewBox="0 0 300 120"
				role="img"
				aria-label="Event replication disabled - one pixel at a time"
			>
				<defs>
					<pattern
						id="grid-replication-disabled"
						width="10"
						height="10"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 10 0 L 0 0 0 10"
							fill="none"
							stroke="currentColor"
							strokeWidth="0.3"
							className="text-border"
						/>
					</pattern>
				</defs>
				<rect
					width="300"
					height="120"
					fill="url(#grid-replication-disabled)"
					opacity="0.2"
				/>

				{/* User node (left) */}
				<rect
					x="10"
					y="50"
					width="30"
					height="20"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className="text-foreground"
					rx="2"
				/>
				<text
					x="25"
					y="63"
					textAnchor="middle"
					className="fill-current font-mono text-[8px] text-foreground"
				>
					USER
				</text>

				{/* TRAKI node (center) */}
				<rect
					x="125"
					y="50"
					width="50"
					height="20"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					className="text-foreground"
					rx="2"
				/>
				<text
					x="150"
					y="63"
					textAnchor="middle"
					className="fill-current font-bold font-mono text-[9px] text-foreground"
				>
					TRAKI
				</text>

				{/* Pixel nodes (right) */}
				{[
					{ y: 20, label: "FB-PIXEL", id: "pixel-fb" },
					{ y: 50, label: "TTK-PIXEL", id: "pixel-tik" },
					{ y: 80, label: "RDT-PIXEL", id: "pixel-rdt" },
				].map((pixel) => (
					<g key={pixel.id}>
						<rect
							x="245"
							y={pixel.y}
							width="45"
							height="20"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="text-border"
							rx="2"
						/>
						<text
							x="267.5"
							y={pixel.y + 13}
							textAnchor="middle"
							className="fill-current font-mono text-[7px] text-foreground"
						>
							{pixel.label}
						</text>
					</g>
				))}

				{/* Connection lines */}
				{/* User -> TRAKI */}
				<line
					x1="40"
					y1="60"
					x2="125"
					y2="60"
					stroke="currentColor"
					strokeWidth="1.5"
					className="text-foreground/20"
					strokeDasharray="3,3"
				/>

				{/* TRAKI -> Pixels */}
				{[
					{ y: 30, id: "line-fb" },
					{ y: 60, id: "line-tik" },
					{ y: 90, id: "line-rdt" },
				].map((line) => (
					<line
						key={line.id}
						x1="175"
						y1="60"
						x2="245"
						y2={line.y}
						stroke="currentColor"
						strokeWidth="1.5"
						className="text-foreground/20"
						strokeDasharray="3,3"
					/>
				))}

				{/* Animation 1: User -> TRAKI -> FB (Blue) */}
				<circle r="2.5" fill="#3b82f6">
					<animateMotion dur="4s" repeatCount="indefinite" begin="0s">
						<mpath href="#path-user-traki-1" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="4s"
						begin="0s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>
				<path
					id="path-user-traki-1"
					d="M 40 60 L 125 60 L 175 60 L 245 30"
					fill="none"
					stroke="none"
				/>

				{/* Animation 2: User -> TRAKI -> TIK (Red) */}
				<circle r="2.5" fill="#ef4444">
					<animateMotion dur="4s" repeatCount="indefinite" begin="1.5s">
						<mpath href="#path-user-traki-2" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="4s"
						begin="1.5s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>
				<path
					id="path-user-traki-2"
					d="M 40 60 L 125 60 L 175 60 L 245 60"
					fill="none"
					stroke="none"
				/>

				{/* Animation 3: User -> TRAKI -> RDT (Orange) */}
				<circle r="2.5" fill="#f97316">
					<animateMotion dur="4s" repeatCount="indefinite" begin="3s">
						<mpath href="#path-user-traki-3" />
					</animateMotion>
					<animate
						attributeName="opacity"
						values="0;1;1;0"
						dur="4s"
						begin="3s"
						repeatCount="indefinite"
						keyTimes="0;0.1;0.4;0.5"
					/>
				</circle>
				<path
					id="path-user-traki-3"
					d="M 40 60 L 125 60 L 175 60 L 245 90"
					fill="none"
					stroke="none"
				/>

				{/* Receive indicators on pixels */}
				{[
					{ y: 30, delay: "0.8s", id: "indicator-fb", color: "#3b82f6" },
					{ y: 60, delay: "2.3s", id: "indicator-tik", color: "#ef4444" },
					{ y: 90, delay: "3.8s", id: "indicator-rdt", color: "#f97316" },
				].map((indicator) => (
					<circle
						key={indicator.id}
						cx="267.5"
						cy={indicator.y + 10}
						r="3"
						fill={indicator.color}
						opacity="0"
					>
						<animate
							attributeName="opacity"
							values="0;1;0"
							dur="0.6s"
							begin={indicator.delay}
							repeatCount="indefinite"
							repeatDur="6s"
						/>
					</circle>
				))}
			</svg>
		</div>
	);
}

function DetailItem({
	label,
	value,
	className = "",
}: {
	label: string;
	value: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={`space-y-1 ${className}`}>
			<p className="font-medium text-muted-foreground text-xs">{label}</p>
			<p className="break-all text-sm">{value}</p>
		</div>
	);
}
