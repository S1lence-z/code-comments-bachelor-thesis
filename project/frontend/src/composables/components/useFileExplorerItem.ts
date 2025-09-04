import { useRepositoryStore } from "../../stores/repositoryStore";
import type { TreeNode } from "../../types/github/githubTree";

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

export function useFileExplorerItem(props: FileExplorerItemProps, emit: FileExplorerItemEmits) {
	// Store access
	const repositoryStore = useRepositoryStore();

	// Methods
	const handleItemClick = (): void => {
		if (props.item.type === "file") {
			emit("update:filePath", props.item.path);
		} else if (props.item.type === "folder") {
			emit("toggle-expand-item", props.item);
		}
	};

	const handleToggleExpand = (): void => {
		if (props.item.type === "folder") {
			emit("toggle-expand-item", props.item);
		}
	};

	const handleFileCommentAction = (): void => {
		emit("file-comment-requested", props.item.path);
	};

	return {
		// Store access for template
		repositoryStore,

		// Methods
		handleItemClick,
		handleToggleExpand,
		handleFileCommentAction,
	};
}
