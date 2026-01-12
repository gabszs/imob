import { toast as sonnerToast } from "sonner";

interface ToastOptions {
	title?: string;
	description?: string;
	variant?: "default" | "destructive";
	duration?: number;
}

export function useToast() {
	const toast = ({ title, description, variant, duration }: ToastOptions) => {
		const message = (
			<div>
				{title && <div className="font-semibold">{title}</div>}
				{description && <div className="text-sm">{description}</div>}
			</div>
		);

		if (variant === "destructive") {
			sonnerToast.error(message, { duration });
		} else {
			sonnerToast.success(message, { duration });
		}
	};

	return { toast };
}
