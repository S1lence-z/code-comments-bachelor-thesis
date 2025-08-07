<script setup lang="ts">
import { ref, onMounted, watch, provide } from "vue";
import FileExplorer from "../components/codeReview/FileExplorer.vue";
import CodeEditor from "../components/codeReview/CodeEditor.vue";
import OtherContentViewer from "../components/codeReview/ContentViewer.vue";
import type ICommentDto from "../../../shared/dtos/ICommentDto";
import { CommentType } from "../../../shared/enums/CommentType.ts";
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
import { keyboardModeContextKey, projectCommentModalContextKey, fileCommentModalContextKey } from "../core/keys.ts";
import CommentFormPanel from "../components/codeReview/CommentFormPanel.vue";

// Provide IsKeyboardMode Context
const isKeyboardMode = ref(false);
function updateKeyboardModeState(value: boolean) {
	isKeyboardMode.value = value;
}
provide(keyboardModeContextKey, { isKeyboardMode: isKeyboardMode, updateKeyboardModeState });

// Router
const route = useRoute();

// Stores
const projectStore = useProjectStore();
const repositoryStore = useRepositoryStore();
const fileContentStore = useFileContentStore();

// Store refs
const { repositoryUrl, writeApiUrl, repositoryBranch, githubPat } = storeToRefs(projectStore);
const { fileTree, allComments, isLoadingRepository, isLoadingComments } = storeToRefs(repositoryStore);

// State for file explorer
const showSideBar = ref<boolean>(true);

// State for save workspace
const saveWorkspace = ref<boolean>(false);

// Local state for file selection and content
const selectedFilePath = ref<string | null>(null);
const processedSelectedFile = ref<ProcessedFile | null>(null);
const isLoadingFile = ref<boolean>(false);

// Resizable sidebar state
const sidebarWidth = ref(280);
const minSidebarWidth = 200;
const maxSidebarWidth = 450;
const sidebar = ref<HTMLElement | null>(null);

// Handle file selection and loading
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

// Comment form state
const commentFilePath = ref<string | null>(null);
const startLineNumber = ref<number | null>(null);
const endLineNumber = ref<number | null>(null);
const commentId = ref<number | null>(null);
const isAddingComment = ref<boolean>(false);
const addedCommentType = ref<CommentType>(CommentType.Singleline);

function handleSinglelineCommentSelected(payload: { lineNumber: number; filePath: string }) {
	const { lineNumber, filePath } = payload;
	if (!filePath || !writeApiUrl.value) {
		console.error("Cannot add comment: comments API URL is not configured.");
		return;
	}
	const existingComment = allComments.value.find(
		(c: ICommentDto) => c.filePath === filePath && c.lineNumber === lineNumber
	);

	// Set the form state variables
	commentFilePath.value = filePath;
	startLineNumber.value = lineNumber;
	endLineNumber.value = null;
	commentId.value = existingComment ? existingComment.id : null;
	addedCommentType.value = CommentType.Singleline;
	isAddingComment.value = true;
}

function handleMultilineCommentSelected(payload: {
	selectedStartLineNumber: number;
	selectedEndLineNumber: number;
	filePath: string;
}) {
	const { selectedStartLineNumber, selectedEndLineNumber, filePath } = payload;
	if (!filePath || !writeApiUrl.value) {
		console.error("Cannot add comment: comments API URL is not configured.");
		return;
	}
	const existingComment = allComments.value.find(
		(c: ICommentDto) => c.filePath === filePath && c.startLineNumber === selectedStartLineNumber
	);

	commentFilePath.value = filePath;
	startLineNumber.value = selectedStartLineNumber;
	endLineNumber.value = selectedEndLineNumber;
	commentId.value = existingComment ? existingComment.id : null;
	addedCommentType.value = CommentType.Multiline;
	isAddingComment.value = true;
}

const handleFileCommentSelected = (filePath: string) => {
	console.log("File comment selected:", filePath);
	const existingComment = allComments.value.find(
		(comment: ICommentDto) => comment.filePath === filePath && comment.type === CommentType.File
	);

	commentId.value = existingComment ? existingComment.id : null;
	commentFilePath.value = filePath;
	addedCommentType.value = CommentType.File;
	isAddingComment.value = true;
};

provide(fileCommentModalContextKey, {
	handleFileCommentSelected,
});

//#region Project comment modal
const isAddingProjectComment = ref(false);
const projectCommentData = ref<{ content: string }>({
	content: "",
});
const updateIsAddingProjectComment = (value: boolean) => {
	isAddingProjectComment.value = value;
};
const updateProjectCommentData = (content: string) => {
	const existingComment = allComments.value.find((comment: ICommentDto) => comment.type === CommentType.Project);
	if (existingComment) {
		projectCommentData.value.content = existingComment.content;
		return;
	}
	// Adding new comment data
	projectCommentData.value.content = content;
};
provide(projectCommentModalContextKey, {
	updateIsAddingProjectComment,
	updateProjectCommentData,
});

function closeProjectCommentModal() {
	isAddingProjectComment.value = false;
	projectCommentData.value.content = "";
}

async function handleProjectCommentSubmit() {
	if (!projectCommentData.value.content.trim() || !writeApiUrl.value) {
		alert("Cannot save project comment: content is empty or API URL is not configured.");
		return;
	}

	const commentToSubmit: ICommentDto = {
		id: 0,
		filePath: projectStore.getRepositoryName,
		content: projectCommentData.value.content,
		type: CommentType.Project,
	};

	// Find the existing comment or create a new one
	allComments.value.forEach((comment: ICommentDto) => {
		if (comment.type === CommentType.Project) {
			commentToSubmit.id = comment.id;
		}
	});

	// Submit the comment
	try {
		await repositoryStore.upsertCommentAsync(commentToSubmit, writeApiUrl.value);
	} catch (e: any) {
		console.error("Failed to save comment:", e);
	} finally {
		closeProjectCommentModal();
	}
}
//#endregion

// Handle resize events from ResizeHandle component
const handleSidebarResize = (newWidth: number) => {
	sidebarWidth.value = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, newWidth));
}; // TODO: add the handling the line number if applicable
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

// Handle edit button for the codemirror widget
const handleEditComment = async (commentId: number) => {
	// Take the comment ID and open the modal for editing
	const editedComment = allComments.value.find((comment: ICommentDto) => comment.id === commentId);
	if (!editedComment) {
		console.error("Comment not found for ID:", commentId);
		return;
	}

	// Get the comment type
	const commentType: CommentType = editedComment.type;
	if (commentType === CommentType.Singleline) {
		handleSinglelineCommentSelected({
			lineNumber: editedComment.lineNumber || 0,
			filePath: editedComment.filePath,
		});
	} else if (commentType === CommentType.Multiline) {
		handleMultilineCommentSelected({
			selectedStartLineNumber: editedComment.startLineNumber || 0,
			selectedEndLineNumber: editedComment.endLineNumber || 0,
			filePath: editedComment.filePath,
		});
	} else {
		console.error("Unsupported comment type:", commentType);
	}
};

onMounted(async () => {
	await initRepositoryStore();
});

watch(
	() => selectedFilePath.value,
	() => {
		if (selectedFilePath.value) {
			handleFileSelected(selectedFilePath.value);
		}
	}
);

watch(
	() => route.query.file,
	() => {
		handleFileQueryParam();
	}
);
</script>

<template>
	<div class="page">
		<div class="flex flex-row h-full w-full">
			<!-- Code Editor Section-->
			<div class="flex flex-col h-full w-full">
				<!-- Code Editor Toolbar -->
				<CodeReviewToolbar v-model:showSideBar="showSideBar" v-model:saveWorkspace="saveWorkspace" />

				<!-- Code Editor -->
				<div class="flex h-full w-full overflow-hidden">
					<!-- Sidebar -->
					<div ref="sidebar" v-if="showSideBar" class="flex-shrink-0" :style="{ width: sidebarWidth + 'px' }">
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
							v-model:selectedPath="selectedFilePath"
							:treeData="fileTree"
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
						<SplitPanelManager
							v-else
							v-model:selected-file-path="selectedFilePath"
							v-model:saveWorkspace="saveWorkspace"
						>
							<template #default="{ filePath }">
								<div v-if="filePath" class="h-full">
									<div
										v-if="!fileContentStore.isFileCached(filePath)"
										class="p-6 text-sm text-center text-slate-300"
									>
										<div class="inline-flex items-center space-x-2">
											<span class="spinner"></span>
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
											:delete-comment-action="
												async (commentId) =>
													await repositoryStore.deleteCommentAsync(commentId, writeApiUrl)
											"
											:edit-comment-action="handleEditComment"
											@line-double-clicked="handleSinglelineCommentSelected"
											@multiline-selected="handleMultilineCommentSelected"
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
			</div>

			<!-- Comment Add/Edit Form Component -->
			<CommentFormPanel
				v-model:isVisible="isAddingComment"
				:commentFilePath="selectedFilePath"
				:start-line-number="startLineNumber"
				:end-line-number="endLineNumber"
				:comment-id="commentId"
				:comment-type="addedCommentType"
			/>

			<!-- Project Comment Modal -->
			<Modal v-if="isAddingProjectComment" @close="closeProjectCommentModal">
				<Card title="Add a Project Comment">
					<div class="space-y-2">
						<InputArea
							label="Comment"
							v-model="projectCommentData.content"
							placeholder="Enter your comment here..."
							:rows="6"
						/>
						<div class="flex justify-end space-x-2">
							<button @click="closeProjectCommentModal" class="btn btn-secondary">Cancel</button>
							<button
								@click="handleProjectCommentSubmit"
								:disabled="!projectCommentData.content.trim()"
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
