import { type TreeNode, TreeNodeType } from "../../types/domain/tree-content";

export interface FileExplorerItemProps {
	currentNode: TreeNode;
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
	const projectDataStore = useProjectDataStore();

	// Methods
	const fileContainsAnyComments = (filePath: string): boolean => {
		return projectDataStore.fileContainsComments(filePath);
	};

	const fileContainsFileComment = (filePath: string): boolean => {
		return projectDataStore.fileContainsFileComment(filePath);
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

	const containsCommentedChildren = (item: TreeNode): boolean => {
		if (item.type === TreeNodeType.file) {
			return projectDataStore.fileContainsComments(item.path);
		}
		return item.children.some(containsCommentedChildren) ?? false;
	};

	// Computed
	const isFileSelected = computed(() => {
		return props.currentNode.path === props.filePath && props.currentNode.type === TreeNodeType.file;
	});

	const hasCommentedChildren = computed(() => {
		return containsCommentedChildren(props.currentNode);
	});

	return {
		handleItemClick,
		handleToggleExpand,
		fileContainsAnyComments,
		fileContainsFileComment,
		hasCommentedChildren,
		isFileSelected,
	};
}
