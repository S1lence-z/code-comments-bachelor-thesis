import type IProjectDto from "../../../shared/dtos/IProjectDto.ts";
import type ISetupProjectRequest from "../../../shared/api/ISetupProjectRequest.ts";
import type IGetCommentsResponse from "../../../shared/api/IGetCommentsResponse.ts";
import type ICommentDto from "../../../shared/dtos/ICommentDto.ts";
import type ICategoryDto from "../../../shared/dtos/ICategoryDto.ts";

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

export async function addComment(writeApiUrl: string, commentData: ICommentDto): Promise<{ success: boolean }> {
	try {
		const response = await fetch(writeApiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(commentData),
		});
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ message: "Failed to add comment" }));
			throw new Error(`Failed to add comment: ${response.status} ${response.statusText} - ${errorData.message}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Error in addComment:", error);
		throw error;
	}
}

export async function createConfiguration(setupRequest: ISetupProjectRequest): Promise<IProjectDto> {
	const requestUrl = "http://localhost:4000/api/setup";
	try {
		const response = await fetch(requestUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				repoUrl: setupRequest.repoUrl,
				branch: setupRequest.branch,
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

export async function deleteComment(writeApiUrl: string, commentId: number): Promise<{ success: boolean }> {
	try {
		const response = await fetch(`${writeApiUrl}/${commentId}`, {
			method: "DELETE",
		});
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ message: "Failed to delete comment" }));
			throw new Error(
				`Failed to delete comment: ${response.status} ${response.statusText} - ${errorData.message}`
			);
		}
		return await response.json();
	} catch (error) {
		console.error("Error in deleteComment:", error);
		throw error;
	}
}

export async function getAllCategories(backendBaseUrl: string): Promise<ICategoryDto[]> {
	try {
		const response = await fetch(`${backendBaseUrl}/api/categories`);
		if (!response.ok) {
			throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
		}
		const categories: ICategoryDto[] = await response.json();
		return categories;
	} catch (error) {
		console.error("Error in getAllCategories:", error);
		throw error;
	}
}
