import { computed, ref } from "vue";
import { useProjectDataStore } from "../../stores/projectDataStore";
import type { TreeNode } from "../../types/github/githubTree";
import { handleToggleExpandInTree } from "../../utils/treeNodeUtils.ts";

export interface FileExplorerProps {
	treeData: TreeNode[];
	selectedPath: string | null;
}

export interface FileExplorerEmits {
	(event: "update:selectedPath", value: string | null): void;
	(event: "project-comment-requested"): void;
	(event: "file-comment-requested", filePath: string): void;
}

export const useFileExplorer = () => {
	// Stores
	const projectDataStore = useProjectDataStore();

	// Local state
	const areFilesExpanded = ref<boolean>(false);

	// Methods
	const expandAllFiles = () => {
		areFilesExpanded.value = !areFilesExpanded.value;
		projectDataStore.expandAllFiles(areFilesExpanded.value);
	};

	const expandAllButtonLabel = computed(() => {
		return areFilesExpanded.value ? "Collapse All" : "Expand All";
	});

	// Computed
	const projectCommentButtonLabel = computed(() => {
		return projectDataStore.containsProjectComment ? "Edit Project Comment" : "Add Project Comment";
	});

	return {
		expandAllFiles,
		expandAllButtonLabel,
		handleToggleExpandInTree,
		projectCommentButtonLabel,
	};
};
