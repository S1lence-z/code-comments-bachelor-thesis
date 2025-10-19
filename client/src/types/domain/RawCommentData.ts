import type { CommentType } from "../dtos/CommentType";

export default interface RawCommentData {
	id: string | null;
	commentType: CommentType;
	categoryLabel: string;
	filePath: string;
	content: string;
	startLineNumber: number;
	endLineNumber: number;
}
