import DatabaseManager from "./databaseManager.ts";
import { Project, Repository } from "../models/databaseModels.ts";

class ProjectService {
	constructor(private dbManager: DatabaseManager) {}

	/**
	 * Create a new project with repository
	 */
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
		return this.dbManager.createProject(requestData);
	}

	/**
	 * Get a project by ID
	 */
	public getProjectById(projectId: number): (Project & { repository: Repository }) | null {
		return this.dbManager.getProjectById(projectId);
	}

	/**
	 * Check if a project exists
	 */
	public projectExists(projectId: number): boolean {
		const project = this.dbManager.getProjectById(projectId);
		return project !== null;
	}
}

export default ProjectService;
