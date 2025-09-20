import { computed, ref } from "vue";
import useProjectService from "../../services/projectService";
import type ProjectSetupRequest from "../../types/dtos/ProjectSetupRequest";
import type ProjectDto from "../../types/dtos/ProjectDto";
import { useProjectStore } from "../../stores/projectStore";
import { isValidGithubUrl } from "../../utils/urlUtils";
import { useSettingsStore } from "../../stores/settingsStore";
import type { LocationQueryValue } from "vue-router";
import { useQueryParams } from "../core/useQueryParams";

export function useSetupPage() {
	// Stores
	const projectStore = useProjectStore();
	const settingsStore = useSettingsStore();

	// Services
	const projectService = useProjectService();

	// Query params composable
	const { navigateToProject, navigateToServer } = useQueryParams();

	// Form input values
	const formGithubRepositoryUrl = ref("");
	const formBranchName = ref("");
	const formProjectName = ref("");
	const formReadWriteApiUrl = ref("");
	const formServerBaseUrl = ref(projectStore.getServerBaseUrl || "");

	// UI state
	const isCreatingProject = ref(false);
	const isProjectCreated = ref(false);
	const isServerUrlConfigured = ref(false);
	const projectCreationErrorMessage = ref("");
	const projectsLoadedSuccessfully = ref(true);

	// Computed
	const isOfflineMode = computed(() => settingsStore.isOfflineMode);

	// Data
	const existingProjects = ref<ProjectDto[]>([]);

	// Handle new project creation
	const handleNewProjectCreation = () => {
		if (!isOfflineMode.value) {
			createProject();
			return;
		}
		// In offline mode, simulate project creation without server interaction
		isProjectCreated.value = true;
		projectCreationErrorMessage.value = "";
	};

	// Create new project from form
	const createProject = async (): Promise<void> => {
		isCreatingProject.value = true;
		isProjectCreated.value = false;
		projectCreationErrorMessage.value = "";

		// Validate github URL
		if (!isValidGithubUrl(formGithubRepositoryUrl.value.trim())) {
			projectCreationErrorMessage.value = "Invalid GitHub repository URL.";
			return;
		}

		// Submit project setup request
		try {
			const setupData: ProjectSetupRequest = {
				serverBaseUrl: formServerBaseUrl.value.trim(),
				repositoryUrl: formGithubRepositoryUrl.value.trim(),
				branch: formBranchName.value.trim(),
				name: formProjectName.value.trim(),
			};

			const response = await projectService.createProject(setupData, projectStore.getServerBaseUrl);

			if (response.readWriteApiUrl && response.repository) {
				isProjectCreated.value = true;
				formReadWriteApiUrl.value = response.readWriteApiUrl;
			} else {
				throw new Error("Invalid response from server");
			}
		} catch (error: any) {
			projectCreationErrorMessage.value = `Failed to create review session: ${error.message || "Unknown error"}`;
		} finally {
			isCreatingProject.value = false;
		}
	};

	// Navigate to newly created project
	const navigateToNewProject = (): void => {
		if (!isProjectCreated.value) return;

		navigateToProject(
			formServerBaseUrl.value.trim(),
			formGithubRepositoryUrl.value.trim(),
			formReadWriteApiUrl.value.trim(),
			formBranchName.value.trim()
		);
	};

	// Navigate to existing project
	const navigateToExistingProject = (project: ProjectDto): void => {
		navigateToProject(
			project.serverBaseUrl,
			project.repository.repositoryUrl,
			project.readWriteApiUrl,
			project.repository.branch
		);
	};

	// Load existing projects
	const loadExistingProjects = async (): Promise<void> => {
		try {
			if (!formServerBaseUrl.value || !formServerBaseUrl.value.trim()) {
				console.warn("Server base URL is not set. Cannot load existing projects.");
				return;
			}
			existingProjects.value = await projectService.getProjects(formServerBaseUrl.value.trim());
		} catch (error) {
			console.error("Failed to load existing projects:", error);
			projectsLoadedSuccessfully.value = false;
		}
	};

	// Handle submission of the server base URL form
	const submitServerBaseUrl = async (): Promise<void> => {
		if (!formServerBaseUrl.value.trim()) return;

		navigateToServer(formServerBaseUrl.value.trim());
		isServerUrlConfigured.value = true;
	};

	// Use default server URL
	const useDefaultServerUrl = () => {
		formServerBaseUrl.value = projectStore.getDefaultServerBaseUrl();
	};

	// Handle offline mode (skip server URL configuration)
	const setOfflineMode = () => {
		isServerUrlConfigured.value = true;
		projectsLoadedSuccessfully.value = true;
		settingsStore.toggleOfflineMode(true);
	};

	// Handle offline mode changes from route query
	const handleOfflineModeSwitch = (
		backendBaseUrl?: LocationQueryValue | LocationQueryValue[],
		offlineMode?: boolean
	) => {
		if (backendBaseUrl || offlineMode) {
			isServerUrlConfigured.value = true;
		} else {
			isServerUrlConfigured.value = false;
		}
	};

	return {
		// Form inputs
		formGithubRepositoryUrl,
		formBranchName,
		formProjectName,
		formServerBaseUrl,

		// Computed
		isOfflineMode,

		// UI state
		isCreatingProject,
		isProjectCreated,
		isServerUrlConfigured,
		projectCreationErrorMessage,
		projectsLoadedSuccessfully,

		// Data
		existingProjects,

		// Actions
		handleNewProjectCreation,
		navigateToNewProject,
		navigateToExistingProject,
		loadExistingProjects,
		submitServerBaseUrl,
		useDefaultServerUrl,
		setOfflineMode,
		handleOfflineModeSwitch,
	};
}
