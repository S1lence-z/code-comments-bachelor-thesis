import type { TreeNode } from "../../types/github/githubTree";

export interface FileExplorerProps {
	treeData: TreeNode[];
	selectedPath: string | null;
	projectCommentButtonLabel: string;
}

export interface FileExplorerEmits {
	(event: "update:selectedPath", value: string | null): void;
	(event: "project-comment-requested"): void;
	(event: "file-comment-requested", filePath: string): void;
}

export function useFileExplorer(_props: FileExplorerProps, emit: FileExplorerEmits) {
	// Methods
	const handleProjectCommentAction = (): void => {
		emit("project-comment-requested");
	};

	const handleFileCommentAction = (filePath: string): void => {
		emit("file-comment-requested", filePath);
	};

	const handleFileSelection = (filePath: string | null): void => {
		emit("update:selectedPath", filePath);
	};

	return {
		// Methods
		handleProjectCommentAction,
		handleFileCommentAction,
		handleFileSelection,
	};
}
