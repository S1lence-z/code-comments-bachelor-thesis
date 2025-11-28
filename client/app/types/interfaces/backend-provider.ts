import type CommentDto from "../../../../base/app/types/dtos/comment-dto";
import type CategoryDto from "../../../../base/app/types/dtos/category-dto";

export interface BackendProvider {
	// Configuration
	setAuthToken(token: string): void;

	// Comments
	getComments(): Promise<CommentDto[]>;
	addComment(comment: CommentDto): Promise<CommentDto>;
	updateComment(commentId: string, comment: CommentDto): Promise<CommentDto>;
	deleteComment(commentId: string): Promise<void>;
	replyToComment(parentCommentId: string, comment: CommentDto): Promise<CommentDto>;
	getCommentThread(rootCommentId: string): Promise<CommentDto[]>;

	// Categories
	getCategories(): Promise<CategoryDto[]>;
}
