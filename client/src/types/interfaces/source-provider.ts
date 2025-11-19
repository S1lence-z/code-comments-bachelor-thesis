import type { TreeNode } from "../domain/TreeContent";
import type { ProcessedFile } from "../domain/FileContent";

/**
 * Interface for source code providers (GitHub, Single File, etc.)
 * Implement this interface to create a custom source provider
 */
export interface SourceProvider {
	/**
	 * Fetches the complete file tree/directory structure from the source
	 * @param repositoryUrl - The URL or identifier of the repository/source
	 * @param branch - The branch, version, or snapshot identifier
	 * @param authToken - Optional authentication token (GitHub PAT, API key, etc.)
	 * @returns Promise resolving to an array of TreeNode representing the file structure
	 */
	getRepositoryTree(repositoryUrl: string, branch: string, authToken?: string): Promise<TreeNode[]>;

	/**
	 * Fetches and processes a single file from the source
	 * @param repositoryUrl - The URL or identifier of the repository/source
	 * @param branch - The branch, version, or snapshot identifier
	 * @param filePath - The relative path to the file within the repository
	 * @param authToken - Optional authentication token (GitHub PAT, API key, etc.)
	 * @returns Promise resolving to a ProcessedFile containing the file content and metadata
	 */
	fetchProcessedFile(
		repositoryUrl: string,
		branch: string,
		filePath: string,
		authToken?: string
	): Promise<ProcessedFile>;
}
