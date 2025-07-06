import DatabaseManager from "./databaseManager";
import { CommentDto, CategoryDto } from "../models/dtoModels";
import { CommentType } from "../../../shared/enums/CommentType";

class CommentsService {
	constructor(private dbManager: DatabaseManager) {}

	/**
	 * Add a new comment to a project
	 */
	public addComment(projectId: number, commentData: CommentDto): void {
		try {
			const db = this.dbManager.getDb();
			// Get repository for this project
			const repositoryRows = db
				.prepare(`SELECT identifier FROM repositories WHERE project_id = ?`)
				.all(projectId) as { identifier: string }[];

			if (repositoryRows.length === 0) {
				throw new Error(`No repository found for project ${projectId}`);
			}

			const repository = repositoryRows[0];

			const locationId = this.createLocationByCommentType(
				commentData.type,
				commentData.filePath,
				commentData.lineNumber,
				commentData.startLineNumber,
				commentData.endLineNumber
			);

			// Create comment
			const commentResult = db
				.prepare(`INSERT INTO comments (project_id, repository_id, location_id, content) VALUES (?, ?, ?, ?)`)
				.run(projectId, repository.identifier, locationId, commentData.content);
			const commentId = Number(commentResult.lastInsertRowid);

			// Assign categories to the comment
			if (commentData.categories && commentData.categories.length > 0) {
				for (const category of commentData.categories) {
					this.assignCategoryToComment(commentId, category.id);
				}
			}
		} catch (error) {
			console.error("Error adding comment:", error);
			throw error;
		}
	}

	/**
	 * Get all comments for a specific project
	 */
	public getCommentsByProjectId(projectId: number): CommentDto[] {
		try {
			const db = this.dbManager.getDb();
			const comments = db
				.prepare(
					`SELECT 
						c.identifier as id,
						c.content as content,
						l.file_path as filePath,
						l.location_type as type,
						ll.line_number as lineNumber,
						lrl.start_line_number as startLineNumber,
						lrl.end_line_number as endLineNumber
						FROM comments c
						JOIN locations l ON c.location_id = l.identifier
						LEFT JOIN line_locations ll ON l.identifier = ll.identifier AND l.location_type = 'line'
						LEFT JOIN line_range_locations lrl ON l.identifier = lrl.identifier AND l.location_type = 'multiline'
						LEFT JOIN file_locations fl ON l.identifier = fl.identifier AND l.location_type = 'file'
						LEFT JOIN project_locations pl ON l.identifier = pl.identifier AND l.location_type = 'project'
						WHERE c.project_id = ? AND l.location_type IN ('line', 'multiline', 'file', 'project')`
				)
				.all(projectId) as CommentDto[];

			for (const comment of comments) {
				comment.categories = this.getCommentCategories(comment.id);
			}

			return comments;
		} catch (error) {
			console.error("Error getting comments:", error);
			throw error;
		}
	}

	private getCommentCategories(commentId: number): CategoryDto[] {
		try {
			const db = this.dbManager.getDb();
			const categoryRows = db
				.prepare(
					`SELECT c.identifier as id, c.label, c.description 
					FROM categories c 
					JOIN comment_categories cc ON c.identifier = cc.category_id 
					WHERE cc.comment_id = ?`
				)
				.all(commentId) as CategoryDto[];

			return categoryRows;
		} catch (error) {
			console.error("Error getting comment categories:", error);
			throw error;
		}
	}

	private assignCategoryToComment(commentId: number, categoryId: number): void {
		const db = this.dbManager.getDb();
		db.prepare(`INSERT INTO comment_categories (comment_id, category_id) VALUES (?, ?)`).run(commentId, categoryId);
	}

	private createLocationByCommentType(
		type: CommentType,
		filePath: string,
		lineNumber?: number,
		startLineNumber?: number,
		endLineNumber?: number
	): number {
		try {
			const db = this.dbManager.getDb();
			const locationStmt = db.prepare(`INSERT INTO locations (location_type, file_path) VALUES (?, ?)`);
			const locationResult = locationStmt.run(type, filePath);

			// TODO: not concurrent safe, but we don't need it for now
			const locationId = Number(locationResult.lastInsertRowid);

			switch (type) {
				case CommentType.SingleLine:
					db.prepare(`INSERT INTO line_locations (identifier, line_number) VALUES (?, ?)`).run(
						locationId,
						lineNumber
					);
					break;
				case CommentType.MultiLine:
					db.prepare(
						`INSERT INTO line_range_locations (identifier, start_line_number, end_line_number) VALUES (?, ?, ?)`
					).run(locationId, startLineNumber, endLineNumber);
					break;
				case CommentType.File:
					db.prepare(`INSERT INTO file_locations (identifier) VALUES (?)`).run(locationId);
					break;
				case CommentType.Project:
					db.prepare(`INSERT INTO project_locations (identifier) VALUES (?)`).run(locationId);
					break;
			}

			return locationId;
		} catch (error) {
			console.error("Error inserting location:", error);
			throw error;
		}
	}

	/**
	 * Delete a comment from a project
	 * This will also delete the associated location and any line locations or line range locations
	 */
	public deleteComment(projectId: number, commentId: number): void {
		try {
			const db = this.dbManager.getDb();
			// Check if the project exists
			const project = this.dbManager.getProjectById(projectId);
			if (!project) {
				throw new Error(`Project with ID ${projectId} does not exist.`);
			}

			// Get the location_id before deleting the comment
			const commentRows = db
				.prepare(`SELECT location_id FROM comments WHERE identifier = ? AND project_id = ?`)
				.all(commentId, projectId) as { location_id: number }[];

			if (commentRows.length === 0) {
				throw new Error(`Comment with ID ${commentId} does not exist in project ${projectId}.`);
			}

			const locationId = commentRows[0].location_id;

			// Delete the comment first
			db.prepare(`DELETE FROM comments WHERE identifier = ? AND project_id = ?`).run(commentId, projectId);

			// Delete the associated location (this will cascade to line_locations/line_range_locations)
			this.deleteLocation(locationId);
		} catch (error) {
			console.error("Error deleting comment:", error);
			throw error;
		}
	}

	private deleteLocation(locationId: number): void {
		try {
			const db = this.dbManager.getDb();
			db.prepare(`DELETE FROM locations WHERE identifier = ?`).run(locationId);
		} catch (error) {
			console.error("Error deleting location:", error);
			throw error;
		}
	}

	/**
	 * Update an existing comment
	 */
	public updateComment(projectId: number, commentId: number, updatedComment: CommentDto): void {
		const db = this.dbManager.getDb();

		// Check if the project exists
		const project = this.dbManager.getProjectById(projectId);
		if (!project) {
			throw new Error(`Project with ID ${projectId} does not exist.`);
		}

		// Check if the comment exists
		const comment = db
			.prepare(`SELECT * FROM comments WHERE identifier = ? AND project_id = ?`)
			.get(commentId, projectId);
		if (!comment) {
			throw new Error(`Comment with ID ${commentId} does not exist in project ${projectId}.`);
		}

		// Update the comment
		db.prepare(`UPDATE comments SET content = ? WHERE identifier = ? AND project_id = ?`).run(
			updatedComment.content,
			commentId,
			projectId
		);
	}
}

export default CommentsService;
