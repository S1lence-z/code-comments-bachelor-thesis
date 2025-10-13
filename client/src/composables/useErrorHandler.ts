import { useToastStore } from "../stores/toastStore";
import type { ToastType } from "../types/others/Toast";

export interface ErrorHandlerOptions {
	showToast?: boolean;
	toastDuration?: number;
	logToConsole?: boolean;
	customMessage?: string;
	onError?: (error: Error) => void;
}

export interface ApiErrorResponse {
	message?: string;
	error?: string;
	statusCode?: number;
}

export const useErrorHandler = () => {
	const toastStore = useToastStore();

	const extractErrorMessage = (error: unknown): string => {
		// Handle Error objects
		if (error instanceof Error) {
			return error.message;
		}

		// Handle API error responses
		if (typeof error === "object" && error !== null) {
			const apiError = error as ApiErrorResponse;
			return apiError.message || apiError.error || "An unknown error occurred";
		}

		// Handle string errors
		if (typeof error === "string") {
			return error;
		}

		return "An unknown error occurred";
	};

	const handleError = (error: unknown, options: ErrorHandlerOptions = {}) => {
		const { showToast = true, toastDuration = 5000, logToConsole = true, customMessage, onError } = options;

		const errorMessage = customMessage || extractErrorMessage(error);

		// Log to console if enabled
		if (logToConsole) {
			console.error("Error:", error);
		}

		// Show toast notification if enabled
		if (showToast) {
			toastStore.addToast(errorMessage, "error", toastDuration);
		}

		// Call custom error handler if provided
		if (onError && error instanceof Error) {
			onError(error);
		}
	};

	const showSuccess = (message: string, duration: number = 3000) => {
		toastStore.addToast(message, "success", duration);
	};

	const showError = (message: string, duration: number = 5000) => {
		toastStore.addToast(message, "error", duration);
	};

	const showWarning = (message: string, duration: number = 4000) => {
		toastStore.addToast(message, "warning", duration);
	};

	const showInfo = (message: string, duration: number = 3000) => {
		toastStore.addToast(message, "info", duration);
	};

	const showToast = (message: string, type: ToastType = "info", duration: number = 3000) => {
		toastStore.addToast(message, type, duration);
	};

	return {
		handleError,
		showSuccess,
		showError,
		showWarning,
		showInfo,
		showToast,
	};
};
