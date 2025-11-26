export const QUERY_PARAMS = {
	SERVER_BASE_URL: "serverBaseUrl",
	REPOSITORY_URL: "repositoryUrl",
	REPOSITORY_TYPE: "repositoryType",
	PROJECT_ID: "projectId",
	BRANCH: "branch",
	FILE: "file",
	TOKEN: "token",
};

export interface QueryParams {
	serverBaseUrl?: string;
	repositoryUrl?: string;
	repositoryType?: string;
	projectId?: string;
	branch?: string;
	file?: string;
	token?: string;
}
