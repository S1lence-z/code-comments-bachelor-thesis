import { Database } from "@db/sqlite";
import { Project, Repository, ProjectRow, RepositoryRow } from "../models/databaseModels.ts";
import { CommentDto } from "../models/dtoModels.ts";

class DatabaseManager {
	private db: Database;

	constructor(dbPath: string) {
		this.db = new Database(dbPath);
		this.createTables();
	}

	private createTables(): void {
		const tables = [
			`CREATE TABLE IF NOT EXISTS projects (
        identifier INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL DEFAULT 'v1',
        label TEXT NOT NULL DEFAULT 'Test Project',
        read_api_url TEXT NOT NULL,
        write_api_url TEXT
      )`,
			`CREATE TABLE IF NOT EXISTS repositories (
        identifier INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL UNIQUE,
        type TEXT NOT NULL,
        repo_landing_page_url TEXT NOT NULL,
        \`commit\` TEXT NOT NULL,
        token TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(identifier) ON DELETE CASCADE
      )`,

			`CREATE TABLE IF NOT EXISTS locations (
        identifier INTEGER PRIMARY KEY AUTOINCREMENT,
        location_type TEXT NOT NULL,
        file_path TEXT
      )`,

			`CREATE TABLE IF NOT EXISTS line_locations (
        identifier INTEGER PRIMARY KEY,
        line_number INTEGER NOT NULL,
        FOREIGN KEY (identifier) REFERENCES locations(identifier) ON DELETE CASCADE
      )`,

			`CREATE TABLE IF NOT EXISTS line_range_locations (
        identifier INTEGER PRIMARY KEY,
        start_line_number INTEGER NOT NULL,
        end_line_number INTEGER NOT NULL,
        FOREIGN KEY (identifier) REFERENCES locations(identifier) ON DELETE CASCADE
      )`,

			`CREATE TABLE IF NOT EXISTS comments (
        identifier INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        repository_id INTEGER NOT NULL,
        location_id INTEGER NOT NULL UNIQUE,
        content TEXT NOT NULL,
        activity_id INTEGER,
        FOREIGN KEY (project_id) REFERENCES projects(identifier) ON DELETE CASCADE,
        FOREIGN KEY (repository_id) REFERENCES repositories(identifier) ON DELETE CASCADE,
        FOREIGN KEY (location_id) REFERENCES locations(identifier) ON DELETE CASCADE
      )`,

			`CREATE TABLE IF NOT EXISTS categories (
        identifier INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL UNIQUE,
        description TEXT
      )`,

			`CREATE TABLE IF NOT EXISTS comment_categories (
        comment_id INTEGER,
        category_id INTEGER,
        PRIMARY KEY (comment_id, category_id),
        FOREIGN KEY (comment_id) REFERENCES comments(identifier) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(identifier) ON DELETE CASCADE
      )`,

			`CREATE TABLE IF NOT EXISTS activities (
        identifier INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
		];
		for (const table of tables) {
			try {
				this.db.exec(table);
			} catch (error) {
				console.error(`Error creating table: ${error}`);
				throw error;
			}
		}
	}

	private createReadApiUrl(projectId: number, backendBaseUrl: string): string {
		return `${backendBaseUrl}/api/project/${projectId}/comments`;
	}

	private createWriteApiUrl(projectId: number, backendBaseUrl: string): string {
		return `${backendBaseUrl}/api/project/${projectId}/comments`;
	}

	public createProject(requestData: {
		git_repo_url: string;
		repo_type?: string;
		commit?: string;
		token?: string;
		version?: string;
		label?: string;
		backend_base_url: string;
	}): Project & { repository: Repository } {
		const { backend_base_url } = requestData;

		if (!backend_base_url) {
			throw new Error("Backend base URL is required to create project URLs.");
		}
		try {
			// Create the project first
			const projectStmt = this.db.prepare(
				`INSERT INTO projects (version, label, read_api_url, write_api_url) 
         VALUES (?, ?, ?, ?)`
			);
			const _projectResult = projectStmt.run([
				requestData.version || "v1",
				requestData.label || "Test Project",
				"", // Will be updated after we get the ID
				"", // Will be updated after we get the ID
			]);

			const projectId = this.db.lastInsertRowId;

			// Update URLs with the actual project ID
			const readApiUrl = this.createReadApiUrl(projectId, backend_base_url);
			const writeApiUrl = this.createWriteApiUrl(projectId, backend_base_url);

			this.db
				.prepare(
					`UPDATE projects SET read_api_url = ?, write_api_url = ? WHERE identifier = ?`
				)
				.run([readApiUrl, writeApiUrl, projectId]);

			// Create the repository
			this.db
				.prepare(
					`INSERT INTO repositories (project_id, type, repo_landing_page_url, \`commit\`, token)
         VALUES (?, ?, ?, ?, ?)`
				)
				.run([
					projectId,
					requestData.repo_type || "git",
					requestData.git_repo_url,
					requestData.commit || "main",
					requestData.token || null,
				]);

			// Fetch the complete project with repository
			const projectRows = this.db
				.prepare(`SELECT * FROM projects WHERE identifier = ?`)
				.all([projectId]);
			const project = projectRows[0] as ProjectRow;
			const repositoryRows = this.db
				.prepare(`SELECT * FROM repositories WHERE project_id = ?`)
				.all([projectId]);
			const repository = repositoryRows[0] as RepositoryRow;

			return {
				...project,
				repository,
			};
		} catch (error) {
			console.error("Error creating project:", error);
			throw error;
		}
	}

	public getProjectById(projectId: number): (Project & { repository: Repository }) | null {
		try {
			const projectRows = this.db
				.prepare(`SELECT * FROM projects WHERE identifier = ?`)
				.all([projectId]);
			const project = projectRows[0] as ProjectRow;

			if (!project) {
				return null;
			}

			const repositoryRows = this.db
				.prepare(`SELECT * FROM repositories WHERE project_id = ?`)
				.all([projectId]);
			const repository = repositoryRows[0] as RepositoryRow;

			return {
				...project,
				repository,
			};
		} catch (error) {
			console.error("Error getting project:", error);
			throw error;
		}
	}

	public getCommentsByProjectId(projectId: number): Array<{
		content: string;
		filePath: string;
		lineNumber: number | null;
		startLineNumber: number | null;
		endLineNumber: number | null;
		locationType: string;
	}> {
		try {
			const comments = this.db
				.prepare(
					`SELECT 
						c.content as content,
						l.file_path as filePath,
						l.location_type as locationType,
						ll.line_number as lineNumber,
						lrl.start_line_number as startLineNumber,
						lrl.end_line_number as endLineNumber
						FROM comments c
						JOIN locations l ON c.location_id = l.identifier
						LEFT JOIN line_locations ll ON l.identifier = ll.identifier AND l.location_type = 'line'
						LEFT JOIN line_range_locations lrl ON l.identifier = lrl.identifier AND l.location_type = 'line_range'
						WHERE c.project_id = ? AND l.location_type IN ('line', 'line_range')
					`
				)
				.all([projectId]) as Array<{
				content: string;
				filePath: string;
				lineNumber: number | null;
				startLineNumber: number | null;
				endLineNumber: number | null;
				locationType: string;
			}>;
			return comments;
		} catch (error) {
			console.error("Error getting comments:", error);
			throw error;
		}
	}

	public addComment(projectId: number, commentData: CommentDto): void {
		try {
			// Get repository for this project
			const repositoryRows = this.db
				.prepare(`SELECT identifier FROM repositories WHERE project_id = ?`)
				.all([projectId]);

			if (repositoryRows.length === 0) {
				throw new Error(`No repository found for project ${projectId}`);
			}

			const repository = repositoryRows[0]; // Create location
			const locationStmt = this.db.prepare(
				`INSERT INTO locations (location_type, file_path) VALUES (?, ?)`
			);
			const _locationResult = locationStmt.run(["line", commentData.filePath]);

			const locationId = this.db.lastInsertRowId; // Create line location
			this.db
				.prepare(`INSERT INTO line_locations (identifier, line_number) VALUES (?, ?)`)
				.run([locationId, commentData.lineNumber]);

			// Create comment
			this.db
				.prepare(
					`INSERT INTO comments (project_id, repository_id, location_id, content)
         VALUES (?, ?, ?, ?)`
				)
				.run([projectId, repository.identifier, locationId, commentData.content]);
		} catch (error) {
			console.error("Error adding comment:", error);
			throw error;
		}
	}

	public close(): void {
		this.db.close();
	}

	// Health check method
	public isConnected(): boolean {
		try {
			const result = this.db.prepare("SELECT 1").all();
			return Array.isArray(result);
		} catch (error) {
			console.error("Database health check failed:", error);
			return false;
		}
	}

	// Get database statistics
	public getStats(): { projectCount: number; commentCount: number; repositoryCount: number } {
		try {
			const projectCount =
				this.db.prepare("SELECT COUNT(*) as count FROM projects").all()[0]?.count || 0;
			const commentCount =
				this.db.prepare("SELECT COUNT(*) as count FROM comments").all()[0]?.count || 0;
			const repositoryCount =
				this.db.prepare("SELECT COUNT(*) as count FROM repositories").all()[0]?.count || 0;

			return {
				projectCount: Number(projectCount),
				commentCount: Number(commentCount),
				repositoryCount: Number(repositoryCount),
			};
		} catch (error) {
			console.error("Error getting database stats:", error);
			return { projectCount: 0, commentCount: 0, repositoryCount: 0 };
		}
	}
}

export default DatabaseManager;
