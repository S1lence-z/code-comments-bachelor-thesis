import { useProjectDataStore } from "../stores/projectDataStore";
import { useProjectStore } from "../stores/projectStore";
import { createCommentDtoByType } from "../utils/commentUtils";
import type RawCommentData from "../types/others/RawCommentData";
import { useErrorHandler } from "./useErrorHandler";

export interface CommentOperationResult {
	success: boolean;
	error?: string;
}

export const useCommentOperations = () => {
	const projectDataStore = useProjectDataStore();
	const projectStore = useProjectStore();
	const { handleError, showSuccess } = useErrorHandler();

	const submitComment = async (payload: RawCommentData): Promise<CommentOperationResult> => {
		try {
			const commentData = createCommentDtoByType(payload.commentType, projectDataStore.allCategories, payload);

			await projectDataStore.upsertCommentAsync(commentData, projectStore.getRwServerUrl);

			// Show success toast
			const isEditing = !!commentData.id;
			showSuccess(isEditing ? "Comment updated successfully" : "Comment added successfully");

			return { success: true };
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			handleError(e, {
				customMessage: "Failed to submit comment: " + errorMsg,
			});
			return {
				success: false,
				error: errorMsg,
			};
		}
	};

	const deleteComment = async (commentId: string): Promise<CommentOperationResult> => {
		try {
			await projectDataStore.deleteCommentAsync(commentId, projectStore.getRwServerUrl);

			// Show success toast
			showSuccess("Comment deleted successfully");

			return { success: true };
		} catch (error) {
			handleError(error, {
				customMessage: "Failed to delete comment. Please try again.",
			});
			return {
				success: false,
				error: "Failed to delete comment. Please try again.",
			};
		}
	};

	return {
		submitComment,
		deleteComment,
	};
};
