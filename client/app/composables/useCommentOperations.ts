import { createCommentDtoByType } from "../utils/comments";
import type RawCommentData from "../types/domain/raw-comment-data";

export interface CommentOperationResult {
	success: boolean;
	error?: string;
}

export const useCommentOperations = () => {
	const projectDataStore = useProjectDataStore();

	const submitComment = async (payload: RawCommentData): Promise<CommentOperationResult> => {
		const commentData = createCommentDtoByType(
			payload.commentType,
			projectDataStore.getAllCategories,
			payload
		);
		await projectDataStore.upsertCommentAsync(commentData);
		return { success: true };
	};

	const deleteComment = async (commentId: string): Promise<CommentOperationResult> => {
		await projectDataStore.deleteCommentAsync(commentId);
		return { success: true };
	};

	const replyToComment = async (
		parentCommentId: string,
		payload: RawCommentData
	): Promise<CommentOperationResult> => {
		const commentData = createCommentDtoByType(
			payload.commentType,
			projectDataStore.getAllCategories,
			payload
		);
		await projectDataStore.replyToCommentAsync(parentCommentId, commentData);
		return { success: true };
	};

	return {
		submitComment,
		deleteComment,
		replyToComment,
	};
};
