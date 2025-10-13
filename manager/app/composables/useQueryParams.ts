export const QUERY_PARAMS = {
	SERVER_BASE_URL: "serverBaseUrl",
	REPOSITORY_URL: "repositoryUrl",
	RW_SERVER_URL: "rwServerUrl",
	BRANCH: "branch",
	FILE: "file",
};

export interface QueryParams {
	serverBaseUrl?: string;
	repositoryUrl?: string;
	rwServerUrl?: string;
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
		rwServerUrl: string,
		branch: string
	) => {
		const query: Record<string, string> = {};
		if (serverBaseUrl) {
			query[QUERY_PARAMS.SERVER_BASE_URL] = serverBaseUrl;
		}
		if (repositoryUrl) {
			query[QUERY_PARAMS.REPOSITORY_URL] = repositoryUrl;
		}
		if (rwServerUrl) {
			query[QUERY_PARAMS.RW_SERVER_URL] = rwServerUrl;
		}
		if (branch) {
			query[QUERY_PARAMS.BRANCH] = branch;
		}
		if (config.public.clientUrl) {
			alert("This will open the client in a new tab. Continue?");
			const url = config.public.clientUrl + "?" + new URLSearchParams(query).toString();
			const newWindow = window.open(url, "_blank", "noopener,noreferrer");
			if (newWindow) newWindow.opener = null;
		} else {
			alert("Client URL is not configured.");
		}
	};

	const navigateToOfflineProject = (repositoryUrl: string, branch: string) => {
		const query: Record<string, string> = {};
		if (repositoryUrl) {
			query[QUERY_PARAMS.REPOSITORY_URL] = repositoryUrl;
		}
		if (branch) {
			query[QUERY_PARAMS.BRANCH] = branch;
		}
		if (config.public.clientUrl) {
			alert("This will open the client in a new tab. Continue?");
			const url = config.public.clientUrl + "?" + new URLSearchParams(query).toString();
			const newWindow = window.open(url, "_blank", "noopener,noreferrer");
			if (newWindow) newWindow.opener = null;
		} else {
			alert("Client URL is not configured.");
		}
	};

	return {
		setupServerUrl,
		navigateToProject,
		navigateToOfflineProject,
	};
};
