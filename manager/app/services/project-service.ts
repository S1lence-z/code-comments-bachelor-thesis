import type ProjectSetupRequest from "../../../base/app/types/project-setup-request";
import type ProjectDto from "../../../base/app/types/dtos/project-dto";

const useProjectService = () => {
	const getProjects = async (backendBaseUrl: string): Promise<ProjectDto[]> => {
		const requestUrl = `${backendBaseUrl}/api/v1/project`;
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
	};

	const createProject = async (
		setupProjectRequest: ProjectSetupRequest,
		backendBaseUrl: string,
		serverAuthToken?: string
	): Promise<ProjectDto> => {
		const requestUrl = `${backendBaseUrl}/api/v1/project`;
		const response = await fetch(requestUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${serverAuthToken}`,
			},
			body: JSON.stringify(setupProjectRequest),
		});

		if (!response.ok) {
			throw new Error(`Failed to create project: ${response.status} ${response.statusText}`);
		}

		const createdProject = await response.json();
		return createdProject;
	};

	return { getProjects, createProject };
};

export default useProjectService;
