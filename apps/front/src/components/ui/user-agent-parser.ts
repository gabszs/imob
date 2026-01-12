/**
 * User Agent Parser Utilities
 * Extracts browser, OS, and device information from user agent strings
 */

export const parseBrowser = (userAgent: string): string => {
	if (!userAgent) return "Unknown";

	if (userAgent.includes("Edg/")) return "Edge";
	if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/"))
		return "Chrome";
	if (
		userAgent.includes("Safari/") &&
		!userAgent.includes("Chrome/") &&
		!userAgent.includes("Edg/")
	)
		return "Safari";
	if (userAgent.includes("Firefox/")) return "Firefox";
	if (userAgent.includes("Opera/") || userAgent.includes("OPR/"))
		return "Opera";
	if (userAgent.includes("MSIE") || userAgent.includes("Trident/"))
		return "Internet Explorer";

	return "Unknown";
};

export const parseOS = (userAgent: string): string => {
	if (!userAgent) return "Unknown";

	if (userAgent.includes("Windows NT 10.0")) return "Windows 10";
	if (userAgent.includes("Windows NT 6.3")) return "Windows 8.1";
	if (userAgent.includes("Windows NT 6.2")) return "Windows 8";
	if (userAgent.includes("Windows NT 6.1")) return "Windows 7";
	if (userAgent.includes("Windows NT")) return "Windows";

	if (userAgent.includes("Mac OS X")) {
		const match = userAgent.match(/Mac OS X ([\d_]+)/);
		if (match) return `macOS ${match[1].replace(/_/g, ".")}`;
		return "macOS";
	}

	if (userAgent.includes("Android")) {
		const match = userAgent.match(/Android ([\d.]+)/);
		if (match) return `Android ${match[1]}`;
		return "Android";
	}

	if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
		const match = userAgent.match(/OS ([\d_]+)/);
		if (match) return `iOS ${match[1].replace(/_/g, ".")}`;
		return "iOS";
	}

	if (userAgent.includes("Linux")) return "Linux";
	if (userAgent.includes("CrOS")) return "Chrome OS";

	return "Unknown";
};

export const parseDevice = (userAgent: string): string => {
	if (!userAgent) return "Unknown";
	const ua = userAgent.toLowerCase();

	if (ua.includes("iphone")) return "iPhone";
	if (ua.includes("ipad")) return "iPad";
	if (ua.includes("android")) return "Android";
	if (ua.includes("windows")) return "Windows";
	if (ua.includes("mac os x") || ua.includes("macintosh")) return "Mac";
	if (ua.includes("linux") && !ua.includes("android")) return "Linux";
	if (ua.includes("cros")) return "Chrome OS";
	if (ua.includes("mobile")) return "Mobile";

	return "Desktop";
};
