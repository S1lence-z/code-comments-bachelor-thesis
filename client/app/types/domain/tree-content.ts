export enum TreeNodeType {
	file = "file",
	folder = "folder",
}

export interface TreeNode {
	name: string;
	path: string;
	type: TreeNodeType;
	previewUrl?: string;
	children: TreeNode[];
	isExpanded: boolean;
}
