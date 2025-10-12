import useProjectService from "../services/projectService";
import useGithubBranchService from "../services/githubBranchService";
import type ProjectSetupRequest from "../../shared/types/ProjectSetupRequest";
import type ProjectDto from "../../shared/types/ProjectDto";
import { isValidGithubUrl } from "../utils/urlUtils";

export function useSetupPage() {
	// Runtime config
	const config = useRuntimeConfig();

	// Services
	const { branchExistsInRepo } = useGithubBranchService();
	const projectService = useProjectService();

	// Query params composable
	const { navigateToProject, setupServerUrl } = useQueryParams();

	// Form input values
	const formGithubRepositoryUrl = ref("");
	const formBranchName = ref("");
	const formProjectName = ref("");
	const formReadWriteApiUrl = ref("");
	const formServerBaseUrl = ref("");

	// UI state
	const isCreatingProject = ref(false);
	const isProjectCreated = ref(false);
	const isServerUrlConfigured = ref(false);
	const projectCreationErrorMessage = ref("");
	const projectsLoadedSuccessfully = ref(true);
	const isOfflineMode = ref(false);

	// Data
	const existingProjects = ref<ProjectDto[]>([]);

	// Handle new project creation
	const handleNewProjectCreation = async () => {
		// Trim inputs
		const repositoryUrl = formGithubRepositoryUrl.value.trim();
		const branchName = formBranchName.value.trim();
		const projectName = formProjectName.value.trim();
		const serverBaseUrl = formServerBaseUrl.value.trim();

		// Validate github URL
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

		if (!isOfflineMode.value) {
			createProject(serverBaseUrl, repositoryUrl, branchName, projectName);
			return;
		}
		// In offline mode, simulate project creation without server interaction
		isProjectCreated.value = true;
		projectCreationErrorMessage.value = "";
	};

	// Create new project from form
	const createProject = async (
		serverBaseUrl: string,
		repositoryUrl: string,
		branchName: string,
		projectName: string
	): Promise<void> => {
		isCreatingProject.value = true;
		isProjectCreated.value = false;
		projectCreationErrorMessage.value = "";

		// Submit project setup request
		try {
			// Prepare setup data
			const setupData: ProjectSetupRequest = {
				serverBaseUrl,
				repositoryUrl,
				branch: branchName,
				name: projectName,
			};

			// Call the service to create the project
			const response = await projectService.createProject(
				setupData,
				formServerBaseUrl.value.trim()
			);

			if (response.readWriteApiUrl && response.repository) {
				isProjectCreated.value = true;
				formReadWriteApiUrl.value = response.readWriteApiUrl;
			} else {
				throw new Error("Invalid response from server");
			}
		} catch (error: any) {
			projectCreationErrorMessage.value = `Failed to create review session: ${
				error.message || "Unknown error"
			}`;
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
			existingProjects.value = await projectService.getProjects(
				formServerBaseUrl.value.trim()
			);
		} catch (error) {
			console.error("Failed to load existing projects:", error);
			projectsLoadedSuccessfully.value = false;
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
		formServerBaseUrl.value = config.public.defaultServerUrl || "";
	};

	// Handle offline mode (skip server URL configuration)
	const setOfflineMode = () => {
		isServerUrlConfigured.value = true;
		isOfflineMode.value = true;
	};

	return {
		// Form inputs
		formGithubRepositoryUrl,
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
