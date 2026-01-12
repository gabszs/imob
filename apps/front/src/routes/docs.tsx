import { createFileRoute } from "@tanstack/react-router";

const subtleLinkClass =
	"relative inline-block text-current no-underline after:absolute after:left-0 after:bottom-0 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-200 after:ease-out after:content-[''] hover:after:w-full focus-visible:after:w-full focus-visible:outline-none";

export const Route = createFileRoute("/docs")({
	component: DocsRoute,
});

function DocsRoute() {
	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-4xl px-8 py-12">
				<header className="mb-12">
					<h1 className="font-normal text-xl uppercase tracking-wide">
						DOCUMENTATION
					</h1>
					<p className="mt-1 text-sm italic opacity-80">PROJECT OVERVIEW</p>
				</header>

				<div className="space-y-12 text-base leading-snug">
					<section>
						<p className="mb-6">
							Welcome to the documentation for this project. This is a modern
							full-stack application built with cutting-edge technologies.
						</p>
					</section>

					<section>
						<h2 className="mb-4 font-normal uppercase">Core Features</h2>
						<div className="space-y-4 opacity-90">
							<ul className="ml-4 space-y-2">
								<li>→ Modern authentication with Better Auth</li>
								<li>→ Real-time data synchronization</li>
								<li>→ Responsive design with Tailwind CSS</li>
								<li>→ Type-safe API with tRPC</li>
								<li>→ Edge-ready deployment on Cloudflare Workers</li>
							</ul>
						</div>
					</section>

					<section>
						<h2 className="mb-4 font-normal uppercase">Tech Stack</h2>
						<div className="space-y-6 opacity-90">
							<div>
								<p className="mb-2 font-normal">Frontend</p>
								<ul className="ml-4 space-y-1">
									<li>
										→{" "}
										<a
											href="https://vite.dev"
											className={subtleLinkClass}
											target="_blank"
											rel="noreferrer"
										>
											Vite
										</a>{" "}
										with React
									</li>
									<li>
										→{" "}
										<a
											href="https://tanstack.com/router"
											className={subtleLinkClass}
											target="_blank"
											rel="noreferrer"
										>
											TanStack Router
										</a>{" "}
										for routing
									</li>
									<li>
										→{" "}
										<a
											href="https://tanstack.com/query"
											className={subtleLinkClass}
											target="_blank"
											rel="noreferrer"
										>
											TanStack Query
										</a>{" "}
										for data fetching
									</li>
									<li>
										→{" "}
										<a
											href="https://tailwindcss.com"
											className={subtleLinkClass}
											target="_blank"
											rel="noreferrer"
										>
											Tailwind CSS
										</a>{" "}
										for styling
									</li>
									<li>
										→{" "}
										<a
											href="https://ui.shadcn.com"
											className={subtleLinkClass}
											target="_blank"
											rel="noreferrer"
										>
											shadcn/ui
										</a>{" "}
										for UI components
									</li>
								</ul>
							</div>

							<div>
								<p className="mb-2 font-normal">Backend</p>
								<ul className="ml-4 space-y-1">
									<li>
										→{" "}
										<a
											href="https://hono.dev"
											className={subtleLinkClass}
											target="_blank"
											rel="noreferrer"
										>
											Hono
										</a>{" "}
										for API routing
									</li>
									<li>
										→{" "}
										<a
											href="https://trpc.io"
											className={subtleLinkClass}
											target="_blank"
											rel="noreferrer"
										>
											tRPC
										</a>{" "}
										for type-safe APIs
									</li>
									<li>
										→{" "}
										<a
											href="https://orm.drizzle.team"
											className={subtleLinkClass}
											target="_blank"
											rel="noreferrer"
										>
											Drizzle ORM
										</a>{" "}
										for database
									</li>
									<li>
										→{" "}
										<a
											href="https://better-auth.com"
											className={subtleLinkClass}
											target="_blank"
											rel="noreferrer"
										>
											Better Auth
										</a>{" "}
										for authentication
									</li>
								</ul>
							</div>

							<div>
								<p className="mb-2 font-normal">Infrastructure</p>
								<ul className="ml-4 space-y-1">
									<li>
										→{" "}
										<a
											href="https://developers.cloudflare.com/workers"
											className={subtleLinkClass}
											target="_blank"
											rel="noreferrer"
										>
											Cloudflare Workers
										</a>{" "}
										for edge computing
									</li>
									<li>
										→{" "}
										<a
											href="https://developers.cloudflare.com/d1"
											className={subtleLinkClass}
											target="_blank"
											rel="noreferrer"
										>
											Cloudflare D1
										</a>{" "}
										for database
									</li>
									<li>
										→{" "}
										<a
											href="https://alchemy.run"
											className={subtleLinkClass}
											target="_blank"
											rel="noreferrer"
										>
											Alchemy
										</a>{" "}
										for deployment
									</li>
								</ul>
							</div>
						</div>
					</section>

					<section>
						<h2 className="mb-4 font-normal uppercase">Getting Started</h2>
						<div className="space-y-4 opacity-90">
							<p>
								To get started with development, clone the repository and follow
								the setup instructions in the README.
							</p>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
