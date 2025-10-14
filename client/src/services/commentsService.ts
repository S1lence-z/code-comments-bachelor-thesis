import type CommentDto from "../types/dtos/CommentDto";

const useCommentsService = () => {
	async function getComments(rwServerUrl: string): Promise<CommentDto[]> {
		const response = await fetch(rwServerUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
		}

		const allComments: CommentDto[] = await response.json();
		return allComments;
	}

	async function addComment(rwServerUrl: string, commentData: CommentDto): Promise<CommentDto> {
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
	}

	async function updateComment(rwServerUrl: string, commentId: string, commentData: CommentDto): Promise<CommentDto> {
		const response = await fetch(`${rwServerUrl}/${commentId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(commentData),
		});
		if (!response.ok) {
			throw new Error(
				`Failed to update comment: ${response.status} ${response.statusText}`
			);
		}

		const updatedComment: CommentDto = await response.json();
		return updatedComment;
	}

	async function deleteComment(rwServerUrl: string, commentId: string): Promise<void> {
		const response = await fetch(`${rwServerUrl}/${commentId}`, {
			method: "DELETE",
		});
		if (!response.ok) {
			throw new Error(`Failed to delete comment: ${response.status} ${response.statusText}`);
		}
		return;
	}

	return { getComments, addComment, updateComment, deleteComment };
};

export default useCommentsService;
