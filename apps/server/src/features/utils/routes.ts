import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import type { AppContext } from "../../types";
import { healthSchema } from "./schemas";

const utilityRoutes = new OpenAPIHono<AppContext>();

utilityRoutes.openapi(
	createRoute({
		tags: ["utilities"],
		summary: "Health check endpoint",
		description: "Returns the health status of the service along with the current timestamp",
		method: "get",
		path: "/health",
		responses: {
			200: {
				description: "Service is healthy and operational",
				content: {
					"application/json": {
						schema: healthSchema,
					},
				},
			},
		},
	}),
	async (c: AppContext) => {
		await c.env.D1.prepare("SELECT 1").first();
		return c.json({
			status: "ok",
			timestamp: new Date().toISOString(),
			metadata: c.env.VERSION_METADATA,
		});
	},
);

export default utilityRoutes;
