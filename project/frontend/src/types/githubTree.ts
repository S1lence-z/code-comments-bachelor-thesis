export interface TreeNode {
	name: string;
	path: string; // Full path from repo root
	type: "file" | "folder";
	children: TreeNode[];
	isExpanded: boolean; // Manages UI state for folders
}

// For GitHub API response
export interface GitHubTreeItem {
	path: string;
	type: "blob" | "tree" | "commit"; // 'commit' for submodules
	mode: string;
	sha: string;
	url: string;
	size?: number; // for blobs
}
