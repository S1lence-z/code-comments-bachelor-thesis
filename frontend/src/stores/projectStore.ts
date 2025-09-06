import { defineStore } from "pinia";
import { type LocationQuery } from "vue-router";

export const useProjectStore = defineStore("projectStore", {
	state: () => ({
		repositoryUrl: "",
		writeApiUrl: "",
		repositoryBranch: "main",
		githubPat: import.meta.env.VITE_GITHUB_PAT || "",
		backendBaseUrl: import.meta.env.VITE_API_BASE_URL || "",
	}),
	getters: {
		getRepositoryUrl: (state) => state.repositoryUrl,
		getWriteApiUrl: (state) => state.writeApiUrl,
		getInitialBranch: (state) => state.repositoryBranch,
		getGithubPat: (state) => state.githubPat,
		getRepositoryName: (state) => state.repositoryUrl.split("/").pop() || "Unknown",
		getBackendBaseUrl: (state) => state.backendBaseUrl,
		isProjectSetup: (state) => !!state.repositoryUrl && !!state.writeApiUrl,
	},
	actions: {
		syncStateWithRoute(newQuery: LocationQuery) {
			this.repositoryUrl = decodeURIComponent(newQuery.repoUrl as string) || "";
			this.writeApiUrl = decodeURIComponent(newQuery.commentsApiUrl as string) || "";
			this.repositoryBranch = decodeURIComponent(newQuery.branch as string) || "main";

			if (!this.repositoryUrl || !this.writeApiUrl) {
				throw new Error("Repository URL and Comments API URL must be set.");
			}
		},
	},
});
