<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'; // Added watch
import FileExplorer from './components/FileExplorer.vue';
import CodeEditor from './components/CodeEditor.vue';
import CommentModal from './components/CommentModal.vue';
import type { TreeNode } from './types/github';
import type { Comment } from './types/comment';
import { fetchRepoTreeAPI, fetchFileContentAPI } from './api/githubApi';
import { fetchComments, addComment } from './api/commentsApi'; // Import comments API functions

const repoUrl = ref<string>('');
const branch = ref<string>('main');
const commentsApiUrl = ref<string | null>(null); // To store the commentsApiUrl from query params

const fileTreeData = ref<TreeNode[]>([]);
const selectedFile = ref<string | null>(null);
const fileContent = ref<string | null>(null);
const errorMessage = ref<string>('');
const isLoadingRepo = ref<boolean>(false);
const isLoadingFile = ref<boolean>(false);
const isLoadingComments = ref<boolean>(false); // For loading comments
const GITHUB_PAT = import.meta.env.VITE_GITHUB_PAT;

// Modal State
const isModalVisible = ref(false);
const modalLineNumber = ref<number | null>(null);
const modalFilePath = ref<string | null>(null);
const modalInitialText = ref("");

// Store all fetched comments from the backend for the current config
const backendComments = ref<Comment[]>([]);

// Computed property to get comments for the currently selected file
// Filters backendComments by selectedFile.value
const currentFileComments = computed(() => {
  if (selectedFile.value && backendComments.value.length > 0) {
    return backendComments.value.filter(comment => comment.filePath === selectedFile.value);
  }
  return [];
});

// Extended to include commentsApiUrl
function initializeApp() {
  const params = new URLSearchParams(window.location.search);
  const repoUrlParam = params.get('repoUrl');
  const commentsApiUrlParam = params.get('commentsApiUrl'); // Get commentsApiUrl

  if (!repoUrlParam) {
    errorMessage.value = 'Missing repoUrl query parameter. Example: ?repoUrl=https://github.com/owner/repo&branch=main&commentsApiUrl=http://localhost:4000/api/comments/1';
    return false;
  }
  if (!commentsApiUrlParam) {
    errorMessage.value = 'Missing commentsApiUrl query parameter. Example: ?repoUrl=https://github.com/owner/repo&branch=main&commentsApiUrl=http://localhost:4000/api/comments/1';
    return false;
  }

  // Basic validation for GitHub URL
  if (!repoUrlParam.startsWith('https://github.com/')) {
      errorMessage.value = 'Invalid GitHub repo URL. Must start with https://github.com/';
      return false;
  }
  try {
      // Validate commentsApiUrlParam (basic check)
      new URL(commentsApiUrlParam);
  } catch (e) {
      errorMessage.value = 'Invalid commentsApiUrl parameter.';
      return false;
  }


  repoUrl.value = repoUrlParam;
  branch.value = params.get('branch') || 'main';
  commentsApiUrl.value = commentsApiUrlParam; // Store it

  return true;
}

async function loadComments() {
  if (!commentsApiUrl.value) return;
  isLoadingComments.value = true;
  try {
    backendComments.value = await fetchComments(commentsApiUrl.value);
  } catch (e: any) {
    errorMessage.value = `Failed to load comments: ${e.message}`;
    console.error("Error fetching comments:", e);
    backendComments.value = []; // Clear comments on error
  } finally {
    isLoadingComments.value = false;
  }
}

async function fetchRepoTree() {
  // ...existing code...
  if (!repoUrl.value || errorMessage.value) return;
  isLoadingRepo.value = true;
  errorMessage.value = '';
  fileTreeData.value = [];
  selectedFile.value = null;
  fileContent.value = null;

  try {
    fileTreeData.value = await fetchRepoTreeAPI(repoUrl.value, branch.value, GITHUB_PAT);
  } catch (e: any) {
    errorMessage.value = e.message;
    console.error("Error fetching repo tree:", e);
  } finally {
    isLoadingRepo.value = false;
  }
}

async function handleFileSelected(path: string) {
  // ...existing code...
  if (!path || path === selectedFile.value) return;
  selectedFile.value = path;
  fileContent.value = null;
  isLoadingFile.value = true;

  try {
    fileContent.value = await fetchFileContentAPI(repoUrl.value, branch.value, path, GITHUB_PAT);
  } catch (e: any) {
    fileContent.value = `Error loading file: ${e.message}`;
    console.error("Error fetching file content:", e);
  } finally {
    isLoadingFile.value = false;
  }
}

// ... handleToggleExpandInTree (no changes needed) ...
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


// Handler for when a line is double-clicked in the CodeEditor
async function handleLineDoubleClicked(payload: { lineNumber: number; filePath: string }) {
  const { lineNumber, filePath } = payload;
  if (!filePath || !commentsApiUrl.value) { // Ensure commentsApiUrl is present
    errorMessage.value = "Cannot add comment: comments API URL is not configured.";
    return;
  }

  // Use currentFileComments (which is already filtered for the current file)
  // or search through backendComments directly if preferred.
  const existingComment = backendComments.value.find(
    c => c.filePath === filePath && c.lineNumber === lineNumber
  );

  modalLineNumber.value = lineNumber;
  modalFilePath.value = filePath;
  modalInitialText.value = existingComment ? existingComment.text : "";
  isModalVisible.value = true;
}

// Handler for when the modal submits a comment
async function handleCommentSubmit(commentText: string) {
  if (modalFilePath.value === null || modalLineNumber.value === null || !commentsApiUrl.value) {
    errorMessage.value = "Cannot save comment: missing data or API URL.";
    return;
  }

  const commentData = {
    filePath: modalFilePath.value,
    lineNumber: modalLineNumber.value,
    text: commentText,
    // tags: [] // Add tag functionality later if needed
  };

  try {
    // If commentText is empty, we might want to implement a delete later,
    // for now, we only add/update. The backend PUT currently only adds.
    // To "delete", user would submit empty string, and we'd need a DELETE endpoint or logic in PUT.
    // For now, an empty comment submission will just be an empty comment.
    // Or, prevent submitting empty comments if text is required by backend (which it is).
    if (!commentText.trim()) {
        // Optionally, show a message to the user that comment text cannot be empty.
        // For now, we just won't submit it if it's only whitespace.
        // Or, if we want to allow "deleting" by submitting empty, the backend needs to handle that.
        // The current backend PUT requires text.
        console.log("Comment text is empty, not submitting.");
        closeCommentModal();
        return;
    }

    await addComment(commentsApiUrl.value, commentData);
    // Refresh comments from backend after adding a new one
    await loadComments();
  } catch (e: any) {
    errorMessage.value = `Failed to save comment: ${e.message}`;
    console.error("Error saving comment:", e);
  } finally {
    closeCommentModal();
  }
}

// ... closeCommentModal (no changes needed) ...
function closeCommentModal() {
  isModalVisible.value = false;
  modalLineNumber.value = null;
  modalFilePath.value = null;
  modalInitialText.value = "";
}

onMounted(async () => { // Make onMounted async
  if (initializeApp()) {
    await fetchRepoTree(); // Wait for repo tree
    if (commentsApiUrl.value) {
      await loadComments(); // Then load comments
    }
  }
});

// Watch for changes in commentsApiUrl to reload comments if it changes (e.g. user manually changes URL)
// This might be an edge case, but good for robustness.
watch(commentsApiUrl, async (newUrl, oldUrl) => {
  if (newUrl && newUrl !== oldUrl) {
    await loadComments();
  }
});
</script>

<template>
	<!-- .vscode-layout equivalent -->
	<div class="app-container">
		<!-- .sidebar-container equivalent -->
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
				v-if="errorMessage && !isLoadingRepo && fileTreeData.length === 0"
				class="error-message"
			>
				{{ errorMessage }}
			</div>
		</div>

		<!-- .editor-group equivalent -->
		<div class="editor-group">
			<div v-if="isLoadingComments" class="loading-message">Loading comments...</div>
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
/* ...existing styles... */
.app-container {
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
