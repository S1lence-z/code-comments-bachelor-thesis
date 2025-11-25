import { defineStore } from "pinia";
import { type LocationQuery } from "vue-router";
import { QUERY_PARAMS, type QueryParams } from "../types/shared/query-params";
import { useProjectServerConfigsStore } from "./projectServerConfigsStore";
import { useRepositoryAuthStore } from "./repositoryAuthStore";
import { RepositoryType } from "../types/shared/repository-type";

export const useProjectStore = defineStore("projectStore", {
	state: () => ({
		serverBaseUrl: "",
		projectId: "",
		repositoryUrl: "",
		repositoryBranch: "",
		repositoryType: RepositoryType.github,
		repositoryAuthToken: "",
		serverAuthToken: "", // TODO: add to the manager form if needed for something, currently not used
	}),
	getters: {
		getRepositoryUrl: (state) => state.repositoryUrl,
		getProjectId: (state) => state.projectId,
		getRepositoryBranch: (state) => state.repositoryBranch,
		getRepositoryType: (state) => state.repositoryType,
		getRepositoryName: (state) => state.repositoryUrl.split("/").pop() || "Unknown",
		getServerBaseUrl: (state) => state.serverBaseUrl,
		isProjectCompletelyEmpty: (state) => {
			return !state.serverBaseUrl && !state.projectId && !state.repositoryUrl && !state.repositoryBranch;
		},
	},
	actions: {
		// Get authentication token based on repository type
		getRepoAuthToken(): string {
			// Try to get from store first
			const repositoryAuthStore = useRepositoryAuthStore();
			const auth = repositoryAuthStore.getAuthByType(this.repositoryType);
			if (auth && auth.authToken) return auth.authToken;

			return this.repositoryAuthToken;
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
			this.repositoryType = extractString(newQuery[QUERY_PARAMS.REPOSITORY_TYPE]) as RepositoryType;
			this.projectId = extractString(newQuery[QUERY_PARAMS.PROJECT_ID]);
			this.repositoryBranch = extractString(newQuery[QUERY_PARAMS.BRANCH]);
			projectServerConfigsStore.saveConfig(
				{
					repositoryUrl: this.repositoryUrl,
					branch: this.repositoryBranch,
					repositoryType: this.repositoryType,
				},
				{
					serverBaseUrl: this.serverBaseUrl,
					projectId: this.projectId,
				}
			);
		},
		updateFromParams(params: QueryParams) {
			this.serverBaseUrl = params.serverBaseUrl || "";
			this.repositoryUrl = params.repositoryUrl || "";
			this.repositoryType = (params.repositoryType || RepositoryType.github) as RepositoryType;
			this.projectId = params.projectId || "";
			this.repositoryBranch = params.branch || "";
		},
	},
});
