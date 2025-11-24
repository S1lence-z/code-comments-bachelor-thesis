import { CommentType } from "../types/dtos/comment-type";
import type CommentDto from "../types/dtos/comment-dto";
import type RawCommentData from "../types/domain/raw-comment-data";
import type CategoryDto from "../types/dtos/category-dto";

export const getCommentLocationInfoByType = (
	commentType: CommentType,
	startLineNumber?: number,
	endLineNumber?: number
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
			return "mdi:chevron-right";
		case CommentType.Multiline:
			return "mdi:code-tags";
		case CommentType.File:
			return "mdi:folder";
		case CommentType.Project:
			return "mdi:archive";
		default:
			return "mdi:code-tags";
	}
};

export const getCommentLocationInfo = (comment: CommentDto): string => {
	return getCommentLocationInfoByType(
		comment.type,
		comment.location.startLineNumber || comment.location.lineNumber || 0,
		comment.location.endLineNumber || comment.location.lineNumber || 0
	);
};

export const createCommentDtoByType = (
	commentType: CommentType,
	allCategories: CategoryDto[],
	commentData: RawCommentData
): CommentDto => {
	const trimmedContent = commentData.content.trim();
	const categoryId = allCategories.find((cat) => cat.id === commentData.categoryId)?.id || null;

	if (!trimmedContent) {
		throw new Error("Comment content cannot be empty.");
	}

	if (!categoryId && commentType !== CommentType.Project && commentType !== CommentType.File) {
		throw new Error("Invalid category selected.");
	}

	switch (commentType) {
		case CommentType.Singleline:
			return {
				id: commentData.id,
				location: {
					type: CommentType.Singleline,
					id: null,
					filePath: commentData.filePath,
					lineNumber: commentData.startLineNumber,
				},
				parentCommentId: null,
				rootCommentId: null,
				categoryId: categoryId,
				content: trimmedContent,
				type: CommentType.Singleline,
			};
		case CommentType.Multiline:
			return {
				id: commentData.id,
				location: {
					type: CommentType.Multiline,
					id: null,
					filePath: commentData.filePath,
					startLineNumber: commentData.startLineNumber,
					endLineNumber: commentData.endLineNumber,
				},
				parentCommentId: null,
				rootCommentId: null,
				categoryId: categoryId,
				content: trimmedContent,
				type: CommentType.Multiline,
			};
		case CommentType.File:
			return {
				id: commentData.id,
				location: {
					type: CommentType.File,
					id: null,
					filePath: commentData.filePath,
				},
				parentCommentId: null,
				rootCommentId: null,
				categoryId: categoryId,
				content: trimmedContent,
				type: CommentType.File,
			};
		case CommentType.Project:
			return {
				id: commentData.id,
				location: {
					type: CommentType.Project,
					id: null,
					filePath: commentData.filePath,
				},
				parentCommentId: null,
				rootCommentId: null,
				categoryId: categoryId,
				content: trimmedContent,
				type: CommentType.Project,
			};
		default:
			throw new Error("Invalid comment type.");
	}
};
