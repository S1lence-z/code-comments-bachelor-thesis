import { ref } from "vue";
import { setupProject, listProjects } from "../../services/projectService";
import type ProjectSetupRequest from "../../types/dtos/SetupProjectRequest";
import type ProjectDto from "../../types/dtos/ProjectDto";
import router from "../../core/router";
import { useProjectStore } from "../../stores/projectStore";
import { extractBaseBackendUrl } from "../../utils/urlUtils";

export function useSetupPage() {
	// Stores
	const projectStore = useProjectStore();

	// Form input values
	const formGithubRepoUrl = ref("");
	const formBranchName = ref("");
	const formProjectName = ref("");
	const formWriteApiUrl = ref("");
	const formServerBaseUrl = ref<string>(projectStore.getBackendBaseUrl || "");

	// UI state
	const isCreatingProject = ref(false);
	const isProjectCreated = ref(false);
	const isServerUrlConfigured = ref(false);
	const errorMessage = ref("");

	// Data
	const existingProjects = ref<ProjectDto[]>([]);

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

			const response = await setupProject(setupData, projectStore.getBackendBaseUrl);

			if (response.writeApiUrl && response.repository) {
				isProjectCreated.value = true;
				formWriteApiUrl.value = response.writeApiUrl;
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
				backendBaseUrl: formServerBaseUrl.value.trim(),
				repoUrl: formGithubRepoUrl.value.trim(),
				commentsApiUrl: formWriteApiUrl.value.trim(),
				branch: formBranchName.value.trim(),
			},
		});
	};

	// Navigate to existing project
	const navigateToExistingProject = (project: ProjectDto): void => {
		router.push({
			name: "Code Review",
			query: {
				backendBaseUrl: extractBaseBackendUrl(project.writeApiUrl),
				repoUrl: project.repository.repositoryUrl,
				commentsApiUrl: project.writeApiUrl,
				branch: project.repository.branch,
			},
		});
	};

	// Load existing projects
	const loadExistingProjects = async (): Promise<void> => {
		try {
			if (!formServerBaseUrl.value || !formServerBaseUrl.value.trim()) {
				console.warn("Server base URL is not set. Cannot load existing projects.");
				return;
			}
			existingProjects.value = await listProjects(formServerBaseUrl.value.trim());
		} catch (error) {
			console.error("Failed to load existing projects:", error);
		}
	};

	// Handle submission of the server base URL form
	const submitServerBaseUrl = async (): Promise<void> => {
		if (!formServerBaseUrl.value.trim()) return;
		router.push({
			name: "Home",
			query: {
				backendBaseUrl: formServerBaseUrl.value.trim(),
			},
		});
		isServerUrlConfigured.value = true;
	};

	// Use default server URL
	const useDefaultServerUrl = () => {
		formServerBaseUrl.value = projectStore.getDefaultBackendBaseUrl();
	};

	// Handle offline mode (skip server URL configuration)
	const handleOfflineMode = () => {
		isServerUrlConfigured.value = true;
	};

	return {
		// Form inputs
		formGithubRepoUrl,
		formBranchName,
		formProjectName,
		formServerBaseUrl,

		// UI state
		isCreatingProject,
		isProjectCreated,
		isServerUrlConfigured,
		errorMessage,

		// Data
		existingProjects,

		// Actions
		createProject,
		navigateToNewProject,
		navigateToExistingProject,
		loadExistingProjects,
		submitServerBaseUrl,
		useDefaultServerUrl,
		handleOfflineMode,
	};
}
