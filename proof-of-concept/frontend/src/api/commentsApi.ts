// API client for comment-related operations

import type { Comment } from "../types/comment";

/**
 * Fetches comments for a given configuration.
 * @param commentsApiUrl The URL to fetch comments from (e.g., http://localhost:4000/api/comments/:id)
 * @returns A promise that resolves to an array of comments.
 */
export async function fetchComments(commentsApiUrl: string): Promise<Comment[]> {
	try {
		const response = await fetch(commentsApiUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
		}
		const comments: Comment[] = await response.json();
		return comments;
	} catch (error) {
		console.error("Error in fetchComments:", error);
		throw error; // Re-throw to be caught by the caller
	}
}

/**
 * Adds a comment to a specific configuration.
 * @param commentsApiUrl The base URL for the comments API of a specific config (e.g., http://localhost:4000/api/comments/:id)
 * @param commentData The comment object to add.
 * @returns A promise that resolves when the comment is successfully added.
 */
export async function addComment(
	commentsApiUrl: string,
	commentData: { text: string; filePath: string; lineNumber: number; tags?: string[] }
): Promise<any> {
	try {
		const response = await fetch(commentsApiUrl, {
			method: "PUT",
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
		return await response.json(); // Contains { message: "Comment added", config: db[id] }
	} catch (error) {
		console.error("Error in addComment:", error);
		throw error; // Re-throw to be caught by the caller
	}
}
