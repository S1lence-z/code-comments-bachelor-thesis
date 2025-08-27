import type IProjectSetupRequest from "../types/interfaces/ISetupProjectRequest";
import type IProjectDto from "../types/interfaces/IProjectDto";

export async function listProjects(backendBaseUrl: string): Promise<IProjectDto[]> {
	const requestUrl = `${backendBaseUrl}/api/v1/project`;
	try {
		const response = await fetch(requestUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ message: "Failed to fetch projects" }));
			return Promise.reject(
				`Failed to fetch projects: ${response.status} ${response.statusText} - ${errorData.message}`
			);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error in listProjects:", error);
		throw error;
	}
}

export async function setupProject(
	setupProjectRequest: IProjectSetupRequest,
	backendBaseUrl: string
): Promise<IProjectDto> {
	const requestUrl = `${backendBaseUrl}/api/v1/project`;
	try {
		const response = await fetch(requestUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				repositoryUrl: setupProjectRequest.repositoryUrl,
				branch: setupProjectRequest.branch,
			}),
		});
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ message: "Failed to create configuration" }));
			return Promise.reject(
				`Failed to create configuration: ${response.status} ${response.statusText} - ${errorData.message}`
			);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error in createConfiguration:", error);
		throw error;
	}
}
