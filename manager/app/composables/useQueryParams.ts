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

export const useQueryParams = () => {
	const config = useRuntimeConfig();
	const route = useRoute();

	const setupServerUrl = (serverBaseUrl: string) => {
		if (serverBaseUrl) {
			const currentServerBaseUrl = route.query[QUERY_PARAMS.SERVER_BASE_URL];
			if (currentServerBaseUrl !== serverBaseUrl) {
				navigateTo({ query: { [QUERY_PARAMS.SERVER_BASE_URL]: serverBaseUrl } });
			}
		}
	};

	const navigateToProject = (
		serverBaseUrl: string,
		repositoryUrl: string,
		rwApiUrl: string,
		branch: string
	) => {
		const query: Record<string, string> = {};
		if (serverBaseUrl) {
			query[QUERY_PARAMS.SERVER_BASE_URL] = serverBaseUrl;
		}
		if (repositoryUrl) {
			query[QUERY_PARAMS.REPOSITORY_URL] = repositoryUrl;
		}
		if (rwApiUrl) {
			query[QUERY_PARAMS.RW_API_URL] = rwApiUrl;
		}
		if (branch) {
			query[QUERY_PARAMS.BRANCH] = branch;
		}
		if (config.public.clientUrl) {
			const url = config.public.clientUrl + "?" + new URLSearchParams(query).toString();
			const newWindow = window.open(url, "_blank", "noopener,noreferrer");
			if (newWindow) newWindow.opener = null;
		} else {
			alert("Viewer base URL is not configured.");
		}
	};

	return {
		setupServerUrl,
		navigateToProject,
	};
};
