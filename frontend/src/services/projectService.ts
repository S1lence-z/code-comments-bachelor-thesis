import type ProjectSetupRequest from "../types/dtos/ProjectSetupRequest";
import type ProjectDto from "../types/dtos/ProjectDto";

const useProjectService = () => {
	async function getProjects(backendBaseUrl: string): Promise<ProjectDto[]> {
		const requestUrl = `${backendBaseUrl}/api/v1/project`;
		try {
			const response = await fetch(requestUrl, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (!response.ok) {
				throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
			}

			const fetchedProjects = await response.json();
			return fetchedProjects;
		} catch (error) {
			throw error;
		}
	}

	async function createProject(
		setupProjectRequest: ProjectSetupRequest,
		backendBaseUrl: string
	): Promise<ProjectDto> {
		const requestUrl = `${backendBaseUrl}/api/v1/project`;
		try {
			const response = await fetch(requestUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(setupProjectRequest),
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: "Failed to create configuration" }));
				throw new Error(
					`Failed to create configuration: ${response.status} ${response.statusText} - ${errorData.message}`
				);
			}

			const createdProject = await response.json();
			return createdProject;
		} catch (error) {
			throw error;
		}
	}

	return { getProjects, createProject };
};

export default useProjectService;
