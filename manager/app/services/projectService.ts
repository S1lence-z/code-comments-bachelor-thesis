import type ProjectSetupRequest from "../../shared/types/ProjectSetupRequest";
import type ProjectDto from "../../shared/types/ProjectDto";

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
				throw new Error(
					`Failed to fetch projects: ${response.status} ${response.statusText}`
				);
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
				throw new Error(
					`Failed to create project: ${response.status} ${response.statusText}`
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
