import type IProjectDto from "../../../shared/dtos/IProjectDto.ts";
import type ISetupProjectRequest from "../../../shared/api/ISetupProjectRequest.ts";
import type IGetCommentsResponse from "../../../shared/api/IGetCommentsResponse.ts";

export async function fetchComments(readApiUrl: string): Promise<IGetCommentsResponse> {
	try {
		const response = await fetch(readApiUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
		}
		const allComments: IGetCommentsResponse = await response.json();
		return allComments;
	} catch (error) {
		console.error("Error in fetchComments:", error);
		throw error;
	}
}

export async function addComment(
	writeApiUrl: string,
	commentData: { text: string; filePath: string; lineNumber: number; tags?: string[] }
): Promise<IGetCommentsResponse> {
	try {
		const response = await fetch(writeApiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(commentData),
		});
		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: "Failed to add comment" }));
			throw new Error(
				`Failed to add comment: ${response.status} ${response.statusText} - ${errorData.message}`
			);
		}
		return await response.json();
	} catch (error) {
		console.error("Error in addComment:", error);
		throw error;
	}
}

export async function createConfiguration(
	setupRequest: ISetupProjectRequest
): Promise<IProjectDto> {
	const requestUrl = "http://localhost:4000/api/setup";
	try {
		const response = await fetch(requestUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				repoUrl: setupRequest.repoUrl,
			}),
		});
		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: "Failed to create configuration" }));
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
