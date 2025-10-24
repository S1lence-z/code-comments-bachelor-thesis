import type CommentDto from "../types/dtos/CommentDto";

const useCommentsService = () => {
	const getComments = async (rwServerUrl: string): Promise<CommentDto[]> => {
		const response = await fetch(rwServerUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
		}

		const allComments: CommentDto[] = await response.json();
		return allComments;
	};

	const addComment = async (rwServerUrl: string, commentData: CommentDto): Promise<CommentDto> => {
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
	};

	const updateComment = async (
		rwServerUrl: string,
		commentId: string,
		commentData: CommentDto
	): Promise<CommentDto> => {
		const response = await fetch(`${rwServerUrl}/${commentId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(commentData),
		});
		if (!response.ok) {
			throw new Error(`Failed to update comment: ${response.status} ${response.statusText}`);
		}

		const updatedComment: CommentDto = await response.json();
		return updatedComment;
	};

	const deleteComment = async (rwServerUrl: string, commentId: string): Promise<void> => {
		const response = await fetch(`${rwServerUrl}/${commentId}`, {
			method: "DELETE",
		});
		if (!response.ok) {
			throw new Error(`Failed to delete comment: ${response.status} ${response.statusText}`);
		}
		return;
	};

	const replyComment = async (
		rwServerUrl: string,
		parentCommentId: string,
		commentData: CommentDto
	): Promise<CommentDto> => {
		const response = await fetch(`${rwServerUrl}/${parentCommentId}/reply`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(commentData),
		});
		if (!response.ok) {
			throw new Error(`Failed to reply to comment: ${response.status} ${response.statusText}`);
		}

		const repliedComment: CommentDto = await response.json();
		return repliedComment;
	};

	const getCommentThread = async (rwServerUrl: string, rootCommentId: string): Promise<CommentDto[]> => {
		const response = await fetch(`${rwServerUrl}/${rootCommentId}/thread`);
		if (!response.ok) {
			throw new Error(`Failed to fetch comment thread: ${response.status} ${response.statusText}`);
		}

		const commentThread: CommentDto[] = await response.json();
		return commentThread;
	};

	return { getComments, addComment, updateComment, deleteComment, replyComment, getCommentThread };
};

export default useCommentsService;
