export const useQueryParams = () => {
	const config = useRuntimeConfig();
	const route = useRoute();
	const errorHandler = useErrorHandler();

	const setupServerUrl = async (serverBaseUrl: string) => {
		if (serverBaseUrl) {
			const currentServerBaseUrl = route.query[QUERY_PARAMS.SERVER_BASE_URL];
			if (currentServerBaseUrl !== serverBaseUrl) {
				await navigateTo({
					path: route.path,
					query: { [QUERY_PARAMS.SERVER_BASE_URL]: serverBaseUrl },
				});
			}
		}
	};

	const navigateToProject = (
		serverBaseUrl: string,
		repositoryUrl: string,
		repositoryType: RepositoryType,
		projectId: string,
		branch: string
	) => {
		const query: Record<string, string> = {};
		if (serverBaseUrl) {
			query[QUERY_PARAMS.SERVER_BASE_URL] = serverBaseUrl;
		}
		if (repositoryUrl) {
			query[QUERY_PARAMS.REPOSITORY_URL] = repositoryUrl;
		}
		if (repositoryType) {
			query[QUERY_PARAMS.REPOSITORY_TYPE] = repositoryType;
		}
		if (projectId) {
			query[QUERY_PARAMS.PROJECT_ID] = projectId;
		}
		if (branch) {
			query[QUERY_PARAMS.BRANCH] = branch;
		}
		if (config.public.clientUrl) {
			const url = config.public.clientUrl + "?" + new URLSearchParams(query).toString();
			const newWindow = window.open(url, "_blank", "noopener,noreferrer");
			if (newWindow) newWindow.opener = null;
		} else {
			errorHandler.showError("Client URL is not configured.");
		}
	};

	const navigateToOfflineProject = (
		repositoryUrl: string,
		repositoryType: RepositoryType,
		branch: string
	) => {
		const query: Record<string, string> = {};
		if (repositoryUrl) {
			query[QUERY_PARAMS.REPOSITORY_URL] = repositoryUrl;
		}
		if (repositoryType) {
			query[QUERY_PARAMS.REPOSITORY_TYPE] = repositoryType;
		}
		if (branch) {
			query[QUERY_PARAMS.BRANCH] = branch;
		}
		if (config.public.clientUrl) {
			const url = config.public.clientUrl + "?" + new URLSearchParams(query).toString();
			const newWindow = window.open(url, "_blank", "noopener,noreferrer");
			if (newWindow) newWindow.opener = null;
		} else {
			errorHandler.showError("Client URL is not configured.");
		}
	};

	return {
		setupServerUrl,
		navigateToProject,
		navigateToOfflineProject,
	};
};
