import { CommentDto } from "../models/dtoModels.ts";
import { GetCommentsResponse } from "../models/responseModels.ts";
import CommentsService from "../services/commentsService.ts";
import ProjectService from "../services/projectService.ts";
import { createCommentDto } from "../utils/comments.ts";

export default class CommentsController {
	public static getComments(
		commentsService: CommentsService,
		projectService: ProjectService,
		projectId: number
	): GetCommentsResponse {
		const project = projectService.getProjectById(projectId);
		if (!project) {
			throw new Error("Project not found");
		}

		const commentsData: CommentDto[] = commentsService.getCommentsByProjectId(projectId);

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
				branch: project.repository.branch,
			},
			comments: commentDtos,
		};
	}

	public static addComment(commentsService: CommentsService, projectId: number, newComment: CommentDto): void {
		commentsService.addComment(projectId, newComment);
	}

	public static deleteComment(commentsService: CommentsService, projectId: number, commentId: number): void {
		commentsService.deleteComment(projectId, commentId);
	}
}
