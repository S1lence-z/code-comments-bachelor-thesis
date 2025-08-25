import type IGetCommentsResponse from "../types/api/IGetCommentsResponse.ts";
import type ICommentDto from "../types/dtos/ICommentDto.ts";

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

export async function addComment(writeApiUrl: string, commentData: ICommentDto): Promise<{ commentId: number }> {
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

export async function updateComment(
	writeApiUrl: string,
	commentId: number,
	commentData: ICommentDto
): Promise<{ success: boolean }> {
	try {
		const response = await fetch(`${writeApiUrl}/${commentId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(commentData),
		});
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ message: "Failed to update comment" }));
			throw new Error(
				`Failed to update comment: ${response.status} ${response.statusText} - ${errorData.message}`
			);
		}
		return await response.json();
	} catch (error) {
		console.error("Error in updateComment:", error);
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
