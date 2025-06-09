import { CommentType } from "../enums/CommentType.ts";

export default interface ICommentDto {
	id: number; // Unique identifier for the comment
	filePath: string; // Path to the file where the comment is located
	content: string; // The actual content of the comment
	type: CommentType; // Type of the comment
	lineNumber?: number; // Line number in the file where the comment is placed
	startLineNumber?: number; // Optional start line number for multi-line comments
	endLineNumber?: number; // Optional end line number for multi-line comments
	categories?: string[]; // Optional categories associated with the comment for categorization or filtering
}
