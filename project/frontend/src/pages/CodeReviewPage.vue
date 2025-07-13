<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import FileExplorer from "../components/FileExplorer.vue";
import CodeEditor from "../components/CodeEditor.vue";
import SinglelineCommentModal from "../components/SinglelineCommentModal.vue";
import MultilineCommentModal from "../components/MultilineCommentModal.vue";
import type { TreeNode } from "../types/githubApi.ts";
import type ICommentDto from "../../../shared/dtos/ICommentDto";
import { fetchFileContentAPI } from "../services/githubService.ts";
import { addComment, deleteComment } from "../services/commentsService.ts";
import { CommentType } from "../../../shared/enums/CommentType.ts";
import type ICategoryDto from "../../../shared/dtos/ICategoryDto.ts";
import FileTabManager from "../components/FileTabManager.vue";
import { useRepositoryStore } from "../stores/repositoryStore.ts";
// @ts-ignore
import { storeToRefs } from "pinia";

// Import the repository store
const repositoryStore = useRepositoryStore();

// Get repository settings and data from the store
const {
	repositoryUrl: repoUrl,
	writeApiUrl,
	branch,
	githubPersonalAccessToken,
	fileTree,
	allComments: backendComments,
	isLoadingRepo,
	isLoadingComments,
	errorMessage: storeErrorMessage,
} = storeToRefs(repositoryStore);

// Local state for file selection and content
const selectedFile = ref<string | null>(null);
const fileContent = ref<string | null>(null);
const isLoadingFile = ref<boolean>(false);

// SHARED modal state
const modalFilePath = ref<string | null>(null);

// Single line comment modal state
const isAddingSinglelineComment = ref(false);
const modalLineNumber = ref<number | null>(null);
const modalInitialText = ref("");

// Multiline comment modal state
const isAddingMultilineComment = ref(false);
const modalStartLineNumber = ref<number | null>(null);
const modalEndLineNumber = ref<number | null>(null);
const multilineModalInitialText = ref<string>("");

// Resizable sidebar state
const sidebarWidth = ref(280);
const minSidebarWidth = 200;
const maxSidebarWidth = 600;
const isResizing = ref(false);

const currentFileComments = computed(() => {
	if (selectedFile.value && backendComments.value.length > 0) {
		return repositoryStore.getCommentsForFile(selectedFile.value);
	}
	return [];
});

async function deleteCommentAndReload(commentId: number): Promise<void> {
	if (!writeApiUrl.value) {
		console.error("Cannot delete comment: comments API URL is not configured.");
		return;
	}
	try {
		await deleteComment(writeApiUrl.value, commentId);
		repositoryStore.removeComment(commentId);
	} catch (e: any) {
		console.error("Failed to delete comment:", e);
	}
}

async function handleFileSelected(path: string) {
	if (!path) return;
	selectedFile.value = path;
	fileContent.value = null;
	isLoadingFile.value = true;

	try {
		fileContent.value = await fetchFileContentAPI(
			repoUrl.value,
			branch.value,
			path,
			githubPersonalAccessToken.value
		);
	} catch (e: any) {
		fileContent.value = `Error loading file: ${e.message}`;
		console.error("Error fetching file content:", e);
	} finally {
		isLoadingFile.value = false;
	}
}

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

// Handle comment actions
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
	modalInitialText.value = existingComment ? existingComment.content : "";
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
		await addComment(writeApiUrl.value, commentData);
		await repositoryStore.fetchAllComments();
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
		await addComment(writeApiUrl.value, commentData);
		await repositoryStore.fetchAllComments();
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
	modalInitialText.value = "";
}

function closeMultilineCommentModal() {
	isAddingMultilineComment.value = false;
	modalStartLineNumber.value = null;
	modalEndLineNumber.value = null;
	modalFilePath.value = null;
	multilineModalInitialText.value = "";
}

// Resize handling functions
const startResize = (event: MouseEvent) => {
	event.preventDefault();
	isResizing.value = true;
	document.addEventListener("mousemove", handleResize);
	document.addEventListener("mouseup", stopResize);
	document.body.style.cursor = "col-resize";
	document.body.style.userSelect = "none";
};

const handleResize = (event: MouseEvent) => {
	if (!isResizing.value) return;

	const newWidth = event.clientX;
	if (newWidth >= minSidebarWidth && newWidth <= maxSidebarWidth) {
		sidebarWidth.value = newWidth;
	}
};

const stopResize = () => {
	isResizing.value = false;
	cleanResize();
};

const cleanResize = () => {
	document.removeEventListener("mousemove", handleResize);
	document.removeEventListener("mouseup", stopResize);
	document.body.style.cursor = "";
	document.body.style.userSelect = "";
};

onMounted(async () => {
	try {
		await repositoryStore.initializeData();
	} catch (error) {
		console.error("Failed to initialize store data:", error);
	}
});

onUnmounted(() => {
	cleanResize();
});

watch(
	() => selectedFile.value,
	() => {
		if (selectedFile.value) {
			handleFileSelected(selectedFile.value);
		} else {
			fileContent.value = null;
		}
	}
);
</script>

<template>
	<div class="page">
		<div class="flex h-full w-full bg-[#1e1e1e] font-sans">
			<div :style="{ width: sidebarWidth + 'px' }" class="min-w-[200px] flex flex-col border-r flex-shrink-0">
				<!-- File Explorer -->
				<div v-if="isLoadingRepo" class="p-4 text-sm text-center text-gray-400">Loading repository...</div>
				<FileExplorer
					v-else-if="fileTree.length > 0"
					:treeData="fileTree"
					v-model="selectedFile"
					@toggle-expand-item="handleToggleExpandInTree"
				/>
				<div
					v-if="storeErrorMessage && !isLoadingRepo && fileTree.length === 0 && !isLoadingComments"
					class="p-4 text-sm text-red-500"
				>
					{{ storeErrorMessage }}
				</div>
			</div>

			<!-- Resize handle -->
			<div
				class="flex w-1 h-full cursor-col-resize bg-black hover:bg-blue-500 transition-colors"
				@mousedown="startResize"
			></div>

			<!-- Code Editor and Comments -->
			<div class="flex flex-col flex-grow overflow-hidden">
				<div v-if="isLoadingComments && !isLoadingFile" class="p-4 text-sm text-center text-gray-400">
					Loading comments...
				</div>
				<FileTabManager v-else v-model="selectedFile">
					<CodeEditor
						:file-path="selectedFile"
						:file-content="fileContent"
						:is-loading-file="isLoadingFile"
						:comments="currentFileComments"
						:delete-comment-action="deleteCommentAndReload"
						@line-double-clicked="handleLineDoubleClicked"
						@multiline-selected="handleMultilineSelected"
					/>
				</FileTabManager>
			</div>

			<!-- Comment Modals -->
			<SinglelineCommentModal
				:visible="isAddingSinglelineComment"
				:lineNumber="modalLineNumber"
				:filePath="modalFilePath"
				:initialText="modalInitialText"
				@submit="handleSinglelineCommentSubmit"
				@close="closeSinglelineCommentModal"
			/>

			<MultilineCommentModal
				:visible="isAddingMultilineComment"
				:startLineNumber="modalStartLineNumber"
				:endLineNumber="modalEndLineNumber"
				:filePath="modalFilePath"
				:initialText="multilineModalInitialText"
				@submit="handleMultilineCommentSubmit"
				@close="closeMultilineCommentModal"
			/>
		</div>
	</div>
</template>
