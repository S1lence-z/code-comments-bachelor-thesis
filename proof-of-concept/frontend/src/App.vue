<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import FileExplorer from './components/FileExplorer.vue';
import CodeEditor from './components/CodeEditor.vue';
import type { TreeNode } from './types/github';
import type { Comment } from './types/comment';
import { fetchRepoTreeAPI, fetchFileContentAPI } from './api/githubApi';

const repoUrl = ref<string>('');
const branch = ref<string>('main');
const fileTreeData = ref<TreeNode[]>([]);
const selectedFile = ref<string | null>(null);
const fileContent = ref<string | null>(null);
const errorMessage = ref<string>('');
const isLoadingRepo = ref<boolean>(false);
const isLoadingFile = ref<boolean>(false);
const GITHUB_PAT = import.meta.env.VITE_GITHUB_PAT;

// Reactive state for storing comments, keyed by file path
const allComments = ref<Record<string, Comment[]>>({});

// Computed property to get comments for the currently selected file
const currentFileComments = computed(() => {
  if (selectedFile.value) {
    return allComments.value[selectedFile.value] || [];
  }
  return [];
});

function parseRepoUrlAndBranch() {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('repo_url');
    if (!urlParam) {
      errorMessage.value = 'Missing repo_url query parameter. Example: ?repo_url=https://github.com/owner/repo&branch=main';
      return false;
    }
    if (!urlParam.startsWith('https://github.com/')) {
      errorMessage.value = 'Invalid GitHub repo URL. Must start with https://github.com/';
      return false;
    }
    const tempUrl = new URL(urlParam);
    const pathParts = tempUrl.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      errorMessage.value = 'Invalid GitHub repo URL. Must be in format https://github.com/owner/repo.';
      return false;
    }
    repoUrl.value = urlParam;
    branch.value = params.get('branch') || 'main';
    return true;
  } catch (e) {
    errorMessage.value = 'Invalid repo_url parameter.';
    return false;
  }

}

async function fetchRepoTree() {
  if (!repoUrl.value || errorMessage.value) return;
  isLoadingRepo.value = true;
  errorMessage.value = '';
  fileTreeData.value = [];
  selectedFile.value = null;
  fileContent.value = null;

  try {
    // Use the new API function
    fileTreeData.value = await fetchRepoTreeAPI(repoUrl.value, branch.value, GITHUB_PAT);
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
  fileContent.value = null; // Clear previous content
  isLoadingFile.value = true;

  try {
    // Use the new API function
    fileContent.value = await fetchFileContentAPI(repoUrl.value, branch.value, path, GITHUB_PAT);
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

// Handler for when a line is double-clicked in the CodeEditor
async function handleLineDoubleClicked(payload: { lineNumber: number; filePath: string }) {
  const { lineNumber, filePath } = payload;
  const commentText = window.prompt(`Enter comment for line ${lineNumber} in ${filePath.split('/').pop()}:`);

  if (commentText) {
    const newComment: Comment = { lineNumber, text: commentText };
    if (!allComments.value[filePath]) {
      allComments.value[filePath] = [];
    }
    // Add the new comment and ensure it's sorted by line number for consistent display
    const fileComments = allComments.value[filePath];
    fileComments.push(newComment);
    fileComments.sort((a, b) => a.lineNumber - b.lineNumber);
    // Vue's reactivity should handle the update automatically
  }
}

onMounted(() => {

  if (parseRepoUrlAndBranch()) {
    fetchRepoTree();
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
			<CodeEditor
				:file-path="selectedFile"
				:file-content="fileContent"
				:is-loading-file="isLoadingFile"
				:comments="currentFileComments"
				@line-double-clicked="handleLineDoubleClicked"
			/>
		</div>
	</div>
</template>

<style scoped>
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
