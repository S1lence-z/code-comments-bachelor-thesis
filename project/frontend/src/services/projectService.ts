import type ISetupProjectRequest from "../types/api/ISetupProjectRequest";
import type IProjectDto from "../types/dtos/IProjectDto";

export async function setupProject(
	setupProjectRequest: ISetupProjectRequest,
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
