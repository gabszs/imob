/**
 * Notification System Types
 *
 * Comprehensive type definitions for the notification system.
 */

/**
 * Notification type determines visual styling and icon
 */
export type NotificationType = "success" | "error" | "warning" | "info";

/**
 * Position where toasts appear on screen
 */
export type NotificationPosition =
	| "top-right"
	| "top-center"
	| "top-left"
	| "bottom-right"
	| "bottom-center"
	| "bottom-left";

/**
 * Core notification object
 */
export interface Notification {
	/** Unique identifier */
	id: string;

	/** Notification type (affects styling and icon) */
	type: NotificationType;

	/** Optional title/heading */
	title?: string;

	/** Main message content */
	message: string;

	/** Auto-dismiss duration in ms (0 = no auto-dismiss, default: 5000) */
	duration?: number;

	/** Timestamp when notification was created */
	timestamp: number;

	/** Whether notification has been read */
	read: boolean;

	/** Optional action button */
	action?: NotificationAction;

	/** Optional source identifier for filtering/grouping */
	source?: string;

	/** Optional error metadata for detailed error display */
	errorMetadata?: ErrorMetadata;
}

/**
 * Action button configuration
 */
export interface NotificationAction {
	/** Button label */
	label: string;

	/** Click handler */
	onClick: () => void;

	/** Optional button variant */
	variant?: "primary" | "secondary" | "danger";
}

/**
 * Input for creating a new notification (omits generated fields)
 */
export type CreateNotificationInput = Omit<
	Notification,
	"id" | "timestamp" | "read"
>;

/**
 * Notification context value
 */
export interface NotificationContextValue {
	/** All notifications (including read and dismissed) */
	notifications: Notification[];

	/** Count of unread notifications */
	unreadCount: number;

	/** Currently active (visible) toast notifications */
	activeToasts: Notification[];

	/** Show a new notification (returns notification ID) */
	showNotification: (input: CreateNotificationInput) => string;

	/** Dismiss a toast notification */
	dismissToast: (id: string) => void;

	/** Mark notification as read */
	markAsRead: (id: string) => void;

	/** Mark all notifications as read */
	markAllAsRead: () => void;

	/** Clear all notifications */
	clearAll: () => void;

	/** Remove a specific notification */
	removeNotification: (id: string) => void;

	/** Currently selected error for modal display */
	selectedError: Notification | null;

	/** Open error details modal */
	openErrorModal: (notification: Notification) => void;

	/** Close error details modal */
	closeErrorModal: () => void;
}

/**
 * Notification configuration options
 */
export interface NotificationConfig {
	/** Maximum number of notifications to keep in history */
	maxNotifications?: number;

	/** Maximum number of toasts visible at once */
	maxToasts?: number;

	/** Default auto-dismiss duration (ms) */
	defaultDuration?: number;

	/** Toast position on screen */
	position?: NotificationPosition;

	/** Enable localStorage persistence */
	persist?: boolean;

	/** localStorage key for persistence */
	storageKey?: string;
}

/**
 * Helper type for notification severity levels
 */
export const NotificationSeverity = {
	SUCCESS: "success",
	ERROR: "error",
	WARNING: "warning",
	INFO: "info",
} as const;

/**
 * Toast state for animation control
 */
export type ToastState = "entering" | "visible" | "exiting" | "exited";

/**
 * Error notification metadata
 */
export interface ErrorNotificationMeta {
	/** HTTP status code if from API */
	statusCode?: number;

	/** Error code from backend */
	errorCode?: string;

	/** Stack trace (only in development) */
	stack?: string;

	/** Request URL that failed */
	url?: string;
}

/**
 * Success notification metadata
 */
export interface SuccessNotificationMeta {
	/** Action that succeeded */
	action?: string;

	/** Additional context */
	context?: Record<string, any>;
}

/**
 * Error metadata for detailed error display
 */
export interface ErrorMetadata {
	/** HTTP status code if from API */
	statusCode?: number;

	/** Error code from backend */
	errorCode?: string;

	/** Full error object as JSON */
	errorJson?: any;

	/** Request URL that failed */
	url?: string;

	/** Request method (GET, POST, etc.) */
	method?: string;

	/** Stack trace (only in development) */
	stack?: string;

	/** Additional context */
	context?: Record<string, any>;
}
