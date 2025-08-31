import { CommentType } from "../types/enums/CommentType";

export const getCommentLocationInfoByType = (
	commentType: CommentType,
	startLineNumber: number | null,
	endLineNumber: number | null
) => {
	if (commentType === CommentType.Project) return "Project-wide Comment";

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
		default:
			commentInfo = "";
	}
	return commentInfo;
};
