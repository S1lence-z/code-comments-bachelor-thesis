import useProjectService from "../services/project-service";
import useGithubBranchService from "../services/github-branch-service";
import type ProjectSetupRequest from "../../shared/types/project-setup-request";
import type ProjectDto from "../../shared/types/project-dto";
import { RepositoryType } from "../../shared/types/repository-type";
import { isValidGithubUrl } from "../utils/url";
import { useErrorHandler } from "#imports";

export function useSetupPage() {
	// Runtime config
	const config = useRuntimeConfig();

	// Services
	const { branchExistsInRepo } = useGithubBranchService();
	const projectService = useProjectService();
	const errorHandler = useErrorHandler();

	// Query params composable
	const { navigateToProject, navigateToOfflineProject, setupServerUrl } = useQueryParams();

	// Form values
	const formRepositoryUrl = ref("");
	const formRepositoryType = ref<RepositoryType>(RepositoryType.github);
	const formBranchName = ref("");
	const formProjectName = ref("");
	const formServerBaseUrl = ref("");

	// UI state
	const isCreatingProject = ref(false);
	const isProjectCreated = ref(false);
	const isLoadingProjects = ref(false);
	const isServerUrlConfigured = ref(false);
	const projectCreationErrorMessage = ref("");
	const projectsLoadedSuccessfully = ref(true);
	const isOfflineMode = ref(false);

	// Data
	const readWriteServerUrl = ref("");
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
			if (isOfflineMode.value) {
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
				formServerBaseUrl.value.trim()
			);

			if (response && response.readWriteApiUrl) {
				readWriteServerUrl.value = response.readWriteApiUrl;
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

		if (isOfflineMode.value) {
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
			readWriteServerUrl.value.trim(),
			formBranchName.value.trim()
		);
	};

	// Navigate to existing project
	const navigateToExistingProject = (project: ProjectDto): void => {
		navigateToProject(
			project.serverBaseUrl,
			project.repository.repositoryUrl,
			project.repository.repositoryType,
			project.readWriteApiUrl,
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
	const submitServerBaseUrl = (serverBaseUrl?: string): void => {
		const urlToSubmit = serverBaseUrl ? serverBaseUrl.trim() : formServerBaseUrl.value.trim();

		if (!urlToSubmit) {
			return;
		}

		formServerBaseUrl.value = urlToSubmit;
		setupServerUrl(urlToSubmit);
		isServerUrlConfigured.value = true;
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

	// Handle offline mode (skip server URL configuration)
	const setOfflineMode = () => {
		isServerUrlConfigured.value = true;
		isOfflineMode.value = true;
	};

	return {
		// Form inputs
		formRepositoryUrl,
		formRepositoryType,
		formBranchName,
		formProjectName,
		formServerBaseUrl,

		// Ref
		isOfflineMode,

		// UI state
		isCreatingProject,
		isProjectCreated,
		isServerUrlConfigured,
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
		submitServerBaseUrl,
		useDefaultServerUrl,
		setOfflineMode,
	};
}
