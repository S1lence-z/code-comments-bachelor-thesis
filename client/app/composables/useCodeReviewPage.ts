export const useCodeReviewPage = () => {
	// Query params composable
	const { params } = useQueryParams();

	// Stores
	const projectDataStore = useProjectDataStore();
	const settingsStore = useSettingsStore();
	const workspaceStore = useWorkspaceStore();

	// Sidebar state
	const sidebarWidth = ref(280);
	const minSidebarWidth = 200;
	const maxSidebarWidth = 450;
	const sidebar = ref<HTMLElement | null>(null);

	// Computed
	const isSidebarVisible = computed(() => {
		return settingsStore.isSidebarOpen;
	});
	const getFileTree = computed(() => projectDataStore.getFileTree);
	const isLoadingRepository = computed(() => projectDataStore.isLoadingRepository);

	// Handle resize events from ResizeHandle component
	const handleSidebarResize = (newWidth: number): void => {
		sidebarWidth.value = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, newWidth));
	};

	const handleFileQueryParam = (): void => {
		const filePathToOpen = params.value.file;
		if (filePathToOpen) {
			workspaceStore.openFile(filePathToOpen);
		}
	};

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
		// Computed
		isSidebarVisible,
		getFileTree,
		isLoadingRepository,
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
		handleSidebarResize,
		handleFileQueryParam,
	};
}
