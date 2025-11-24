import type { CommentType } from "../dtos/comment-type";

export default interface RawCommentData {
	id: string | null;
	commentType: CommentType;
	categoryId: string;
	filePath: string;
	content: string;
	startLineNumber: number;
	endLineNumber: number;
}
