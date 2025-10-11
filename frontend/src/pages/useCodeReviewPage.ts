import { computed, ref } from "vue";
import { useProjectDataStore } from "../stores/projectDataStore";
import { useFileContentStore } from "../stores/fileContentStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useProjectStore } from "../stores/projectStore";
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
	const { fileTree, isLoadingRepository } = storeToRefs(projectDataStore);

	// State
	const selectedFilePath = ref<string | null>(null);

	// Sidebar state
	const sidebarWidth = ref(280);
	const minSidebarWidth = 200;
	const maxSidebarWidth = 450;
	const sidebar = ref<HTMLElement | null>(null);

	// Handle file selection and loading
	const handleFileSelected = async (path: string | null): Promise<void> => {
		if (!path) {
			selectedFilePath.value = null;
			return;
		}

		// Update selected file path
		selectedFilePath.value = path;

		// Fetch the file content
		await fileContentStore.cacheFileAsync(
			path,
			projectStore.getRepositoryUrl,
			projectStore.getRepositoryBranch,
			projectStore.getGithubPat
		);
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
		}
	};

	// Is current workspace empty
	const isAnyFileSelected = () => {
		return !!selectedFilePath.value;
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

	const isSidebarVisible = computed(() => {
		return settingsStore.isSidebarOpen;
	});

	return {
		// Store refs
		fileTree,
		isLoadingRepository,

		// Local state
		selectedFilePath,

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

		// Inline form handlers
		submitInlineComment,
		deleteInlineComment,

		isSidebarVisible,
	};
}
