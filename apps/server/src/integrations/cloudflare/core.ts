// Lightweight Core module extracted from cloudflare-typescript SDK

export class CloudflareError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "CloudflareError";
	}
}

export class APIError extends CloudflareError {
	constructor(
		message: string,
		public readonly status?: number,
		public readonly errors?: Array<{ code: number; message: string }>,
	) {
		super(message);
		this.name = "APIError";
	}
}

export interface CloudflareAPIResponse<T> {
	result: T;
	success: boolean;
	errors: Array<{
		code: number;
		message: string;
	}>;
	messages: string[];
}

export interface RequestOptions {
	headers?: Record<string, string>;
	query?: Record<string, unknown>;
	body?: unknown;
}

export class APIPromise<T> extends Promise<T> {
	_thenUnwrap<U>(transform: (data: T) => U): APIPromise<U> {
		return new APIPromise((resolve, reject) => {
			this.then((data) => resolve(transform(data))).catch(reject);
		});
	}
}

export abstract class APIClient {
	baseURL: string;
	protected apiToken: string | null;

	constructor({
		baseURL,
		apiToken,
	}: {
		baseURL: string;
		apiToken: string | null | undefined;
	}) {
		this.baseURL = baseURL;
		this.apiToken = apiToken || null;
	}

	/**
	 * Make a request to the Cloudflare API
	 * Returns the full CloudflareAPIResponse (not just result)
	 */
	protected async request<T>(
		path: string,
		options: {
			method: "GET" | "POST" | "PATCH" | "DELETE";
			body?: unknown;
		},
	): Promise<CloudflareAPIResponse<T>> {
		const url = `${this.baseURL}${path}`;

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (this.apiToken) {
			headers.Authorization = `Bearer ${this.apiToken}`;
		}

		const fetchOptions: RequestInit = {
			method: options.method,
			headers,
		};

		if (options.body) {
			fetchOptions.body = JSON.stringify(options.body);
		}

		try {
			const response = await fetch(url, fetchOptions);

			// Handle non-JSON responses (like 204 No Content)
			if (response.status === 204) {
				return {
					result: null as T,
					success: true,
					errors: [],
					messages: [],
				};
			}

			const data: CloudflareAPIResponse<T> = await response.json();

			if (!response.ok || !data.success) {
				const errorMessage =
					data.errors?.[0]?.message || `Cloudflare API Error: ${response.statusText}`;

				throw new APIError(errorMessage, response.status, data.errors);
			}

			return data;
		} catch (error) {
			if (error instanceof APIError) {
				throw error;
			}

			// Handle network errors or JSON parse errors
			throw new APIError(`Failed to communicate with Cloudflare API: ${(error as Error).message}`);
		}
	}

	/**
	 * GET request
	 */
	get<T>(path: string, options?: RequestOptions): APIPromise<CloudflareAPIResponse<T>> {
		return new APIPromise((resolve, reject) => {
			this.request<T>(path, { method: "GET" }).then(resolve).catch(reject);
		});
	}

	/**
	 * POST request
	 */
	post<T>(
		path: string,
		body: unknown,
		options?: RequestOptions,
	): APIPromise<CloudflareAPIResponse<T>> {
		return new APIPromise((resolve, reject) => {
			this.request<T>(path, { method: "POST", body }).then(resolve).catch(reject);
		});
	}

	/**
	 * PATCH request
	 */
	patch<T>(
		path: string,
		body: unknown,
		options?: RequestOptions,
	): APIPromise<CloudflareAPIResponse<T>> {
		return new APIPromise((resolve, reject) => {
			this.request<T>(path, { method: "PATCH", body }).then(resolve).catch(reject);
		});
	}

	/**
	 * DELETE request
	 */
	delete<T>(path: string, options?: RequestOptions): APIPromise<CloudflareAPIResponse<T>> {
		return new APIPromise((resolve, reject) => {
			this.request<T>(path, { method: "DELETE" }).then(resolve).catch(reject);
		});
	}
}
