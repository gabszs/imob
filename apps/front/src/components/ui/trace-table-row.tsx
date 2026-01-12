import {
	Apple,
	ChevronDown,
	Laptop,
	MapPin,
	Monitor,
	Smartphone,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { EventsGraph } from "@/web/components/EventsGraph";
import { ClarityIcon } from "@/web/components/icons/ClarityIcon";
import { CopyableId } from "./copyable-id";
import { InfoBox } from "./info-box";
import { parseBrowser, parseOS } from "./user-agent-parser";

interface TraceTableRowProps {
	trace: any;
	isSelected: boolean;
	isExpanded: boolean;
	onSelectChange: (checked: boolean) => void;
	onExpandToggle: () => void;
	onDelete: () => void;
	onCopyTraceId: () => void;
	copiedTraceId: string | null;
}

export const TraceTableRow = ({
	trace,
	isSelected,
	isExpanded,
	onSelectChange,
	onExpandToggle,
	onDelete,
	onCopyTraceId,
	copiedTraceId,
}: TraceTableRowProps) => {
	const [expandedEventsGraphId, setExpandedEventsGraphId] = useState<
		string | null
	>(null);

	const toggleEventsGraph = (traceId: string) => {
		setExpandedEventsGraphId(
			expandedEventsGraphId === traceId ? null : traceId,
		);
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleString("en-US", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			});
		} catch {
			return dateString;
		}
	};

	const getLocation = () => {
		const parts = [];
		if (trace.city) parts.push(trace.city);
		if (trace.region) parts.push(trace.region);
		if (trace.country) parts.push(trace.country);
		return parts.length > 0 ? parts.join(", ") : "N/A";
	};

	const getProvider = () => {
		const utmSource = trace.utm_source;
		if (utmSource === null || utmSource === undefined) return "N/A";
		if (utmSource === "") return "Unknown";
		if (utmSource.length > 8) return `${utmSource.substring(0, 8)}...`;
		return utmSource;
	};

	const getDeviceIcon = (userAgent?: string) => {
		if (!userAgent) return <Monitor className="h-4 w-4" />;
		const ua = userAgent.toLowerCase();

		// iOS devices (iPhone, iPad)
		if (ua.includes("iphone") || ua.includes("ipad")) {
			return <Apple className="h-4 w-4" />;
		}

		// Android devices
		if (ua.includes("android")) {
			return <Smartphone className="h-4 w-4" />;
		}

		// Windows
		if (ua.includes("windows")) {
			return <Monitor className="h-4 w-4" />;
		}

		// macOS
		if (ua.includes("mac os x") || ua.includes("macintosh")) {
			return <Apple className="h-4 w-4" />;
		}

		// Linux
		if (ua.includes("linux") && !ua.includes("android")) {
			return <Monitor className="h-4 w-4" />;
		}

		// Chrome OS
		if (ua.includes("cros")) {
			return <Laptop className="h-4 w-4" />;
		}

		// Generic mobile
		if (ua.includes("mobile")) {
			return <Smartphone className="h-4 w-4" />;
		}

		// Default to laptop for desktop
		return <Laptop className="h-4 w-4" />;
	};

	const browser = trace.user_agent ? parseBrowser(trace.user_agent) : "Unknown";
	const os = trace.user_agent ? parseOS(trace.user_agent) : "Unknown";

	return (
		<>
			<tr
				className="cursor-pointer transition-all"
				style={{
					backgroundColor: isExpanded ? "hsl(var(--muted))" : undefined,
				}}
				onMouseEnter={(e) =>
					!isExpanded &&
					(e.currentTarget.style.backgroundColor = "hsl(var(--muted))")
				}
				onMouseLeave={(e) =>
					!isExpanded && (e.currentTarget.style.backgroundColor = "")
				}
				onClick={onExpandToggle}
			>
				<td className="relative p-2" style={{ width: "40px" }}>
					<input
						type="checkbox"
						checked={isSelected}
						onChange={(e) => {
							e.stopPropagation();
							onSelectChange(e.target.checked);
						}}
						className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-md border border-gray-300"
					/>
				</td>
				<td className="overflow-hidden p-2" style={{ width: "29%" }}>
					<CopyableId id={trace.id} onCopy={onCopyTraceId} />
				</td>
				<td
					className="overflow-hidden p-2 text-mono text-muted-foreground text-sm"
					style={{ width: "18%" }}
				>
					<span className="block truncate">{formatDate(trace.created_at)}</span>
				</td>
				<td className="overflow-hidden p-2 text-sm" style={{ width: "18%" }}>
					<div className="flex items-center gap-3">
						{getDeviceIcon(trace.user_agent || undefined)}
						<div className="flex-1 space-y-0.5">
							<span className="truncate text-sm">{browser}</span>
							<div className="truncate text-muted-foreground text-xs">{os}</div>
						</div>
					</div>
				</td>
				<td
					className="overflow-hidden p-2 text-muted-foreground text-sm"
					style={{ width: "25%" }}
				>
					<div className="flex items-center gap-1">
						<MapPin className="h-3 w-3 text-muted-foreground" />
						<span className="block truncate">{getLocation()}</span>
					</div>
				</td>

				<td className="p-2 text-right" style={{ width: "10%" }}>
					<button
						type="button"
						disabled={!trace.clarity_session_id || !trace.clarity_project_id}
						className="group h-8 w-8 rounded-lg border border-transparent p-1.5 transition-colors hover:border-gray-300 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:hover:border-gray-600"
						onClick={(e) => {
							e.stopPropagation();
							if (trace.clarity_session_id && trace.clarity_project_id) {
								window.open(
									`https://clarity.microsoft.com/projects/view/${trace.clarity_project_id}/sessions/${trace.clarity_session_id}`,
									"_blank",
								);
							}
						}}
						title={
							trace.clarity_session_id && trace.clarity_project_id
								? "View in Microsoft Clarity"
								: "Clarity data not available"
						}
					>
						<ClarityIcon
							className="h-4 w-4 text-muted-foreground transition-colors"
							disabled={!trace.clarity_session_id || !trace.clarity_project_id}
						/>
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete();
						}}
						className="group h-8 w-8 rounded-lg border border-transparent p-1.5 transition-colors hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
					>
						<Trash2 className="h-4 w-4 group-hover:text-red-500" />
					</button>
				</td>
			</tr>
			{isExpanded && (
				<tr style={{ backgroundColor: "hsl(var(--muted))" }}>
					<td colSpan={7} className="p-4">
						<div className="space-y-3">
							{/* Events Graph Section */}
							<div className="space-y-2 border-border border-b pb-4">
								<button
									type="button"
									onClick={() => toggleEventsGraph(trace.id)}
									className="flex w-full items-center gap-2 text-left transition-colors hover:text-primary"
								>
									{expandedEventsGraphId === trace.id ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4 rotate-[-90deg]" />
									)}
									<h4 className="font-semibold text-sm">Events Graph</h4>
								</button>
								{expandedEventsGraphId === trace.id && (
									<div className="pt-2">
										<EventsGraph traceId={trace.id} />
									</div>
								)}
							</div>

							<div className="mb-3">
								<h4 className="font-semibold text-sm">Trace Details</h4>
							</div>

							{/* Basic Info */}
							<div
								className="grid grid-cols-3 gap-3 rounded-md p-3"
								style={{ backgroundColor: "hsl(var(--muted))" }}
							>
								<InfoBox label="Campaign ID" value={trace.campaign_id} inline />
								<InfoBox
									label="Click ID"
									value={trace.click_id || "N/A"}
									inline
								/>
								<InfoBox
									label="Client IP"
									value={trace.client_ip || "N/A"}
									inline
								/>
							</div>

							{/* UTM Parameters */}
							{(trace.utm_source ||
								trace.utm_medium ||
								trace.utm_campaign ||
								trace.utm_term ||
								trace.utm_content) && (
								<>
									<h5 className="font-semibold text-sm">UTM Parameters</h5>
									<div
										className="grid grid-cols-3 gap-3 rounded-md p-3"
										style={{ backgroundColor: "hsl(var(--muted))" }}
									>
										<InfoBox
											label="UTM Source"
											value={trace.utm_source || "N/A"}
											inline
										/>
										<InfoBox
											label="UTM Medium"
											value={trace.utm_medium || "N/A"}
											inline
										/>
										<InfoBox
											label="UTM Campaign"
											value={trace.utm_campaign || "N/A"}
											inline
										/>
										<InfoBox
											label="UTM Term"
											value={trace.utm_term || "N/A"}
											inline
										/>
										<InfoBox
											label="UTM Content"
											value={trace.utm_content || "N/A"}
											inline
										/>
									</div>
								</>
							)}

							{/* Location Info */}
							<h5 className="font-semibold text-sm">Location Information</h5>
							<div
								className="grid grid-cols-3 gap-3 rounded-md p-3"
								style={{ backgroundColor: "hsl(var(--muted))" }}
							>
								<InfoBox label="City" value={trace.city || "N/A"} inline />
								<InfoBox label="Region" value={trace.region || "N/A"} inline />
								<InfoBox
									label="Country"
									value={trace.country || "N/A"}
									inline
								/>
								<InfoBox
									label="Postal Code"
									value={trace.postal_code || "N/A"}
									inline
								/>
								<InfoBox
									label="Timezone"
									value={trace.timezone || "N/A"}
									inline
								/>
							</div>

							{/* Device & Browser */}
							<h5 className="font-semibold text-sm">
								Device & Browser Information
							</h5>
							<div
								className="grid grid-cols-2 gap-3 rounded-md p-3"
								style={{ backgroundColor: "hsl(var(--muted))" }}
							>
								<InfoBox label="Browser" value={browser} inline />
								<InfoBox label="Operating System" value={os} inline />
								<InfoBox
									label="User Agent"
									value={trace.user_agent || "N/A"}
									inline
									className="col-span-2"
								/>
							</div>

							{/* Final URL */}
							{trace.final_url && (
								<InfoBox
									label="Final URL"
									value={trace.final_url}
									className="break-all"
								/>
							)}
						</div>
					</td>
				</tr>
			)}
		</>
	);
};
