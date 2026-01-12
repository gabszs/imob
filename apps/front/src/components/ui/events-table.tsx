import { EventTableRow } from "./event-table-row";
import { SortHeader } from "./sort-header";

type SortField = "name" | "created_at" | "trace_id";
type SortDirection = "asc" | "desc";

interface EventsTableProps {
	events: any[];
	isLoading: boolean;
	isLoadingMore: boolean;
	hasMore: boolean;
	selectedRows: Set<string>;
	expandedRows: Set<string>;
	sortField: SortField | null;
	sortDirection: SortDirection;
	copiedEventId: string | null;
	onSelectAll: (checked: boolean) => void;
	onSelectRow: (eventId: string, checked: boolean) => void;
	onExpandRow: (eventId: string) => void;
	onDeleteRow: (eventId: string) => void;
	onCopyTraceId: (eventId: string, traceId: string) => void;
	onSort: (field: SortField) => void;
	onLoadMore: () => void;
}

export const EventsTable = ({
	events,
	isLoading,
	isLoadingMore,
	hasMore,
	selectedRows,
	expandedRows,
	sortField,
	sortDirection,
	copiedEventId,
	onSelectAll,
	onSelectRow,
	onExpandRow,
	onDeleteRow,
	onCopyTraceId,
	onSort,
	onLoadMore,
}: EventsTableProps) => {
	const allSelected =
		events.length > 0 && events.every((event) => selectedRows.has(event.id));

	return (
		<div className="mt-3 w-full overflow-x-auto">
			<table
				className="w-full border-collapse"
				style={{ tableLayout: "fixed" }}
			>
				<thead className="border-border border-b">
					<tr>
						<th className="relative h-8 p-2" style={{ width: "40px" }}>
							<input
								type="checkbox"
								checked={allSelected}
								onChange={(e) => onSelectAll(e.target.checked)}
								className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-md border border-gray-300"
							/>
						</th>
						<th
							className="h-8 px-2 text-left font-semibold text-foreground text-sm"
							style={{ width: "25%" }}
						>
							<SortHeader
								field="name"
								label="Event Name"
								isActive={sortField === "name"}
								sortDirection={sortDirection}
								onClick={() => onSort("name")}
							/>
						</th>
						<th
							className="h-8 px-2 text-left font-semibold text-foreground text-sm"
							style={{ width: "20%" }}
						>
							<SortHeader
								field="created_at"
								label="Created At"
								isActive={sortField === "created_at"}
								sortDirection={sortDirection}
								onClick={() => onSort("created_at")}
							/>
						</th>
						<th
							className="h-8 px-2 text-left font-semibold text-foreground text-sm"
							style={{ width: "35%" }}
						>
							<SortHeader
								field="trace_id"
								label="Trace ID"
								isActive={sortField === "trace_id"}
								sortDirection={sortDirection}
								onClick={() => onSort("trace_id")}
							/>
						</th>
						<th
							className="h-8 px-2 text-right font-semibold text-foreground text-sm"
							style={{ width: "20%" }}
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border">
					{isLoading ? (
						<tr>
							<td colSpan={5} className="p-4 text-center text-muted-foreground">
								Loading...
							</td>
						</tr>
					) : events.length === 0 ? (
						<tr>
							<td colSpan={5} className="p-4 text-center text-muted-foreground">
								No events found
							</td>
						</tr>
					) : (
						events.map((event) => (
							<EventTableRow
								key={event.id}
								event={event}
								isSelected={selectedRows.has(event.id)}
								isExpanded={expandedRows.has(event.id)}
								onSelectChange={(checked) => onSelectRow(event.id, checked)}
								onExpandToggle={() => onExpandRow(event.id)}
								onDelete={() => onDeleteRow(event.id)}
								onCopyTraceId={(traceId) => onCopyTraceId(event.id, traceId)}
								copiedEventId={copiedEventId}
							/>
						))
					)}
				</tbody>
			</table>

			{/* Load More Button */}
			{!isLoading && events.length > 0 && (
				<div className="mt-3 flex justify-end pr-8">
					{isLoadingMore ? (
						<div className="flex items-center gap-2">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
							<span className="text-muted-foreground text-sm">Loading...</span>
						</div>
					) : hasMore ? (
						<button
							type="button"
							onClick={onLoadMore}
							className="cursor-pointer rounded-md border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent"
						>
							Load More
						</button>
					) : (
						<span className="text-muted-foreground text-sm">
							No more events
						</span>
					)}
				</div>
			)}
		</div>
	);
};
