import { repositoryAuthsKey } from "~/core/keys";

export const useRepositoryAuthStore = defineStore("repositoryAuthStore", {
	state: () => ({
		repositoryAuths: [] as RepositoryAuthItem[],
	}),
	getters: {
		getAuthByType: (state) => {
			return (type: RepositoryType): RepositoryAuthItem | undefined => {
				return state.repositoryAuths.find((auth) => auth.repositoryType === type);
			};
		},
	},
	actions: {
		initializeFromLocalStorage() {
			const errorHandler = useErrorHandler();
			const storedData = localStorage.getItem(repositoryAuthsKey.description!);

			if (storedData) {
				try {
					this.repositoryAuths = JSON.parse(storedData) as RepositoryAuthItem[];
				} catch (error) {
					errorHandler.handleError(error, {
						customMessage: "Failed to parse saved repository auths.",
					});
				}
			}
		},
		save() {
			const savedData = JSON.stringify(this.repositoryAuths);
			localStorage.setItem(repositoryAuthsKey.description!, savedData);
		},
		upsertAuthToken(repositoryType: RepositoryType, authToken: string) {
			const existingAuthIndex = this.repositoryAuths.findIndex(
				(auth) => auth.repositoryType === repositoryType
			);

			if (existingAuthIndex === -1) {
                // Add new auth
                this.repositoryAuths.push({ repositoryType, authToken });
            } else {
                // Update existing auth
                const existingAuth = this.repositoryAuths[existingAuthIndex]!;
                existingAuth.authToken = authToken;
            }
			this.save();
		},
	},
});
