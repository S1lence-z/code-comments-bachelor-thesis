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
		case CommentType.Singleline:
			return {
				id: id,
				filePath: filePath,
				content: content,
				type: CommentType.Singleline,
				lineNumber: lineNumber,
				categories: categories,
			};
		case CommentType.Multiline:
			return {
				id: id,
				filePath: filePath,
				content: content,
				type: CommentType.Multiline,
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
