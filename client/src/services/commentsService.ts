import type CommentDto from "../types/dtos/CommentDto";

const useCommentsService = () => {
	async function getComments(rwServerUrl: string): Promise<CommentDto[]> {
		try {
			const response = await fetch(rwServerUrl);
			if (!response.ok) {
				throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
			}

			const allComments: CommentDto[] = await response.json();
			return allComments;
		} catch (error) {
			throw error;
		}
	}

	async function addComment(rwServerUrl: string, commentData: CommentDto): Promise<CommentDto> {
		try {
			const response = await fetch(rwServerUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(commentData),
			});
			if (!response.ok) {
				throw new Error(`Failed to add comment: ${response.status} ${response.statusText}`);
			}

			const addedComment: CommentDto = await response.json();
			return addedComment;
		} catch (error) {
			throw error;
		}
	}

	async function updateComment(rwServerUrl: string, commentId: string, commentData: CommentDto): Promise<CommentDto> {
		try {
			const response = await fetch(`${rwServerUrl}/${commentId}`, {
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

			const updatedComment: CommentDto = await response.json();
			return updatedComment;
		} catch (error) {
			console.error("Error in updateComment:", error);
			throw error;
		}
	}

	async function deleteComment(rwServerUrl: string, commentId: string): Promise<void> {
		try {
			const response = await fetch(`${rwServerUrl}/${commentId}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error(`Failed to delete comment: ${response.status} ${response.statusText}`);
			}
		} catch (error) {
			throw error;
		}
	}

	return { getComments, addComment, updateComment, deleteComment };
};

export default useCommentsService;
