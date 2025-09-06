import { ref } from "vue";
import { setupProject, listProjects } from "../../services/projectService";
import type ProjectSetupRequest from "../../types/dtos/SetupProjectRequest";
import type ProjectDto from "../../types/dtos/ProjectDto";
import router from "../../core/router";

export function useSetupPage() {
	// Form input values
	const formGithubRepoUrl = ref("");
	const formBranchName = ref("");
	const formProjectName = ref("");

	// UI state
	const isCreatingProject = ref(false);
	const isProjectCreated = ref(false);
	const errorMessage = ref("");

	// Data
	const existingProjects = ref<ProjectDto[]>([]);

	// Configuration
	const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

	// Create new project from form
	const createProject = async (): Promise<void> => {
		isCreatingProject.value = true;
		isProjectCreated.value = false;
		errorMessage.value = "";

		try {
			const setupData: ProjectSetupRequest = {
				repositoryUrl: formGithubRepoUrl.value.trim(),
				branch: formBranchName.value.trim(),
				name: formProjectName.value.trim(),
			};

			const response = await setupProject(setupData, backendBaseUrl);

			if (response.writeApiUrl && response.repository) {
				isProjectCreated.value = true;
			} else {
				throw new Error("Invalid response from server");
			}
		} catch (error: any) {
			errorMessage.value = `Failed to create review session: ${error.message || "Unknown error"}`;
		} finally {
			isCreatingProject.value = false;
		}
	};

	// Navigate to newly created project
	const navigateToNewProject = (): void => {
		if (!isProjectCreated.value) return;

		router.push({
			name: "Code Review",
			query: {
				repoUrl: formGithubRepoUrl.value.trim(),
				commentsApiUrl: backendBaseUrl,
				branch: formBranchName.value.trim(),
			},
		});
	};

	// Navigate to existing project
	const navigateToExistingProject = (project: ProjectDto): void => {
		router.push({
			name: "Code Review",
			query: {
				repoUrl: project.repository.repositoryUrl,
				commentsApiUrl: project.writeApiUrl,
				branch: project.repository.branch,
			},
		});
	};

	// Load existing projects
	const loadExistingProjects = async (): Promise<void> => {
		try {
			existingProjects.value = await listProjects(backendBaseUrl);
		} catch (error) {
			console.error("Failed to load existing projects:", error);
		}
	};

	return {
		// Form inputs
		formGithubRepoUrl,
		formBranchName,
		formProjectName,

		// UI state
		isCreatingProject,
		isProjectCreated,
		errorMessage,

		// Data
		existingProjects,

		// Actions
		createProject,
		navigateToNewProject,
		navigateToExistingProject,
		loadExistingProjects,
	};
}
