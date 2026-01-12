/**
 * Event utilities for filtering and exporting
 */

const PREDEFINED_EVENT_TYPES = [
	"PageView",
	"ViewContent",
	"Search",
	"AddToWishlist",
	"AddToCart",
	"InitCheckout",
	"PendingPurchase",
	"Purchase",
	"SubmitForm",
	"Contact",
	"SignUp",
] as const;

export const isEventDetected = (eventType: string, events: any[]): boolean => {
	if (eventType === "All") {
		return events.length > 0;
	}

	const predefinedTypesUpper = PREDEFINED_EVENT_TYPES.map((t) =>
		t.toUpperCase(),
	);

	if (eventType === "Custom") {
		return events.some((event) => {
			const eventNameUpper = event.name?.toUpperCase();
			return !predefinedTypesUpper.includes(eventNameUpper);
		});
	}

	const eventTypeUpper = eventType.toUpperCase();
	return events.some((event) => {
		if (!event.payload || typeof event.payload !== "object") {
			return false;
		}
		const payloadKeys = Object.keys(event.payload).map((key) =>
			key.toUpperCase(),
		);
		return (
			payloadKeys.includes(eventTypeUpper) ||
			event.name?.toUpperCase() === eventTypeUpper
		);
	});
};

export const convertToCSV = (data: any[]): string => {
	if (data.length === 0) return "";

	const headers = Object.keys(data[0]);
	const csvHeaders = headers.join(",");
	const csvRows = data.map((row) =>
		headers
			.map((header) => {
				const value = (row as any)[header];
				if (value === null || value === undefined) return "";

				let stringValue: string;
				if (typeof value === "object") {
					stringValue = JSON.stringify(value);
				} else {
					stringValue = String(value);
				}

				if (
					stringValue.includes(",") ||
					stringValue.includes('"') ||
					stringValue.includes("\n")
				) {
					return `"${stringValue.replace(/"/g, '""')}"`;
				}
				return stringValue;
			})
			.join(","),
	);

	return [csvHeaders, ...csvRows].join("\n");
};

export const downloadFile = (
	content: string,
	filename: string,
	mimeType: string,
) => {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};
