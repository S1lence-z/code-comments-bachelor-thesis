import { CommentDto } from "../models/dtoModels.ts";
import { GetCommentsResponse } from "../models/responseModels.ts";
import DatabaseManager from "../services/databaseManager.ts";
import { createCommentDto } from "../utils/comments.ts";

export default class CommentsController {
	public static getComments(dbManager: DatabaseManager, projectId: number): GetCommentsResponse {
		const project = dbManager.getProjectById(projectId);
		if (!project) {
			throw new Error("Project not found");
		}

		const commentsData: CommentDto[] = dbManager.getCommentsByProjectId(projectId);

		const commentDtos: CommentDto[] = commentsData.map((comment) =>
			createCommentDto(
				comment.id,
				comment.type,
				comment.content,
				comment.lineNumber ? comment.lineNumber : 0,
				comment.startLineNumber ? comment.startLineNumber : 0,
				comment.endLineNumber ? comment.endLineNumber : 0,
				comment.filePath,
				comment.categories || []
			)
		);

		return {
			repository: {
				identifier: project.repository.identifier,
				type: project.repository.type,
				repoLandingPageUrl: project.repository.repo_landing_page_url,
			},
			comments: commentDtos,
		};
	}

	public static addComment(
		dbManager: DatabaseManager,
		projectId: number,
		newComment: CommentDto
	): void {
		dbManager.addComment(projectId, newComment);
	}

	public static deleteComment(
		dbManager: DatabaseManager,
		projectId: number,
		commentId: number
	): void {
		dbManager.deleteComment(projectId, commentId);
	}
}
