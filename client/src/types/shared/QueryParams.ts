import type { RepositoryType } from "./RepositoryType";

export const QUERY_PARAMS = {
	SERVER_BASE_URL: "serverBaseUrl",
	REPOSITORY_URL: "repositoryUrl",
	REPOSITORY_TYPE: "repositoryType",
	RW_SERVER_URL: "rwServerUrl",
	BRANCH: "branch",
	FILE: "file",
};

export interface QueryParams {
	serverBaseUrl?: string;
	repositoryUrl?: string;
	repositoryType?: RepositoryType;
	rwServerUrl?: string;
	branch?: string;
	file?: string;
}
