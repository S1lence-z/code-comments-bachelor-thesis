import { useAuthStore } from "../stores/authStore";
import { QUERY_PARAMS, type QueryParams } from "../types/query-params";
import type { RepositoryType } from "../types/repository-type";

export const useQueryParams = () => {
	const config = useRuntimeConfig();
	const route = useRoute();
	const errorHandler = useErrorHandler();
	const authStore = useAuthStore();

	// Functions used in the manager app
	const navigateWithServerUrl = async (serverBaseUrl: string) => {
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
		if (authStore.authTokens) {
			query[QUERY_PARAMS.TOKEN] = authStore.getAuthToken(serverBaseUrl);
		}
		if (config.public.clientUrl) {
			const url = config.public.clientUrl + "?" + new URLSearchParams(query).toString();
			const newWindow = window.open(url, "_blank", "noopener,noreferrer");
			if (newWindow) newWindow.opener = null;
		} else {
			errorHandler.showError("Client URL is not configured.");
		}
	};

	const navigateToOfflineProject = (repositoryUrl: string, repositoryType: RepositoryType, branch: string) => {
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

	// Functions used in the client app
	const extractString = (value: any) => {
		if (Array.isArray(value)) return value[0] || "";
		return value || "";
	};

	const params = computed<QueryParams>(() => ({
		serverBaseUrl: extractString(route.query[QUERY_PARAMS.SERVER_BASE_URL]),
		repositoryUrl: extractString(route.query[QUERY_PARAMS.REPOSITORY_URL]),
		projectId: extractString(route.query[QUERY_PARAMS.PROJECT_ID]),
		branch: extractString(route.query[QUERY_PARAMS.BRANCH]),
		file: extractString(route.query[QUERY_PARAMS.FILE]) || undefined,
	}));

	const removeTokenFromQuery = async () => {
		// Remove token from URL
		const newQuery = { ...route.query };
		delete newQuery[QUERY_PARAMS.TOKEN];
		await navigateTo({ query: newQuery });
	};

	const navigateToCodeEditorWithFile = (filePath: string) => {
		navigateTo({
			path: "/review",
			query: {
				...route.query,
				[QUERY_PARAMS.FILE]: filePath,
			},
		});
	};

	return {
		// Manager app functions
		navigateWithServerUrl,
		navigateToProject,
		navigateToOfflineProject,

		// Client app properties and functions
		params,
		navigateToCodeEditorWithFile,
		removeTokenFromQuery,
	};
};
