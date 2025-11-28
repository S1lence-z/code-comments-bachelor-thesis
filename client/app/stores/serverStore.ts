import type { ServerStatus } from "../types/domain/server-status";

export const useServerStatusStore = defineStore("serverStatusStore", {
	state: () => ({
		serverStatus: "idle" as ServerStatus,
		errorMessage: "",
	}),
	getters: {
		isServerSynced: (state) => state.serverStatus === "synced",
		getStatus: (state) => {
			return state.serverStatus as ServerStatus;
		},
		getErrorMessage: (state) => {
			return state.errorMessage;
		},
	},
	actions: {
		startSyncing() {
			this.serverStatus = "syncing";
			this.errorMessage = "";
		},
		setSyncError(errorMessage: string) {
			this.serverStatus = "error";
			this.errorMessage = errorMessage;
		},
		setSynced() {
			this.errorMessage = "";
			setTimeout(() => {
				this.serverStatus = "synced";
			}, 2000);
		},
	},
});
