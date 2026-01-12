// Lightweight Cloudflare SDK - Custom Hostnames only
// File structure extracted from cloudflare-typescript SDK

import * as Core from "./core";
import { CustomHostnames } from "./resources/custom-hostnames/custom-hostnames";

export interface ClientOptions {
	/**
	 * The preferred authorization scheme for interacting with the Cloudflare API.
	 * [Create a token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).
	 */
	apiToken?: string | null | undefined;

	/**
	 * Override the default base URL for the API, e.g., "https://api.example.com/v2/"
	 */
	baseURL?: string | null | undefined;

	/**
	 * The maximum amount of time (in milliseconds) that the client should wait for a response
	 * from the server before timing out a single request.
	 *
	 * @unit milliseconds
	 */
	timeout?: number | undefined;

	/**
	 * The maximum number of times that the client will retry a request in case of a
	 * temporary failure, like a network error or a 5XX error from the server.
	 *
	 * @default 2
	 */
	maxRetries?: number | undefined;
}

/**
 * API Client for interfacing with the Cloudflare API.
 */
export class Cloudflare extends Core.APIClient {
	apiToken: string | null;

	private _options: ClientOptions;

	/**
	 * API Client for interfacing with the Cloudflare API.
	 *
	 * @param {string | null | undefined} [opts.apiToken] - Cloudflare API Token
	 * @param {string} [opts.baseURL=https://api.cloudflare.com/client/v4] - Override the default base URL for the API.
	 * @param {number} [opts.timeout=60000] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
	 * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
	 */
	constructor({ baseURL, apiToken, ...opts }: ClientOptions = {}) {
		const options: ClientOptions = {
			apiToken,
			...opts,
			baseURL: baseURL || "https://api.cloudflare.com/client/v4",
		};

		super({
			baseURL: options.baseURL!,
			apiToken: options.apiToken,
		});

		this._options = options;
		this.apiToken = apiToken || null;
	}

	customHostnames: CustomHostnames = new CustomHostnames(this);
}

export { CustomHostnames };

export { APIError, CloudflareError } from "./core";
export type {
	BundleMethod,
	CertificateCA,
	CustomHostname,
	CustomHostnameCreateParams,
	CustomHostnameCreateResponse,
	CustomHostnameDeleteParams,
	CustomHostnameDeleteResponse,
	CustomHostnameGetParams,
	CustomHostnameGetResponse,
	DCVMethod,
	DomainValidationType,
} from "./resources/custom-hostnames/custom-hostnames";
