export enum TreeNodeType {
	file = "file",
	folder = "folder",
}

export interface TreeNode {
	name: string;
	path: string;
	type: TreeNodeType;
	children: TreeNode[];
	isExpanded: boolean;
}
