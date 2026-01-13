import { type RouterOutputs } from "@/server/lib/router";
import { orpc } from "@/web/lib/orpc";
import { useQuery } from "@tanstack/react-query";

export type McpServer = RouterOutputs["mcp"]["listServers"][number];

export function useMcpServers(options?: { enabled?: boolean }) {
	return useQuery(
		orpc.mcp.listServers.queryOptions({
			staleTime: 30_000,
			...options,
		}),
	);
}
