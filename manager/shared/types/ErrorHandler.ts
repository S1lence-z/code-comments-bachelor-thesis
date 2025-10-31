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
