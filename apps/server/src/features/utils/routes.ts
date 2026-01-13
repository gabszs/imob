import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { HttpStatusCodes } from "../../lib/constants";
import { httpErrors } from "../../lib/errors";
import { type AppContext } from "../../types";
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
			[HttpStatusCodes.OK]: {
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
		throw httpErrors.badRequest("test");
		return c.json(
			{
				status: "ok",
				timestamp: new Date().toISOString(),
				metadata: c.env.VERSION_METADATA,
			},
			HttpStatusCodes.OK,
		);
	},
);

export default utilityRoutes;
