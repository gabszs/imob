import { Plus, Settings, X } from "lucide-react";
import { useId, useState } from "react";
import {
	type CampaignPixel,
	type CampaignPixelCreate,
	useCampaignPixelsByCampaign,
	useCreateCampaignPixel,
	useDeleteCampaignPixel,
	useUpdateCampaignPixel,
} from "@/web/hooks/useCampaignPixels";
import { usePixelsList } from "@/web/hooks/usePixels";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";

interface CampaignPixelsSectionProps {
	campaignId: string;
}

export function CampaignPixelsSection({
	campaignId,
}: CampaignPixelsSectionProps) {
	// TanStack Query hooks
	const { data: campaignPixels = [], isLoading } =
		useCampaignPixelsByCampaign(campaignId);
	const { data: availablePixels = [] } = usePixelsList();
	const createCampaignPixelMutation = useCreateCampaignPixel();
	const updateCampaignPixelMutation = useUpdateCampaignPixel();
	const deleteCampaignPixelMutation = useDeleteCampaignPixel();

	// UI state
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
	const [selectedCI, setSelectedCI] = useState<CampaignPixel | null>(null);

	// Generate unique IDs for form elements
	const pixelSelectId = useId();
	const eventNameId = useId();
	const sendTestEventsId = useId();
	const isActiveId = useId();
	const configEventNameId = useId();
	const configSendTestEventsId = useId();
	const configIsActiveId = useId();

	// Add form state
	const [addFormData, setAddFormData] = useState<CampaignPixelCreate>({
		campaignId,
		pixelId: "",
		eventName: "",
		sendTestEvents: false,
		isActive: true,
	});

	// Config form state
	const [configFormData, setConfigFormData] = useState({
		eventName: "",
		sendTestEvents: false,
		isActive: true,
	});

	const getPixelDetails = (pixelId: string) => {
		return availablePixels.find((int) => int.id === pixelId);
	};

	const handleAddClick = () => {
		setAddFormData({
			campaignId,
			pixelId: "",
			eventName: "",
			sendTestEvents: false,
			isActive: true,
		});
		setIsAddDialogOpen(true);
	};

	const handleAddSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await createCampaignPixelMutation.mutateAsync(addFormData);
			setIsAddDialogOpen(false);
			resetAddForm();
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleConfigClick = (ci: CampaignPixel) => {
		setSelectedCI(ci);
		setConfigFormData({
			eventName: ci.eventName || "",
			sendTestEvents: ci.sendTestEvents,
			isActive: ci.isActive,
		});
		setIsConfigDialogOpen(true);
	};

	const handleConfigSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedCI) return;

		try {
			await updateCampaignPixelMutation.mutateAsync({
				id: selectedCI.id,
				data: configFormData,
			});
			setIsConfigDialogOpen(false);
			resetConfigForm();
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleToggleActive = async (ci: CampaignPixel) => {
		try {
			await updateCampaignPixelMutation.mutateAsync({
				id: ci.id,
				data: {
					isActive: !ci.isActive,
				},
			});
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleRemove = async (ci: CampaignPixel) => {
		if (
			!confirm("Are you sure you want to remove this pixel from the campaign?")
		) {
			return;
		}

		try {
			await deleteCampaignPixelMutation.mutateAsync(ci.id);
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const resetAddForm = () => {
		setAddFormData({
			campaignId,
			pixelId: "",
			eventName: "",
			sendTestEvents: false,
			isActive: true,
		});
	};

	const resetConfigForm = () => {
		setSelectedCI(null);
		setConfigFormData({
			eventName: "",
			sendTestEvents: false,
			isActive: true,
		});
	};

	const getAvailablePixelsForAdd = () => {
		const usedPixelIds = campaignPixels.map((ci) => ci.pixelId);
		return availablePixels.filter(
			(int) => !usedPixelIds.includes(int.id) && int.isActive,
		);
	};

	return (
		<Card className="mt-4">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Conversion Pixels</span>
					<Button onClick={handleAddClick} size="sm" variant="outline">
						<Plus className="mr-2 h-4 w-4" />
						Add Pixel
					</Button>
				</CardTitle>
				<CardDescription>
					Select which platforms to send conversion events for this campaign
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className="text-muted-foreground text-sm">Loading...</p>
				) : campaignPixels.length === 0 ? (
					<div className="py-8 text-center">
						<p className="mb-4 text-muted-foreground text-sm">
							No pixels configured for this campaign yet
						</p>
						<Button onClick={handleAddClick} size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add First Pixel
						</Button>
					</div>
				) : (
					<div className="space-y-3">
						{campaignPixels.map((ci) => {
							const pixel = getPixelDetails(ci.pixelId);
							return (
								<div
									key={ci.id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center gap-3">
										<div>
											<div className="flex items-center gap-2">
												<Badge variant="outline">
													{pixel?.platform || "Unknown"}
												</Badge>
												<span className="font-medium text-sm">
													{pixel?.name || ci.pixelId}
												</span>
											</div>
											{ci.eventName && (
												<p className="mt-1 text-muted-foreground text-xs">
													Event: {ci.eventName}
												</p>
											)}
											{ci.sendTestEvents && (
												<p className="mt-1 text-muted-foreground text-xs">
													Test events enabled
												</p>
											)}
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Switch
											checked={ci.isActive}
											onCheckedChange={() => handleToggleActive(ci)}
											variant="status"
											disabled={updateCampaignPixelMutation.isPending}
										/>
										<Button
											size="icon"
											variant="ghost"
											className="h-8 w-8 border border-transparent p-1.5 hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
											onClick={() => handleConfigClick(ci)}
										>
											<Settings className="h-4 w-4" />
										</Button>
										<Button
											size="icon"
											variant="ghost"
											className="group h-8 w-8 border border-transparent p-1.5 hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
											onClick={() => handleRemove(ci)}
											disabled={deleteCampaignPixelMutation.isPending}
										>
											<X className="h-4 w-4 text-destructive" />
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>

			{/* Add Pixel Dialog */}
			<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
				<DialogContent>
					<form onSubmit={handleAddSubmit}>
						<DialogHeader>
							<DialogTitle>Add Pixel</DialogTitle>
							<DialogDescription>
								Select an pixel to add to this campaign
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor={pixelSelectId}>Pixel *</Label>
								<Select
									value={addFormData.pixelId}
									onValueChange={(value) =>
										setAddFormData({ ...addFormData, pixelId: value })
									}
									required
								>
									<SelectTrigger id={pixelSelectId}>
										<SelectValue placeholder="Select an pixel" />
									</SelectTrigger>
									<SelectContent>
										{getAvailablePixelsForAdd().map((int) => (
											<SelectItem key={int.id} value={int.id}>
												{int.platform} - {int.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{getAvailablePixelsForAdd().length === 0 && (
									<p className="text-muted-foreground text-xs">
										No available pixels. All active pixels are already added or
										you need to create one first.
									</p>
								)}
							</div>
							<div className="grid gap-2">
								<Label htmlFor={eventNameId}>
									Event Name (optional)
									<span className="ml-1 text-muted-foreground text-xs">
										- e.g., "PURCHASE"
									</span>
								</Label>
								<Input
									id={eventNameId}
									value={addFormData.eventName ?? ""}
									onChange={(e) =>
										setAddFormData({
											...addFormData,
											eventName: e.target.value,
										})
									}
									placeholder="PURCHASE"
								/>
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									id={sendTestEventsId}
									checked={addFormData.sendTestEvents}
									onCheckedChange={(checked) =>
										setAddFormData({ ...addFormData, sendTestEvents: checked })
									}
								/>
								<Label htmlFor={sendTestEventsId}>Send test events</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									id={isActiveId}
									checked={addFormData.isActive}
									onCheckedChange={(checked) =>
										setAddFormData({ ...addFormData, isActive: checked })
									}
									variant="status"
								/>
								<Label htmlFor={isActiveId}>
									{addFormData.isActive ? "Active" : "Inactive"}
								</Label>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsAddDialogOpen(false)}
								disabled={createCampaignPixelMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={
									createCampaignPixelMutation.isPending || !addFormData.pixelId
								}
							>
								{createCampaignPixelMutation.isPending
									? "Adding..."
									: "Add Pixel"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Configure Pixel Dialog */}
			<Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
				<DialogContent>
					<form onSubmit={handleConfigSubmit}>
						<DialogHeader>
							<DialogTitle>Configure Pixel</DialogTitle>
							<DialogDescription>
								Update pixel settings for this campaign
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor={configEventNameId}>
									Event Name (optional)
									<span className="ml-1 text-muted-foreground text-xs">
										- e.g., "PURCHASE"
									</span>
								</Label>
								<Input
									id={configEventNameId}
									value={configFormData.eventName}
									onChange={(e) =>
										setConfigFormData({
											...configFormData,
											eventName: e.target.value,
										})
									}
									placeholder="PURCHASE"
								/>
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									id={configSendTestEventsId}
									checked={configFormData.sendTestEvents}
									onCheckedChange={(checked) =>
										setConfigFormData({
											...configFormData,
											sendTestEvents: checked,
										})
									}
								/>
								<Label htmlFor={configSendTestEventsId}>Send test events</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									id={configIsActiveId}
									checked={configFormData.isActive}
									onCheckedChange={(checked) =>
										setConfigFormData({ ...configFormData, isActive: checked })
									}
									variant="status"
								/>
								<Label htmlFor={configIsActiveId}>
									{configFormData.isActive ? "Active" : "Inactive"}
								</Label>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsConfigDialogOpen(false)}
								disabled={updateCampaignPixelMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={updateCampaignPixelMutation.isPending}
							>
								{updateCampaignPixelMutation.isPending
									? "Saving..."
									: "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
