<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import FileExplorer from './components/FileExplorer.vue';
import CodeEditor from './components/CodeEditor.vue';
import type { TreeNode, GitHubTreeItem } from './types/github';

// Define the Comment interface (if not already globally defined or imported)
interface Comment {
  lineNumber: number;
  text: string;
}

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

function buildFileTreeFromGitHub(gitHubItems: GitHubTreeItem[]): TreeNode[] {
  const rootNodes: TreeNode[] = [];
  const map: { [path: string]: TreeNode } = {};

  const sortedItems = [...gitHubItems].sort((a, b) => a.path.localeCompare(b.path));

  sortedItems.forEach(item => {
    if (item.type === 'commit') return;

    const parts = item.path.split('/');
    const itemName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/');

    const node: TreeNode = {
      name: itemName,
      path: item.path,
      type: item.type === 'blob' ? 'file' : 'folder',
      children: [],
      isExpanded: item.type === 'tree' && parts.length === 1,
    };
    map[item.path] = node;

    if (parentPath && map[parentPath]) {
      map[parentPath].children.push(node);
      map[parentPath].children.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
    } else {
      rootNodes.push(node);
    }
  });

  rootNodes.sort((a, b) => {
    if (a.type === 'folder' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });
  return rootNodes;
}

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

  const url = new URL(repoUrl.value);
  const [owner, repo] = url.pathname.split('/').filter(Boolean);
  const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json', // Good practice to specify API version
  };
  if (GITHUB_PAT) {
    headers['Authorization'] = `Bearer ${GITHUB_PAT}`;
  }

  try {
    const res = await fetch(`${apiBase}/git/trees/${branch.value}?recursive=1`, { headers }); // Pass headers
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: `Failed to load repo tree: ${res.status} ${res.statusText}` }));
      throw new Error(errorData.message || `Failed to load repo tree: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.tree || !Array.isArray(data.tree)) {
      throw new Error('Invalid tree data received from GitHub API.');
    }
    fileTreeData.value = buildFileTreeFromGitHub(data.tree as GitHubTreeItem[]);
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

  // Comments for the new file are already handled by currentFileComments computed property

  const url = new URL(repoUrl.value);
  const [owner, repo] = url.pathname.split('/').filter(Boolean);
  const contentUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch.value}`;

  const headers: HeadersInit = {
    // For raw content, GitHub expects this specific Accept header
    'Accept': 'application/vnd.github.raw',
  };
  if (GITHUB_PAT) {
    headers['Authorization'] = `Bearer ${GITHUB_PAT}`;
  }

  try {
    // Note: The 'Accept: application/vnd.github.raw' header for fetching raw content
    // should be sent to the /contents API endpoint, not directly to raw.githubusercontent.com
    // If you were previously using raw.githubusercontent.com, that URL doesn't take auth headers
    // the same way the API does. The /contents endpoint with the right Accept header is better.

    const res = await fetch(contentUrl, { headers }); // Pass headers
    if (!res.ok) {
      const errorText = await res.text(); // Raw endpoint might not return JSON on error
      throw new Error(`Status ${res.status}: ${errorText || 'Failed to load file content.'}`);
    }
    fileContent.value = await res.text();
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
