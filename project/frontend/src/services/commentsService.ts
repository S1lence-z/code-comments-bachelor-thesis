import type CommentDto from "../types/dtos/CommentDto";

export async function fetchComments(readApiUrl: string): Promise<CommentDto[]> {
	try {
		const response = await fetch(readApiUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
		}
		const allComments: CommentDto[] = await response.json();
		return allComments;
	} catch (error) {
		console.error("Error in fetchComments:", error);
		throw error;
	}
}

export async function addComment(writeApiUrl: string, commentData: CommentDto): Promise<CommentDto> {
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
	commentId: string,
	commentData: CommentDto
): Promise<CommentDto> {
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

export async function deleteComment(writeApiUrl: string, commentId: string): Promise<void> {
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
	} catch (error) {
		console.error("Error in deleteComment:", error);
		throw error;
	}
}
