import { computed, ref } from "vue";
import { useProjectDataStore } from "../stores/projectDataStore";
import { useFileContentStore } from "../stores/fileContentStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useProjectStore } from "../stores/projectStore";
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

	const isSidebarVisible = computed(() => {
		return settingsStore.isSidebarOpen;
	});

	// Project/File comment form state
	const isAddingProjectOrFileComment = ref(false);
	const projectOrFileCommentPath = ref<string | null>(null);

	const handleFileCommentRequest = (filePath: string) => {
		isAddingProjectOrFileComment.value = true;
		projectOrFileCommentPath.value = filePath;
	};

	const handleProjectCommentRequest = () => {
		isAddingProjectOrFileComment.value = true;
		projectOrFileCommentPath.value = null;
	};

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

		// Project/File comment form state
		isAddingProjectOrFileComment,
		projectOrFileCommentPath,
		handleFileCommentRequest,
		handleProjectCommentRequest,

		// Methods
		handleFileSelected,
		handleSidebarResize,
		handleFileQueryParam,
		isAnyFileSelected,

		isSidebarVisible,
	};
}
