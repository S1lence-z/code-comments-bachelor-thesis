export const QUERY_PARAMS = {
	SERVER_BASE_URL: "serverBaseUrl",
	REPOSITORY_URL: "repositoryUrl",
	RW_API_URL: "rwApiUrl",
	BRANCH: "branch",
	FILE: "file",
};

export interface QueryParams {
	serverBaseUrl?: string;
	repositoryUrl?: string;
	rwApiUrl?: string;
	branch?: string;
	file?: string;
}
