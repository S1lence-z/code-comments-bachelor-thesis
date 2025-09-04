import { CommentType } from "../types/enums/CommentType";
import type CommentDto from "../types/dtos/CommentDto";
import type CategoryDto from "../types/dtos/CategoryDto";

export const getCommentLocationInfoByType = (
	commentType: CommentType,
	startLineNumber: number | null,
	endLineNumber: number | null
) => {
	let commentInfo = "";
	switch (commentType) {
		case CommentType.Multiline:
			commentInfo = `from line ${startLineNumber || 0} to ${endLineNumber || 0}`;
			break;
		case CommentType.Singleline:
			commentInfo = `on line ${startLineNumber || 0}`;
			break;
		case CommentType.File:
			commentInfo = "File/Folder Comment";
			break;
		case CommentType.Project:
			commentInfo = "Whole Project Comment";
			break;
		default:
			commentInfo = "Unknown";
	}
	return commentInfo;
};

export const getCommentsByType = (comments: CommentDto[], commentType: CommentType): CommentDto[] => {
	return comments.filter((comment) => comment.type === commentType);
};

export const groupCommentsByFile = (comments: CommentDto[]): Record<string, CommentDto[]> => {
	return comments.reduce((accumulator, comment) => {
		const filePath = comment.location.filePath || "Unknown";
		if (!accumulator[filePath]) {
			accumulator[filePath] = [];
		}
		accumulator[filePath].push(comment);
		return accumulator;
	}, {} as Record<string, CommentDto[]>);
};

export const sortCommentsByLineNumber = (comments: CommentDto[]): CommentDto[] => {
	return comments.sort((a, b) => {
		const lineA = a.location.lineNumber || 0;
		const lineB = b.location.lineNumber || 0;
		return lineA - lineB;
	});
};

export const getCommentTypeIcon = (type: CommentType) => {
	switch (type) {
		case CommentType.Singleline:
			return "arrow";
		case CommentType.Multiline:
			return "code";
		case CommentType.File:
			return "closedFolder";
		case CommentType.Project:
			return "archive";
		default:
			return "code";
	}
};

export const getCommentLocationInfo = (comment: CommentDto): string => {
	return getCommentLocationInfoByType(
		comment.type,
		comment.location.startLineNumber || comment.location.lineNumber || 0,
		comment.location.endLineNumber || comment.location.lineNumber || 0
	);
};

export const createCommentByType = (
	commentType: CommentType,
	allCategories: CategoryDto[],
	selectedCategoryLabel: string,
	commentId: string | null,
	content: string,
	startLineNumber: number,
	endLineNumber: number,
	commentFilePath: string
): CommentDto => {
	const trimmedContent = content.trim();
	const categoryId = allCategories.find((cat) => cat.label === selectedCategoryLabel)?.id || null;

	switch (commentType) {
		case CommentType.Singleline:
			return {
				id: commentId,
				location: {
					type: CommentType.Singleline,
					id: null,
					filePath: commentFilePath,
					lineNumber: startLineNumber,
				},
				categoryId: categoryId,
				content: trimmedContent,
				type: CommentType.Singleline,
			};
		case CommentType.Multiline:
			return {
				id: commentId,
				location: {
					type: CommentType.Multiline,
					id: null,
					filePath: commentFilePath,
					startLineNumber: startLineNumber,
					endLineNumber: endLineNumber,
				},
				categoryId: categoryId,
				content: trimmedContent,
				type: CommentType.Multiline,
			};
		case CommentType.File:
			return {
				id: commentId,
				location: {
					type: CommentType.File,
					id: null,
					filePath: commentFilePath,
				},
				categoryId: categoryId,
				content: trimmedContent,
				type: CommentType.File,
			};
		case CommentType.Project:
			return {
				id: commentId,
				location: {
					type: CommentType.Project,
					id: null,
					filePath: commentFilePath,
				},
				categoryId: categoryId,
				content: trimmedContent,
				type: CommentType.Project,
			};
		default:
			throw new Error("Invalid comment type.");
	}
};
