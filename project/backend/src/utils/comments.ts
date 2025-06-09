import { CommentDto } from "../models/dtoModels.ts";
import { CommentType } from "../../../shared/enums/CommentType.ts";

export function createCommentDto(
	id: number,
	type: CommentType,
	content: string,
	lineNumber: number,
	startLineNumber: number,
	endLineNumber: number,
	filePath: string
): CommentDto {
	switch (type) {
		case CommentType.SingleLine:
			return {
				id: id,
				filePath: filePath,
				content: content,
				type: CommentType.SingleLine,
				lineNumber: lineNumber,
			};
		case CommentType.MultiLine:
			return {
				id: id,
				filePath: filePath,
				content: content,
				type: CommentType.MultiLine,
				startLineNumber: startLineNumber,
				endLineNumber: endLineNumber,
			};
	}
}
