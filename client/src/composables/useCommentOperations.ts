import { useProjectDataStore } from "../stores/projectDataStore";
import { useProjectStore } from "../stores/projectStore";
import { createCommentDtoByType } from "../utils/commentUtils";
import type RawCommentData from "../types/others/RawCommentData";

/**
 * Result type for comment operations
 */
export interface CommentOperationResult {
	success: boolean;
	error?: string;
}

/**
 * Composable for handling comment operations: submit and delete
 * Returns result objects for UI to handle success/error states
 * Uses projectDataStore and projectStore
 * Handles errors and logs them to console
 * Returns success status and error messages in result objects
 */
export const useCommentOperations = () => {
	const projectDataStore = useProjectDataStore();
	const projectStore = useProjectStore();

	const submitComment = async (payload: RawCommentData): Promise<CommentOperationResult> => {
		try {
			const commentData = createCommentDtoByType(payload.commentType, projectDataStore.allCategories, payload);

			await projectDataStore.upsertCommentAsync(commentData, projectStore.getRwServerUrl);
			return { success: true };
		} catch (e) {
			console.error("Failed to submit comment:", e);
			const errorMsg = e instanceof Error ? e.message : String(e);
			return {
				success: false,
				error: errorMsg,
			};
		}
	};

	/**
	 * Delete a comment by ID
	 * Returns result object for UI to handle
	 */
	const deleteComment = async (commentId: string): Promise<CommentOperationResult> => {
		try {
			await projectDataStore.deleteCommentAsync(commentId, projectStore.getRwServerUrl);
			return { success: true };
		} catch (error) {
			console.error("Failed to delete comment:", error);
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
