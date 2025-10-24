import { useProjectDataStore } from "../stores/projectDataStore";
import { useProjectStore } from "../stores/projectStore";
import { createCommentDtoByType } from "../utils/commentUtils";
import type RawCommentData from "../types/domain/RawCommentData";

export interface CommentOperationResult {
	success: boolean;
	error?: string;
}

export const useCommentOperations = () => {
	const projectDataStore = useProjectDataStore();
	const projectStore = useProjectStore();

	const submitComment = async (payload: RawCommentData): Promise<CommentOperationResult> => {
		const commentData = createCommentDtoByType(payload.commentType, projectDataStore.allCategories, payload);
		await projectDataStore.upsertCommentAsync(commentData, projectStore.getRwServerUrl);
		return { success: true };
	};

	const deleteComment = async (commentId: string): Promise<CommentOperationResult> => {
		await projectDataStore.deleteCommentAsync(commentId, projectStore.getRwServerUrl);
		return { success: true };
	};

	const replyToComment = async (
		parentCommentId: string,
		payload: RawCommentData
	): Promise<CommentOperationResult> => {
		const commentData = createCommentDtoByType(payload.commentType, projectDataStore.allCategories, payload);
		await projectDataStore.replyToCommentAsync(projectStore.getRwServerUrl, parentCommentId, commentData);
		return { success: true };
	};

	return {
		submitComment,
		deleteComment,
		replyToComment,
	};
};
