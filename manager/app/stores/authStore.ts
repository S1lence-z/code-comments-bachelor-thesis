import { jwtAuthTokenKey } from "~/core/keys";

export const useAuthStore = defineStore("auth", {
	state: () => ({
		authTokens: {} as Record<string, string>,
	}),
	getters: {
		isAuthenticated: (state) => (serverUrl: string) => !!state.authTokens[serverUrl],
		getAuthToken: (state) => (serverUrl: string) => state.authTokens[serverUrl] || "",
	},
	actions: {
		loadAuthToken() {
			const storedTokens = sessionStorage.getItem(jwtAuthTokenKey.description!);
			if (storedTokens) {
				try {
					this.authTokens = JSON.parse(storedTokens);
				} catch (e) {
					console.error("Failed to parse auth tokens from session storage", e);
					this.authTokens = {};
				}
			}
		},
		saveAuthToken(serverUrl: string, token: string) {
			this.authTokens[serverUrl] = token;
			sessionStorage.setItem(jwtAuthTokenKey.description!, JSON.stringify(this.authTokens));
		},
	},
});
