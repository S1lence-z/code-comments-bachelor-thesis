import type { AuthResponseDto } from "../../../../base/app/types/authentication";
import type ProjectDto from "../../../../base/app/types/dtos/project-dto";
import type ProjectSetupRequest from "../../../../base/app/types/project-setup-request";

/**
 * Interface for backend providers that handle communication with the server API.
 * Covers the manager app's subset of endpoints: authentication and project management.
 */
export interface BackendProvider {
	/**
	 * Sets the authentication token used for subsequent API requests.
	 * @param token - The authentication token (e.g. JWT)
	 */
	setAuthToken(token: string): void;

	/**
	 * Authenticates with the server using the provided password.
	 * @param password - The project password
	 * @returns The authentication response containing a token on success
	 */
	login(password: string): Promise<AuthResponseDto>;

	/**
	 * Fetches all projects from the server.
	 */
	getProjects(): Promise<ProjectDto[]>;

	/**
	 * Creates a new project with the provided setup configuration.
	 * @param request - The project setup request data
	 * @returns The created project with server-assigned fields
	 */
	createProject(request: ProjectSetupRequest): Promise<ProjectDto>;
}
