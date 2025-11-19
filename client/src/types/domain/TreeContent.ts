export enum TreeNodeType {
	file = "file",
	folder = "folder",
}

// TODO: clarify the difference between fileUrl and previewUrl
export interface TreeNode {
	name: string;
	path: string;
	type: TreeNodeType;
	fileUrl?: string;
	previewUrl?: string;
	children: TreeNode[];
	isExpanded: boolean;
}
