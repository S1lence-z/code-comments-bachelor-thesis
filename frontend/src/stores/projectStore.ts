import { defineStore } from "pinia";
import { type LocationQuery } from "vue-router";
import { QUERY_PARAMS, type QueryParams } from "../types/others/QueryParams";

export const useProjectStore = defineStore("projectStore", {
	state: () => ({
		repositoryUrl: "",
		rwApiUrl: "",
		repositoryBranch: "",
		githubPat: import.meta.env.VITE_GITHUB_PAT || "",
		serverBaseUrl: "",
	}),
	getters: {
		getRepositoryUrl: (state) => state.repositoryUrl,
		getRwApiUrl: (state) => state.rwApiUrl,
		getInitialBranch: (state) => state.repositoryBranch,
		getGithubPat: (state) => state.githubPat,
		getRepositoryName: (state) => state.repositoryUrl.split("/").pop() || "Unknown",
		getServerBaseUrl: (state) => state.serverBaseUrl,
	},
	actions: {
		syncStateWithRoute(newQuery: LocationQuery) {
			// Simple extraction from query
			const extractString = (value: any): string => {
				if (Array.isArray(value)) return value[0] || "";
				return value || "";
			};

			this.serverBaseUrl = extractString(newQuery[QUERY_PARAMS.SERVER_BASE_URL]);
			this.repositoryUrl = extractString(newQuery[QUERY_PARAMS.REPOSITORY_URL]);
			this.rwApiUrl = extractString(newQuery[QUERY_PARAMS.RW_API_URL]);
			this.repositoryBranch = extractString(newQuery[QUERY_PARAMS.BRANCH]);
		},
		updateFromParams(params: QueryParams) {
			this.serverBaseUrl = params.serverBaseUrl || "";
			this.repositoryUrl = params.repositoryUrl || "";
			this.rwApiUrl = params.rwApiUrl || "";
			this.repositoryBranch = params.branch || "";
		},
		getDefaultServerBaseUrl: () => {
			return import.meta.env.VITE_API_BASE_URL;
		},
	},
});
