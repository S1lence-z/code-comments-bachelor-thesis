import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { QUERY_PARAMS, type QueryParams } from "../types/shared/QueryParams";
import { codeReviewPageKey } from "../core/keys";

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
		rwServerUrl: extractString(route.query[QUERY_PARAMS.RW_SERVER_URL]),
		branch: extractString(route.query[QUERY_PARAMS.BRANCH]),
		file: extractString(route.query[QUERY_PARAMS.FILE]) || undefined,
	}));

	// Navigation functions

	const navigateToFile = (filePath: string) => {
		router.push({
			name: codeReviewPageKey,
			query: {
				...route.query,
				[QUERY_PARAMS.FILE]: filePath,
			},
		});
	};

	return {
		// Current parameters
		params,

		// Navigation
		navigateToFile,
	};
}
