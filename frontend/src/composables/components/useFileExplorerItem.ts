import { useProjectDataStore } from "../../stores/projectDataStore";
import { type TreeNode, TreeNodeType } from "../../types/github/githubTree";

export interface FileExplorerItemProps {
	item: TreeNode;
	filePath: string | null;
	depth: number;
}

export interface FileExplorerItemEmits {
	(event: "update:filePath", value: string | null): void;
	(event: "toggle-expand-item", item: TreeNode): void;
	(event: "file-comment-requested", filePath: string): void;
}

export function useFileExplorerItem(props: FileExplorerItemProps, emit: FileExplorerItemEmits) {
	// Store access
	const projectDataStore = useProjectDataStore();

	// Methods
	const fileContainsComments = (filePath: string): boolean => {
		return projectDataStore.fileContainsComments(filePath);
	};

	const handleItemClick = (): void => {
		if (props.item.type === TreeNodeType.file) {
			emit("update:filePath", props.item.path);
		} else if (props.item.type === TreeNodeType.folder) {
			emit("toggle-expand-item", props.item);
		}
	};

	const handleToggleExpand = (): void => {
		if (props.item.type === TreeNodeType.folder) {
			emit("toggle-expand-item", props.item);
		}
	};

	return {
		handleItemClick,
		handleToggleExpand,
		fileContainsComments,
	};
}
