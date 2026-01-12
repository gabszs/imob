import { createFileRoute } from "@tanstack/react-router";
import {
	Chrome,
	Compass,
	Download,
	Layers,
	Monitor,
	Plus,
	RotateCw,
	Smartphone,
	Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSidebar } from "@/web/components/sidebar/sidebar-context";
import { AdvancedSearchInput } from "@/web/components/ui/advanced-search-input";
import { DeleteDialog } from "@/web/components/ui/delete-dialog";
import * as DropdownMenu from "@/web/components/ui/dropdown-menu";
import {
	convertToCSV,
	downloadFile,
	isEventDetected,
} from "@/web/components/ui/event-utils";
import { EventsTable } from "@/web/components/ui/events-table";
import { ExportDialog } from "@/web/components/ui/export-dialog";
import { FilterDropdown } from "@/web/components/ui/filter-dropdown";
import {
	type Filter,
	FilterBadge,
} from "@/web/components/ui/logs/filter-badge";
import { StatusDot } from "@/web/components/ui/status-dot";
import {
	parseBrowser,
	parseDevice,
	parseOS,
} from "@/web/components/ui/user-agent-parser";
import { useDeleteEvent, useEventsList } from "@/web/hooks/useEvents";

export const Route = createFileRoute("/_protectedLayout/events")({
	component: EventsPage,
});

const EVENT_TYPES = [
	"PageView",
	"ViewContent",
	"Search",
	"AddToWishlist",
	"AddToCart",
	"Contact",
	"SignUp",
	"InitCheckout",
	"PendingPurchase",
	"Purchase",
	"SubmitForm",
	"Custom",
] as const;

type SortField = "name" | "created_at" | "trace_id";
type SortDirection = "asc" | "desc";

export default function EventsPage() {
	const [selectedTypes, setSelectedTypes] = useState(new Set<string>());
	const [appliedTypeFilters, setAppliedTypeFilters] = useState(
		new Set<string>(),
	);
	const [searchValue, setSearchValue] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [sortField, setSortField] = useState<SortField | null>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
	const [ordering, setOrdering] = useState<string | null>(null);
	const [selectedRows, setSelectedRows] = useState(new Set<string>());
	const [expandedRows, setExpandedRows] = useState(new Set<string>());
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedEventToDelete, setSelectedEventToDelete] = useState<
		string | null
	>(null);
	const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
	const [page, setPage] = useState(1);
	const [allEvents, setAllEvents] = useState<any[]>([]);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [searchFilters, setSearchFilters] = useState<
		Array<{ field: string; operator: string; value: string }>
	>([]);
	const [filterDevice, setFilterDevice] = useState<string[]>([]);
	const [filterBrowser, setFilterBrowser] = useState<string[]>([]);
	const [filterOS, setFilterOS] = useState<string[]>([]);
	const [filterCity, setFilterCity] = useState<string[]>([]);
	const [filterRegion, setFilterRegion] = useState<string[]>([]);
	const [deviceSearch, setDeviceSearch] = useState("");
	const [browserSearch, setBrowserSearch] = useState("");
	const [osSearch, setOsSearch] = useState("");
	const [citySearch, setCitySearch] = useState("");
	const [regionSearch, setRegionSearch] = useState("");
	const [deviceMatchType, setDeviceMatchType] = useState<"exact" | "contains">(
		"exact",
	);
	const [browserMatchType, setBrowserMatchType] = useState<
		"exact" | "contains"
	>("exact");
	const [osMatchType, setOsMatchType] = useState<"exact" | "contains">("exact");
	const [cityMatchType, setCityMatchType] = useState<"exact" | "contains">(
		"exact",
	);
	const [regionMatchType, setRegionMatchType] = useState<"exact" | "contains">(
		"exact",
	);
	const [copiedEventId, setCopiedEventId] = useState<string | null>(null);
	const [activeFilters, setActiveFilters] = useState<Filter[]>([]);

	const {
		data: eventsResponse,
		isLoading,
		refetch,
	} = useEventsList(
		{ page, page_size: 50, ordering: ordering || "-created_at" },
		{
			name:
				appliedTypeFilters.size > 0
					? Array.from(appliedTypeFilters)
					: undefined,
		},
	);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		setAppliedTypeFilters(new Set(selectedTypes));
		setPage(1);
		setAllEvents([]);
		try {
			await refetch();
		} finally {
			setIsRefreshing(false);
		}
	};

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

	const handleRegionChange = (region: string, checked: boolean) => {
		if (checked) {
			setFilterRegion([...filterRegion, region]);
			addFilterBadge(
				"region",
				region,
				regionMatchType === "exact" ? "is" : "contains",
			);
		} else {
			setFilterRegion(filterRegion.filter((r) => r !== region));
			setActiveFilters(
				activeFilters.filter(
					(f) => !(f.field === "region" && f.value === region),
				),
			);
		}
	};

	const handleDeviceChange = (device: string, checked: boolean) => {
		if (checked) {
			setFilterDevice([...filterDevice, device]);
			addFilterBadge(
				"device",
				device,
				deviceMatchType === "exact" ? "is" : "contains",
			);
		} else {
			setFilterDevice(filterDevice.filter((d) => d !== device));
			setActiveFilters(
				activeFilters.filter(
					(f) => !(f.field === "device" && f.value === device),
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
		if (eventsResponse?.data && Array.isArray(eventsResponse.data)) {
			if (page === 1) {
				setAllEvents(eventsResponse.data);
			} else {
				setAllEvents((prev) => [...prev, ...eventsResponse.data]);
			}
			setHasMore(eventsResponse.data.length === 50);
			setIsLoadingMore(false);
		}
	}, [eventsResponse, page]);

	const handleLoadMore = () => {
		if (!isLoadingMore && hasMore) {
			setIsLoadingMore(true);
			setPage((prev) => prev + 1);
		}
	};

	useEffect(() => {
		setPage(1);
		setAllEvents([]);
		setHasMore(true);
	}, [searchFilters, selectedTypes, searchValue]);

	useEffect(() => {
		if (!isStreaming) return;
		setAppliedTypeFilters(new Set(selectedTypes));
		const interval = setInterval(() => refetch(), 5000);
		return () => clearInterval(interval);
	}, [isStreaming, refetch, selectedTypes]);

	const events = allEvents.length > 0 ? allEvents : eventsResponse?.data || [];

	const sortedEvents = useMemo(() => {
		if (!sortField) return [...events];
		return [...events].sort((a, b) => {
			let aValue: string | number | undefined;
			let bValue: string | number | undefined;
			if (sortField === "name") {
				aValue = a.name;
				bValue = b.name;
			} else if (sortField === "created_at") {
				aValue = new Date(a.created_at).getTime();
				bValue = new Date(b.created_at).getTime();
			} else if (sortField === "trace_id") {
				aValue = a.trace_id;
				bValue = b.trace_id;
			}
			if (aValue === undefined || bValue === undefined) return 0;
			const comparison =
				typeof aValue === "string" && typeof bValue === "string"
					? aValue.localeCompare(bValue)
					: typeof aValue === "number" && typeof bValue === "number"
						? aValue - bValue
						: 0;
			return sortDirection === "asc" ? comparison : -comparison;
		});
	}, [events, sortField, sortDirection]);

	const {
		deviceOptions,
		browserOptions,
		osOptions,
		cityOptions,
		regionOptions,
	} = useMemo(() => {
		const devices = new Set<string>();
		const browsers = new Set<string>();
		const oses = new Set<string>();
		const cities = new Set<string>();
		const regions = new Set<string>();
		sortedEvents.forEach((event) => {
			const userAgent = (event.metadata as any)?.user_agent;
			if (userAgent) {
				devices.add(parseDevice(userAgent));
				browsers.add(parseBrowser(userAgent));
				oses.add(parseOS(userAgent));
			}
			const city = (event.metadata as any)?.city;
			const region = (event.metadata as any)?.region;
			if (city) cities.add(city);
			if (region) regions.add(region);
		});
		return {
			deviceOptions: Array.from(devices).sort(),
			browserOptions: Array.from(browsers).sort(),
			osOptions: Array.from(oses).sort(),
			cityOptions: Array.from(cities).sort(),
			regionOptions: Array.from(regions).sort(),
		};
	}, [sortedEvents]);

	const dynamicFieldValues = useMemo(
		() => ({
			city: cityOptions,
			region: regionOptions,
			device: deviceOptions,
			browser: browserOptions,
			"operating system": osOptions,
		}),
		[cityOptions, regionOptions, deviceOptions, browserOptions, osOptions],
	);

	const filteredEvents = useMemo(() => {
		let result = sortedEvents;
		if (selectedTypes.size > 0) {
			result = result.filter((event) => {
				const eventNameUpper = event.name?.toUpperCase();
				for (const selectedType of selectedTypes) {
					if (selectedType === "Custom") {
						const predefinedTypes = [
							"PAGEVIEW",
							"VIEWCONTENT",
							"SEARCH",
							"ADDTOWISHLIST",
							"ADDTOCART",
							"INITCHECKOUT",
							"PENDINGPURCHASE",
							"PURCHASE",
							"SUBMITFORM",
							"CONTACT",
							"SIGNUP",
						];
						if (!predefinedTypes.includes(eventNameUpper)) return true;
					} else {
						const selectedTypeUpper = selectedType.toUpperCase();
						if (eventNameUpper === selectedTypeUpper) return true;
						if (event.payload && typeof event.payload === "object") {
							const payloadKeys = Object.keys(event.payload).map((key) =>
								key.toUpperCase(),
							);
							if (payloadKeys.includes(selectedTypeUpper)) return true;
						}
					}
				}
				return false;
			});
		}
		if (filterDevice.length > 0)
			result = result.filter((event) => {
				const userAgent = (event.metadata as any)?.user_agent;
				return userAgent && filterDevice.includes(parseDevice(userAgent));
			});
		if (filterBrowser.length > 0)
			result = result.filter((event) => {
				const userAgent = (event.metadata as any)?.user_agent;
				return userAgent && filterBrowser.includes(parseBrowser(userAgent));
			});
		if (filterOS.length > 0)
			result = result.filter((event) => {
				const userAgent = (event.metadata as any)?.user_agent;
				return userAgent && filterOS.includes(parseOS(userAgent));
			});
		if (filterCity.length > 0)
			result = result.filter((event) => {
				const city = (event.metadata as any)?.city;
				return city && filterCity.includes(city);
			});
		if (filterRegion.length > 0)
			result = result.filter((event) => {
				const region = (event.metadata as any)?.region;
				return region && filterRegion.includes(region);
			});
		return result;
	}, [
		sortedEvents,
		selectedTypes,
		filterDevice,
		filterBrowser,
		filterOS,
		filterCity,
		filterRegion,
	]);

	const getSelectedEventsData = () =>
		sortedEvents.filter((event) => selectedRows.has(event.id));
	const getExportPreview = (format: "json" | "csv") => {
		const data = getSelectedEventsData();
		return format === "json"
			? JSON.stringify(data, null, 2)
			: convertToCSV(data);
	};
	const handleDownloadExport = (format: "json" | "csv") => {
		const data = getSelectedEventsData();
		const preview = getExportPreview(format);
		const timestamp = new Date().toISOString().split("T")[0];
		const filename = `events-export-${timestamp}.${format}`;
		const mimeType = format === "json" ? "application/json" : "text/csv";
		downloadFile(preview, filename, mimeType);
	};
	const handleCopyExport = (format: "json" | "csv") => {
		const preview = getExportPreview(format);
		navigator.clipboard.writeText(preview);
	};
	const handleDeleteClick = (eventId: string) => {
		if (selectedRows.size > 1) {
			setIsDeleteDialogOpen(true);
		} else {
			setSelectedEventToDelete(eventId);
			setIsDeleteDialogOpen(true);
		}
	};
	const deleteEventMutation = useDeleteEvent();

	const handleDeleteConfirm = async () => {
		try {
			const eventsToDelete =
				selectedRows.size > 1
					? Array.from(selectedRows)
					: selectedEventToDelete
						? [selectedEventToDelete]
						: [];
			if (eventsToDelete.length === 0) return;

			// Delete all selected events
			for (const eventId of eventsToDelete) {
				await deleteEventMutation.mutateAsync(eventId);
			}

			setIsDeleteDialogOpen(false);
			setSelectedEventToDelete(null);
			setSelectedRows(new Set());
		} catch (error) {
			console.error("Error deleting events:", error);
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
			setSelectedRows(new Set(filteredEvents.map((e) => e.id)));
		} else {
			setSelectedRows(new Set());
		}
	};
	const handleSelectRow = (eventId: string, checked: boolean) => {
		const newSelection = new Set(selectedRows);
		if (checked) {
			newSelection.add(eventId);
		} else {
			newSelection.delete(eventId);
		}
		setSelectedRows(newSelection);
	};
	const toggleRowExpanded = (eventId: string) => {
		const newExpanded = new Set(expandedRows);
		if (newExpanded.has(eventId)) {
			newExpanded.delete(eventId);
		} else {
			newExpanded.add(eventId);
		}
		setExpandedRows(newExpanded);
	};
	const handleCopyTraceId = (eventId: string, traceId: string) => {
		navigator.clipboard.writeText(traceId);
		setCopiedEventId(eventId);
		setTimeout(() => setCopiedEventId(null), 2000);
	};

	const isAllSelected = selectedTypes.size === 0;
	const hasActiveItems = activeFilters.length > 0 || searchValue.length > 0;

	const { isExpanded } = useSidebar();

	return (
		<div className="flex h-full flex-col">
			<div
				className={`flex items-center gap-3 bg-background pt-8 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				<Sparkles className="h-4 w-4" />
				<h1 className="font-semibold text-base">Events</h1>
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
									Pixel event logs
								</h2>
							</div>
							<div className="flex flex-wrap gap-2">
								<button
									type="button"
									onClick={() => setSelectedTypes(new Set())}
									className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${isAllSelected ? "border-gray-300 bg-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" : "border-border bg-background hover:bg-accent"}`}
								>
									All
								</button>
								{EVENT_TYPES.map((type) => {
									const isSelected = selectedTypes.has(type);
									const isDetected = isEventDetected(type, sortedEvents);
									return (
										<button
											key={type}
											type="button"
											onClick={() => {
												const next = new Set(selectedTypes);
												if (next.has(type)) {
													next.delete(type);
												} else {
													next.add(type);
												}
												setSelectedTypes(next);
											}}
											className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${isSelected ? "border-gray-300 bg-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" : "border-border bg-background hover:bg-accent"}`}
											title={
												isDetected
													? `${type} is being detected`
													: `${type} is not being detected`
											}
										>
											<StatusDot
												variant={isDetected ? "success" : "neutral"}
												aria-label={
													isDetected
														? `${type} detected`
														: `${type} not detected`
												}
											/>
											{type}
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
												label="Region"
												options={regionOptions}
												selectedValues={filterRegion}
												searchValue={regionSearch}
												matchType={regionMatchType}
												onSearchChange={setRegionSearch}
												onMatchTypeChange={setRegionMatchType}
												onOptionChange={handleRegionChange}
											/>
											<FilterDropdown
												icon={<Smartphone className="h-4 w-4" />}
												label="Device"
												options={deviceOptions}
												selectedValues={filterDevice}
												searchValue={deviceSearch}
												matchType={deviceMatchType}
												onSearchChange={setDeviceSearch}
												onMatchTypeChange={setDeviceMatchType}
												onOptionChange={handleDeviceChange}
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
								<EventsTable
									events={filteredEvents}
									isLoading={isLoading}
									isLoadingMore={isLoadingMore}
									hasMore={hasMore}
									selectedRows={selectedRows}
									expandedRows={expandedRows}
									sortField={sortField}
									sortDirection={sortDirection}
									copiedEventId={copiedEventId}
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
						: selectedEventToDelete
							? [selectedEventToDelete]
							: []
				}
				onOpenChange={setIsDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
			/>
		</div>
	);
}
