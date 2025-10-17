import type { ISourceProvider } from "../../types/interfaces/ISourceProvider";
import type { TreeNode } from "../../types/github/githubTree";
import type { ProcessedFile } from "../../types/github/githubFile";

/**
 * HTTP API implementation of ISourceProvider
 * Uses a custom HTTP API endpoint to fetch repository trees and file contents
 *
 * Expected API Contract:
 *
 * 1. GET {baseUrl}/tree?branch={branch}
 *    Returns: TreeNode[] - The complete directory structure
 *
 * 2. GET {baseUrl}/file?branch={branch}&path={filePath}
 *    Returns: ProcessedFile - The file content and metadata
 *
 * Both endpoints should support an optional Authorization header for authentication
 */
export class HttpApiSourceProvider implements ISourceProvider {
	/**
	 * Fetches the repository tree from a custom HTTP API endpoint
	 *
	 * Endpoint: GET {repositoryUrl}/tree?branch={branch}
	 * Expected Response: TreeNode[]
	 */
	async getRepositoryTree(repositoryUrl: string, branch: string, authToken?: string): Promise<TreeNode[]> {
		// Construct the API URL
		const url = new URL(`${repositoryUrl}/tree`);
		url.searchParams.set("branch", branch);

		// Set up headers
		const headers: HeadersInit = {
			Accept: "application/json",
		};
		if (authToken) {
			headers["Authorization"] = `Bearer ${authToken}`;
		}

		// Fetch the repository tree
		const response = await fetch(url.toString(), { headers });
		if (!response.ok) {
			throw new Error(`Failed to load repository tree from HTTP API: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();

		// Validate the response structure
		if (!Array.isArray(data)) {
			throw new Error("Invalid tree data received from HTTP API. Expected an array of TreeNode objects.");
		}

		return data as TreeNode[];
	}

	/**
	 * Fetches and processes a single file from a custom HTTP API endpoint
	 *
	 * Endpoint: GET {repositoryUrl}/file?branch={branch}&path={filePath}
	 * Expected Response: ProcessedFile
	 */
	async fetchProcessedFile(
		repositoryUrl: string,
		branch: string,
		filePath: string,
		authToken?: string
	): Promise<ProcessedFile> {
		// Construct the API URL
		const url = new URL(`${repositoryUrl}/file`);
		url.searchParams.set("branch", branch);
		url.searchParams.set("path", filePath);

		// Set up headers
		const headers: HeadersInit = {
			Accept: "application/json",
		};
		if (authToken) {
			headers["Authorization"] = `Bearer ${authToken}`;
		}

		// Fetch the file content
		const response = await fetch(url.toString(), { headers });
		if (!response.ok) {
			throw new Error(`Failed to load file content for ${filePath} from HTTP API. Error ${response.status}`);
		}

		const data = await response.json();

		// Validate the response structure
		if (!data || typeof data !== "object") {
			throw new Error("Invalid file data received from HTTP API. Expected a ProcessedFile object.");
		}

		return data as ProcessedFile;
	}
}
