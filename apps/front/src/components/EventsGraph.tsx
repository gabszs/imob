import dagre from "@dagrejs/dagre";
import {
	Background,
	Controls,
	type Edge,
	Handle,
	MarkerType,
	type Node,
	type NodeProps,
	Position,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import { useEventsByTraceId } from "@/web/hooks/useEvents";
import "@xyflow/react/dist/style.css";
import { Loader2, RotateCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Props
interface EventsGraphProps {
	traceId: string;
}

// Custom Node Component
function EventNode({ data }: NodeProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="flex min-w-[140px] max-w-[280px] flex-col rounded-lg border-2 border-border bg-card text-foreground shadow-sm transition-all hover:border-primary hover:shadow-md">
			<Handle
				type="target"
				position={Position.Left}
				className="!bg-muted-foreground !h-1.5 !w-1.5"
			/>
			<div className="flex flex-col items-center justify-center px-4 py-3">
				<div className="text-center font-semibold text-sm">{data.name}</div>
				<div className="mt-1 text-center text-xs opacity-60">
					{data.created_at}
				</div>
			</div>

			{data.id && data.payload && (
				<>
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex items-center justify-center gap-1 border-border border-t px-4 py-2 text-primary text-xs transition-colors hover:bg-muted"
					>
						<span
							className="transition-transform"
							style={{
								transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
							}}
						>
							▶
						</span>
						Details
					</button>

					{isExpanded && (
						<div className="space-y-2 border-border border-t bg-muted/30 px-4 py-3 text-xs">
							<div>
								<span className="font-semibold">ID:</span>
								<div className="mt-0.5 break-all font-mono text-[10px] text-muted-foreground">
									{data.id}
								</div>
							</div>
							<div>
								<span className="font-semibold">Payload:</span>
								<pre className="mt-0.5 max-h-[150px] overflow-auto whitespace-pre-wrap rounded bg-background/50 p-2 text-[10px] text-muted-foreground">
									{JSON.stringify(data.payload, null, 2)}
								</pre>
							</div>
							{data.metadata && (
								<div>
									<span className="font-semibold">Metadata:</span>
									<pre className="mt-0.5 whitespace-pre-wrap rounded bg-background/50 p-2 text-[10px] text-muted-foreground">
										{JSON.stringify(data.metadata, null, 2)}
									</pre>
								</div>
							)}
						</div>
					)}
				</>
			)}
			<Handle
				type="source"
				position={Position.Right}
				className="!bg-muted-foreground !h-1.5 !w-1.5"
			/>
		</div>
	);
}

const nodeWidth = 180;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));
	dagreGraph.setGraph({
		rankdir: "LR", // layout Left → Right
		nodesep: 100,
		ranksep: 150,
	});

	nodes.forEach((node) => {
		dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
	});

	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	const layoutedNodes = nodes.map((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		return {
			...node,
			position: {
				x: nodeWithPosition.x - nodeWidth / 2,
				y: nodeWithPosition.y - nodeHeight / 2,
			},
		};
	});

	return { nodes: layoutedNodes, edges };
};

export function EventsGraph({ traceId }: EventsGraphProps) {
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);

	// Use TanStack Query hook instead of direct client call
	const {
		data: events = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useEventsByTraceId(traceId);

	const formatDate = useCallback((dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
		} catch {
			return dateString;
		}
	}, []);

	// Process events data when it changes
	useEffect(() => {
		if (!events || events.length === 0) {
			setNodes([]);
			setEdges([]);
			return;
		}

		// Sort events from oldest to newest
		const sorted = [...events].sort(
			(a, b) =>
				new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
		);

		// Create nodes
		const newNodes: Node[] = sorted.map((e) => ({
			id: e.id,
			type: "eventNode",
			sourcePosition: Position.Right,
			targetPosition: Position.Left,
			position: { x: 0, y: 0 },
			data: {
				id: e.id,
				name: e.name,
				created_at: formatDate(e.created_at),
				payload: e.payload,
				metadata: e.metadata,
			},
		}));

		// Create edges connecting the events sequentially
		const newEdges: Edge[] = sorted.slice(0, -1).map((e, i) => ({
			id: `e${e.id}-${sorted[i + 1].id}`,
			source: e.id,
			target: sorted[i + 1].id,
			type: "default",
			animated: true,
			style: {
				stroke: "#F38020",
				strokeWidth: 2,
				strokeDasharray: "5 5",
			},
			markerEnd: {
				type: MarkerType.ArrowClosed,
				color: "#F38020",
			},
		}));

		// Automatic layout
		const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
			newNodes,
			newEdges,
		);

		setNodes(layoutedNodes);
		setEdges(layoutedEdges);
	}, [events, formatDate, setNodes, setEdges]);

	if (isLoading)
		return (
			<div className="flex h-[400px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);

	if (isError)
		return (
			<div className="flex h-[400px] items-center justify-center">
				<p className="text-destructive text-sm">
					{error instanceof Error
						? error.message
						: "Failed to load events graph"}
				</p>
				<button
					onClick={() => refetch()}
					className="ml-4 rounded-md border border-border bg-background p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
					title="Retry"
				>
					<RotateCw className="h-4 w-4" />
				</button>
			</div>
		);

	if (nodes.length === 0)
		return (
			<div className="flex h-[400px] items-center justify-center">
				<p className="text-muted-foreground text-sm">
					No events found for this trace
				</p>
				<button
					onClick={() => refetch()}
					className="ml-4 rounded-md border border-border bg-background p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
					title="Refresh"
				>
					<RotateCw className="h-4 w-4" />
				</button>
			</div>
		);

	return (
		<div className="relative h-[420px] w-full rounded-lg border border-border bg-background">
			<style>{`
				.react-flow__edge-path {
					stroke: #F38020;
					stroke-width: 2px;
				}
				.react-flow__controls {
					background: hsl(var(--card)) !important;
					border: 1px solid hsl(var(--border)) !important;
				}
				.react-flow__controls button {
					background: hsl(var(--background)) !important;
					border-bottom: 1px solid hsl(var(--border)) !important;
					color: #F38020 !important;
				}
				.react-flow__controls button:hover {
					background: #F38020 !important;
					color: white !important;
				}
				.react-flow__controls button path {
					fill: currentColor;
				}
				.react-flow__attribution {
					display: none !important;
				}
				.react-flow__pane,
				.react-flow__renderer,
				.react-flow__viewport {
					background: transparent !important;
					backdrop-filter: none !important;
				}
			`}</style>

			<button
				type="button"
				onClick={() => refetch()}
				className="absolute top-4 right-4 z-10 rounded-md border-2 border-foreground/20 bg-background p-2 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
				title="Refresh Events"
			>
				<RotateCw className="h-4 w-4" />
			</button>

			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				nodeTypes={{ eventNode: EventNode }}
				fitView
				minZoom={0.5}
				maxZoom={1.5}
			>
				<Background />
				<Controls />
			</ReactFlow>
		</div>
	);
}
