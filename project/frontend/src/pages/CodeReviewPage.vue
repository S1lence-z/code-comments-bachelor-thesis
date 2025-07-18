<script setup lang="ts">
import { ref, onMounted, watch, provide } from "vue";
import FileExplorer from "../components/codeReview/FileExplorer.vue";
import CodeEditor from "../components/codeReview/CodeEditor.vue";
import SinglelineCommentModal from "../components/codeReview/SinglelineCommentModal.vue";
import MultilineCommentModal from "../components/codeReview/MultilineCommentModal.vue";
import OtherContentViewer from "../components/codeReview/ContentViewer.vue";
import type { TreeNode } from "../types/githubTree.ts";
import type ICommentDto from "../../../shared/dtos/ICommentDto";
import { deleteComment } from "../services/commentsService.ts";
import { CommentType } from "../../../shared/enums/CommentType.ts";
import type ICategoryDto from "../../../shared/dtos/ICategoryDto.ts";
import SplitPanelManager from "../components/codeReview/SplitPanelManager.vue";
import { useRepositoryStore } from "../stores/repositoryStore.ts";
import { useFileContentStore } from "../stores/fileContentStore.ts";
import { storeToRefs } from "pinia";
import type { ProcessedFile } from "../types/githubFile.ts";
import Modal from "../lib/Modal.vue";
import Card from "../lib/Card.vue";
import InputArea from "../lib/InputArea.vue";
import CodeReviewToolbar from "../components/codeReview/CodeReviewToolbar.vue";
import { useRoute } from "vue-router";
import ResizeHandle from "../lib/ResizeHandle.vue";
import { useProjectStore } from "../stores/projectStore.ts";
import { getFileName } from "../utils/fileUtils.ts";

// Router
const route = useRoute();

// Stores
const projectStore = useProjectStore();
const repositoryStore = useRepositoryStore();
const fileContentStore = useFileContentStore();

// Store refs
const { repositoryUrl, writeApiUrl, repositoryBranch, githubPat } = storeToRefs(projectStore);
const { fileTree, allComments: backendComments, isLoadingRepository, isLoadingComments } = storeToRefs(repositoryStore);

// State for file explorer
const showSideBar = ref<boolean>(true);

// Local state for file selection and content
const selectedFilePath = ref<string | null>(null);
const processedSelectedFile = ref<ProcessedFile | null>(null);
const isLoadingFile = ref<boolean>(false);

// SHARED modal state
const modalFilePath = ref<string | null>(null);

// Single line comment modal state
const isAddingSinglelineComment = ref(false);
const modalLineNumber = ref<number | null>(null);
const singlelineModalCommentText = ref<string>("");

// Multiline comment modal state
const isAddingMultilineComment = ref(false);
const modalStartLineNumber = ref<number | null>(null);
const modalEndLineNumber = ref<number | null>(null);
const multilineModalCommentText = ref<string>("");

// File/Folder comment modal state
const isAddingFileComment = ref(false);
function updateIsAddingFileComment(value: boolean) {
	isAddingFileComment.value = value;
}
provide("updateIsAddingFileComment", updateIsAddingFileComment);

// File comment data
const fileCommentData = ref<{ filePath: string | null; content: string }>({
	filePath: null,
	content: "",
});
const updateFileCommentData = (filePath: string, content: string) => {
	const existingComment = backendComments.value.find(
		(comment: ICommentDto) => comment.filePath === filePath && comment.type === CommentType.File
	);

	// Update existing comment data if found
	if (existingComment) {
		fileCommentData.value.filePath = filePath;
		fileCommentData.value.content = existingComment.content;
		return;
	}
	// Adding new comment data
	fileCommentData.value.filePath = filePath;
	fileCommentData.value.content = content;
};
provide("updateFileCommentData", updateFileCommentData);

// IsKeyboardMode state
const isKeyboardMode = ref(false);
function updateKeyboardModeState(value: boolean) {
	isKeyboardMode.value = value;
}
provide("keyboardModeContext", { isKeyboardMode: isKeyboardMode, updateKeyboardModeState });

// Resizable sidebar state
const sidebarWidth = ref(280);
const minSidebarWidth = 200;
const maxSidebarWidth = 600;
const sidebar = ref<HTMLElement | null>(null);

async function ensureFileCached(filePath: string): Promise<void> {
	if (fileContentStore.isFileCached(filePath)) {
		return;
	}

	try {
		await fileContentStore.getFileContentAsync(
			filePath,
			repositoryUrl.value,
			repositoryBranch.value,
			githubPat.value
		);
	} catch (e: any) {
		console.error("Error fetching file content:", e);
	}
}

// Comment handling
async function deleteCommentAndReload(commentId: number): Promise<void> {
	if (!writeApiUrl.value) {
		console.error("Cannot delete comment: comments API URL is not configured.");
		return;
	}
	try {
		await deleteComment(writeApiUrl.value, commentId);
		repositoryStore.deleteCommentLocal(commentId);
	} catch (e: any) {
		console.error("Failed to delete comment:", e);
	}
}

async function handleFileSelected(path: string) {
	if (!path) return;

	selectedFilePath.value = path;
	isLoadingFile.value = true;
	try {
		processedSelectedFile.value = await fileContentStore.getFileContentAsync(
			path,
			repositoryUrl.value,
			repositoryBranch.value,
			githubPat.value
		);
	} catch (e: any) {
		processedSelectedFile.value = null;
		console.error("Error fetching file content:", e);
	} finally {
		isLoadingFile.value = false;
	}
}

// TODO: move this function to the FileExplorer component
function handleToggleExpandInTree(itemToToggle: TreeNode) {
	const findAndToggle = (nodes: TreeNode[]): boolean => {
		for (const node of nodes) {
			if (node.path === itemToToggle.path && node.type === "folder") {
				node.isExpanded = !node.isExpanded;
				return true;
			}
			if (node.children && node.children.length > 0) {
				if (findAndToggle(node.children)) return true;
			}
		}
		return false;
	};
	findAndToggle(fileTree.value);
}

//! Handle comment modals
function handleLineDoubleClicked(payload: { lineNumber: number; filePath: string }) {
	const { lineNumber, filePath } = payload;
	if (!filePath || !writeApiUrl.value) {
		console.error("Cannot add comment: comments API URL is not configured.");
		return;
	}
	const existingComment = backendComments.value.find(
		(c: ICommentDto) => c.filePath === filePath && c.lineNumber === lineNumber
	);
	modalLineNumber.value = lineNumber;
	modalFilePath.value = filePath;
	singlelineModalCommentText.value = existingComment ? existingComment.content : "";
	isAddingSinglelineComment.value = true;
}

function handleMultilineSelected(payload: { startLineNumber: number; endLineNumber: number; filePath: string }) {
	const { startLineNumber, endLineNumber, filePath } = payload;
	if (!filePath || !writeApiUrl.value) {
		console.error("Cannot add comment: comments API URL is not configured.");
		return;
	}
	modalStartLineNumber.value = startLineNumber;
	modalEndLineNumber.value = endLineNumber;
	modalFilePath.value = filePath;
	isAddingMultilineComment.value = true;
}

async function handleSinglelineCommentSubmit(commentText: string, category: ICategoryDto) {
	if (modalFilePath.value === null || modalLineNumber.value === null || !writeApiUrl.value) {
		console.error("Cannot save comment: missing data or API URL.");
		return;
	}

	const commentData: ICommentDto = {
		id: 0,
		filePath: modalFilePath.value,
		lineNumber: modalLineNumber.value,
		content: commentText,
		type: CommentType.SingleLine,
		categories: category ? [category] : [],
	};

	if (!commentData.content.trim()) {
		console.log("Comment text is empty, not submitting.");
		closeSinglelineCommentModal();
		return;
	}

	try {
		await repositoryStore.upsertCommentAsync(commentData, writeApiUrl.value);
	} catch (e: any) {
		console.error("Failed to save comment:", e);
	} finally {
		closeSinglelineCommentModal();
	}
}

async function handleMultilineCommentSubmit(commentText: string, category: ICategoryDto) {
	if (
		modalFilePath.value === null ||
		modalStartLineNumber.value === null ||
		modalEndLineNumber.value === null ||
		!writeApiUrl.value
	) {
		console.error("Cannot save comment: missing data or API URL.");
		return;
	}

	const commentData: ICommentDto = {
		id: 0,
		filePath: modalFilePath.value,
		content: commentText,
		type: CommentType.MultiLine,
		startLineNumber: modalStartLineNumber.value,
		endLineNumber: modalEndLineNumber.value,
		categories: category ? [category] : [],
	};

	if (!commentData.content.trim()) {
		console.log("Comment text is empty, not submitting.");
		closeMultilineCommentModal();
		return;
	}

	try {
		await repositoryStore.upsertCommentAsync(commentData, writeApiUrl.value);
	} catch (e: any) {
		console.error("Failed to save comment:", e);
	} finally {
		closeMultilineCommentModal();
	}
}

function closeSinglelineCommentModal() {
	isAddingSinglelineComment.value = false;
	modalLineNumber.value = null;
	modalFilePath.value = null;
	singlelineModalCommentText.value = "";
}

function closeMultilineCommentModal() {
	isAddingMultilineComment.value = false;
	modalStartLineNumber.value = null;
	modalEndLineNumber.value = null;
	modalFilePath.value = null;
	multilineModalCommentText.value = "";
}

function handleFileCommentModal(isAdding: boolean) {
	if (isAdding) {
		fileCommentData.value.filePath = null;
		fileCommentData.value.content = "";
		isAddingFileComment.value = true;
	}
}

function closeFileCommentModal() {
	isAddingFileComment.value = false;
	fileCommentData.value.filePath = null;
	fileCommentData.value.content = "";
}

async function handleFileCommentSubmit() {
	if (!fileCommentData.value.filePath || !fileCommentData.value.content.trim() || !writeApiUrl.value) {
		console.error("Cannot save comment: missing data or API URL.");
		return;
	}

	const commentToSubmit: ICommentDto = {
		id: 0,
		filePath: fileCommentData.value.filePath,
		content: fileCommentData.value.content,
		type: CommentType.File,
	};

	// Find the existing comment or create a new one
	backendComments.value.forEach((comment: ICommentDto) => {
		if (comment.filePath === fileCommentData.value.filePath && comment.type === CommentType.File) {
			commentToSubmit.id = comment.id;
		}
	});

	// Submit the comment
	try {
		await repositoryStore.upsertCommentAsync(commentToSubmit, writeApiUrl.value);
	} catch (e: any) {
		console.error("Failed to save comment:", e);
	} finally {
		closeFileCommentModal();
	}
}

// Handle resize events from ResizeHandle component
const handleSidebarResize = (newWidth: number) => {
	sidebarWidth.value = newWidth;
};

// TODO: add the handling the line number if applicable
const handleFileQueryParam = () => {
	const filePath = decodeURIComponent((route.query.file as string) || "");
	if (filePath) {
		selectedFilePath.value = filePath;
	} else {
		selectedFilePath.value = null;
		processedSelectedFile.value = null;
	}
};

// Setup function
const initRepositoryStore = async () => {
	// If project is already set up, initialize immediately
	if (projectStore.isProjectSetup) {
		// Prevent multiple initialization attempts
		if (repositoryStore.isRepositorySetup) {
			return;
		}

		try {
			await repositoryStore.initializeStoreAsync(
				repositoryUrl.value,
				writeApiUrl.value,
				repositoryBranch.value,
				githubPat.value
			);
			handleFileQueryParam();
		} catch (error) {
			console.error("Failed to initialize store data:", error);
		}
	}
};

onMounted(async () => {
	if (projectStore.isProjectSetup) {
		await initRepositoryStore();
	}
});

// Watch for project setup completion
watch(
	() => projectStore.isProjectSetup,
	async (isSetup) => {
		if (isSetup) {
			await initRepositoryStore();
		}
	},
	{ immediate: true }
);

watch(
	() => selectedFilePath.value,
	() => {
		if (selectedFilePath.value) {
			handleFileSelected(selectedFilePath.value);
		} else {
			processedSelectedFile.value = null;
		}
	}
);

watch(
	() => route.query.file,
	() => {
		handleFileQueryParam();
	}
);

// Watch for selectedFilePath changes to preload the file
watch(selectedFilePath, async (newPath) => {
	if (newPath) {
		await ensureFileCached(newPath);
	}
});
</script>

<template>
	<div class="page">
		<div class="flex flex-col h-full w-full">
			<!-- Code Editor Toolbar -->
			<CodeReviewToolbar v-model:showSideBar="showSideBar" />
			<div class="flex h-full w-full overflow-hidden">
				<!-- Sidebar -->
				<div ref="sidebar" v-if="showSideBar" :style="{ width: sidebarWidth + 'px' }">
					<!-- File Explorer -->
					<div v-if="isLoadingRepository" class="p-6 text-sm text-center text-slate-300">
						<div class="inline-flex items-center space-x-2">
							<div
								class="animate-spin rounded-full h-4 w-4 border-2 border-modern-blue border-t-transparent"
							></div>
							<span>Loading repository...</span>
						</div>
					</div>
					<FileExplorer
						v-else-if="fileTree.length > 0"
						:treeData="fileTree"
						v-model="selectedFilePath"
						@update:isAddingFileComment="handleFileCommentModal"
						@toggle-expand-item="handleToggleExpandInTree"
					/>
				</div>

				<!-- Resize Handle -->
				<ResizeHandle
					v-if="showSideBar"
					:resizable-element="sidebar"
					:min-width="minSidebarWidth"
					:max-width="maxSidebarWidth"
					@resize-number="(newWidth: number) => handleSidebarResize(newWidth)"
				/>

				<!-- Code Editor and Comments -->
				<div class="flex flex-col flex-grow overflow-hidden backdrop-blur-sm bg-white/5 w-full">
					<div v-if="isLoadingComments && !isLoadingFile" class="p-6 text-sm text-center text-slate-300">
						<div class="inline-flex items-center space-x-2">
							<div
								class="animate-spin rounded-full h-4 w-4 border-2 border-modern-blue border-t-transparent"
							></div>
							<span>Loading comments...</span>
						</div>
					</div>
					<SplitPanelManager v-else v-model:selected-file-path="selectedFilePath">
						<template #default="{ filePath }">
							<div v-if="filePath" class="h-full">
								<div
									v-if="!fileContentStore.isFileCached(filePath)"
									class="p-6 text-sm text-center text-slate-300"
								>
									<div class="inline-flex items-center space-x-2">
										<div
											class="animate-spin rounded-full h-4 w-4 border-2 border-modern-blue border-t-transparent"
										></div>
										<span>Loading file...</span>
									</div>
								</div>
								<template v-else>
									<CodeEditor
										v-if="fileContentStore.getFileDisplayType(filePath) === 'text'"
										:file-path="filePath"
										:file-content="fileContentStore.getFileContent(filePath)"
										:is-loading-file="false"
										:comments="repositoryStore.getCommentsForFile(filePath)"
										:delete-comment-action="deleteCommentAndReload"
										@line-double-clicked="handleLineDoubleClicked"
										@multiline-selected="handleMultilineSelected"
									/>
									<OtherContentViewer
										v-else
										:display-type="fileContentStore.getFileDisplayType(filePath)"
										:download-url="fileContentStore.getFileDownloadUrl(filePath)"
										:file-name="getFileName(filePath)"
										:selected-file-path="filePath"
									/>
								</template>
							</div>
						</template>
					</SplitPanelManager>
				</div>
			</div>

			<!-- Comment Modals -->
			<SinglelineCommentModal
				v-model:isVisible="isAddingSinglelineComment"
				v-model:commentText="singlelineModalCommentText"
				:lineNumber="modalLineNumber"
				:filePath="modalFilePath"
				@submit="handleSinglelineCommentSubmit"
				@close="closeSinglelineCommentModal"
			/>

			<MultilineCommentModal
				v-model:isVisible="isAddingMultilineComment"
				v-model:commentText="multilineModalCommentText"
				:startLineNumber="modalStartLineNumber"
				:endLineNumber="modalEndLineNumber"
				:filePath="modalFilePath"
				@submit="handleMultilineCommentSubmit"
				@close="closeMultilineCommentModal"
			/>

			<!-- File/Folder Comment Modal -->
			<Modal v-if="isAddingFileComment" @close="closeFileCommentModal">
				<Card :title="'Comment: ' + fileCommentData.filePath" subtitle="Add a comment to the file or folder">
					<div class="space-y-2">
						<InputArea
							label="Comment"
							v-model="fileCommentData.content"
							placeholder="Enter your comment here..."
							:rows="6"
						/>
						<div class="flex justify-end space-x-2">
							<button @click="closeFileCommentModal" class="btn btn-secondary">Cancel</button>
							<button
								@click="handleFileCommentSubmit"
								:disabled="!fileCommentData.content.trim()"
								class="btn btn-primary"
							>
								Add Comment
							</button>
						</div>
					</div>
				</Card>
			</Modal>
		</div>
	</div>
</template>
