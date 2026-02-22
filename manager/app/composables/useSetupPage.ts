import useProjectService from "../services/project-service";
import useGithubBranchService from "../services/github-branch-service";
import type ProjectSetupRequest from "../../../base/app/types/project-setup-request";
import type ProjectDto from "../../../base/app/types/dtos/project-dto";
import { RepositoryType } from "../../../base/app/types/repository-type";
import { isValidGithubUrl } from "../utils/url";
import repositoryTypeOptions from "../../../base/app/types/repository-type-options";
import useAuthService from "../services/auth-service";
import { useAuthStore } from "../../../base/app/stores/authStore";

export function useSetupPage() {
	// Runtime config
	const config = useRuntimeConfig();

	// Stores
	const authStore = useAuthStore();
	const offlineModeStore = useOfflineModeStore();

	// Services
	const { branchExistsInRepo } = useGithubBranchService();
	const projectService = useProjectService();
	const authService = useAuthService();
	const errorHandler = useErrorHandler();

	// Query params composable
	const { navigateToProject, navigateToOfflineProject, navigateWithServerUrl } = useQueryParams();

	// Form values
	const formRepositoryUrl = ref("");
	const formRepositoryType = ref<RepositoryType>(RepositoryType.github);
	const formBranchName = ref("");
	const formProjectName = ref("");
	const formServerBaseUrl = ref("");
	const formServerPassword = ref("");

	// UI state
	const isAuthorizing = ref(false);
	const isCreatingProject = ref(false);
	const isProjectCreated = ref(false);
	const isLoadingProjects = ref(false);
	const projectCreationErrorMessage = ref("");
	const projectsLoadedSuccessfully = ref(true);

	// Data
	const projectId = ref("");
	const existingProjects = ref<ProjectDto[]>([]);

	// Handle new project creation
	const handleNewProjectCreation = async () => {
		// Reset state
		isProjectCreated.value = false;
		projectCreationErrorMessage.value = "";

		// Trim inputs
		const repositoryUrl = formRepositoryUrl.value.trim();
		const repositoryType = formRepositoryType.value;
		const branchName = formBranchName.value.trim();
		const projectName = formProjectName.value.trim();
		const serverBaseUrl = formServerBaseUrl.value.trim();

		try {
			isCreatingProject.value = true;

			// Validate github URL only for git repository type
			if (repositoryType === RepositoryType.github) {
				if (!isValidGithubUrl(repositoryUrl)) {
					projectCreationErrorMessage.value = "Invalid GitHub repository URL.";
					return;
				}

				// Validate the branch exists on the repository
				const branchExists = await branchExistsInRepo(repositoryUrl, branchName);
				if (!branchExists) {
					projectCreationErrorMessage.value = `The branch "${branchName}" does not exist in the repository.`;
					return;
				}
			}

			// Create offline project
			if (offlineModeStore.isOfflineMode) {
				createOfflineProject();
				return;
			}

			// Create project via server
			createProject(serverBaseUrl, repositoryUrl, repositoryType, branchName, projectName);
		} catch (error: any) {
			errorHandler.handleError(error);
			projectCreationErrorMessage.value = `Error during project setup: ${
				error.message || "Unknown error"
			}`;
		} finally {
			isCreatingProject.value = false;
		}
	};

	const createOfflineProject = () => {
		isProjectCreated.value = true;
	};

	// Create new project from form
	const createProject = async (
		serverBaseUrl: string,
		repositoryUrl: string,
		repositoryType: RepositoryType,
		branchName: string,
		projectName: string
	): Promise<void> => {
		try {
			isCreatingProject.value = true;
			// Prepare setup data
			const setupData: ProjectSetupRequest = {
				serverBaseUrl,
				repositoryUrl,
				repositoryType,
				branch: branchName,
				name: projectName,
			};

			// Call the service to create the project
			const response = await projectService.createProject(
				setupData,
				formServerBaseUrl.value.trim(),
				authStore.getAuthToken(serverBaseUrl)
			);

			if (response && response.id) {
				projectId.value = response.id;
				existingProjects.value.push(response);
			} else {
				projectCreationErrorMessage.value = "Server did not return a read-write API URL.";
				return;
			}
		} catch (error: any) {
			errorHandler.handleError(error);
			projectCreationErrorMessage.value = `Failed to create review session: ${
				error.message || "Unknown error"
			}`;
		} finally {
			isCreatingProject.value = false;
			isProjectCreated.value = !projectCreationErrorMessage.value;
		}
	};

	// Navigate to newly created project
	const navigateToNewProject = (): void => {
		if (!isProjectCreated.value) return;

		if (offlineModeStore.isOfflineMode) {
			navigateToOfflineProject(
				formRepositoryUrl.value.trim(),
				formRepositoryType.value,
				formBranchName.value.trim()
			);
			return;
		}

		navigateToProject(
			formServerBaseUrl.value.trim(),
			formRepositoryUrl.value.trim(),
			formRepositoryType.value,
			projectId.value.trim(),
			formBranchName.value.trim()
		);
	};

	// Navigate to existing project
	const navigateToExistingProject = (project: ProjectDto): void => {
		navigateToProject(
			project.serverBaseUrl,
			project.repository.repositoryUrl,
			project.repository.repositoryType,
			project.id,
			project.repository.branch
		);
	};

	// Load existing projects
	const loadExistingProjects = async (): Promise<void> => {
		try {
			isLoadingProjects.value = true;
			if (!formServerBaseUrl.value || !formServerBaseUrl.value.trim()) {
				console.warn("Server base URL is not set. Cannot load existing projects.");
				return;
			}
			existingProjects.value = await projectService.getProjects(
				formServerBaseUrl.value.trim()
			);
		} catch (error) {
			errorHandler.handleError(error, {
				customMessage: "Failed to load existing projects.",
			});
			projectsLoadedSuccessfully.value = false;
		} finally {
			isLoadingProjects.value = false;
		}
	};

	// Handle submission of the server base URL form
	const setServerConfiguration = async (
		serverBaseUrl?: string,
		token?: string
	): Promise<void> => {
		const urlToSubmit = serverBaseUrl ? serverBaseUrl : formServerBaseUrl.value.trim();
		const passwordToSubmit = formServerPassword.value.trim();

		if (!urlToSubmit) {
			return;
		}

		formServerBaseUrl.value = urlToSubmit;

		// If token is provided, use it directly
		if (token) {
			authStore.saveAuthToken(urlToSubmit, token);
			navigateWithServerUrl(urlToSubmit);
			offlineModeStore.setServerUrlConfigured(true);
			return;
		}

		// If given password, attempt to authorize
		if (passwordToSubmit) {
			isAuthorizing.value = true;
			try {
				const response = await authService.serverLogin(passwordToSubmit, urlToSubmit);
				if (!response.success) {
					throw new Error(response.message);
				}
				authStore.saveAuthToken(urlToSubmit, response.token!);
				errorHandler.showSuccess(response.message);
			} catch (error) {
				errorHandler.handleError(error);
				return;
			} finally {
				isAuthorizing.value = false;
			}
		}
		// Navigate with the server URL
		navigateWithServerUrl(urlToSubmit);
		offlineModeStore.setServerUrlConfigured(true);
	};

	// Use default server URL
	const useDefaultServerUrl = () => {
		if (!config.public.defaultServerUrl) {
			errorHandler.showError(
				"No default server URL is configured. Please enter a server URL."
			);
			return;
		}

		formServerBaseUrl.value = config.public.defaultServerUrl;
	};

	// Reset form for setting up a new session
	const resetProjectForm = (): void => {
		formRepositoryUrl.value = "";
		formRepositoryType.value = RepositoryType.github;
		formBranchName.value = "";
		formProjectName.value = "";
		isProjectCreated.value = false;
		projectCreationErrorMessage.value = "";
	};

	// Cycle through repository types
	const cycleThroughRepositoryTypes = (currentOption: RepositoryType): RepositoryType => {
		const currentIndex = repositoryTypeOptions.findIndex(
			(option) => option.value === currentOption
		);
		const nextIndex = (currentIndex + 1) % repositoryTypeOptions.length;
		const nextRepositoryOption = repositoryTypeOptions[nextIndex];
		return nextRepositoryOption?.value ?? RepositoryType.github;
	};

	return {
		// Form inputs
		formRepositoryUrl,
		formRepositoryType,
		formBranchName,
		formProjectName,
		formServerBaseUrl,
		formServerPassword,

		// UI state
		isAuthorizing,
		isCreatingProject,
		isProjectCreated,
		projectCreationErrorMessage,
		projectsLoadedSuccessfully,
		isLoadingProjects,

		// Data
		existingProjects,

		// Actions
		handleNewProjectCreation,
		navigateToNewProject,
		navigateToExistingProject,
		loadExistingProjects,
		setServerConfiguration,
		useDefaultServerUrl,
		cycleThroughRepositoryTypes,
		resetProjectForm,
	};
}
