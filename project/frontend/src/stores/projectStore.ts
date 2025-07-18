import { defineStore } from "pinia";
import { type LocationQuery } from "vue-router";

export const useProjectStore = defineStore("projectStore", {
	state: () => ({
		repositoryUrl: "",
		writeApiUrl: "",
		repositoryBranch: "main",
		githubPat: import.meta.env.VITE_GITHUB_PAT || "",
	}),
	getters: {
		getRepositoryUrl: (state) => state.repositoryUrl,
		getWriteApiUrl: (state) => state.writeApiUrl,
		getInitialBranch: (state) => state.repositoryBranch,
		getGithubPat: (state) => state.githubPat,
		isProjectSetup: (state) => !!state.repositoryUrl && !!state.writeApiUrl,
	},
	actions: {
		initializeStore(initialQuery: LocationQuery) {
			this.repositoryUrl = decodeURIComponent(initialQuery.repoUrl as string) || "";
			this.writeApiUrl = decodeURIComponent(initialQuery.commentsApiUrl as string) || "";
			this.repositoryBranch = decodeURIComponent(initialQuery.branch as string) || "main";
			this.githubPat = import.meta.env.VITE_GITHUB_PAT || "";

			if (!this.repositoryUrl || !this.writeApiUrl) {
				throw new Error("Repository URL and Comments API URL must be set.");
			}
		},
		syncStateWithRoute(newQuery: LocationQuery) {
			this.repositoryUrl = decodeURIComponent(newQuery.repoUrl as string) || "";
			this.writeApiUrl = decodeURIComponent(newQuery.commentsApiUrl as string) || "";
			this.repositoryBranch = decodeURIComponent(newQuery.branch as string) || "main";
			this.githubPat = import.meta.env.VITE_GITHUB_PAT || "";
		},
		setRepositoryUrl(url: string) {
			this.repositoryUrl = url;
		},
		setWriteApiUrl(url: string) {
			this.writeApiUrl = url;
		},
		setInitialBranch(branch: string) {
			this.repositoryBranch = branch;
		},
		setGithubPat(token: string) {
			this.githubPat = token;
		},
	},
});
