import { computed, ref } from "vue";
import { setupProject, listProjects } from "../../services/projectService";
import type ProjectSetupRequest from "../../types/dtos/ProjectSetupRequest";
import type ProjectDto from "../../types/dtos/ProjectDto";
import router from "../../core/router";
import { useProjectStore } from "../../stores/projectStore";
import { isValidGithubUrl } from "../../utils/urlUtils";
import { useSettingsStore } from "../../stores/settingsStore";
import type { LocationQueryValue } from "vue-router";

export function useSetupPage() {
	// Stores
	const projectStore = useProjectStore();
	const settingsStore = useSettingsStore();

	// Form input values
	const formGithubRepositoryUrl = ref("");
	const formBranchName = ref("");
	const formProjectName = ref("");
	const formReadWriteApiUrl = ref("");
	const formServerBaseUrl = ref(projectStore.getBackendBaseUrl || "");

	// UI state
	const isCreatingProject = ref(false);
	const isProjectCreated = ref(false);
	const isServerUrlConfigured = ref(false);
	const errorMessage = ref("");

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
		errorMessage.value = "";
	};

	// Create new project from form
	const createProject = async (): Promise<void> => {
		isCreatingProject.value = true;
		isProjectCreated.value = false;
		errorMessage.value = "";

		// Validate github URL
		if (!isValidGithubUrl(formGithubRepositoryUrl.value.trim())) {
			errorMessage.value = "Invalid GitHub repository URL.";
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

			const response = await setupProject(setupData, projectStore.getBackendBaseUrl);

			if (response.readWriteApiUrl && response.repository) {
				isProjectCreated.value = true;
				formReadWriteApiUrl.value = response.readWriteApiUrl;
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
				repositoryUrl: formGithubRepositoryUrl.value.trim(),
				writeApiUrl: formReadWriteApiUrl.value.trim(),
				branch: formBranchName.value.trim(),
			},
		});
	};

	// Navigate to existing project
	const navigateToExistingProject = (project: ProjectDto): void => {
		router.push({
			name: "Code Review",
			query: {
				backendBaseUrl: project.serverBaseUrl,
				repositoryUrl: project.repository.repositoryUrl,
				writeApiUrl: project.readWriteApiUrl,
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
	const setOfflineMode = () => {
		isServerUrlConfigured.value = true;
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
		errorMessage,

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
