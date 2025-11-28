export enum GithubTreeItemType {
	blob = "blob",
	tree = "tree",
	commit = "commit",
}

export interface GithubTreeItem {
	path: string;
	type: GithubTreeItemType;
	mode: string;
	sha: string;
	url: string;
	size?: number;
}
