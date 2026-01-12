import { createFileRoute } from "@tanstack/react-router";
import {
	ChevronDown,
	ChevronRight,
	Globe,
	Plus,
	RefreshCw,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useSidebar } from "@/web/components/sidebar/sidebar-context";
import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import { DeleteConfirmDialog } from "@/web/components/ui/delete-confirm-dialog";
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
	type Domain,
	type DomainCreate,
	useCreateDomain,
	useDeleteDomain,
	useDomainsList,
	useUpdateDomain,
} from "@/web/hooks/useDomains";

export const Route = createFileRoute("/_protectedLayout/domains")({
	component: DomainsPage,
});

// Validate hostname format
function validateHostname(hostname: string): string {
	if (!hostname) return "";

	// Check for protocol
	if (/^https?:\/\//i.test(hostname)) {
		return "Hostname cannot contain protocol (https:// or http://)";
	}

	// Check for paths
	if (hostname.includes("/")) {
		return "Hostname cannot contain paths";
	}

	// Check valid domain format
	if (
		!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/.test(
			hostname,
		)
	) {
		return "Invalid hostname format. Use only domain name (e.g., example.com)";
	}

	return "";
}

function DomainsPage() {
	const { toast } = useToast();

	// TanStack Query hooks
	const {
		data: domains = [],
		isLoading,
		isFetching,
		refetch,
	} = useDomainsList();
	const createDomainMutation = useCreateDomain();
	const updateDomainMutation = useUpdateDomain();
	const deleteDomainMutation = useDeleteDomain();

	// UI state
	const [expandedDomainId, setExpandedDomainId] = useState<string | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
	const [checkingStatusId, setCheckingStatusId] = useState<string | null>(null);

	// Form state for create
	const [formData, setFormData] = useState<DomainCreate>({
		hostname: "",
	});
	const [createHostnameError, setCreateHostnameError] = useState<string>("");

	const handleRefresh = async () => {
		try {
			await refetch();
			toast({
				title: "Refreshed",
				description: "Domains list has been refreshed",
			});
		} catch {
			// Error silently handled - refetch failures are non-critical
		}
	};

	const toggleExpand = (domainId: string) => {
		setExpandedDomainId(expandedDomainId === domainId ? null : domainId);
	};

	const handleCreateClick = () => {
		setFormData({
			hostname: "",
		});
		setCreateHostnameError("");
		setIsCreateDialogOpen(true);
	};

	const handleCreateHostnameChange = (value: string) => {
		setFormData({ hostname: value });
		setCreateHostnameError(validateHostname(value));
	};

	const handleCheckStatus = async (domainId: string) => {
		setCheckingStatusId(domainId);
		try {
			await updateDomainMutation.mutateAsync({
				id: domainId,
				data: {},
			});
		} catch {
			// Error is already handled by the mutation's onError
		} finally {
			setCheckingStatusId(null);
		}
	};

	const handleDeleteClick = (domain: Domain) => {
		setSelectedDomain(domain);
		setIsDeleteDialogOpen(true);
	};

	const handleCreateSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.hostname || createHostnameError) {
			toast({
				title: "Validation Error",
				description: "Please enter a valid hostname",
				variant: "destructive",
			});
			return;
		}

		try {
			await createDomainMutation.mutateAsync(formData);
			setIsCreateDialogOpen(false);
			setFormData({ hostname: "" });
			setCreateHostnameError("");
		} catch {
			// Error is already handled by the mutation's onError
		}
	};

	const handleDeleteConfirm = async () => {
		if (!selectedDomain) return;

		try {
			await deleteDomainMutation.mutateAsync(selectedDomain.id);
			setIsDeleteDialogOpen(false);
			setSelectedDomain(null);
		} catch {
			// Error is already handled by the mutation's onError
		}
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

	const getStatusColor = (status?: string): "default" | "outline" => {
		if (!status) return "outline";

		const statusLower = status.toLowerCase();

		// Green - Only for active status (everything is OK)
		if (statusLower === "active") {
			return "default";
		}

		// Everything else is white/black (outline)
		return "outline";
	};

	const getStatusIndicatorColor = (
		domainStatus?: string,
		sslStatus?: string,
	) => {
		// Only green if BOTH are active
		if (
			domainStatus?.toLowerCase() === "active" &&
			sslStatus?.toLowerCase() === "active"
		) {
			return "bg-green-500";
		}

		// Red if either is failed/deleted/expired/inactive
		const redStatuses = ["failed", "deleted", "expired", "inactive"];
		if (
			redStatuses.includes(domainStatus?.toLowerCase() || "") ||
			redStatuses.includes(sslStatus?.toLowerCase() || "")
		) {
			return "bg-red-500";
		}

		// Yellow for pending states
		const yellowStatuses = [
			"pending",
			"pending_validation",
			"pending_issuance",
			"pending_deployment",
			"initializing",
		];
		if (
			yellowStatuses.includes(domainStatus?.toLowerCase() || "") ||
			yellowStatuses.includes(sslStatus?.toLowerCase() || "")
		) {
			return "bg-yellow-500";
		}

		// Default gray
		return "bg-gray-500";
	};

	const { isExpanded } = useSidebar();

	return (
		<div className="flex h-full flex-col">
			<div
				className={`flex items-center gap-3 bg-background pt-8 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				<Globe className="h-4 w-4" />
				<h1 className="font-semibold text-base">Domains</h1>
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
								Domains List
							</h2>
						</div>
						<div className="flex items-center justify-between gap-4">
							<p className="text-muted-foreground text-sm">
								{domains.length === 0
									? "No domains yet"
									: `Showing ${domains.length} domain${domains.length === 1 ? "" : "s"}`}
							</p>
							<div className="flex gap-1.5">
								<button
									type="button"
									onClick={handleRefresh}
									disabled={isFetching}
									className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
									title="Refresh domains"
								>
									<RefreshCw
										className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
									/>
									<span className="hidden md:inline">Refresh</span>
								</button>
								<button
									type="button"
									onClick={handleCreateClick}
									className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-medium text-sm transition-colors hover:bg-accent"
								>
									<Plus className="h-4 w-4" />
									<span className="hidden md:inline">New Domain</span>
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
						) : domains.length === 0 ? (
							<div className="py-8 text-center">
								<Globe className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
								<h3 className="mb-1 font-medium text-sm">No Domains</h3>
								<p className="mb-3 text-muted-foreground text-xs">
									Add your first custom domain to get started
								</p>
								<button
									type="button"
									onClick={handleCreateClick}
									className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-medium text-sm transition-colors hover:bg-accent"
								>
									<Plus className="h-4 w-4" />
									Add Domain
								</button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[40px]" />
											<TableHead className="w-[150px]">Hostname</TableHead>
											<TableHead className="w-[100px]">Status</TableHead>
											<TableHead className="w-[100px]">SSL Status</TableHead>
											<TableHead className="w-[150px]">Errors</TableHead>
											<TableHead className="w-[100px] text-right">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{domains.map((domain) => (
											<>
												<TableRow
													key={domain.id}
													className="cursor-pointer"
													onClick={() => toggleExpand(domain.id)}
												>
													<TableCell>
														<button
															type="button"
															className="flex h-6 w-6 items-center justify-center rounded-md border-0 bg-transparent p-0 transition-colors hover:bg-accent"
															onClick={(e) => {
																e.stopPropagation();
																toggleExpand(domain.id);
															}}
														>
															{expandedDomainId === domain.id ? (
																<ChevronDown className="h-4 w-4" />
															) : (
																<ChevronRight className="h-4 w-4" />
															)}
														</button>
													</TableCell>
													<TableCell className="font-medium text-sm">
														<div className="flex items-center gap-2">
															<div
																className={`h-2 w-2 rounded-full ${getStatusIndicatorColor(domain.status, domain.sslStatus)}`}
																title={`Domain Status: ${domain.status} | SSL Status: ${domain.sslStatus}`}
															/>
															<span className="max-w-[120px] truncate">
																{domain.hostname}
															</span>
														</div>
													</TableCell>
													<TableCell>
														<Badge
															variant={getStatusColor(domain.status)}
															className="text-xs"
														>
															{domain.status}
														</Badge>
													</TableCell>
													<TableCell>
														<Badge
															variant={getStatusColor(domain.sslStatus)}
															className="text-xs"
														>
															{domain.sslStatus}
														</Badge>
													</TableCell>
													<TableCell className="text-muted-foreground text-xs">
														{domain.verificationErrors &&
														domain.verificationErrors !== "[]" ? (
															<span className="text-destructive text-xs">
																{domain.verificationErrors.length > 50
																	? `${domain.verificationErrors.substring(0, 50)}...`
																	: domain.verificationErrors}
															</span>
														) : (
															<span className="text-muted-foreground text-xs">
																-
															</span>
														)}
													</TableCell>
													<TableCell className="text-right">
														<div className="flex items-center justify-end gap-1.5">
															<button
																type="button"
																onClick={(e) => {
																	e.stopPropagation();
																	handleCheckStatus(domain.id);
																}}
																disabled={checkingStatusId === domain.id}
																title="Check status from Cloudflare"
																className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:hover:border-gray-600"
															>
																<RefreshCw
																	className={`h-3.5 w-3.5 ${checkingStatusId === domain.id ? "animate-spin" : ""}`}
																/>
															</button>
															<button
																type="button"
																className="group flex h-7 w-7 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
																onClick={(e) => {
																	e.stopPropagation();
																	handleDeleteClick(domain);
																}}
															>
																<Trash2 className="h-3.5 w-3.5 group-hover:text-red-500" />
															</button>
														</div>
													</TableCell>
												</TableRow>
												{expandedDomainId === domain.id && (
													<TableRow key={`${domain.id}-expanded`}>
														<TableCell colSpan={6} className="bg-muted/50">
															<div className="space-y-3 p-3">
																<h4 className="font-semibold text-xs">
																	Domain Details
																</h4>
																<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
																	<DetailItem
																		label="Domain ID"
																		value={domain.id}
																	/>
																	<DetailItem
																		label="Custom Hostname ID"
																		value={domain.customHostnameId}
																	/>
																	<DetailItem
																		label="User ID"
																		value={domain.userId}
																	/>
																	{domain.verificationErrors &&
																		domain.verificationErrors !== "[]" && (
																			<DetailItem
																				label="Errors"
																				value={domain.verificationErrors}
																				className="md:col-span-2 lg:col-span-3"
																			/>
																		)}
																	<DetailItem
																		label="Created At"
																		value={formatDate(domain.createdAt)}
																	/>
																	<DetailItem
																		label="Updated At"
																		value={formatDate(domain.updatedAt)}
																	/>
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

				{/* Create Dialog */}
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogContent>
						<form onSubmit={handleCreateSubmit}>
							<DialogHeader>
								<DialogTitle className="text-base">Add New Domain</DialogTitle>
								<DialogDescription className="text-xs">
									Add a custom domain to your account.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-3 py-3">
								<div className="grid gap-1.5">
									<Label htmlFor="create-hostname" className="text-xs">
										Hostname *
									</Label>
									<Input
										id="create-hostname"
										type="text"
										value={formData.hostname}
										onChange={(e) => handleCreateHostnameChange(e.target.value)}
										placeholder="example.com"
										className={createHostnameError ? "border-destructive" : ""}
										required
									/>
									{createHostnameError ? (
										<p className="text-destructive text-xs">
											{createHostnameError}
										</p>
									) : (
										<p className="text-muted-foreground text-xs">
											Enter domain name only, without https:// or paths
										</p>
									)}
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsCreateDialogOpen(false)}
									disabled={createDomainMutation.isPending}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={
										createDomainMutation.isPending ||
										!!createHostnameError ||
										!formData.hostname
									}
								>
									{createDomainMutation.isPending ? "Adding..." : "Add Domain"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>

				{/* Delete Dialog */}
				<DeleteConfirmDialog
					isOpen={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					onConfirm={handleDeleteConfirm}
					itemName={selectedDomain?.hostname || ""}
					itemType="Domain"
					isDeleting={deleteDomainMutation.isPending}
				/>
			</div>
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
