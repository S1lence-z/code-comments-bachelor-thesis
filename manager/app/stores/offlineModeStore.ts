/**
 * Tracks whether a server URL is configured and whether the app is running in offline mode.
 */
export const useOfflineModeStore = defineStore("offlineStore", {
	state: () => ({
		isServerUrlConfigured: false,
		isOfflineMode: false,
	}),
	actions: {
		setServerUrlConfigured(configured: boolean) {
			this.isServerUrlConfigured = configured;
		},
		setOfflineMode() {
			this.isOfflineMode = true;
		},
		startOfflineMode() {
			this.isServerUrlConfigured = true;
			this.isOfflineMode = true;
		},
		cancelOfflineMode() {
			this.isServerUrlConfigured = false;
			this.isOfflineMode = false;
		},
	},
});
