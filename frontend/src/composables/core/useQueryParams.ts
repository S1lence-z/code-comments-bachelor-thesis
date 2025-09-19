import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { QUERY_PARAMS, type QueryParams } from "../../types/others/QueryParams";
import { setupPageKey, codeReviewPageKey } from "../../core/keys";

/**
 * Main composable for query parameter management
 * This is the primary interface for working with URL query parameters
 */
export function useQueryParams() {
	const route = useRoute();
	const router = useRouter();

	// Helper to safely extract string from router query
	const extractString = (value: any): string => {
		if (Array.isArray(value)) return value[0] || "";
		return value || "";
	};

	// Parse current query parameters
	const params = computed<QueryParams>(() => ({
		serverBaseUrl: extractString(route.query[QUERY_PARAMS.SERVER_BASE_URL]),
		repositoryUrl: extractString(route.query[QUERY_PARAMS.REPOSITORY_URL]),
		rwApiUrl: extractString(route.query[QUERY_PARAMS.RW_API_URL]),
		branch: extractString(route.query[QUERY_PARAMS.BRANCH]),
		file: extractString(route.query[QUERY_PARAMS.FILE]) || undefined,
	}));

	// Navigation functions
	const navigateToProject = (serverBaseUrl: string, repositoryUrl: string, rwApiUrl: string, branch: string) => {
		router.push({
			name: codeReviewPageKey,
			query: {
				[QUERY_PARAMS.SERVER_BASE_URL]: serverBaseUrl,
				[QUERY_PARAMS.REPOSITORY_URL]: repositoryUrl,
				[QUERY_PARAMS.RW_API_URL]: rwApiUrl,
				[QUERY_PARAMS.BRANCH]: branch,
			},
		});
	};

	const navigateToFile = (filePath: string) => {
		router.push({
			name: codeReviewPageKey,
			query: {
				...route.query,
				[QUERY_PARAMS.FILE]: filePath,
			},
		});
	};

	const navigateToServer = (serverBaseUrl: string) => {
		router.push({
			name: setupPageKey,
			query: {
				[QUERY_PARAMS.SERVER_BASE_URL]: serverBaseUrl,
			},
		});
	};

	return {
		// Current parameters
		params,

		// Navigation (main interface)
		navigateToProject,
		navigateToFile,
		navigateToServer,
	};
}
