import type { RepositoryProvider } from "../../types/interfaces/repository-provider";
import type { TreeNode } from "../../types/domain/tree-content";
import type { ProcessedFile } from "../../types/domain/file-content";
import { repositoryProviderRegistry } from "../repository-provider-registry";
import { RepositoryType } from "../../../../base/app/types/repository-type";

/**
 * Single File Repository Provider implementation of RepositoryProvider
 * Fetches a single static JSON file containing the complete tree structure
 * and serves individual file contents from the same base URL
 *
 * Both requests support an optional Authorization header for authentication
 */
export class SingleFileRepositoryProvider implements RepositoryProvider {
	/**
	 * Fetches the repository tree from a static JSON file
	 *
	 * Endpoint: GET {repositoryUrl}
	 * Expected Response: { tree: TreeNode[] }
	 */
	async getRepositoryTree(
		repositoryUrl: string,
		branch: string,
		authToken?: string
	): Promise<TreeNode[]> {
		const headers: HeadersInit = {
			Accept: "application/json",
		};
		if (authToken) {
			headers["Authorization"] = `Bearer ${authToken}`;
		}
		const response = await fetch(repositoryUrl, { headers });
		const data = await response.json();
		if (!data || !data.tree || !Array.isArray(data.tree)) {
			throw new Error(
				data.message
					? data.message
					: "Invalid tree data received from Single File Repository."
			);
		}
		return data.tree as TreeNode[];
	}

	/**
	 * Fetches and processes a single file by deriving its URL from the repository base URL
	 *
	 * Endpoint: GET {baseUrl}/{filePath}
	 * Expected Response: ProcessedFile
	 */
	async fetchProcessedFile(
		repositoryUrl: string,
		branch: string,
		filePath: string,
		authToken?: string
	): Promise<ProcessedFile> {
		const baseUrl = repositoryUrl.substring(0, repositoryUrl.lastIndexOf("/"));
		const fileContentUrl = `${baseUrl}/${filePath}`;

		const headers: HeadersInit = {
			Accept: "application/json",
		};
		if (authToken) {
			headers["Authorization"] = `Bearer ${authToken}`;
		}

		const response = await fetch(fileContentUrl, { headers });
		if (!response.ok) {
			throw new Error(
				`Failed to load file content for ${filePath} from Single File Repository. Error ${response.status}`
			);
		}

		const data = await response.json();
		if (!data || typeof data !== "object") {
			throw new Error(
				"Invalid file data received from Single File Repository. Expected a ProcessedFile object."
			);
		}

		return data as ProcessedFile;
	}
}

repositoryProviderRegistry.register({
	metadata: {
		id: RepositoryType.singleFile,
		name: "Static File",
		requiresAuth: false,
	},
	factory: () => new SingleFileRepositoryProvider(),
});
