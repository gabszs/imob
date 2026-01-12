import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, HomeIcon } from "lucide-react";
import { Button } from "@/web/components/ui/button";

export function NotFound() {
	return (
		<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
			<div className="mx-auto max-w-md text-center">
				{/* 404 Large Text */}
				<h1 className="mb-4 font-bold text-9xl text-primary">404</h1>

				{/* Error Message */}
				<h2 className="mb-2 font-semibold text-3xl">Page Not Found</h2>
				<p className="mb-8 text-muted-foreground">
					Oops! The page you're looking for doesn't exist. It might have been
					moved or deleted.
				</p>

				{/* Action Buttons */}
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Button
						variant="outline"
						size="lg"
						onClick={() => window.history.back()}
					>
						<ArrowLeftIcon className="mr-2 h-5 w-5" />
						Go Back
					</Button>
					<Button asChild size="lg">
						<Link to="/">
							<HomeIcon className="mr-2 h-5 w-5" />
							Go to Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
