import { defineStore } from "pinia";
import { type LocationQuery } from "vue-router";
import { QUERY_PARAMS, type QueryParams } from "../types/others/QueryParams";
import { useProjectServerConfigsStore } from "./projectServerConfigsStore";
import { RepositoryType } from "../types/enums/RepositoryType";

export const useProjectStore = defineStore("projectStore", {
	state: () => ({
		serverBaseUrl: "",
		rwServerUrl: "",
		repositoryUrl: "",
		repositoryBranch: "",
		repositoryType: RepositoryType.github as RepositoryType,
		githubPat: import.meta.env.VITE_GITHUB_PAT || "",
		// TODO: add a generic auth token for other repository types, probably add it to the form
		//! right now the githubPat is used for all repository types
	}),
	getters: {
		getRepositoryUrl: (state) => state.repositoryUrl,
		getRwServerUrl: (state) => state.rwServerUrl,
		getRepositoryBranch: (state) => state.repositoryBranch,
		getRepositoryType: (state) => state.repositoryType,
		getGithubPat: (state) => state.githubPat,
		getRepositoryName: (state) => state.repositoryUrl.split("/").pop() || "Unknown",
		getServerBaseUrl: (state) => state.serverBaseUrl,
		isProjectCompletelyEmpty: (state) => {
			return !state.serverBaseUrl && !state.rwServerUrl && !state.repositoryUrl && !state.repositoryBranch;
		},
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
