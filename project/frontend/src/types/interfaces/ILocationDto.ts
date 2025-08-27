import type { CommentType } from "../enums/CommentType";

export default interface ILocationDto {
	id: string;
	type: CommentType;
	filePath: string;
	// Singleline
	lineNumber?: number;
	// Multiline
	startLineNumber?: number;
	endLineNumber?: number;
	// File and Project
	description?: string;
}
