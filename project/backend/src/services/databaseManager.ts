import { Database } from "@db/sqlite";
import { Project, Repository, ProjectRow, RepositoryRow } from "../models/databaseModels.ts";
import { CategoryDto } from "../models/dtoModels.ts";

class DatabaseManager {
	private db: Database;

	constructor(dbPath: string) {
		this.db = new Database(dbPath);
		this.createTables();
		this.prepopulateCategories();
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
				branch TEXT NOT NULL,
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

			`CREATE TABLE IF NOT EXISTS file_locations (
				identifier INTEGER PRIMARY KEY,
				FOREIGN KEY (identifier) REFERENCES locations(identifier) ON DELETE CASCADE
			)`,

			`CREATE TABLE IF NOT EXISTS project_locations (
				identifier INTEGER PRIMARY KEY,
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

	private prepopulateCategories(): void {
		const predefinedCategories: CategoryDto[] = [
			{
				id: 1,
				label: "Bug",
				description: "A bug in the code",
			},
			{
				id: 2,
				label: "Feature Request",
				description: "A request for a new feature",
			},
			{
				id: 3,
				label: "Documentation",
				description: "Issues related to documentation",
			},
			{
				id: 4,
				label: "Question",
				description: "A question about the code or project",
			},
			{
				id: 5,
				label: "Enhancement",
				description: "An enhancement to existing functionality",
			},
			{
				id: 6,
				label: "Performance",
				description: "Performance-related issues or improvements",
			},
			{
				id: 7,
				label: "Security",
				description: "Security vulnerabilities or concerns",
			},
		];

		const insertStmt = this.db.prepare(`INSERT OR IGNORE INTO categories (label, description) VALUES (?, ?)`);
		for (const category of predefinedCategories) {
			insertStmt.run([category.label, category.description]);
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
		branch: string;
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
				`INSERT INTO projects (version, label, read_api_url, write_api_url) VALUES (?, ?, ?, ?)`
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
				.prepare(`UPDATE projects SET read_api_url = ?, write_api_url = ? WHERE identifier = ?`)
				.run([readApiUrl, writeApiUrl, projectId]);

			// Create the repository
			this.db
				.prepare(
					`INSERT INTO repositories (project_id, type, repo_landing_page_url, branch, \`commit\`, token)
					VALUES (?, ?, ?, ?, ?, ?)`
				)
				.run([
					projectId,
					requestData.repo_type || "git",
					requestData.git_repo_url,
					requestData.branch,
					requestData.commit || "HEAD",
					requestData.token || null,
				]);

			// Fetch the complete project with repository
			const projectRows = this.db.prepare(`SELECT * FROM projects WHERE identifier = ?`).all([projectId]);
			const project = projectRows[0] as ProjectRow;
			const repositoryRows = this.db.prepare(`SELECT * FROM repositories WHERE project_id = ?`).all([projectId]);
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
			const projectRows = this.db.prepare(`SELECT * FROM projects WHERE identifier = ?`).all([projectId]);
			const project = projectRows[0] as ProjectRow;

			if (!project) {
				return null;
			}

			const repositoryRows = this.db.prepare(`SELECT * FROM repositories WHERE project_id = ?`).all([projectId]);
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

	// Expose database connection for services
	public getDb() {
		return this.db;
	}
}

export default DatabaseManager;
