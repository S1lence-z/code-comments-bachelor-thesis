import type { CommentType } from "../enums/CommentType";

export default interface LocationDto {
	id: string | null;
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
