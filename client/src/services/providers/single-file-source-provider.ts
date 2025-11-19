import type { ISourceProvider } from "../../types/interfaces/ISourceProvider";
import type { TreeNode } from "../../types/domain/TreeContent";
import type { ProcessedFile } from "../../types/domain/FileContent";
import { providerRegistry } from "../provider-registry";

/**
 * Single File Source Provider implementation of ISourceProvider
 * Fetches a single static JSON file containing the complete tree structure
 * and URLs to individual file contents for lazy loading
 *
 * Expected API Contract:
 *
 * 1. GET {repositoryUrl} (the content.json file)
 *    Returns: { tree: TreeNode[] } - The complete directory structure with file URLs
 *
 * 2. GET {fileUrl} (from TreeNode.fileUrl)
 *    Returns: ProcessedFile - The file content and metadata
 *
 * Both requests should support an optional Authorization header for authentication
 */
export class SingleFileSourceProvider implements ISourceProvider {
	/**
	 * Fetches the repository tree from a static JSON file
	 *
	 * Endpoint: GET {repositoryUrl}
	 * Expected Response: { tree: TreeNode[] }
	 */
	async getRepositoryTree(repositoryUrl: string, _branch: string, authToken?: string): Promise<TreeNode[]> {
		// Set up headers
		const headers: HeadersInit = {
			Accept: "application/json",
		};
		if (authToken) {
			headers["Authorization"] = `Bearer ${authToken}`;
		}

		// Fetch the content.json file
		const response = await fetch(repositoryUrl, { headers });
		if (!response.ok) {
			throw new Error(
				`Failed to load repository tree from Single File Source: ${response.status} ${response.statusText}`
			);
		}

		const data = await response.json();

		// Validate the response structure
		if (!data || !data.tree || !Array.isArray(data.tree)) {
			throw new Error(
				"Invalid tree data received from Single File Source. Expected an object with a 'tree' property containing TreeNode array."
			);
		}

		return data.tree as TreeNode[];
	}

	/**
	 * Fetches and processes a single file from its fileUrl
	 *
	 * Uses the fileUrl from the TreeNode to fetch the file content
	 * Expected Response: ProcessedFile
	 */
	async fetchProcessedFile(
		repositoryUrl: string,
		branch: string,
		filePath: string,
		authToken?: string
	): Promise<ProcessedFile> {
		// First, we need to get the tree to find the fileUrl for this path
		const tree = await this.getRepositoryTree(repositoryUrl, branch, authToken);
		const fileNode = this.findFileInTree(tree, filePath);

		if (!fileNode || !fileNode.fileUrl) {
			throw new Error(`File not found in tree or missing fileUrl: ${filePath}`);
		}

		// Set up headers
		const headers: HeadersInit = {
			Accept: "application/json",
		};
		if (authToken) {
			headers["Authorization"] = `Bearer ${authToken}`;
		}

		// Fetch the file content from the fileUrl
		const response = await fetch(fileNode.fileUrl, { headers });
		if (!response.ok) {
			throw new Error(
				`Failed to load file content for ${filePath} from Single File Source. Error ${response.status}`
			);
		}

		const data = await response.json();

		// Validate the response structure
		if (!data || typeof data !== "object") {
			throw new Error("Invalid file data received from Single File Source. Expected a ProcessedFile object.");
		}

		return data as ProcessedFile;
	}

	/**
	 * Helper method to find a file node in the tree by its path
	 */
	private findFileInTree(tree: TreeNode[], targetPath: string): TreeNode | null {
		for (const node of tree) {
			if (node.path === targetPath) {
				return node;
			}
			if (node.children && node.children.length > 0) {
				const found = this.findFileInTree(node.children, targetPath);
				if (found) return found;
			}
		}
		return null;
	}
}

providerRegistry.register({
	metadata: {
		id: "singleFile",
		name: "Static File",
		requiresAuth: false,
	},
	factory: () => new SingleFileSourceProvider(),
});
