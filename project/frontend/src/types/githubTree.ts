export interface TreeNode {
	name: string;
	path: string;
	type: "file" | "folder";
	children: TreeNode[];
	isExpanded: boolean;
}

// For GitHub API response
export interface GitHubTreeItem {
	path: string;
	type: "blob" | "tree" | "commit";
	mode: string;
	sha: string;
	url: string;
	size?: number;
}
