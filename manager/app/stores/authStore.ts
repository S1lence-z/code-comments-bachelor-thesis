import { jwtAuthTokenKey } from "~/core/keys";

export const useAuthStore = defineStore("auth", {
	state: () => ({
		authToken: "",
	}),
	getters: {
		isAuthenticated: (state) => !!state.authToken,
		getAuthToken: (state) => state.authToken,
	},
	actions: {
		saveAuthToken(token: string) {
			this.authToken = token;
			sessionStorage.setItem(jwtAuthTokenKey.description!, token);
		},
	},
});
