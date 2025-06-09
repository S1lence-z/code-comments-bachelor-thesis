<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import FileExplorer from '../components/FileExplorer.vue';
import CodeEditor from '../components/CodeEditor.vue';
import SinglelineCommentModal from '../components/SinglelineCommentModal.vue';
import MultilineCommentModal from '../components/MultilineCommentModal.vue';
import type { TreeNode } from '../types/githubApi.ts';
import type ICommentDto from '../../../shared/dtos/ICommentDto';
import { fetchRepoTreeAPI, fetchFileContentAPI } from '../api/githubApi.ts';
import { fetchComments, addComment } from '../api/commentsApi.ts';
import { CommentType } from '../../../shared/enums/CommentType.ts';

const props = defineProps<{
  repoUrl: string;
  initialBranch: string;
  writeApiUrl: string;
}>();

const branch = ref(props.initialBranch || 'main');
const fileTreeData = ref<TreeNode[]>([]);
const selectedFile = ref<string | null>(null);
const fileContent = ref<string | null>(null);
const errorMessage = ref<string>('');
const isLoadingRepo = ref<boolean>(false);
const isLoadingFile = ref<boolean>(false);
const isLoadingComments = ref<boolean>(false);
const GITHUB_PAT = import.meta.env.VITE_GITHUB_PAT || '';

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

const backendComments = ref<ICommentDto[]>([]);

const currentFileComments = computed(() => {
  if (selectedFile.value && backendComments.value.length > 0) {
    return backendComments.value.filter(comment => comment.filePath === selectedFile.value);
  }
  return [];
});

async function loadComments() {
  if (!props.writeApiUrl) return;
  isLoadingComments.value = true;
  try {
    const response = await fetchComments(props.writeApiUrl);
    backendComments.value = response.comments || [];
  } catch (e: any) {
    errorMessage.value = `Failed to load comments: ${e.message}`;
    console.error("Error fetching comments:", e);
    backendComments.value = [];
  } finally {
    isLoadingComments.value = false;
  }
}

async function localFetchRepoTree() {
  if (!props.repoUrl) return;
  isLoadingRepo.value = true;
  errorMessage.value = '';
  fileTreeData.value = [];
  selectedFile.value = null;
  fileContent.value = null;

  try {
    fileTreeData.value = await fetchRepoTreeAPI(props.repoUrl, branch.value, GITHUB_PAT);
  } catch (e: any) {
    errorMessage.value = e.message;
    console.error("Error fetching repo tree:", e);
  } finally {
    isLoadingRepo.value = false;
  }
}

async function handleFileSelected(path: string) {
  if (!path || path === selectedFile.value) return;
  selectedFile.value = path;
  fileContent.value = null;
  isLoadingFile.value = true;

  try {
    fileContent.value = await fetchFileContentAPI(props.repoUrl, branch.value, path, GITHUB_PAT);
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
      if (node.path === itemToToggle.path && node.type === 'folder') {
        node.isExpanded = !node.isExpanded;
        return true;
      }
      if (node.children && node.children.length > 0) {
        if (findAndToggle(node.children)) return true;
      }
    }
    return false;
  };
  findAndToggle(fileTreeData.value);
}

function handleLineDoubleClicked(payload: { lineNumber: number; filePath: string }) {
  const { lineNumber, filePath } = payload;
  if (!filePath || !props.writeApiUrl) {
    errorMessage.value = "Cannot add comment: comments API URL is not configured.";
    return;
  }
  const existingComment = backendComments.value.find(
    c => c.filePath === filePath && c.lineNumber === lineNumber
  );
  modalLineNumber.value = lineNumber;
  modalFilePath.value = filePath;
  modalInitialText.value = existingComment ? existingComment.content : "";
  isAddingSinglelineComment.value = true;
}

function handleMultilineSelected(payload: { startLineNumber: number; endLineNumber: number; filePath: string }) {
  const { startLineNumber, endLineNumber, filePath } = payload;
  if (!filePath || !props.writeApiUrl) {
    errorMessage.value = "Cannot add comment: comments API URL is not configured.";
    return;
  }
  modalStartLineNumber.value = startLineNumber;
  modalEndLineNumber.value = endLineNumber;
  modalFilePath.value = filePath;
  isAddingMultilineComment.value = true;
}

async function handleSinglelineCommentSubmit(commentText: string) {
  if (modalFilePath.value === null || modalLineNumber.value === null || !props.writeApiUrl) {
    errorMessage.value = "Cannot save comment: missing data or API URL.";
    return;
  }

  const commentData: ICommentDto = {
    filePath: modalFilePath.value,
    lineNumber: modalLineNumber.value,
    content: commentText,
    type: CommentType.SingleLine,
  };

  if (!commentData.content.trim()) {
    console.log("Comment text is empty, not submitting.");
    closeSinglelineCommentModal();
    return;
  }

  try {
    await addComment(props.writeApiUrl, commentData);
    await loadComments();
  } catch (e: any) {
    errorMessage.value = `Failed to save comment: ${e.message}`;
    console.error("Error saving comment:", e);
  } finally {
    closeSinglelineCommentModal();
  }
}

async function handleMultilineCommentSubmit(commentText: string) {
  if (modalFilePath.value === null || modalStartLineNumber.value === null || modalEndLineNumber.value === null || !props.writeApiUrl) {
    errorMessage.value = "Cannot save comment: missing data or API URL.";
    return;
  }

  const commentData: ICommentDto = {
    filePath: modalFilePath.value,
    content: commentText,
    type: CommentType.MultiLine,
    startLineNumber: modalStartLineNumber.value,
    endLineNumber: modalEndLineNumber.value,
  };

  console.log("Submitting multiline comment:", commentData);
  console.log(typeof commentText, commentText);

  if (!commentData.content.trim()) {
    console.log("Comment text is empty, not submitting.");
    closeMultilineCommentModal();
    return;
  }

  try {
    await addComment(props.writeApiUrl, commentData);
    await loadComments();
  } catch (e: any) {
    errorMessage.value = `Failed to save comment: ${e.message}`;
    console.error("Error saving comment:", e);
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

onMounted(async () => {
  if (props.repoUrl && props.writeApiUrl) {
    await localFetchRepoTree();
    await loadComments();
  }
});

watch(() => props.writeApiUrl, async (newUrl, oldUrl) => {
  if (newUrl && newUrl !== oldUrl) {
    await loadComments();
  }
});

watch(() => props.repoUrl, async (newUrl, oldUrl) => {
  if (newUrl && newUrl !== oldUrl) {
    await localFetchRepoTree();
    // Potentially reload comments if the repo changes and comments are repo-specific beyond the ID
    if (props.writeApiUrl) await loadComments();
  }
});
</script>

<template>
	<div class="review-page-container">
		<div class="sidebar-container">
			<div v-if="isLoadingRepo" class="loading-message">Loading repository...</div>
			<FileExplorer
				v-else-if="fileTreeData.length > 0"
				:treeData="fileTreeData"
				:selectedFile="selectedFile"
				@file-selected="handleFileSelected"
				@toggle-expand-item="handleToggleExpandInTree"
			/>
			<div
				v-if="errorMessage && !isLoadingRepo && fileTreeData.length === 0 && !isLoadingComments"
				class="error-message"
			>
				{{ errorMessage }}
			</div>
		</div>

		<div class="editor-group">
			<div v-if="isLoadingComments && !isLoadingFile" class="loading-message">
				Loading comments...
			</div>
			<CodeEditor
				v-else
				:file-path="selectedFile"
				:file-content="fileContent"
				:is-loading-file="isLoadingFile"
				:comments="currentFileComments"
				:write-api-url="props.writeApiUrl"
				@line-double-clicked="handleLineDoubleClicked"
				@multiline-selected="handleMultilineSelected"
			/>
		</div>

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
</template>

<style scoped>
.review-page-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #1e1e1e;
  font-family: sans-serif;
}

.sidebar-container {
  width: 280px;
  min-width: 200px;
  background-color: #252526;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
  border-right: 1px solid #181818;
}

.editor-group {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.loading-message {
  padding: 16px;
  text-align: center;
  color: gray;
  font-size: 14px;
}

.error-message {
  padding: 16px;
  color: red;
  font-size: 14px;
}
</style>
