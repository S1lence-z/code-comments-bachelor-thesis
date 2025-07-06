import { CommentDto } from "../models/dtoModels";
import { CommentType } from "../../../shared/enums/CommentType";
import { CategoryDto } from "../models/dtoModels";

export function createCommentDto(
	id: number,
	type: CommentType,
	content: string,
	lineNumber: number,
	startLineNumber: number,
	endLineNumber: number,
	filePath: string,
	categories: CategoryDto[]
): CommentDto {
	switch (type) {
		case CommentType.SingleLine:
			return {
				id: id,
				filePath: filePath,
				content: content,
				type: CommentType.SingleLine,
				lineNumber: lineNumber,
				categories: categories,
			};
		case CommentType.MultiLine:
			return {
				id: id,
				filePath: filePath,
				content: content,
				type: CommentType.MultiLine,
				startLineNumber: startLineNumber,
				endLineNumber: endLineNumber,
				categories: categories,
			};
		case CommentType.File:
			return {
				id: id,
				filePath: filePath,
				content: content,
				type: CommentType.File,
				categories: categories,
			};
		case CommentType.Project:
			return {
				id: id,
				filePath: filePath,
				content: content,
				type: CommentType.Project,
				categories: categories,
			};
	}
}
