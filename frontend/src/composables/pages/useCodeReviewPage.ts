import { ref, computed } from "vue";
import { useProjectDataStore } from "../../stores/projectDataStore";
import { useFileContentStore } from "../../stores/fileContentStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useProjectStore } from "../../stores/projectStore";
import type { ProcessedFile } from "../../types/github/githubFile";
import type CommentDto from "../../types/dtos/CommentDto";
import { CommentType } from "../../types/enums/CommentType";
import { getCommentLocationInfoByType } from "../../utils/commentUtils";
import { storeToRefs } from "pinia";
import { useQueryParams } from "../core/useQueryParams";
import { useWorkspaceStore } from "../../stores/workspaceStore";

export function useCodeReviewPage() {
	// Query params composable
	const { params } = useQueryParams();

	// Stores
	const projectStore = useProjectStore();
	const projectDataStore = useProjectDataStore();
	const fileContentStore = useFileContentStore();
	const settingsStore = useSettingsStore();
	// TODO: delete this dependency when I fix the split panel manager
	const workspaceStore = useWorkspaceStore();

	// Store refs
	const { fileTree, allComments, isLoadingRepository, isLoadingComments } = storeToRefs(projectDataStore);

	// Local state
	const selectedFilePath = ref<string | null>(null);
	const processedSelectedFile = ref<ProcessedFile | null>(null);
	const isLoadingFile = ref<boolean>(false);

	// Resizable sidebar state
	const sidebarWidth = ref(280);
	const minSidebarWidth = 200;
	const maxSidebarWidth = 450;
	const sidebar = ref<HTMLElement | null>(null);

	// Comment form state
	const commentFilePath = ref<string | null>(null);
	const startLineNumber = ref<number | null>(null);
	const endLineNumber = ref<number | null>(null);
	const commentId = ref<string | null>(null);
	const isAddingComment = ref<boolean>(false);
	const addedCommentType = ref<CommentType>(CommentType.Singleline);

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

	// Comment handling functions
	const handleSinglelineCommentSelected = (payload: { lineNumber: number; filePath: string }): void => {
		const { lineNumber, filePath } = payload;
		if (!filePath) {
			console.error("Cannot add comment: no file path provided.");
			return;
		}
		const existingComment = allComments.value.find(
			(c: CommentDto) => c.location.filePath === filePath && c.location.lineNumber === lineNumber
		);

		// Set the form state variables
		commentFilePath.value = filePath;
		startLineNumber.value = lineNumber;
		endLineNumber.value = null;
		commentId.value = existingComment ? existingComment.id : null;
		addedCommentType.value = CommentType.Singleline;
		isAddingComment.value = true;
	};

	const handleMultilineCommentSelected = (payload: {
		selectedStartLineNumber: number;
		selectedEndLineNumber: number;
		filePath: string;
	}): void => {
		const { selectedStartLineNumber, selectedEndLineNumber, filePath } = payload;
		if (!filePath) {
			console.error("Cannot add comment: no file path provided.");
			return;
		}
		const existingComment = allComments.value.find(
			(c: CommentDto) =>
				c.location.filePath === filePath && c.location.startLineNumber === selectedStartLineNumber
		);

		commentFilePath.value = filePath;
		startLineNumber.value = selectedStartLineNumber;
		endLineNumber.value = selectedEndLineNumber;
		commentId.value = existingComment ? existingComment.id : null;
		addedCommentType.value = CommentType.Multiline;
		isAddingComment.value = true;
	};

	const handleFileCommentSelected = (filePath: string): void => {
		if (!filePath) {
			console.error("Cannot add comment: no file path provided.");
			return;
		}

		const existingComment = allComments.value.find(
			(comment: CommentDto) => comment.location.filePath === filePath && comment.type === CommentType.File
		);

		commentId.value = existingComment ? existingComment.id : null;
		commentFilePath.value = filePath;
		addedCommentType.value = CommentType.File;
		isAddingComment.value = true;
	};

	const handleProjectCommentSelected = (): void => {
		if (!projectStore.getRepositoryName) {
			console.error("Cannot add project comment: repository name is not set.");
			return;
		}

		const existingComment = allComments.value.find((comment: CommentDto) => comment.type === CommentType.Project);
		commentId.value = existingComment ? existingComment.id : null;
		commentFilePath.value = projectStore.getRepositoryName;
		addedCommentType.value = CommentType.Project;
		isAddingComment.value = true;
	};

	// Handle edit button for the codemirror widget
	const handleCommentEdit = async (commentId: string): Promise<void> => {
		// Take the comment ID and open the modal for editing
		const editedComment = allComments.value.find((comment: CommentDto) => comment.id === commentId);
		if (!editedComment) {
			console.error("Comment not found for ID:", commentId);
			return;
		}

		// Get the comment type
		const commentType: CommentType = editedComment.type;
		if (commentType === CommentType.Singleline) {
			handleSinglelineCommentSelected({
				lineNumber: editedComment.location.lineNumber || 0,
				filePath: editedComment.location.filePath,
			});
		} else if (commentType === CommentType.Multiline) {
			handleMultilineCommentSelected({
				selectedStartLineNumber: editedComment.location.startLineNumber || 0,
				selectedEndLineNumber: editedComment.location.endLineNumber || 0,
				filePath: editedComment.location.filePath,
			});
		} else if (commentType === CommentType.File) {
			handleFileCommentSelected(editedComment.location.filePath);
		} else if (commentType === CommentType.Project) {
			handleProjectCommentSelected();
		} else {
			console.error("Unsupported comment type:", commentType);
		}
	};

	// Handle resize events from ResizeHandle component
	const handleSidebarResize = (newWidth: number): void => {
		sidebarWidth.value = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, newWidth));
	};

	const handleFileQueryParam = (): void => {
		const filePathToOpen = params.value.file;
		if (filePathToOpen) {
			selectedFilePath.value = filePathToOpen;
		} else {
			selectedFilePath.value = null;
			processedSelectedFile.value = null;
		}
	};

	// Delete comment action
	const deleteCommentAction = async (commentId: string): Promise<void> => {
		await projectDataStore.deleteCommentAsync(commentId, projectStore.getRwApiUrl);
	};

	// Is current workspace empty
	const isWorkspaceEmpty = () => {
		return !workspaceStore.existsNonEmptyWorkspace(projectStore.getRepositoryUrl, projectStore.getRepositoryBranch);
	};

	// Computed
	const getSubtitle = computed(() => {
		if (addedCommentType.value === CommentType.Project) return "Project-wide comment";
		if (!commentFilePath.value) return "";
		const commentInfo = getCommentLocationInfoByType(
			addedCommentType.value,
			startLineNumber.value,
			endLineNumber.value
		);
		return `In file ${commentFilePath.value} ${commentInfo}`;
	});

	const projectCommentButtonLabel = computed(() => {
		return projectDataStore.containsProjectComment ? "Edit Project Comment" : "Add Project Comment";
	});

	return {
		// Store refs
		fileTree,
		allComments,
		isLoadingRepository,
		isLoadingComments,

		// Stores (for direct access if needed)
		projectStore,
		projectDataStore,
		fileContentStore,
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

		// Comment form state
		commentFilePath,
		startLineNumber,
		endLineNumber,
		commentId,
		isAddingComment,
		addedCommentType,

		// Methods
		handleFileSelected,
		handleSinglelineCommentSelected,
		handleMultilineCommentSelected,
		handleFileCommentSelected,
		handleProjectCommentSelected,
		handleCommentEdit,
		handleSidebarResize,
		handleFileQueryParam,
		deleteCommentAction,
		isWorkspaceEmpty,

		// Computed
		getSubtitle,
		projectCommentButtonLabel,
	};
}
