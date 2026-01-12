import { useSidebar } from "@/web/components/sidebar/sidebar-context";
import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/web/components/ui/card";
import { Label } from "@/web/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/web/components/ui/select";
import { Skeleton } from "@/web/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/web/components/ui/toggle-group";
import {
	type TimeRange,
	useLocationAnalysis,
	useMapLocations,
	useUTMAnalysis,
} from "@/web/hooks/useAnalytics";
import { useCampaignsList } from "@/web/hooks/useCampaigns";
import "@/web/styles/leaflet-custom.css";
import { createFileRoute } from "@tanstack/react-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
	AreaChartIcon,
	BarChart3,
	ChevronDown,
	MapPin,
	RefreshCw,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export const Route = createFileRoute("/_protectedLayout/analytics")({
	component: AnalyticsPage,
});

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Clean map marker with floating count
const createCustomIcon = (count: number) => {
	const size = 24; // Fixed smaller size

	return L.divIcon({
		className: "custom-marker",
		html: `
			<div class="map-marker-wrapper">
				<!-- Floating count above pin -->
				<div class="marker-count">${count > 999 ? "999+" : count}</div>

				<!-- Pin marker -->
				<div class="map-marker">
					<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
						<circle cx="12" cy="10" r="3"></circle>
					</svg>
				</div>
			</div>
		`,
		iconSize: [size, size + 16],
		iconAnchor: [size / 2, size],
		popupAnchor: [0, -size],
	});
};

type ChartType = "line" | "bar";

// Social media brand colors
const SOCIAL_MEDIA_COLORS: Record<string, string> = {
	facebook: "#1877F2", // Facebook blue
	instagram: "#E4405F", // Instagram pink/red
	twitter: "#1DA1F2", // Twitter blue
	tiktok: "#8B5CF6", // TikTok purple
	snapchat: "#FFFC00", // Snapchat yellow
	reddit: "#FF4500", // Reddit orange
	pinterest: "#E60023", // Pinterest red
	kwai: "#FF6B00", // Kwai orange
	direct: "#10b981", // Direct green (custom)
};

// Helper function to lighten or darken a hex color
function adjustColorTone(hex: string, percent: number): string {
	// Remove # if present
	const color = hex.replace("#", "");

	// Parse RGB
	const r = Number.parseInt(color.substring(0, 2), 16);
	const g = Number.parseInt(color.substring(2, 4), 16);
	const b = Number.parseInt(color.substring(4, 6), 16);

	// Adjust
	const adjust = (val: number) => {
		const adjusted = Math.round(val + (255 - val) * (percent / 100));
		return Math.min(255, Math.max(0, adjusted));
	};

	const newR = adjust(r);
	const newG = adjust(g);
	const newB = adjust(b);

	// Convert back to hex
	return `#${[newR, newG, newB].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

// Helper function to get color for a source
function getSourceColor(
	source: string,
	index: number,
	allSources: string[],
): string {
	const sourceLower = source.toLowerCase();

	// Check if it's a known social media
	for (const [platform, color] of Object.entries(SOCIAL_MEDIA_COLORS)) {
		if (sourceLower.includes(platform)) {
			// Count how many sources share the same base color
			const sameColorSources = allSources.filter((s) =>
				s.toLowerCase().includes(platform),
			);

			if (sameColorSources.length > 1) {
				// Find the index of this source among sources with the same color
				const sameColorIndex = sameColorSources.indexOf(source);
				// Apply tone variation: -20%, 0%, +20%, +40%, etc.
				const toneAdjustment = sameColorIndex * 20 - 10;
				return adjustColorTone(color, toneAdjustment);
			}

			return color;
		}
	}

	// For unknown sources, use fallback colors
	const fallbackColors = [
		"#8b5cf6", // purple
		"#3b82f6", // blue
		"#10b981", // green
		"#f59e0b", // amber
		"#ef4444", // red
		"#ec4899", // pink
		"#06b6d4", // cyan
		"#f97316", // orange
	];

	// Group unknown sources and apply tone variation if needed
	const unknownSources = allSources.filter((s) => {
		const sLower = s.toLowerCase();
		return !Object.keys(SOCIAL_MEDIA_COLORS).some((platform) =>
			sLower.includes(platform),
		);
	});

	const unknownIndex = unknownSources.indexOf(source);
	const baseColorIndex = unknownIndex % fallbackColors.length;
	const baseColor = fallbackColors[baseColorIndex];

	// If multiple unknowns use the same base color, apply tone variation
	const sameBaseColorCount = Math.floor(unknownIndex / fallbackColors.length);
	if (sameBaseColorCount > 0) {
		return adjustColorTone(baseColor, sameBaseColorCount * 15);
	}

	return baseColor;
}

// MultiSelectFilter Component
function MultiSelectFilter({
	label,
	placeholder,
	value,
	onChange,
	options,
}: {
	label: string;
	placeholder: string;
	value: string[];
	onChange: (value: string[]) => void;
	options: string[];
}) {
	const [inputValue, setInputValue] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim()) {
			e.preventDefault();
			if (!value.includes(inputValue.trim())) {
				onChange([...value, inputValue.trim()]);
			}
			setInputValue("");
		} else if (e.key === "Escape") {
			setIsOpen(false);
		}
	};

	const removeValue = (valueToRemove: string) => {
		onChange(value.filter((v) => v !== valueToRemove));
	};

	const addValue = (valueToAdd: string) => {
		if (!value.includes(valueToAdd)) {
			onChange([...value, valueToAdd]);
		}
		setInputValue("");
		setIsOpen(false);
	};

	const filteredOptions = options
		.filter((opt) => !value.includes(opt))
		.filter((opt) =>
			inputValue ? opt.toLowerCase().includes(inputValue.toLowerCase()) : true,
		);

	return (
		<div className="space-y-1.5">
			<Label className="text-xs">{label}</Label>
			<div className="relative" ref={containerRef}>
				<div className="flex min-h-9 w-full flex-wrap gap-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
					{value.map((v) => (
						<Badge
							key={v}
							variant="secondary"
							className="gap-1 pr-1 font-normal"
						>
							<span>{v}</span>
							<button
								type="button"
								onClick={() => removeValue(v)}
								className="rounded-sm hover:bg-secondary-foreground/20"
								aria-label={`Remove ${v}`}
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					))}
					<input
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						onFocus={() => setIsOpen(true)}
						placeholder={value.length === 0 ? placeholder : ""}
						className="min-w-[120px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
					/>
					<button
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						className="flex items-center"
						aria-label="Toggle options"
					>
						<ChevronDown className="h-4 w-4 opacity-50" />
					</button>
				</div>
				{isOpen && filteredOptions.length > 0 && (
					<div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
						{filteredOptions.map((option) => (
							<button
								key={option}
								type="button"
								onClick={() => addValue(option)}
								className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
							>
								{option}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function AnalyticsPage() {
	// TanStack Query hooks
	const { data: campaigns = [] } = useCampaignsList();

	// UI state
	const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
	const [utmTimeRange, setUtmTimeRange] = useState<TimeRange>("week");
	const [locationTimeRange, setLocationTimeRange] = useState<TimeRange>("week");
	const [mapTimeRange, setMapTimeRange] = useState<TimeRange>("week");
	const [utmChartType, setUtmChartType] = useState<ChartType>("line");
	const [locationChartType, setLocationChartType] = useState<ChartType>("line");
	const [locationFilterCity, setLocationFilterCity] = useState<string[]>([]);
	const [locationFilterCountry, setLocationFilterCountry] = useState<string[]>(
		[],
	);

	// Initialize selected campaign from localStorage or first campaign
	useEffect(() => {
		if (campaigns.length > 0 && !selectedCampaignId) {
			const lastSelectedCampaignId = localStorage.getItem(
				"lastSelectedCampaignId",
			);

			if (
				lastSelectedCampaignId &&
				campaigns.some((c) => c.id === lastSelectedCampaignId)
			) {
				setSelectedCampaignId(lastSelectedCampaignId);
			} else {
				setSelectedCampaignId(campaigns[0].id);
			}
		}
	}, [campaigns, selectedCampaignId]);

	// Save selected campaign to localStorage whenever it changes
	useEffect(() => {
		if (selectedCampaignId) {
			localStorage.setItem("lastSelectedCampaignId", selectedCampaignId);
		}
	}, [selectedCampaignId]);

	// Analytics queries using custom hooks
	const utmQuery = useUTMAnalysis(selectedCampaignId, utmTimeRange);
	const locationQuery = useLocationAnalysis(
		selectedCampaignId,
		locationTimeRange,
		{
			city: locationFilterCity.length > 0 ? locationFilterCity : undefined,
			country:
				locationFilterCountry.length > 0 ? locationFilterCountry : undefined,
		},
	);
	const mapQuery = useMapLocations(selectedCampaignId, mapTimeRange);

	// Get unique UTM sources for chart
	const utmSources = Array.from(
		new Set(utmQuery.data?.data.map((p) => p.utm_source || "unknown")),
	);

	// Transform UTM data for chart
	const utmChartData = utmQuery.data?.data.reduce(
		(acc, point) => {
			const hour = new Date(point.hour).toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
			});
			const existing = acc.find((item) => item.hour === hour);
			if (existing) {
				existing[point.utm_source || "unknown"] = point.count;
			} else {
				acc.push({
					hour,
					[point.utm_source || "unknown"]: point.count,
				});
			}
			return acc;
		},
		[] as Record<string, string | number>[],
	);

	// Get top 10 locations for chart (sorted by count)
	const topLocations = locationQuery.data?.data
		? Array.from(
				locationQuery.data.data.reduce((acc, point) => {
					const location = `${point.city}, ${point.country}`;
					acc.set(location, (acc.get(location) || 0) + point.count);
					return acc;
				}, new Map<string, number>()),
			)
				.sort((a: [string, number], b: [string, number]) => b[1] - a[1])
				.slice(0, 10)
				.map(([location]: [string, number]) => location)
		: [];

	// Extract unique cities and countries for filters
	const uniqueCities = locationQuery.data?.data
		? Array.from(
				new Set(
					locationQuery.data.data
						.map((point) => point.city)
						.filter((city): city is string => !!city),
				),
			).sort()
		: [];

	const uniqueCountries = locationQuery.data?.data
		? Array.from(
				new Set(
					locationQuery.data.data
						.map((point) => point.country)
						.filter((country): country is string => !!country),
				),
			).sort()
		: [];

	// Transform Location data for chart
	const locationChartData = locationQuery.data?.data.reduce(
		(acc, point) => {
			const hour = new Date(point.hour).toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
			});
			const location = `${point.city}, ${point.country}`;
			const existing = acc.find((item) => item.hour === hour);
			if (existing) {
				existing[location] = point.count;
			} else {
				acc.push({
					hour,
					[location]: point.count,
				});
			}
			return acc;
		},
		[] as Record<string, string | number>[],
	);

	// Generate colors for UTM sources using social media brand colors
	const utmSourceColors = utmSources.reduce(
		(acc, source, index) => {
			acc[source as string] = getSourceColor(
				source as string,
				index,
				utmSources.map(String),
			);
			return acc;
		},
		{} as Record<string, string>,
	);

	// Fallback colors for locations
	const locationColors = [
		"#8b5cf6", // purple
		"#3b82f6", // blue
		"#10b981", // green
		"#f59e0b", // amber
		"#ef4444", // red
		"#ec4899", // pink
		"#06b6d4", // cyan
		"#f97316", // orange
	];

	const { isExpanded } = useSidebar();

	return (
		<div className="flex h-full flex-col">
			<div
				className={`flex items-center gap-3 bg-background pt-8 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				<BarChart3 className="h-4 w-4" />
				<h1 className="font-semibold text-base">Analytics</h1>
			</div>
			<div
				className={`flex-1 space-y-6 overflow-y-scroll pt-3 pb-5 transition-all duration-300 ${isExpanded ? "px-6" : "px-16"}`}
			>
				{/* Campaign Selector */}
				<Card>
					<CardHeader>
						<CardTitle>Select Campaign</CardTitle>
						<CardDescription>
							Choose a campaign to view analytics
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Select
							value={selectedCampaignId}
							onValueChange={setSelectedCampaignId}
						>
							<SelectTrigger className="w-full md:w-[400px]">
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
					</CardContent>
				</Card>

				{selectedCampaignId && (
					<>
						{/* UTM Source Chart */}
						<Card>
							<CardHeader>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<CardTitle className="flex items-center gap-2">
											<BarChart3 className="h-5 w-5" />
											UTM Source Analytics
										</CardTitle>
										<CardDescription className="mt-2">
											Traffic sources over time
										</CardDescription>
									</div>
									<div className="flex gap-2">
										<ToggleGroup
											type="single"
											value={utmChartType}
											onValueChange={(value) => {
												if (value) setUtmChartType(value as ChartType);
											}}
										>
											<ToggleGroupItem value="line" aria-label="Line chart">
												<AreaChartIcon className="h-4 w-4" />
											</ToggleGroupItem>
											<ToggleGroupItem value="bar" aria-label="Bar chart">
												<BarChart3 className="h-4 w-4" />
											</ToggleGroupItem>
										</ToggleGroup>
										<Select
											value={utmTimeRange}
											onValueChange={(value) =>
												setUtmTimeRange(value as TimeRange)
											}
										>
											<SelectTrigger className="w-[140px]">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="30min">Last 30 Minutes</SelectItem>
												<SelectItem value="day">Last 24 Hours</SelectItem>
												<SelectItem value="week">Last 7 Days</SelectItem>
												<SelectItem value="month">Last 30 Days</SelectItem>
											</SelectContent>
										</Select>
										<Button
											variant="outline"
											size="icon"
											onClick={() => utmQuery.refetch()}
											disabled={utmQuery.isLoading || utmQuery.isRefetching}
										>
											<RefreshCw
												className={`h-4 w-4 ${utmQuery.isLoading || utmQuery.isRefetching ? "animate-spin" : ""}`}
											/>
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								{utmQuery.isLoading ? (
									<Skeleton className="h-[400px] w-full" />
								) : utmChartData && utmChartData.length > 0 ? (
									<ResponsiveContainer width="100%" height={400}>
										{utmChartType === "line" ? (
											<AreaChart data={utmChartData}>
												<defs>
													{utmSources.map((source) => (
														<linearGradient
															key={`gradient-${source as string}`}
															id={`fill-${source as string}`}
															x1="0"
															y1="0"
															x2="0"
															y2="1"
														>
															<stop
																offset="5%"
																stopColor={utmSourceColors[source as string]}
																stopOpacity={0.8}
															/>
															<stop
																offset="95%"
																stopColor={utmSourceColors[source as string]}
																stopOpacity={0.1}
															/>
														</linearGradient>
													))}
												</defs>
												<CartesianGrid
													strokeDasharray="3 3"
													opacity={0.3}
													vertical={false}
												/>
												<XAxis
													dataKey="hour"
													tickLine={false}
													axisLine={false}
													tickMargin={8}
													minTickGap={32}
													style={{ fontSize: "12px" }}
												/>
												<YAxis
													domain={[0, "auto"]}
													style={{ fontSize: "12px" }}
												/>
												<Tooltip
													cursor={false}
													contentStyle={{
														backgroundColor: "rgba(0, 0, 0, 0.8)",
														border: "none",
														borderRadius: "8px",
														color: "#fff",
													}}
												/>
												<Legend wrapperStyle={{ paddingTop: "20px" }} />
												{utmSources.map((source) => (
													<Area
														key={source as string}
														type="natural"
														dataKey={source as string}
														stroke={utmSourceColors[source as string]}
														fill={`url(#fill-${source as string})`}
														stackId="a"
														connectNulls={true}
													/>
												))}
											</AreaChart>
										) : (
											<BarChart data={utmChartData}>
												<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
												<XAxis
													dataKey="hour"
													tickLine={false}
													axisLine={false}
													tickMargin={8}
													minTickGap={32}
													style={{ fontSize: "12px" }}
												/>
												<YAxis
													domain={[0, "auto"]}
													style={{ fontSize: "12px" }}
												/>
												<Tooltip
													contentStyle={{
														backgroundColor: "rgba(0, 0, 0, 0.8)",
														border: "none",
														borderRadius: "8px",
														color: "#fff",
													}}
												/>
												<Legend wrapperStyle={{ paddingTop: "20px" }} />
												{utmSources.map((source) => (
													<Bar
														key={source as string}
														dataKey={source as string}
														fill={utmSourceColors[source as string]}
														stackId="a"
													/>
												))}
											</BarChart>
										)}
									</ResponsiveContainer>
								) : (
									<div className="flex h-[400px] items-center justify-center text-muted-foreground">
										No data available for the selected period
									</div>
								)}
							</CardContent>
						</Card>

						{/* Location Chart */}
						<Card>
							<CardHeader>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<CardTitle className="flex items-center gap-2">
											<MapPin className="h-5 w-5" />
											Location Analytics
										</CardTitle>
										<CardDescription className="mt-2">
											Top locations over time
										</CardDescription>
									</div>
									<div className="flex gap-2">
										<ToggleGroup
											type="single"
											value={locationChartType}
											onValueChange={(value) => {
												if (value) setLocationChartType(value as ChartType);
											}}
										>
											<ToggleGroupItem value="line" aria-label="Line chart">
												<AreaChartIcon className="h-4 w-4" />
											</ToggleGroupItem>
											<ToggleGroupItem value="bar" aria-label="Bar chart">
												<BarChart3 className="h-4 w-4" />
											</ToggleGroupItem>
										</ToggleGroup>
										<Select
											value={locationTimeRange}
											onValueChange={(value) =>
												setLocationTimeRange(value as TimeRange)
											}
										>
											<SelectTrigger className="w-[140px]">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="30min">Last 30 Minutes</SelectItem>
												<SelectItem value="day">Last 24 Hours</SelectItem>
												<SelectItem value="week">Last 7 Days</SelectItem>
												<SelectItem value="month">Last 30 Days</SelectItem>
											</SelectContent>
										</Select>
										<Button
											variant="outline"
											size="icon"
											onClick={() => locationQuery.refetch()}
											disabled={
												locationQuery.isLoading || locationQuery.isRefetching
											}
										>
											<RefreshCw
												className={`h-4 w-4 ${locationQuery.isLoading || locationQuery.isRefetching ? "animate-spin" : ""}`}
											/>
										</Button>
									</div>
								</div>

								{/* Filters */}
								<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
									{/* City Filter */}
									<MultiSelectFilter
										label="City"
										placeholder="Filter by city..."
										value={locationFilterCity}
										onChange={setLocationFilterCity}
										options={uniqueCities}
									/>

									{/* Country Filter */}
									<MultiSelectFilter
										label="Country"
										placeholder="Filter by country..."
										value={locationFilterCountry}
										onChange={setLocationFilterCountry}
										options={uniqueCountries}
									/>
								</div>
							</CardHeader>
							<CardContent>
								{locationQuery.isLoading ? (
									<Skeleton className="h-[450px] w-full" />
								) : locationChartData && locationChartData.length > 0 ? (
									<ResponsiveContainer width="100%" height={450}>
										{locationChartType === "line" ? (
											<AreaChart
												data={locationChartData}
												margin={{ bottom: 50 }}
											>
												<defs>
													{topLocations.map((location, index) => (
														<linearGradient
															key={`gradient-${location}`}
															id={`fill-location-${index}`}
															x1="0"
															y1="0"
															x2="0"
															y2="1"
														>
															<stop
																offset="5%"
																stopColor={
																	locationColors[index % locationColors.length]
																}
																stopOpacity={0.8}
															/>
															<stop
																offset="95%"
																stopColor={
																	locationColors[index % locationColors.length]
																}
																stopOpacity={0.1}
															/>
														</linearGradient>
													))}
												</defs>
												<CartesianGrid
													strokeDasharray="3 3"
													opacity={0.3}
													vertical={false}
												/>
												<XAxis
													dataKey="hour"
													tickLine={false}
													axisLine={false}
													tickMargin={8}
													minTickGap={32}
													style={{ fontSize: "12px" }}
												/>
												<YAxis
													domain={[0, "auto"]}
													style={{ fontSize: "12px" }}
												/>
												<Tooltip
													cursor={false}
													contentStyle={{
														backgroundColor: "rgba(0, 0, 0, 0.8)",
														border: "none",
														borderRadius: "8px",
														color: "#fff",
													}}
												/>
												<Legend
													wrapperStyle={{
														paddingTop: "15px",
													}}
													layout="horizontal"
													verticalAlign="bottom"
													align="center"
													iconSize={10}
													iconType="square"
												/>
												{topLocations.map((location, index) => (
													<Area
														key={location}
														type="natural"
														dataKey={location}
														stroke={
															locationColors[index % locationColors.length]
														}
														fill={`url(#fill-location-${index})`}
														stackId="a"
														connectNulls={true}
													/>
												))}
											</AreaChart>
										) : (
											<BarChart
												data={locationChartData}
												margin={{ bottom: 50 }}
											>
												<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
												<XAxis
													dataKey="hour"
													tickLine={false}
													axisLine={false}
													tickMargin={8}
													minTickGap={32}
													style={{ fontSize: "12px" }}
												/>
												<YAxis
													domain={[0, "auto"]}
													style={{ fontSize: "12px" }}
												/>
												<Tooltip
													contentStyle={{
														backgroundColor: "rgba(0, 0, 0, 0.8)",
														border: "none",
														borderRadius: "8px",
														color: "#fff",
													}}
												/>
												<Legend
													wrapperStyle={{
														paddingTop: "15px",
													}}
													layout="horizontal"
													verticalAlign="bottom"
													align="center"
													iconSize={10}
													iconType="square"
												/>
												{topLocations.map((location, index) => (
													<Bar
														key={location}
														dataKey={location}
														fill={locationColors[index % locationColors.length]}
														stackId="a"
													/>
												))}
											</BarChart>
										)}
									</ResponsiveContainer>
								) : (
									<div className="flex h-[450px] items-center justify-center text-muted-foreground">
										No data available for the selected period
									</div>
								)}
							</CardContent>
						</Card>

						{/* Map */}
						<Card>
							<CardHeader>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<CardTitle className="flex items-center gap-2">
											<MapPin className="h-5 w-5" />
											Geographic Distribution
										</CardTitle>
										<CardDescription className="mt-2">
											Access locations on map
										</CardDescription>
									</div>
									<div className="flex gap-2">
										<Select
											value={mapTimeRange}
											onValueChange={(value) =>
												setMapTimeRange(value as TimeRange)
											}
										>
											<SelectTrigger className="w-[140px]">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="30min">Last 30 Minutes</SelectItem>
												<SelectItem value="day">Last 24 Hours</SelectItem>
												<SelectItem value="week">Last 7 Days</SelectItem>
												<SelectItem value="month">Last 30 Days</SelectItem>
											</SelectContent>
										</Select>
										<Button
											variant="outline"
											size="icon"
											onClick={() => mapQuery.refetch()}
											disabled={mapQuery.isLoading || mapQuery.isRefetching}
										>
											<RefreshCw
												className={`h-4 w-4 ${mapQuery.isLoading || mapQuery.isRefetching ? "animate-spin" : ""}`}
											/>
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								{mapQuery.isLoading ? (
									<Skeleton className="h-[500px] w-full" />
								) : mapQuery.data && mapQuery.data.data.length > 0 ? (
									<div className="h-[500px] w-full overflow-hidden rounded-lg border">
										<MapContainer
											center={[20, 0]}
											zoom={2}
											style={{ height: "100%", width: "100%" }}
											className="z-0"
										>
											<TileLayer
												attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
												url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
											/>
											{mapQuery.data.data.map((location, index) => (
												<Marker
													key={`${location.latitude}-${location.longitude}-${index}`}
													position={[location.latitude, location.longitude]}
													icon={createCustomIcon(location.count)}
												>
													<Popup
														className="custom-popup"
														closeButton={false}
														offset={[0, -10]}
													>
														<div className="min-w-[180px] p-3">
															<div className="mb-2 flex items-center gap-2">
																<MapPin className="h-4 w-4 text-blue-400" />
																<div className="font-bold text-sm text-white">
																	{location.city}
																</div>
															</div>
															<div className="space-y-1.5 text-xs">
																<div className="flex items-center justify-between gap-3">
																	<span className="font-semibold text-blue-300">
																		Country:
																	</span>
																	<span className="font-semibold text-white">
																		{location.country}
																	</span>
																</div>
																<div className="flex items-center justify-between gap-3">
																	<span className="font-semibold text-blue-300">
																		Accesses:
																	</span>
																	<span className="rounded-full bg-blue-500 px-2.5 py-0.5 font-bold text-white">
																		{location.count}
																	</span>
																</div>
															</div>
														</div>
													</Popup>
												</Marker>
											))}
										</MapContainer>
									</div>
								) : (
									<div className="flex h-[500px] items-center justify-center text-muted-foreground">
										No location data available for the selected period
									</div>
								)}
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</div>
	);
}
