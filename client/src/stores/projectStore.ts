import { defineStore } from "pinia";
import { type LocationQuery } from "vue-router";
import { QUERY_PARAMS, type QueryParams } from "../types/shared/QueryParams";
import { useProjectServerConfigsStore } from "./projectServerConfigsStore";
import { RepositoryType } from "../types/shared/RepositoryType";

export const useProjectStore = defineStore("projectStore", {
	state: () => ({
		serverBaseUrl: "",
		rwServerUrl: "",
		repositoryUrl: "",
		repositoryBranch: "",
		repositoryType: RepositoryType.github as RepositoryType,
		githubPat: import.meta.env.VITE_GITHUB_PAT || "",
		repositoryAuthToken: "",
		serverAuthToken: "", // TODO: add to the manager form if needed for something, currently not used
	}),
	getters: {
		getRepositoryUrl: (state) => state.repositoryUrl,
		getRwServerUrl: (state) => state.rwServerUrl,
		getRepositoryBranch: (state) => state.repositoryBranch,
		getRepositoryType: (state) => state.repositoryType,
		getRepositoryName: (state) => state.repositoryUrl.split("/").pop() || "Unknown",
		getServerBaseUrl: (state) => state.serverBaseUrl,
		isProjectCompletelyEmpty: (state) => {
			return !state.serverBaseUrl && !state.rwServerUrl && !state.repositoryUrl && !state.repositoryBranch;
		},
	},
	actions: {
		// Get authentication token based on repository type
		getRepoAuthToken(): string {
			switch (this.repositoryType) {
				case RepositoryType.github:
					return this.githubPat;
				// Future cases for other repository types can be added here
				default:
					return this.repositoryAuthToken;
			}
		},
		// Sync state with route query parameters
		syncStateWithRoute(newQuery: LocationQuery) {
			const projectServerConfigsStore = useProjectServerConfigsStore();
			// Simple extraction from query
			const extractString = (value: any): string => {
				if (Array.isArray(value)) return value[0] || "";
				return value || "";
			};

			this.serverBaseUrl = extractString(newQuery[QUERY_PARAMS.SERVER_BASE_URL]);
			this.repositoryUrl = extractString(newQuery[QUERY_PARAMS.REPOSITORY_URL]);
			this.repositoryType =
				(extractString(newQuery[QUERY_PARAMS.REPOSITORY_TYPE]) as RepositoryType) || RepositoryType.github;
			this.rwServerUrl = extractString(newQuery[QUERY_PARAMS.RW_SERVER_URL]);
			this.repositoryBranch = extractString(newQuery[QUERY_PARAMS.BRANCH]);
			projectServerConfigsStore.saveConfig(
				{
					repositoryUrl: this.repositoryUrl,
					branch: this.repositoryBranch,
					repositoryType: this.repositoryType,
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
			this.repositoryType = params.repositoryType || RepositoryType.github;
			this.rwServerUrl = params.rwServerUrl || "";
			this.repositoryBranch = params.branch || "";
		},
	},
});
