import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import alchemy from "alchemy";
import {
	type Binding,
	D1Database,
	KVNamespace,
	Queue,
	R2Bucket,
	RateLimit,
	VersionMetadata,
	Vite,
	Worker,
	Workflow,
	WranglerJson,
} from "alchemy/cloudflare";
import { CloudflareStateStore } from "alchemy/state";
import { config } from "dotenv";
import simpleGit from "simple-git";

async function getGitMetadata() {
	const git = simpleGit();

	const [log, branch, userName, userEmail] = await Promise.all([
		git.log({ maxCount: 1 }),
		git.branch(),
		git.raw(["config", "user.name"]),
		git.raw(["config", "user.email"]),
	]);

	return {
		commit: log.latest?.hash,
		branch: branch.current,
		user: {
			name: userName.trim(),
			email: userEmail.trim(),
		},
	};
}

const commitInfo = await getGitMetadata();
console.log("Commit Info:", commitInfo);

async function getServiceVersion(packageJsonPath: string): Promise<string> {
	const absolutePath = resolve(packageJsonPath);
	const packageJson = JSON.parse(await readFile(absolutePath, "utf-8"));
	return packageJson.version;
}

async function bumpPatchVersion(packageJsonPath: string): Promise<string> {
	const absolutePath = resolve(packageJsonPath);
	const packageJson = JSON.parse(await readFile(absolutePath, "utf-8"));

	const currentVersion = packageJson.version;
	const [major, minor, patch] = currentVersion.split(".").map(Number);
	const newVersion = `${major}.${minor}.${patch + 1}`;

	packageJson.version = newVersion;
	await writeFile(absolutePath, JSON.stringify(packageJson, null, "\t") + "\n");

	console.log(`✓ Version bumped: ${currentVersion} → ${newVersion} (${packageJsonPath})`);
	return newVersion;
}

const app = await alchemy("imob-prod", {
	stateStore: (scope) =>
		new CloudflareStateStore(scope, {
			password: alchemy.secret.env.ALCHEMY_PASSWORD,
			stateToken: alchemy.secret.env.ALCHEMY_STATE_TOKEN,
		}),
});
const stage = app.stage;

config({ path: `./.env.${stage}` });
config({ path: `./apps/web/.env.${stage}` });
config({ path: `./apps/server/.env.${stage}` });

const D1 = await D1Database("database", {
	name: `${app.name}-db`,
	migrationsDir: "apps/server/src/db/migrations",
	adopt: true,
	readReplication: { mode: "auto" },
});

const KV = await KVNamespace("sessions", {
	title: `${app.name}-user-sessions`,
});

const R2 = await R2Bucket("r2-bucket", {
	name: `${app.name}-private-bucket`,
	cors: [
		{
			allowed: {
				origins: alchemy.env.CORS_ORIGIN?.split(",") || ["*"],
				methods: ["GET", "HEAD", "PUT", "POST", "DELETE"],
				headers: ["*"],
			},
			exposeHeaders: ["*"],
			maxAgeSeconds: 86400,
		},
	],
});

const S3 = await R2Bucket("r2-public-bucket", {
	name: `${app.name}-public-bucket`,
});

const VERSION_METADATA = VersionMetadata();

const RATE_LIMIT = RateLimit({
	namespace_id: 1001,
	simple: {
		limit: 20,
		period: 10,
	},
});

const serverVersion = await getServiceVersion("apps/server/package.json");

const [worker, web] = await Promise.all([
	Worker("server", {
		cwd: "apps/server",
		name: `${app.name}-api`,
		entrypoint: "src/index.ts",
		compatibilityFlags: ["nodejs_compat"],
		bundle: {
			loader: {
				".sql": "text",
			},
			minify: true,
		},
		observability: {
			enabled: true,
			traces: { enabled: true, headSamplingRate: 1.0, destinations: ["grafana-labs-traces-delfia"] },
			logs: { enabled: true, destinations: ["grafana-labs-logs-delfia"] },
		},
		sourceMap: true,
		// domains: ["api.traki.io"],
		bindings: {
			D1,
			KV,
			R2,
			S3,
			RATE_LIMIT,
			OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: alchemy.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
			OTEL_SERVICE_NAME: alchemy.env.OTEL_SERVICE_NAME,
			ENVIRONMENT: alchemy.env.ENVIRONMENT,
			CORS_ORIGIN: alchemy.env.CORS_ORIGIN,
			BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL,
			BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET,
			RESEND_API_KEY: alchemy.secret.env.RESEND_API_KEY,
			GITHUB_CLIENT_ID: alchemy.secret.env.GITHUB_CLIENT_ID,
			GITHUB_CLIENT_SECRET: alchemy.secret.env.GITHUB_CLIENT_SECRET,
			GOOGLE_CLIENT_ID: alchemy.secret.env.GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET: alchemy.secret.env.GOOGLE_CLIENT_SECRET,

			// wide-events data
			SERVICE_VERSION: serverVersion,
			VERSION_METADATA,
			commitHash: commitInfo.commit || "",
			commitBranch: commitInfo.branch || "",
			deploymentUser: commitInfo.user?.name || "",
			deploymentEmail: commitInfo.user?.email || "",
			deploymentTrigger: commitInfo.user?.name?.toLowerCase().includes("bot") ? "ci/cd" : "manual",
		},
		dev: { port: 8787, remote: false },
	}),

	// Vite("web", {
	// 	cwd: "apps/web",
	// 	name: `${app.name}-web`,
	// 	// version: TRAKI_WEB_VERSION,
	// 	adopt: true,
	// 	assets: "dist",
	// 	bindings: {
	// 		VITE_CLIENT_URL: alchemy.env.VITE_CLIENT_URL,
	// 		VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL,
	// 	},
	// 	dev: { command: "pnpm run dev" },
	// }),
]);

await WranglerJson({
	worker,
	transform: {
		wrangler: (spec) => {
			const rateLimits =
				spec.unsafe?.bindings
					?.filter((b: any) => b.type === "rate_limit")
					.map((b: any) => ({
						name: b.name,
						namespace_id: b.namespace_id,
						simple: b.simple,
					})) || [];
			const otherUnsafeBindings =
				spec.unsafe?.bindings?.filter((b: any) => b.type !== "rate_limit") || [];

			return {
				...spec,
				d1_databases: spec.d1_databases?.map((db) => ({
					...db,
					migrations_dir: "src/db/migrations",
				})),
				ratelimits: rateLimits.length > 0 ? rateLimits : undefined,
				unsafe: otherUnsafeBindings.length > 0 ? { bindings: otherUnsafeBindings } : undefined,
			};
		},
	},
});

const [TRAKI_API_VERSION, TRAKI_WEB_VERSION, TRAKI_OLD_WEB_VERSION] = ["0.0.0", "0.0.0", "0.0.0"];

console.log("┌─────────────┬──────────┬────────────────────────────┐");
console.log("│ Service     │ Version  │ URL                        │");
console.log("├─────────────┼──────────┼────────────────────────────┤");
console.log(`│ API         │ v${TRAKI_API_VERSION.padEnd(7)} │ https://api.traki.io       │`);
console.log(`│ Web         │ v${serverVersion.padEnd(7)} │ https://traki.io           │`);
console.log(`│ Old Web     │ v${TRAKI_OLD_WEB_VERSION.padEnd(7)} │ https://old.traki.io       │`);
console.log("└─────────────┴──────────┴────────────────────────────┘");

await app.finalize();
