import { CommentType } from "../types/enums/CommentType";
import type ICommentDto from "../types/interfaces/ICommentDto";

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

export const getCommentsByType = (comments: ICommentDto[], commentType: CommentType): ICommentDto[] => {
	return comments.filter((comment) => comment.type === commentType);
};

export const groupCommentsByFile = (comments: ICommentDto[]): Record<string, ICommentDto[]> => {
	return comments.reduce((accumulator, comment) => {
		const filePath = comment.location.filePath || "Unknown";
		if (!accumulator[filePath]) {
			accumulator[filePath] = [];
		}
		accumulator[filePath].push(comment);
		return accumulator;
	}, {} as Record<string, ICommentDto[]>);
};

export const sortCommentsByLineNumber = (comments: ICommentDto[]): ICommentDto[] => {
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

export const getCommentLocationInfo = (comment: ICommentDto): string => {
	return getCommentLocationInfoByType(
		comment.type,
		comment.location.startLineNumber || comment.location.lineNumber || 0,
		comment.location.endLineNumber || comment.location.lineNumber || 0
	);
};
