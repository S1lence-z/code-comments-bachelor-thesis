import type CommentDto from "../../../../base/app/types/dtos/comment-dto";
import type CategoryDto from "../../../../base/app/types/dtos/category-dto";

/**
 * Interface for backend providers that handle communication with the server API.
 * Implement this interface to create a custom backend provider (e.g. REST, mock).
 */
export interface BackendProvider {
	/**
	 * Sets the authentication token used for subsequent API requests.
	 * @param token - The authentication token (e.g. JWT)
	 */
	setAuthToken(token: string): void;

	/**
	 * Fetches all comments for the current project.
	 */
	getComments(): Promise<CommentDto[]>;

	/**
	 * Creates a new top-level comment.
	 * @param comment - The comment data to create
	 * @returns The created comment with server-assigned fields (id, timestamps, etc.)
	 */
	addComment(comment: CommentDto): Promise<CommentDto>;

	/**
	 * Updates an existing comment.
	 * @param commentId - The ID of the comment to update
	 * @param comment - The updated comment data
	 */
	updateComment(commentId: string, comment: CommentDto): Promise<CommentDto>;

	/**
	 * Deletes a comment by its ID.
	 * @param commentId - The ID of the comment to delete
	 */
	deleteComment(commentId: string): Promise<void>;

	/**
	 * Creates a reply to an existing comment, forming a thread.
	 * @param parentCommentId - The ID of the comment to reply to
	 * @param comment - The reply comment data
	 */
	replyToComment(parentCommentId: string, comment: CommentDto): Promise<CommentDto>;

	/**
	 * Fetches all comments in a thread starting from the root comment.
	 * @param rootCommentId - The ID of the root comment in the thread
	 */
	getCommentThread(rootCommentId: string): Promise<CommentDto[]>;

	/**
	 * Fetches all available comment categories for the current project.
	 */
	getCategories(): Promise<CategoryDto[]>;
}
