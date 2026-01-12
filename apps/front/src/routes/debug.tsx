import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Bug, Copy, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/web/components/ui/card";
import { Input } from "@/web/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/web/components/ui/table";
import { useToast } from "@/web/hooks/use-toast";

export const Route = createFileRoute("/debug")({
	component: DebugComponent,
});

interface TracePayload {
	id: string;
	created_at: string;
	campaign_id: string;
	api_key_id: string;
	redirect_url: string;
	final_url: string;
	[key: string]: string | number | boolean | null;
}

interface DebugInfo {
	trace_payload: TracePayload;
	final_url: string;
	timestamp: string;
	error?: string;
	api_key_valid?: boolean;
	api_key_info?: {
		id: string;
		isActive: boolean;
		token: string;
	};
}

function DebugComponent() {
	const { toast } = useToast();
	const [searchParams, setSearchParams] = useState<Record<string, string>>({});
	const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Read URL params manually to preserve precision
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const paramsObj: Record<string, string> = {};
		for (const [key, value] of params.entries()) {
			paramsObj[key] = value;
		}
		setSearchParams(paramsObj);
	}, []);

	// Simulates the redirect endpoint processing
	useEffect(() => {
		const processDebugInfo = async () => {
			// Extracts the necessary parameters
			const { campaign_id, redirect_url, api_key, ...extraParams } =
				searchParams;

			// If it doesn't have the necessary parameters, does nothing
			if (!campaign_id && !redirect_url && !api_key) {
				return;
			}

			setIsLoading(true);

			try {
				// Simulates API key validation (makes real request if possible)
				let apiKeyInfo = null;
				let apiKeyValid = false;

				if (api_key) {
					try {
						// Tries to fetch the API key from R2 (via endpoint if exists)
						const response = await fetch(
							`${import.meta.env.VITE_SERVER_URL}/api/auth/api-key`,
							{
								headers: {
									Authorization: `Bearer ${api_key}`,
								},
							},
						);

						if (response.ok) {
							const data = await response.json();
							apiKeyInfo = data;
							apiKeyValid = data.isActive;
						}
					} catch (_error) {
						// If it fails, just marks as invalid
						apiKeyValid = false;
					}
				}

				// Generates the trace_id and timestamp
				const trace_id = crypto.randomUUID();
				const created_at = new Date().toISOString();

				// Builds the final_url
				let final_url = redirect_url || "";
				if (final_url) {
					const url = new URL(final_url);
					// Adds the extra params
					for (const [key, value] of Object.entries(extraParams)) {
						if (value) {
							url.searchParams.set(key, value);
						}
					}
					// Adds trace_id and api_key
					url.searchParams.set("trace_id", trace_id);
					if (api_key) {
						url.searchParams.set("api_key", api_key);
					}
					final_url = url.toString();
				}

				// Builds the trace_payload (simulating what the endpoint would do)
				const trace_payload: TracePayload = {
					id: trace_id,
					created_at,
					campaign_id: campaign_id || "missing",
					api_key_id: apiKeyInfo?.id || "unknown",
					redirect_url: redirect_url || "missing",
					final_url,
					...extraParams,
					// Simulates some Cloudflare Request data
					country: "BR",
					city: "São Paulo",
					colo: "GRU",
					timezone: "America/Sao_Paulo",
					asn: "1234",
					"user-agent": navigator.userAgent,
					"accept-language": navigator.language,
				};

				const info: DebugInfo = {
					trace_payload,
					final_url,
					timestamp: new Date().toISOString(),
					api_key_valid: apiKeyValid,
					api_key_info: apiKeyInfo,
				};

				// If required parameters are missing, adds error
				if (!redirect_url) {
					info.error = "Missing required parameter: redirect_url";
				} else if (!api_key) {
					info.error = "Missing required parameter: api_key";
				} else if (!campaign_id) {
					info.error = "Missing required parameter: campaign_id";
				} else if (!apiKeyValid) {
					info.error = "API key is invalid or inactive";
				}

				setDebugInfo(info);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				setDebugInfo({
					trace_payload: {
						id: "",
						created_at: "",
						campaign_id: "",
						api_key_id: "",
						redirect_url: "",
						final_url: "",
					},
					final_url: "",
					timestamp: new Date().toISOString(),
					error: errorMessage,
				});
			} finally {
				setIsLoading(false);
			}
		};

		processDebugInfo();
	}, [searchParams]);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast({
			title: "Copied!",
			description: "Text copied to clipboard",
		});
	};

	const hasParams =
		searchParams.campaign_id ||
		searchParams.redirect_url ||
		searchParams.api_key;

	return (
		<div className="container mx-auto space-y-6 px-4 py-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Bug className="h-8 w-8 text-primary" />
					<div>
						<h1 className="font-bold text-3xl">Debug Redirect</h1>
						<p className="text-muted-foreground text-sm">
							Visual debugger for the redirect endpoint
						</p>
					</div>
				</div>
			</div>

			{/* Instructions */}
			{!hasParams && (
				<Card>
					<CardHeader>
						<CardTitle>How to use</CardTitle>
						<CardDescription>
							Add query parameters to this page URL to simulate the redirect
							endpoint
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h3 className="mb-2 font-medium text-sm">Example URL:</h3>
							<code className="block rounded-lg bg-muted p-3 font-mono text-sm">
								/debug?campaign_id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx&redirect_url=https://example.com&api_key=your-api-key&utm_source=test&utm_medium=email
							</code>
						</div>
						<div>
							<h3 className="mb-2 font-medium text-sm">Required Parameters:</h3>
							<ul className="ml-4 list-disc space-y-1 text-muted-foreground text-sm">
								<li>
									<code>campaign_id</code>: UUID of the campaign
								</li>
								<li>
									<code>redirect_url</code>: Target URL to redirect to
								</li>
								<li>
									<code>api_key</code>: Your API key
								</li>
							</ul>
						</div>
						<div>
							<h3 className="mb-2 font-medium text-sm">Optional Parameters:</h3>
							<p className="text-muted-foreground text-sm">
								Any additional query parameters (utm_source, utm_medium, etc.)
								will be included in the trace and final URL
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Loading State */}
			{isLoading && (
				<Card>
					<CardContent className="flex items-center justify-center py-12">
						<div className="text-center">
							<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
							<p className="text-muted-foreground text-sm">
								Processing debug info...
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Debug Info Display */}
			{!isLoading && debugInfo && hasParams && (
				<>
					{/* Status Card */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Status</CardTitle>
									<CardDescription>
										Timestamp: {debugInfo.timestamp}
									</CardDescription>
								</div>
								{debugInfo.error ? (
									<Badge variant="destructive">
										<AlertCircle className="mr-1 h-3 w-3" />
										Error
									</Badge>
								) : (
									<Badge>
										<ExternalLink className="mr-1 h-3 w-3" />
										Valid
									</Badge>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{debugInfo.error && (
								<div className="rounded-lg bg-destructive/10 p-4">
									<p className="font-medium text-destructive text-sm">
										{debugInfo.error}
									</p>
								</div>
							)}
							{debugInfo.api_key_valid !== undefined && (
								<div className="flex items-center gap-2">
									<span className="text-sm">API Key Status:</span>
									{debugInfo.api_key_valid ? (
										<Badge variant="default">Valid & Active</Badge>
									) : (
										<Badge variant="destructive">Invalid or Inactive</Badge>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Query Parameters Card */}
					<Card>
						<CardHeader>
							<CardTitle>Query Parameters</CardTitle>
							<CardDescription>Parameters received in the URL</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-1/3">Parameter</TableHead>
											<TableHead>Value</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{Object.entries(searchParams).length > 0 ? (
											Object.entries(searchParams).map(([key, value]) => (
												<TableRow key={key}>
													<TableCell className="font-mono text-sm">
														{key}
													</TableCell>
													<TableCell className="font-mono text-sm">
														{value || (
															<span className="text-muted-foreground italic">
																empty
															</span>
														)}
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={2}
													className="text-center text-muted-foreground"
												>
													No query parameters
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>

					{/* Final URL Card */}
					{debugInfo.final_url && (
						<Card>
							<CardHeader>
								<CardTitle>Final Redirect URL</CardTitle>
								<CardDescription>
									This is where the user would be redirected
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="flex gap-2">
									<Input
										value={debugInfo.final_url}
										readOnly
										className="font-mono text-sm"
									/>
									<Button
										variant="outline"
										size="sm"
										onClick={() => copyToClipboard(debugInfo.final_url)}
									>
										<Copy className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => window.open(debugInfo.final_url, "_blank")}
									>
										<ExternalLink className="h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Trace Payload Card */}
					<Card>
						<CardHeader>
							<CardTitle>Trace Payload</CardTitle>
							<CardDescription>
								Data that would be sent to the queue
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-1/3">Key</TableHead>
											<TableHead>Value</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{Object.entries(debugInfo.trace_payload).map(
											([key, value]) => (
												<TableRow key={key}>
													<TableCell className="font-mono text-sm">
														{key}
													</TableCell>
													<TableCell className="font-mono text-sm">
														{value === null
															? "null"
															: typeof value === "object"
																? JSON.stringify(value)
																: String(value)}
													</TableCell>
												</TableRow>
											),
										)}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>

					{/* API Key Info */}
					{debugInfo.api_key_info && (
						<Card>
							<CardHeader>
								<CardTitle>API Key Information</CardTitle>
							</CardHeader>
							<CardContent>
								<Table>
									<TableBody>
										<TableRow>
											<TableCell className="font-medium">ID</TableCell>
											<TableCell className="font-mono text-sm">
												{debugInfo.api_key_info.id}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell className="font-medium">Status</TableCell>
											<TableCell>
												{debugInfo.api_key_info.isActive ? (
													<Badge>Active</Badge>
												) : (
													<Badge variant="destructive">Inactive</Badge>
												)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell className="font-medium">Token</TableCell>
											<TableCell className="font-mono text-sm">
												{debugInfo.api_key_info.token
													? `${debugInfo.api_key_info.token.substring(0, 20)}...`
													: "N/A"}
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					)}

					{/* Raw JSON */}
					<Card>
						<CardHeader>
							<CardTitle>Raw JSON</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="rounded-lg bg-muted p-4">
								<pre className="overflow-x-auto font-mono text-xs">
									{JSON.stringify(debugInfo, null, 2)}
								</pre>
							</div>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
