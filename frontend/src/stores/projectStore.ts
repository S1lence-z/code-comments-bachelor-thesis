import { defineStore } from "pinia";
import { type LocationQuery } from "vue-router";

export const useProjectStore = defineStore("projectStore", {
	state: () => ({
		repositoryUrl: "",
		writeApiUrl: "",
		repositoryBranch: "",
		githubPat: import.meta.env.VITE_GITHUB_PAT || "",
		backendBaseUrl: "",
	}),
	getters: {
		getRepositoryUrl: (state) => state.repositoryUrl,
		getWriteApiUrl: (state) => state.writeApiUrl,
		getInitialBranch: (state) => state.repositoryBranch,
		getGithubPat: (state) => state.githubPat,
		getRepositoryName: (state) => state.repositoryUrl.split("/").pop() || "Unknown",
		getBackendBaseUrl: (state) => state.backendBaseUrl,
	},
	actions: {
		syncStateWithRoute(newQuery: LocationQuery) {
			this.backendBaseUrl = newQuery.backendBaseUrl ? decodeURIComponent(newQuery.backendBaseUrl as string) : "";
			this.repositoryUrl = newQuery.repositoryUrl ? decodeURIComponent(newQuery.repositoryUrl as string) : "";
			this.writeApiUrl = newQuery.writeApiUrl ? decodeURIComponent(newQuery.writeApiUrl as string) : "";
			this.repositoryBranch = newQuery.branch ? decodeURIComponent(newQuery.branch as string) : "";
		},
		getDefaultBackendBaseUrl: () => {
			return import.meta.env.VITE_API_BASE_URL;
		},
	},
});
