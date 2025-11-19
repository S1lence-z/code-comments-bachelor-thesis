import type { SourceProvider } from "../../types/interfaces/source-provider";
import type { TreeNode } from "../../types/domain/TreeContent";
import { TreeNodeType } from "../../types/domain/TreeContent";
import { type ProcessedFile } from "../../types/domain/FileContent";
import { type GithubTreeItem, GithubTreeItemType } from "../../types/github/TreeContent";
import type { GithubFileContentResponse } from "../../types/github/FileContent";
import { FileDisplayType } from "../../types/domain/FileContent";
import { providerRegistry } from "../provider-registry";

/**
 * GitHub implementation of ISourceProvider
 * Uses GitHub REST API to fetch repository trees and file contents
 */
export class GithubSourceProvider implements SourceProvider {
	private buildFileTreeFromGitHub(gitHubItems: GithubTreeItem[]): TreeNode[] {
		const rootNodes: TreeNode[] = [];
		const map: { [path: string]: TreeNode } = {};

		const sortedItems = [...gitHubItems].sort((a, b) => a.path.localeCompare(b.path));

		sortedItems.forEach((item) => {
			if (item.type === GithubTreeItemType.commit) return;

			const parts = item.path.split("/");
			const itemName = parts[parts.length - 1];
			const parentPath = parts.slice(0, -1).join("/");

			const node: TreeNode = {
				name: itemName,
				path: item.path,
				type: item.type === GithubTreeItemType.blob ? TreeNodeType.file : TreeNodeType.folder,
				children: [],
				isExpanded: item.type === GithubTreeItemType.tree && parts.length === 1, // Expand top-level folders by default
			};
			map[item.path] = node;

			if (parentPath && map[parentPath]) {
				map[parentPath].children.push(node);
				map[parentPath].children.sort((a, b) => {
					if (a.type === TreeNodeType.folder && b.type === TreeNodeType.file) return -1;
					if (a.type === TreeNodeType.file && b.type === TreeNodeType.folder) return 1;
					return a.name.localeCompare(b.name);
				});
			} else {
				rootNodes.push(node);
			}
		});

		rootNodes.sort((a, b) => {
			if (a.type === TreeNodeType.folder && b.type === TreeNodeType.file) return -1;
			if (a.type === TreeNodeType.file && b.type === TreeNodeType.folder) return 1;
			return a.name.localeCompare(b.name);
		});
		return rootNodes;
	}

	private base64ToBlobUrl(base64Data: string, mimeType: string): string | null {
		if (!base64Data) return null;
		try {
			const sanitized = base64Data.replace(/\s/g, "");
			const byteCharacters = atob(sanitized);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const blob = new Blob([byteArray], { type: mimeType });
			return URL.createObjectURL(blob);
		} catch (error) {
			console.error("Failed to create blob URL from base64 data", error);
			return null;
		}
	}

	private processFileContent(file: GithubFileContentResponse): ProcessedFile {
		const { name, content, download_url: downloadUrl } = file;
		let displayType: FileDisplayType = FileDisplayType.Text;
		let fileContent: string | null = null;
		let previewUrl: string | null = downloadUrl;

		if (name.endsWith(".jpg") || name.endsWith(".png")) {
			displayType = FileDisplayType.Image;
			previewUrl = downloadUrl;
		} else if (name.endsWith(".pdf")) {
			displayType = FileDisplayType.PDF;
			previewUrl = content ? this.base64ToBlobUrl(content, "application/pdf") : downloadUrl;
		} else if (!content) {
			displayType = FileDisplayType.Binary;
			previewUrl = null;
		} else {
			// Github API returns base64 encoded content for text files
			const decoded = atob(content.replace(/\s/g, ""));
			const bytes = new Uint8Array(decoded.length);
			for (let i = 0; i < decoded.length; i++) {
				bytes[i] = decoded.charCodeAt(i);
			}
			fileContent = new TextDecoder("utf-8").decode(bytes);
			previewUrl = null;
		}

		return {
			displayType,
			content: fileContent,
			downloadUrl: downloadUrl,
			previewUrl,
			fileName: name,
		};
	}

	async getRepositoryTree(repositoryUrl: string, branch: string, authToken?: string): Promise<TreeNode[]> {
		const url = new URL(repositoryUrl);
		// Extract owner and repo name from URL
		const [owner, repo] = url.pathname.split("/").filter(Boolean);
		if (!owner || !repo) {
			throw new Error("Invalid GitHub repository URL for API construction.");
		}
		// Construct the API URL
		const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

		const headers: HeadersInit = {
			Accept: "application/vnd.github.v3+json",
		};
		if (authToken) {
			headers["Authorization"] = `Bearer ${authToken}`;
		}

		// Fetch the repository tree from GitHub API
		const response = await fetch(`${apiBase}/git/trees/${branch}?recursive=1`, {
			headers,
		});
		if (!response.ok) {
			throw new Error(`Failed to load repo tree: ${response.status} ${response.statusText}`);
		}
		const data = await response.json();
		if (!data.tree || !Array.isArray(data.tree)) {
			throw new Error("Invalid tree data received from GitHub API.");
		}
		return this.buildFileTreeFromGitHub(data.tree as GithubTreeItem[]);
	}

	async fetchProcessedFile(
		repositoryUrl: string,
		branch: string,
		filePath: string,
		authToken?: string
	): Promise<ProcessedFile> {
		// Validate and parse the repository URL
		const url = new URL(repositoryUrl);
		const [owner, repo] = url.pathname.split("/").filter(Boolean);
		if (!owner || !repo) {
			throw new Error("Invalid GitHub repository URL for API construction.");
		}

		// Construct the API call
		const contentUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
		const headers: HeadersInit = {
			Accept: "application/vnd.github+json",
		};
		if (authToken) {
			headers["Authorization"] = `Bearer ${authToken}`;
		}

		// Fetch the file content
		const response = await fetch(contentUrl, { headers });
		if (!response.ok) {
			throw new Error(`Failed to load file content for ${filePath}. Error ${response.status}`);
		}
		const responseData: GithubFileContentResponse = await response.json();
		const processedFile = this.processFileContent(responseData);
		return processedFile;
	}
}

// Register the GithubSourceProvider
providerRegistry.register({
	metadata: {
		id: "github",
		name: "GitHub",
		requiresAuth: false,
	},
	factory: () => new GithubSourceProvider(),
});
