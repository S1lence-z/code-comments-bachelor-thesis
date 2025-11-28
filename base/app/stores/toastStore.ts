import type { Toast, ToastType } from "../types/toast";
import { defineStore } from "pinia";

export const useToastStore = defineStore("toastStore", {
	state: () => ({
		toasts: [] as Toast[],
		nextId: 1,
	}),
	actions: {
		addToast(message: string, type: ToastType = "info", duration: number = 5000) {
			const id = `toast-${this.nextId++}`;
			const toast: Toast = {
				id,
				message,
				type,
				duration,
			};

			this.toasts.push(toast);

			// Auto-remove after duration
			if (duration > 0) {
				setTimeout(() => {
					this.removeToast(id);
				}, duration);
			}

			return id;
		},
		removeToast(id: string) {
			const index = this.toasts.findIndex((toast) => toast.id === id);
			if (index !== -1) {
				this.toasts.splice(index, 1);
			}
		},
		clearAll() {
			this.toasts = [];
		},
	},
});
