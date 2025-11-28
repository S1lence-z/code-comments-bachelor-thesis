import { type TreeNode, TreeNodeType } from "../types/domain/tree-content";

export const handleToggleExpandInTree = (itemToToggle: TreeNode, treeData: TreeNode[]) => {
	const findAndToggle = (nodes: TreeNode[]): boolean => {
		for (const node of nodes) {
			if (node.path === itemToToggle.path && node.type === TreeNodeType.folder) {
				node.isExpanded = !node.isExpanded;
				return true;
			}
			if (node.children && node.children.length > 0) {
				if (findAndToggle(node.children)) return true;
			}
		}
		return false;
	};

	findAndToggle(treeData);
};
