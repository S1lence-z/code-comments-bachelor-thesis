import { ref, computed } from "vue";
import { useProjectDataStore } from "../stores/projectDataStore";
import { useFileContentStore } from "../stores/fileContentStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useProjectStore } from "../stores/projectStore";
import type { ProcessedFile } from "../types/github/githubFile";
import { CommentType } from "../types/enums/CommentType";
import { createCommentByType } from "../utils/commentUtils";
import { storeToRefs } from "pinia";
import { useQueryParams } from "../composables/core/useQueryParams";

export function useCodeReviewPage() {
	// Query params composable
	const { params } = useQueryParams();

	// Stores
	const projectStore = useProjectStore();
	const projectDataStore = useProjectDataStore();
	const fileContentStore = useFileContentStore();
	const settingsStore = useSettingsStore();

	// Store refs
	const { fileTree, allComments, isLoadingRepository, isLoadingComments } = storeToRefs(projectDataStore);

	// Local state
	const selectedFilePath = ref<string | null>(null);
	const processedSelectedFile = ref<ProcessedFile | null>(null);
	const isLoadingFile = ref<boolean>(false);
	const areFilesExpanded = ref<boolean>(false);

	// Resizable sidebar state
	const sidebarWidth = ref(280);
	const minSidebarWidth = 200;
	const maxSidebarWidth = 450;
	const sidebar = ref<HTMLElement | null>(null);

	// Handle file selection and loading
	const handleFileSelected = async (path: string | null): Promise<void> => {
		if (!path) return;

		selectedFilePath.value = path;
		isLoadingFile.value = true;
		// Fetch the file content
		try {
			processedSelectedFile.value = await fileContentStore.getFileContentAsync(
				path,
				projectStore.getRepositoryUrl,
				projectStore.getRepositoryBranch,
				projectStore.getGithubPat
			);
		} catch (e: any) {
			processedSelectedFile.value = null;
			console.error("Error fetching file content:", e);
		} finally {
			isLoadingFile.value = false;
		}
	};

	// Handle resize events from ResizeHandle component
	const handleSidebarResize = (newWidth: number): void => {
		sidebarWidth.value = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, newWidth));
	};

	const handleFileQueryParam = (): void => {
		const filePathToOpen = params.value.file;
		if (filePathToOpen) {
			handleFileSelected(filePathToOpen);
		} else {
			selectedFilePath.value = null;
			processedSelectedFile.value = null;
		}
	};

	// Is current workspace empty
	const isAnyFileSelected = () => {
		return !!selectedFilePath.value;
	};

	const expandAllFiles = () => {
		areFilesExpanded.value = !areFilesExpanded.value;
		projectDataStore.expandAllFiles(areFilesExpanded.value);
	};

	// Handle inline form submission from CodeEditor
	const submitInlineComment = async (payload: {
		content: string;
		categoryLabel: string;
		commentId: string | null;
		commentType: CommentType;
		filePath: string;
		startLineNumber: number | null;
		endLineNumber: number | null;
	}): Promise<void> => {
		const commentData = createCommentByType(
			payload.commentType,
			projectDataStore.allCategories,
			payload.categoryLabel,
			payload.commentId,
			payload.content,
			payload.startLineNumber || 0,
			payload.endLineNumber || 0,
			payload.filePath
		);

		if (!commentData) {
			alert("Invalid comment type.");
			return;
		}

		try {
			await projectDataStore.upsertCommentAsync(commentData, projectStore.getRwApiUrl);
		} catch (error) {
			console.error("Failed to save comment:", error);
			alert("Failed to save comment. Please try again.");
		}
	};

	const deleteInlineComment = async (commentId: string): Promise<void> => {
		await projectDataStore.deleteCommentAsync(commentId, projectStore.getRwApiUrl);
	};

	// Computed
	const projectCommentButtonLabel = computed(() => {
		return projectDataStore.containsProjectComment ? "Edit Project Comment" : "Add Project Comment";
	});

	const expandAllButtonLabel = computed(() => {
		return areFilesExpanded.value ? "Collapse All" : "Expand All";
	});

	return {
		// Store refs
		fileTree,
		allComments,
		isLoadingRepository,
		isLoadingComments,

		// Stores
		settingsStore,

		// Local state
		selectedFilePath,
		processedSelectedFile,
		isLoadingFile,

		// Sidebar state
		sidebarWidth,
		minSidebarWidth,
		maxSidebarWidth,
		sidebar,

		// Methods
		handleFileSelected,
		handleSidebarResize,
		handleFileQueryParam,
		isAnyFileSelected,
		expandAllFiles,

		// Inline form handlers
		submitInlineComment,
		deleteInlineComment,

		// Computed
		projectCommentButtonLabel,
		expandAllButtonLabel,
	};
}
