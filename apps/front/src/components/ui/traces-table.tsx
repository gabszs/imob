import { SortHeader } from "./sort-header";
import { TraceTableRow } from "./trace-table-row";

type SortField =
	| "id"
	| "created_at"
	| "campaign_id"
	| "city"
	| "country"
	| "utm_source";
type SortDirection = "asc" | "desc";

interface TracesTableProps {
	traces: any[];
	isLoading: boolean;
	isLoadingMore: boolean;
	hasMore: boolean;
	selectedRows: Set<string>;
	expandedRows: Set<string>;
	sortField: SortField | null;
	sortDirection: SortDirection;
	copiedTraceId: string | null;
	onSelectAll: (checked: boolean) => void;
	onSelectRow: (traceId: string, checked: boolean) => void;
	onExpandRow: (traceId: string) => void;
	onDeleteRow: (traceId: string) => void;
	onCopyTraceId: (traceId: string) => void;
	onSort: (field: SortField) => void;
	onLoadMore: () => void;
}

export const TracesTable = ({
	traces,
	isLoading,
	isLoadingMore,
	hasMore,
	selectedRows,
	expandedRows,
	sortField,
	sortDirection,
	copiedTraceId,
	onSelectAll,
	onSelectRow,
	onExpandRow,
	onDeleteRow,
	onCopyTraceId,
	onSort,
	onLoadMore,
}: TracesTableProps) => {
	const allSelected =
		traces.length > 0 && traces.every((trace) => selectedRows.has(trace.id));

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
							style={{ width: "29%" }}
						>
							<SortHeader
								field="id"
								label="Trace ID"
								isActive={sortField === "id"}
								sortDirection={sortDirection}
								onClick={() => onSort("id")}
							/>
						</th>
						<th
							className="h-8 px-2 text-left font-semibold text-foreground text-sm"
							style={{ width: "18%" }}
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
							style={{ width: "18%" }}
						>
							Browser / Device
						</th>
						<th
							className="h-8 px-2 text-left font-semibold text-foreground text-sm"
							style={{ width: "25%" }}
						>
							<SortHeader
								field="country"
								label="Location"
								isActive={sortField === "country"}
								sortDirection={sortDirection}
								onClick={() => onSort("country")}
							/>
						</th>
						<th
							className="h-8 px-2 text-right font-semibold text-foreground text-sm"
							style={{ width: "10%" }}
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border">
					{isLoading ? (
						<tr>
							<td colSpan={7} className="p-4 text-center text-muted-foreground">
								Loading...
							</td>
						</tr>
					) : traces.length === 0 ? (
						<tr>
							<td colSpan={7} className="p-4 text-center text-muted-foreground">
								No traces found
							</td>
						</tr>
					) : (
						traces.map((trace) => (
							<TraceTableRow
								key={trace.id}
								trace={trace}
								isSelected={selectedRows.has(trace.id)}
								isExpanded={expandedRows.has(trace.id)}
								onSelectChange={(checked) => onSelectRow(trace.id, checked)}
								onExpandToggle={() => onExpandRow(trace.id)}
								onDelete={() => onDeleteRow(trace.id)}
								onCopyTraceId={() => onCopyTraceId(trace.id)}
								copiedTraceId={copiedTraceId}
							/>
						))
					)}
				</tbody>
			</table>

			{/* Load More Button */}
			{!isLoading && traces.length > 0 && (
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
							No more traces
						</span>
					)}
				</div>
			)}
		</div>
	);
};
