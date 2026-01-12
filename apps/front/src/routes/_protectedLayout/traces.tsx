import { createFileRoute } from "@tanstack/react-router";
import {
	Chrome,
	Compass,
	Download,
	Layers,
	Monitor,
	Network,
	Plus,
	RotateCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSidebar } from "@/web/components/sidebar/sidebar-context";
import { AdvancedSearchInput } from "@/web/components/ui/advanced-search-input";
import { DeleteDialog } from "@/web/components/ui/delete-dialog";
import * as DropdownMenu from "@/web/components/ui/dropdown-menu";
import { convertToCSV, downloadFile } from "@/web/components/ui/event-utils";
import { ExportDialog } from "@/web/components/ui/export-dialog";
import { FilterDropdown } from "@/web/components/ui/filter-dropdown";
import {
	type Filter,
	FilterBadge,
} from "@/web/components/ui/logs/filter-badge";
import { TracesTable } from "@/web/components/ui/traces-table";
import { parseBrowser, parseOS } from "@/web/components/ui/user-agent-parser";
import { useDeleteTrace, useTracesList } from "@/web/hooks/useTraces";

export const Route = createFileRoute("/_protectedLayout/traces")({
	component: NewTracesPage,
});

const SOCIAL_NETWORKS = [
	"Facebook",
	"Kwai",
	"TikTok",
	"Reddit",
	"Pinterest",
	"Google",
] as const;

type SortField =
	| "id"
	| "created_at"
	| "campaign_id"
	| "city"
	| "country"
	| "utm_source";
type SortDirection = "asc" | "desc";

export default function NewTracesPage() {
	const [selectedNetworks, setSelectedNetworks] = useState(new Set<string>());
	const [searchValue, setSearchValue] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [sortField, setSortField] = useState<SortField | null>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
	const [ordering, setOrdering] = useState<string | null>(null);
	const [selectedRows, setSelectedRows] = useState(new Set<string>());
	const [expandedRows, setExpandedRows] = useState(new Set<string>());
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedTraceToDelete, setSelectedTraceToDelete] = useState<
		string | null
	>(null);
	const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
	const [page, setPage] = useState(1);
	const [allTraces, setAllTraces] = useState<any[]>([]);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [searchFilters, setSearchFilters] = useState<
		Array<{ field: string; operator: string; value: string }>
	>([]);
	const [filterBrowser, setFilterBrowser] = useState<string[]>([]);
	const [filterOS, setFilterOS] = useState<string[]>([]);
	const [filterCity, setFilterCity] = useState<string[]>([]);
	const [filterCountry, setFilterCountry] = useState<string[]>([]);
	const [filterCampaign, setFilterCampaign] = useState<string[]>([]);
	const [browserSearch, setBrowserSearch] = useState("");
	const [osSearch, setOsSearch] = useState("");
	const [citySearch, setCitySearch] = useState("");
	const [countrySearch, setCountrySearch] = useState("");
	const [campaignSearch, setCampaignSearch] = useState("");
	const [browserMatchType, setBrowserMatchType] = useState<
		"exact" | "contains"
	>("exact");
	const [osMatchType, setOsMatchType] = useState<"exact" | "contains">("exact");
	const [cityMatchType, setCityMatchType] = useState<"exact" | "contains">(
		"exact",
	);
	const [countryMatchType, setCountryMatchType] = useState<
		"exact" | "contains"
	>("exact");
	const [campaignMatchType, setCampaignMatchType] = useState<
		"exact" | "contains"
	>("exact");
	const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);
	const [activeFilters, setActiveFilters] = useState<Filter[]>([]);

	const limit = 50;
	const offset = (page - 1) * limit;

	const {
		data: tracesResponse,
		isLoading,
		refetch,
	} = useTracesList(
		{ limit, offset, ordering: ordering || undefined },
		{
			city: filterCity.length > 0 ? filterCity : undefined,
			country: filterCountry.length > 0 ? filterCountry : undefined,
			browser: filterBrowser.length > 0 ? filterBrowser : undefined,
			os: filterOS.length > 0 ? filterOS : undefined,
			campaign: filterCampaign.length > 0 ? filterCampaign : undefined,
			utm_source:
				selectedNetworks.size > 0
					? Array.from(selectedNetworks).map((n) => n.toLowerCase())
					: undefined,
		},
	);

	const deleteTraceMutation = useDeleteTrace();

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		setPage(1);
		setAllTraces([]);
		try {
			await refetch();
		} finally {
			setIsRefreshing(false);
		}
	}, [refetch]);

	const handleFilterComplete = (filter: {
		field: string;
		operator: string;
		value: string;
	}) => {
		const exists = searchFilters.some(
			(f) =>
				f.field === filter.field &&
				f.operator === filter.operator &&
				f.value === filter.value,
		);
		if (!exists) {
			setSearchFilters([...searchFilters, filter]);
			// Also add to activeFilters for visual display
			const newFilter: Filter = {
				id: generateFilterId(),
				field: filter.field as any,
				operator: filter.operator as any,
				value: filter.value,
			};
			setActiveFilters([...activeFilters, newFilter]);
		}
	};

	const generateFilterId = () =>
		`filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	const addFilterBadge = (
		field: string,
		value: string,
		operator: "is" | "contains" = "is",
	) => {
		const newFilter: Filter = {
			id: generateFilterId(),
			field: field as Filter["field"],
			operator: operator === "is" ? "equals" : "contains",
			value,
		};
		setActiveFilters([...activeFilters, newFilter]);
	};

	const handleCityChange = (city: string, checked: boolean) => {
		if (checked) {
			setFilterCity([...filterCity, city]);
			addFilterBadge(
				"city",
				city,
				cityMatchType === "exact" ? "is" : "contains",
			);
		} else {
			setFilterCity(filterCity.filter((c) => c !== city));
			setActiveFilters(
				activeFilters.filter((f) => !(f.field === "city" && f.value === city)),
			);
		}
	};

	const handleCountryChange = (country: string, checked: boolean) => {
		if (checked) {
			setFilterCountry([...filterCountry, country]);
			addFilterBadge(
				"country",
				country,
				countryMatchType === "exact" ? "is" : "contains",
			);
		} else {
			setFilterCountry(filterCountry.filter((c) => c !== country));
			setActiveFilters(
				activeFilters.filter(
					(f) => !(f.field === "country" && f.value === country),
				),
			);
		}
	};

	const handleCampaignChange = (campaign: string, checked: boolean) => {
		if (checked) {
			setFilterCampaign([...filterCampaign, campaign]);
			addFilterBadge(
				"campaign",
				campaign,
				campaignMatchType === "exact" ? "is" : "contains",
			);
		} else {
			setFilterCampaign(filterCampaign.filter((c) => c !== campaign));
			setActiveFilters(
				activeFilters.filter(
					(f) => !(f.field === "campaign" && f.value === campaign),
				),
			);
		}
	};

	const handleBrowserChange = (browser: string, checked: boolean) => {
		if (checked) {
			setFilterBrowser([...filterBrowser, browser]);
			addFilterBadge(
				"browser",
				browser,
				browserMatchType === "exact" ? "is" : "contains",
			);
		} else {
			setFilterBrowser(filterBrowser.filter((b) => b !== browser));
			setActiveFilters(
				activeFilters.filter(
					(f) => !(f.field === "browser" && f.value === browser),
				),
			);
		}
	};

	const handleOSChange = (os: string, checked: boolean) => {
		if (checked) {
			setFilterOS([...filterOS, os]);
			addFilterBadge(
				"operating system",
				os,
				osMatchType === "exact" ? "is" : "contains",
			);
		} else {
			setFilterOS(filterOS.filter((o) => o !== os));
			setActiveFilters(
				activeFilters.filter(
					(f) => !(f.field === "operating system" && f.value === os),
				),
			);
		}
	};

	useEffect(() => {
		if (tracesResponse && Array.isArray(tracesResponse)) {
			if (page === 1) {
				setAllTraces(tracesResponse);
			} else {
				setAllTraces((prev) => [...prev, ...tracesResponse]);
			}
			setHasMore(tracesResponse.length === limit);
			setIsLoadingMore(false);
		}
	}, [tracesResponse, page, limit]);

	const handleLoadMore = () => {
		if (!isLoadingMore && hasMore) {
			setIsLoadingMore(true);
			setPage((prev) => prev + 1);
		}
	};

	useEffect(() => {
		setPage(1);
		setAllTraces([]);
		setHasMore(true);
	}, [
		filterCity,
		filterCountry,
		filterBrowser,
		filterOS,
		filterCampaign,
		ordering,
	]);

	useEffect(() => {
		if (!isStreaming) return;
		const interval = setInterval(() => refetch(), 5000);
		return () => clearInterval(interval);
	}, [isStreaming]);

	// Server-side sorting is handled by the API via the ordering parameter
	const traces = allTraces.length > 0 ? allTraces : tracesResponse || [];

	const {
		browserOptions,
		osOptions,
		cityOptions,
		countryOptions,
		campaignOptions,
	} = useMemo(() => {
		const browsers = new Set<string>();
		const oses = new Set<string>();
		const cities = new Set<string>();
		const countries = new Set<string>();
		const campaignIds = new Set<string>();

		traces.forEach((trace) => {
			if (trace.user_agent) {
				browsers.add(parseBrowser(trace.user_agent));
				oses.add(parseOS(trace.user_agent));
			}
			if (trace.city) cities.add(trace.city);
			if (trace.country) countries.add(trace.country);
			if (trace.campaign_id) campaignIds.add(trace.campaign_id);
		});

		return {
			browserOptions: Array.from(browsers).sort(),
			osOptions: Array.from(oses).sort(),
			cityOptions: Array.from(cities).sort(),
			countryOptions: Array.from(countries).sort(),
			campaignOptions: Array.from(campaignIds).sort(),
		};
	}, [traces]);

	const dynamicFieldValues = useMemo(
		() => ({
			city: cityOptions,
			country: countryOptions,
			browser: browserOptions,
			"operating system": osOptions,
			campaign: campaignOptions,
		}),
		[cityOptions, countryOptions, browserOptions, osOptions, campaignOptions],
	);

	const filteredTraces = useMemo(() => {
		let result = traces;

		// Filter by selected social networks (based on utm_source)
		if (selectedNetworks.size > 0) {
			result = result.filter((trace) => {
				const utmSource = trace.utm_source?.toLowerCase();
				if (!utmSource) return false;

				for (const network of selectedNetworks) {
					if (utmSource.includes(network.toLowerCase())) {
						return true;
					}
				}
				return false;
			});
		}

		if (filterBrowser.length > 0) {
			result = result.filter((trace) => {
				return (
					trace.user_agent &&
					filterBrowser.includes(parseBrowser(trace.user_agent))
				);
			});
		}
		if (filterOS.length > 0) {
			result = result.filter((trace) => {
				return trace.user_agent && filterOS.includes(parseOS(trace.user_agent));
			});
		}
		if (filterCity.length > 0) {
			result = result.filter((trace) => {
				return trace.city && filterCity.includes(trace.city);
			});
		}
		if (filterCountry.length > 0) {
			result = result.filter((trace) => {
				return trace.country && filterCountry.includes(trace.country);
			});
		}
		if (filterCampaign.length > 0) {
			result = result.filter((trace) => {
				return trace.campaign_id && filterCampaign.includes(trace.campaign_id);
			});
		}
		return result;
	}, [
		traces,
		selectedNetworks,
		filterBrowser,
		filterOS,
		filterCity,
		filterCountry,
		filterCampaign,
	]);

	const getSelectedTracesData = () =>
		filteredTraces.filter((trace) => selectedRows.has(trace.id));
	const getExportPreview = (format: "json" | "csv") => {
		const data = getSelectedTracesData();
		return format === "json"
			? JSON.stringify(data, null, 2)
			: convertToCSV(data);
	};
	const handleDownloadExport = (format: "json" | "csv") => {
		const preview = getExportPreview(format);
		const timestamp = new Date().toISOString().split("T")[0];
		const filename = `traces-export-${timestamp}.${format}`;
		const mimeType = format === "json" ? "application/json" : "text/csv";
		downloadFile(preview, filename, mimeType);
	};
	const handleCopyExport = (format: "json" | "csv") => {
		const preview = getExportPreview(format);
		navigator.clipboard.writeText(preview);
	};
	const handleDeleteClick = (traceId: string) => {
		if (selectedRows.size > 1) {
			setIsDeleteDialogOpen(true);
		} else {
			setSelectedTraceToDelete(traceId);
			setIsDeleteDialogOpen(true);
		}
	};

	const handleDeleteConfirm = async () => {
		try {
			const tracesToDelete =
				selectedRows.size > 1
					? Array.from(selectedRows)
					: selectedTraceToDelete
						? [selectedTraceToDelete]
						: [];
			if (tracesToDelete.length === 0) return;

			// Delete all selected traces
			for (const traceId of tracesToDelete) {
				await deleteTraceMutation.mutateAsync(traceId);
			}

			setIsDeleteDialogOpen(false);
			setSelectedTraceToDelete(null);
			setSelectedRows(new Set());
		} catch (error) {
			console.error("Error deleting traces:", error);
		}
	};
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			if (sortDirection === "asc") {
				setSortDirection("desc");
				setOrdering(`-${field}`);
			} else {
				setSortField(null);
				setSortDirection("asc");
				setOrdering(null);
			}
		} else {
			setSortField(field);
			setSortDirection("asc");
			setOrdering(field);
		}
	};
	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedRows(new Set(filteredTraces.map((t) => t.id)));
		} else {
			setSelectedRows(new Set());
		}
	};
	const handleSelectRow = (traceId: string, checked: boolean) => {
		const newSelection = new Set(selectedRows);
		if (checked) {
			newSelection.add(traceId);
		} else {
			newSelection.delete(traceId);
		}
		setSelectedRows(newSelection);
	};
	const toggleRowExpanded = (traceId: string) => {
		const newExpanded = new Set(expandedRows);
		if (newExpanded.has(traceId)) {
			newExpanded.delete(traceId);
		} else {
			newExpanded.add(traceId);
		}
		setExpandedRows(newExpanded);
	};
	const handleCopyTraceId = (traceId: string) => {
		navigator.clipboard.writeText(traceId);
		setCopiedTraceId(traceId);
		setTimeout(() => setCopiedTraceId(null), 2000);
	};

	const isNetworkDetected = (network: string) => {
		return traces.some((trace) => {
			const utmSource = trace.utm_source?.toLowerCase();
			return utmSource && utmSource.includes(network.toLowerCase());
		});
	};

	const isAllNetworksSelected = selectedNetworks.size === 0;
	const hasActiveItems = activeFilters.length > 0 || searchValue.length > 0;

	const { isExpanded } = useSidebar();

	return (
		<div className="flex h-full flex-col">
			<div
				className={`flex items-center gap-3 bg-background pt-8 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				<Network className="h-4 w-4" />
				<h1 className="font-semibold text-base">Traces</h1>
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
								<h2 className="font-medium text-foreground text-sm">
									Request trace logs
								</h2>
							</div>
							<div className="flex flex-wrap gap-2">
								<button
									type="button"
									onClick={() => setSelectedNetworks(new Set())}
									className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${isAllNetworksSelected ? "border-gray-300 bg-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" : "border-border bg-background hover:bg-accent"}`}
								>
									All
								</button>
								{SOCIAL_NETWORKS.map((network) => {
									const isSelected = selectedNetworks.has(network);
									const isDetected = isNetworkDetected(network);
									return (
										<button
											key={network}
											type="button"
											onClick={() => {
												const next = new Set(selectedNetworks);
												if (next.has(network)) {
													next.delete(network);
												} else {
													next.add(network);
												}
												setSelectedNetworks(next);
											}}
											className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${isSelected ? "border-gray-300 bg-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" : "border-border bg-background hover:bg-accent"}`}
											title={
												isDetected
													? "${network} is being detected"
													: "${network} is not being detected"
											}
										>
											<span
												className={`h-2 w-2 rounded-full ${isDetected ? "bg-green-600" : "bg-gray-400"}`}
											/>
											{network}
										</button>
									);
								})}
							</div>
						</div>
						<div className="p-4">
							<div className="flex flex-col gap-4">
								<div className="flex items-center gap-1.5">
									<AdvancedSearchInput
										value={searchValue}
										onChange={setSearchValue}
										onSubmit={() => {}}
										onFilterComplete={handleFilterComplete}
										placeholder="Search or filter: city is São Paulo, device is iPhone, browser is Chrome..."
										dynamicFieldValues={dynamicFieldValues}
									/>
									<button
										type="button"
										onClick={handleRefresh}
										className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent"
										title="Refresh events"
									>
										<RotateCw
											className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
										/>
									</button>
									<button
										type="button"
										onClick={() => setIsStreaming(!isStreaming)}
										className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
									>
										<span
											className={`h-2 w-2 rounded-full ${isStreaming ? "bg-green-600" : "bg-black dark:bg-gray-400"}`}
										/>
										<span className="font-medium text-foreground">
											{isStreaming ? "Live" : "Paused"}
										</span>
									</button>
									<button
										type="button"
										onClick={() =>
											selectedRows.size > 0 && setIsExportDialogOpen(true)
										}
										disabled={selectedRows.size === 0}
										className={`flex items-center gap-2 rounded-md border px-3 py-2 font-medium text-sm transition-colors ${selectedRows.size === 0 ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50" : "border-border text-white hover:border-gray-300"}`}
										style={
											selectedRows.size > 0
												? { backgroundColor: "#5320AA" }
												: {}
										}
									>
										<Download className="h-4 w-4" />
										Export {selectedRows.size > 0 && `(${selectedRows.size})`}
									</button>
								</div>
								<div className="flex flex-wrap items-center gap-1.5">
									<DropdownMenu.DropdownMenu
										open={dropdownOpen}
										onOpenChange={setDropdownOpen}
									>
										<DropdownMenu.DropdownMenuTrigger asChild>
											<button
												type="button"
												className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-medium text-sm transition-colors hover:bg-accent"
											>
												<Plus className="h-4 w-4" />
												Add filter
											</button>
										</DropdownMenu.DropdownMenuTrigger>
										<DropdownMenu.DropdownMenuContent
											align="start"
											className="min-w-[220px]"
										>
											<DropdownMenu.DropdownMenuLabel className="font-medium text-foreground text-xs">
												Filter by
											</DropdownMenu.DropdownMenuLabel>
											<div className="-mx-1 border-border border-b" />
											<FilterDropdown
												icon={<Network className="h-4 w-4" />}
												label="Campaign"
												options={campaignOptions}
												selectedValues={filterCampaign}
												searchValue={campaignSearch}
												matchType={campaignMatchType}
												onSearchChange={setCampaignSearch}
												onMatchTypeChange={setCampaignMatchType}
												onOptionChange={handleCampaignChange}
											/>
											<FilterDropdown
												icon={<Layers className="h-4 w-4" />}
												label="City"
												options={cityOptions}
												selectedValues={filterCity}
												searchValue={citySearch}
												matchType={cityMatchType}
												onSearchChange={setCitySearch}
												onMatchTypeChange={setCityMatchType}
												onOptionChange={handleCityChange}
											/>
											<FilterDropdown
												icon={<Compass className="h-4 w-4" />}
												label="Country"
												options={countryOptions}
												selectedValues={filterCountry}
												searchValue={countrySearch}
												matchType={countryMatchType}
												onSearchChange={setCountrySearch}
												onMatchTypeChange={setCountryMatchType}
												onOptionChange={handleCountryChange}
											/>
											<FilterDropdown
												icon={<Chrome className="h-4 w-4" />}
												label="Browser"
												options={browserOptions}
												selectedValues={filterBrowser}
												searchValue={browserSearch}
												matchType={browserMatchType}
												onSearchChange={setBrowserSearch}
												onMatchTypeChange={setBrowserMatchType}
												onOptionChange={handleBrowserChange}
											/>
											<FilterDropdown
												icon={<Monitor className="h-4 w-4" />}
												label="Operating System"
												options={osOptions}
												selectedValues={filterOS}
												searchValue={osSearch}
												matchType={osMatchType}
												onSearchChange={setOsSearch}
												onMatchTypeChange={setOsMatchType}
												onOptionChange={handleOSChange}
											/>
										</DropdownMenu.DropdownMenuContent>
									</DropdownMenu.DropdownMenu>
									{activeFilters.map((filter) => (
										<FilterBadge
											key={filter.id}
											filter={filter}
											onRemove={() =>
												setActiveFilters((prev) =>
													prev.filter((f) => f.id !== filter.id),
												)
											}
										/>
									))}
									{hasActiveItems && (
										<button
											type="button"
											onClick={() => {
												setActiveFilters([]);
												setSearchValue("");
											}}
											className="cursor-pointer text-muted-foreground text-sm transition-colors hover:text-foreground"
										>
											Clear all
										</button>
									)}
								</div>
								<TracesTable
									traces={filteredTraces}
									isLoading={isLoading}
									isLoadingMore={isLoadingMore}
									hasMore={hasMore}
									selectedRows={selectedRows}
									expandedRows={expandedRows}
									sortField={sortField}
									sortDirection={sortDirection}
									copiedTraceId={copiedTraceId}
									onSelectAll={handleSelectAll}
									onSelectRow={handleSelectRow}
									onExpandRow={toggleRowExpanded}
									onDeleteRow={handleDeleteClick}
									onCopyTraceId={handleCopyTraceId}
									onSort={handleSort}
									onLoadMore={handleLoadMore}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<ExportDialog
				isOpen={isExportDialogOpen}
				selectedCount={selectedRows.size}
				onOpenChange={setIsExportDialogOpen}
				onDownload={handleDownloadExport}
				onCopy={handleCopyExport}
				getPreview={getExportPreview}
			/>
			<DeleteDialog
				isOpen={isDeleteDialogOpen}
				selectedCount={selectedRows.size > 1 ? selectedRows.size : 1}
				selectedEventIds={
					selectedRows.size > 1
						? Array.from(selectedRows)
						: selectedTraceToDelete
							? [selectedTraceToDelete]
							: []
				}
				onOpenChange={setIsDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
			/>
		</div>
	);
}
