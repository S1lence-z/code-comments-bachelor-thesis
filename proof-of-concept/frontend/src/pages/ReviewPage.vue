<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import FileExplorer from '../components/FileExplorer.vue';
import CodeEditor from '../components/CodeEditor.vue';
import CommentModal from '../components/CommentModal.vue';
import type { TreeNode } from '../types/github';
import type { Comment } from '../types/comment';
import { fetchRepoTreeAPI, fetchFileContentAPI } from '../api/githubApi';
import { fetchComments, addComment } from '../api/commentsApi';

const props = defineProps<{
  repoUrl: string;
  initialBranch: string;
  commentsApiUrl: string;
}>();

const branch = ref(props.initialBranch || 'main');
const fileTreeData = ref<TreeNode[]>([]);
const selectedFile = ref<string | null>(null);
const fileContent = ref<string | null>(null);
const errorMessage = ref<string>('');
const isLoadingRepo = ref<boolean>(false);
const isLoadingFile = ref<boolean>(false);
const isLoadingComments = ref<boolean>(false);
const GITHUB_PAT = import.meta.env.VITE_GITHUB_PAT;

const isModalVisible = ref(false);
const modalLineNumber = ref<number | null>(null);
const modalFilePath = ref<string | null>(null);
const modalInitialText = ref("");

const backendComments = ref<Comment[]>([]);

const currentFileComments = computed(() => {
  if (selectedFile.value && backendComments.value.length > 0) {
    return backendComments.value.filter(comment => comment.filePath === selectedFile.value);
  }
  return [];
});

async function loadComments() {
  if (!props.commentsApiUrl) return;
  isLoadingComments.value = true;
  try {
    backendComments.value = await fetchComments(props.commentsApiUrl);
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

async function handleLineDoubleClicked(payload: { lineNumber: number; filePath: string }) {
  const { lineNumber, filePath } = payload;
  if (!filePath || !props.commentsApiUrl) {
    errorMessage.value = "Cannot add comment: comments API URL is not configured.";
    return;
  }
  const existingComment = backendComments.value.find(
    c => c.filePath === filePath && c.lineNumber === lineNumber
  );
  modalLineNumber.value = lineNumber;
  modalFilePath.value = filePath;
  modalInitialText.value = existingComment ? existingComment.text : "";
  isModalVisible.value = true;
}

async function handleCommentSubmit(commentText: string) {
  if (modalFilePath.value === null || modalLineNumber.value === null || !props.commentsApiUrl) {
    errorMessage.value = "Cannot save comment: missing data or API URL.";
    return;
  }
  const commentData = {
    filePath: modalFilePath.value,
    lineNumber: modalLineNumber.value,
    text: commentText,
  };
  if (!commentText.trim()) {
    console.log("Comment text is empty, not submitting.");
    closeCommentModal();
    return;
  }
  try {
    await addComment(props.commentsApiUrl, commentData);
    await loadComments();
  } catch (e: any) {
    errorMessage.value = `Failed to save comment: ${e.message}`;
    console.error("Error saving comment:", e);
  } finally {
    closeCommentModal();
  }
}

function closeCommentModal() {
  isModalVisible.value = false;
  modalLineNumber.value = null;
  modalFilePath.value = null;
  modalInitialText.value = "";
}

onMounted(async () => {
  if (props.repoUrl && props.commentsApiUrl) {
    await localFetchRepoTree();
    await loadComments();
  }
});

watch(() => props.commentsApiUrl, async (newUrl, oldUrl) => {
  if (newUrl && newUrl !== oldUrl) {
    await loadComments();
  }
});

watch(() => props.repoUrl, async (newUrl, oldUrl) => {
  if (newUrl && newUrl !== oldUrl) {
    await localFetchRepoTree();
    // Potentially reload comments if the repo changes and comments are repo-specific beyond the ID
    if (props.commentsApiUrl) await loadComments();
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
				@line-double-clicked="handleLineDoubleClicked"
			/>
		</div>

		<CommentModal
			:visible="isModalVisible"
			:lineNumber="modalLineNumber"
			:filePath="modalFilePath"
			:initialText="modalInitialText"
			@submit="handleCommentSubmit"
			@close="closeCommentModal"
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
