import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

type ErrorOptions = Partial<{
	success: boolean;
	error: string;
	message: string;
	code: string;
}>;

function createHttpException(
	defaultError: string,
	defaultMessage: string,
	defaultCode: string,
	defaultStatus: ContentfulStatusCode,
	opts: ErrorOptions = {},
) {
	const response = Response.json(
		{
			error: opts.error || defaultError,
			message: opts.message || defaultMessage,
			code: opts.code || defaultCode,
		},
		{ status: defaultStatus },
	);
	return new HTTPException(defaultStatus, { res: response });
}

export const httpErrors = {
	invalidAuthorizationHeader: (opts?: ErrorOptions) =>
		createHttpException(
			"Invalid or missing Authorization header",
			"The 'Authorization' header must be provided in the format: 'Bearer <token>'",
			"INVALID_AUTHORIZATION_HEADER",
			401,
			opts,
		),
	duplicateField: (entity: string, field: string, opts?: ErrorOptions) =>
		createHttpException(
			`${field} already exists`,
			`A ${entity} with this ${field} already exists.`,
			`${entity.replace(/-/g, "_").toUpperCase()}_${field.replace(/-/g, "_").toUpperCase()}_ALREADY_EXISTS`,
			409,
			opts,
		),

	noChangesDetected: (opts?: ErrorOptions) =>
		createHttpException(
			"No changes detected",
			"No changes were detected in the webhook payload",
			"NO_CHANGES_DETECTED",
			422,
			opts,
		),
	expressionEvaluationFailed: (engine: string, errMsg: string, opts?: ErrorOptions) =>
		createHttpException(
			errMsg,
			`Failed to evaluate expression with engine "${engine}": "${errMsg}"`,
			`${engine.toUpperCase()}_EXPRESSION_FAILED`,
			400,
			opts,
		),
	missingRedirectUrl: (opts?: ErrorOptions) =>
		createHttpException(
			"Missing required parameter",
			"The 'redirect_url' query parameter is required",
			"MISSING_REDIRECT_URL",
			400,
			opts,
		),

	userMismatch: (opts?: ErrorOptions) =>
		createHttpException(
			"User mismatch",
			"The userId does not match the provided entity id",
			"USER_MISMATCH",
			403,
			opts,
		),

	entityInactive: (entityName: string, opts?: ErrorOptions) =>
		createHttpException(
			`${entityName} inactive`,
			`The requested ${entityName} is inactive`,
			`${entityName.toUpperCase()}_INACTIVE`,
			403,
			opts,
		),

	missingRequiredField: (fieldName: string, opts?: ErrorOptions) =>
		createHttpException(
			"Missing required field",
			`The '${fieldName}' field is required`,
			`${fieldName.toUpperCase()}_REQUIRED`,
			400,
			opts,
		),

	missingApiKey: (opts?: ErrorOptions) =>
		createHttpException(
			"Missing required parameter",
			"The 'api_key' query parameter is required",
			"MISSING_API_KEY",
			400,
			opts,
		),

	apiKeyNotFound: (opts?: ErrorOptions) =>
		createHttpException(
			"Invalid API key",
			"The provided API key was not found",
			"API_KEY_NOT_FOUND",
			401,
			opts,
		),

	entityNotFound: (entity_name: string, opts?: ErrorOptions) =>
		createHttpException(
			`${entity_name} not found`,
			`The provided ${entity_name} was not found`,
			`${entity_name.replace(/-/g, "_").replace(/ /g, "_").toUpperCase()}_NOT_FOUND`,
			404,
			opts,
		),

	apiKeyInactive: (opts?: ErrorOptions) =>
		createHttpException(
			"API key inactive",
			"The provided API key is not active or has been disabled",
			"API_KEY_INACTIVE",
			403,
			opts,
		),

	badRequest: (message: string, opts?: ErrorOptions) =>
		createHttpException("Bad request", message, "BAD_REQUEST", 400, opts),

	unauthorized: (opts?: ErrorOptions) =>
		createHttpException(
			"Unauthorized",
			"You must be authenticated to access this resource",
			"UNAUTHORIZED",
			401,
			opts,
		),

	forbidden: (opts?: ErrorOptions) =>
		createHttpException(
			"Forbidden",
			"You do not have permission to access this resource",
			"FORBIDDEN",
			403,
			opts,
		),

	adminOnly: (opts?: ErrorOptions) =>
		createHttpException(
			"Admin access required",
			"Only administrators can access this resource",
			"ADMIN_ONLY",
			403,
			opts,
		),

	custom: (opts: ErrorOptions & { status: number }) =>
		createHttpException(
			opts.error || "Error",
			opts.message || "An error occurred",
			opts.code || "CUSTOM_ERROR",
			opts.status,
			opts,
		),
};
