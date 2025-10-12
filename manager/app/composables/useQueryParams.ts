import { QUERY_PARAMS } from "../../shared/types/QueryParams";

export const useQueryParams = () => {
	const router = useRouter();
	const route = useRoute();

	const params = route.query;

	const navigateToServer = (serverBaseUrl: string) => {
		alert("Navigate to URL provided in env variables.");
	};

	const navigateToProject = (
		serverBaseUrl: string,
		repositoryUrl: string,
		rwApiUrl: string,
		branch: string
	) => {
		alert("Navigate to URL provided in env variables");
	};

	return {
		navigateToServer,
		navigateToProject,
	};
};
