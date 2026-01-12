import { Trash2 } from "lucide-react";
import { useState } from "react";
import { CopyableId } from "./copyable-id";
import { InfoBox } from "./info-box";
import { parseBrowser, parseDevice, parseOS } from "./user-agent-parser";

interface EventTableRowProps {
	event: any;
	isSelected: boolean;
	isExpanded: boolean;
	onSelectChange: (checked: boolean) => void;
	onExpandToggle: () => void;
	onDelete: () => void;
	onCopyTraceId: (traceId: string) => void;
	copiedEventId: string | null;
}

export const EventTableRow = ({
	event,
	isSelected,
	isExpanded,
	onSelectChange,
	onExpandToggle,
	onDelete,
	onCopyTraceId,
	copiedEventId,
}: EventTableRowProps) => {
	const [hoveredField, setHoveredField] = useState<string | null>(null);

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

	const userAgent = (event.metadata as any)?.user_agent;
	const city = (event.metadata as any)?.city;
	const region = (event.metadata as any)?.region;
	const location = (() => {
		if (city && region) return `${city}, ${region}`;
		if (city) return city;
		if (region) return region;
		return "N/A";
	})();

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
				<td className="overflow-hidden p-2" style={{ width: "25%" }}>
					<span className="truncate font-medium text-foreground text-sm">
						{event.name}
					</span>
				</td>
				<td
					className="overflow-hidden p-2 text-mono text-muted-foreground text-sm"
					style={{ width: "20%" }}
				>
					<span className="block truncate">{formatDate(event.created_at)}</span>
				</td>
				<td
					className="overflow-hidden p-2 text-mono text-muted-foreground text-sm"
					style={{ width: "35%" }}
				>
					<CopyableId id={event.trace_id} onCopy={(id) => onCopyTraceId(id)} />
				</td>
				<td className="p-2 text-right" style={{ width: "20%" }}>
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
					<td colSpan={5} className="p-4">
						<div className="space-y-3">
							<div
								className="grid grid-cols-3 gap-3 rounded-md p-3"
								style={{ backgroundColor: "hsl(var(--muted))" }}
							>
								<InfoBox label="Event ID" value={event.id} inline />
								<InfoBox
									label="Client IP"
									value={(event.metadata as any)?.ip_address || "N/A"}
									inline
								/>
								<InfoBox label="Location" value={location} inline />
							</div>
							<div
								className="grid grid-cols-3 gap-3 rounded-md p-3"
								style={{
									backgroundColor: "hsl(var(--muted))",
									marginTop: "-20px",
								}}
							>
								<InfoBox label="User Agent" value={userAgent || "N/A"} inline />
								{userAgent && (
									<>
										<InfoBox
											label="Browser"
											value={parseBrowser(userAgent)}
											inline
										/>
										<InfoBox label="OS" value={parseOS(userAgent)} inline />
										<InfoBox
											label="Device"
											value={parseDevice(userAgent)}
											inline
										/>
									</>
								)}
							</div>
							{event.payload && (
								<InfoBox label="Payload" value={event.payload} />
							)}
							{event.metadata && (
								<InfoBox label="Metadata" value={event.metadata} />
							)}
						</div>
					</td>
				</tr>
			)}
		</>
	);
};
