import { CommentDto } from "../models/dtoModels.ts";
import { GetCommentsResponse } from "../models/responseModels.ts";
import DatabaseManager from "../services/databaseManager.ts";

export default class CommentsController {
	public static getComments(dbManager: DatabaseManager, projectId: number): GetCommentsResponse {
		const project = dbManager.getProjectById(projectId);
		if (!project) {
			throw new Error("Project not found");
		}

		const comments = dbManager.getCommentsByProjectId(projectId);
		console.log("CommentsController.getComments: Comments:", comments);
		return {
			repository: {
				identifier: project.repository.identifier,
				type: project.repository.type,
				repoLandingPageUrl: project.repository.repo_landing_page_url,
			},
			comments,
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
