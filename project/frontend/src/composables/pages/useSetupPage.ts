import { ref } from "vue";
import { setupProject, listProjects } from "../../services/projectService";
import type ProjectSetupRequest from "../../types/dtos/SetupProjectRequest";
import type ProjectDto from "../../types/dtos/ProjectDto";
import router from "../../core/router";

export function useSetupPage(backendBaseUrl: string) {
	// Reactive state
	const githubRepoUrl = ref("");
	const branchName = ref("");
	const projectName = ref("");
	const isLoading = ref(false);
	const errorMessage = ref("");
	const generatedReviewLink = ref("");
	const allExistingProjects = ref<ProjectDto[]>([]);

	// Business logic methods
	const createCodeReviewUrlPath = (writeApiUrl: string, repoLandingPageUrl: string, branchName: string): string => {
		return `/review/code?repoUrl=${repoLandingPageUrl || ""}&commentsApiUrl=${writeApiUrl || ""}&branch=${
			branchName || ""
		}`;
	};

	const handleCreateConfiguration = async (): Promise<void> => {
		isLoading.value = true;
		errorMessage.value = "";
		generatedReviewLink.value = "";

		try {
			const setupData: ProjectSetupRequest = {
				repositoryUrl: githubRepoUrl.value.trim(),
				branch: branchName.value.trim(),
				name: projectName.value.trim(),
			};

			const response = await setupProject(setupData, backendBaseUrl);

			if (response.writeApiUrl && response.repository) {
				generatedReviewLink.value = createCodeReviewUrlPath(
					response.writeApiUrl,
					response.repository.repositoryUrl,
					response.repository.branch
				);
			} else {
				throw new Error("Invalid response from server for configuration setup.");
			}
		} catch (error: any) {
			errorMessage.value = `Failed to create review session: ${error.message || "Unknown error"}`;
		} finally {
			isLoading.value = false;
		}
	};

	const navigateToReviewSession = (): void => {
		if (!generatedReviewLink.value) return;
		router.push(generatedReviewLink.value);
	};

	const loadExistingProjects = async (): Promise<void> => {
		try {
			allExistingProjects.value = await listProjects(backendBaseUrl);
		} catch (error) {
			console.error("Failed to load existing projects:", error);
		}
	};

	return {
		// State
		githubRepoUrl,
		branchName,
		projectName,
		isLoading,
		errorMessage,
		generatedReviewLink,
		allExistingProjects,
		// Methods
		createCodeReviewUrlPath,
		handleCreateConfiguration,
		navigateToReviewSession,
		loadExistingProjects,
	};
}
