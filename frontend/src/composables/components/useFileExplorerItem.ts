import { useProjectDataStore } from "../../stores/projectDataStore";
import { type TreeNode, TreeNodeType } from "../../types/github/githubTree";

export interface FileExplorerItemProps {
	item: TreeNode;
	filePath: string | null;
	depth?: number;
}

export interface FileExplorerItemEmits {
	(event: "update:filePath", value: string | null): void;
	(event: "toggle-expand-item", item: TreeNode): void;
	(event: "file-comment-requested", filePath: string): void;
}

export function useFileExplorerItem(emit: FileExplorerItemEmits) {
	// Store access
	const projectDataStore = useProjectDataStore();

	// Methods
	const fileContainsComments = (filePath: string): boolean => {
		return projectDataStore.fileContainsComments(filePath);
	};

	const handleItemClick = (item: TreeNode): void => {
		if (item.type === TreeNodeType.file) {
			emit("update:filePath", item.path);
		} else if (item.type === TreeNodeType.folder) {
			emit("toggle-expand-item", item);
		}
	};

	const handleToggleExpand = (item: TreeNode): void => {
		if (item.type === TreeNodeType.folder) {
			emit("toggle-expand-item", item);
		}
	};

	return {
		handleItemClick,
		handleToggleExpand,
		fileContainsComments,
	};
}
