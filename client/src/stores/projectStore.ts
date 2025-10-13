import { defineStore } from "pinia";
import { type LocationQuery } from "vue-router";
import { QUERY_PARAMS, type QueryParams } from "../types/others/QueryParams";
import { useProjectServerConfigsStore } from "./projectServerConfigsStore";

export const useProjectStore = defineStore("projectStore", {
	state: () => ({
		serverBaseUrl: "",
		rwServerUrl: "",
		repositoryUrl: "",
		repositoryBranch: "",
		githubPat: import.meta.env.VITE_GITHUB_PAT || "",
	}),
	getters: {
		getRepositoryUrl: (state) => state.repositoryUrl,
		getRwServerUrl: (state) => state.rwServerUrl,
		getRepositoryBranch: (state) => state.repositoryBranch,
		getGithubPat: (state) => state.githubPat,
		getRepositoryName: (state) => state.repositoryUrl.split("/").pop() || "Unknown",
		getServerBaseUrl: (state) => state.serverBaseUrl,
	},
	actions: {
		syncStateWithRoute(newQuery: LocationQuery) {
			const projectServerConfigsStore = useProjectServerConfigsStore();
			// Simple extraction from query
			const extractString = (value: any): string => {
				if (Array.isArray(value)) return value[0] || "";
				return value || "";
			};

			this.serverBaseUrl = extractString(newQuery[QUERY_PARAMS.SERVER_BASE_URL]);
			this.repositoryUrl = extractString(newQuery[QUERY_PARAMS.REPOSITORY_URL]);
			this.rwServerUrl = extractString(newQuery[QUERY_PARAMS.RW_SERVER_URL]);
			this.repositoryBranch = extractString(newQuery[QUERY_PARAMS.BRANCH]);
			projectServerConfigsStore.saveConfig(
				{
					repositoryUrl: this.repositoryUrl,
					branch: this.repositoryBranch,
				},
				{
					serverBaseUrl: this.serverBaseUrl,
					rwServerUrl: this.rwServerUrl,
				}
			);
		},
		updateFromParams(params: QueryParams) {
			this.serverBaseUrl = params.serverBaseUrl || "";
			this.repositoryUrl = params.repositoryUrl || "";
			this.rwServerUrl = params.rwServerUrl || "";
			this.repositoryBranch = params.branch || "";
		},
	},
});
