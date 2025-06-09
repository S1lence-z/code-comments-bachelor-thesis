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

		const commentsData: Readonly<
			Array<{
				content: string;
				filePath: string;
				lineNumber: number | null;
				startLineNumber: number | null;
				endLineNumber: number | null;
				locationType: string;
			}>
		> = dbManager.getCommentsByProjectId(projectId);

		const commentDtos: CommentDto[] = commentsData.map((comment) =>
			createCommentDto(
				comment.locationType,
				comment.content,
				comment.lineNumber,
				comment.startLineNumber,
				comment.endLineNumber,
				comment.filePath
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
}
