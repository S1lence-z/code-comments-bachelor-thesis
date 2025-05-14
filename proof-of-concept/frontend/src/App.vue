<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FileExplorer from './components/FileExplorer.vue';
import CodeEditor from './components/CodeEditor.vue';
import type { TreeNode, GitHubTreeItem } from './types/github';

const repoUrl = ref<string>('');
const branch = ref<string>('main');
const fileTreeData = ref<TreeNode[]>([]);
const selectedFile = ref<string | null>(null);
const fileContent = ref<string | null>(null);
const errorMessage = ref<string>('');
const isLoadingRepo = ref<boolean>(false);
const isLoadingFile = ref<boolean>(false);

function buildFileTreeFromGitHub(gitHubItems: GitHubTreeItem[]): TreeNode[] {
  const rootNodes: TreeNode[] = [];
  const map: { [path: string]: TreeNode } = {};

  // Sort items by path to help ensure parent directories are processed before children,
  // though the logic tries to handle out-of-order by looking up parents in the map.
  const sortedItems = [...gitHubItems].sort((a, b) => a.path.localeCompare(b.path));

  sortedItems.forEach(item => {
    if (item.type === 'commit') return; // Skip submodules for this example

    const parts = item.path.split('/');
    const itemName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/');

    const node: TreeNode = {
      name: itemName,
      path: item.path,
      type: item.type === 'blob' ? 'file' : 'folder',
      children: [],
      isExpanded: item.type === 'tree' && parts.length === 1, // Expand top-level folders only
    };
    map[item.path] = node;

    if (parentPath && map[parentPath]) {
      map[parentPath].children.push(node);
      map[parentPath].children.sort((a, b) => { // Sort children within parent
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
    } else {
      rootNodes.push(node);
    }
  });

  // Sort root nodes
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
  try {
    const res = await fetch(`${apiBase}/git/trees/${branch.value}?recursive=1`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: `Failed to load repo tree: ${res.status}` }));
      throw new Error(errorData.message || `Failed to load repo tree: ${res.status}`);
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
  // errorMessage.value = ''; // Keep general errors, or clear specific file errors

  const url = new URL(repoUrl.value);
  const [owner, repo] = url.pathname.split('/').filter(Boolean);
  const contentUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch.value}`;

  try {
    const res = await fetch(contentUrl, { headers: { 'Accept': 'application/vnd.github.raw' } });
    if (!res.ok) {
       const errorText = await res.text();
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
  // Find the item in the tree and toggle its isExpanded state
  // This requires traversing the tree. For simplicity, assuming a direct mutation works
  // if the 'item' object is reactive and part of the tree.
  // A more robust way for deeply nested state might involve recreating parts of the tree
  // or using a normalized state structure if performance becomes an issue with huge trees.
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


onMounted(() => {
  if (parseRepoUrlAndBranch()) {
    fetchRepoTree();
  }
});
</script>

<template>
	<div class="vscode-layout">
		<!-- Activity Bar -->
		<div class="activity-bar">
			<div class="activity-icon active" title="Explorer">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					width="24"
					height="24"
				>
					<path
						d="M1.5 1.75a.25.25 0 0 0-.25.25v11.5c0 .138.112.25.25.25h13a.25.25 0 0 0 .25-.25V2a.25.25 0 0 0-.25-.25h-13ZM2.75 3h10.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75V3.75A.75.75 0 0 1 2.75 3Zm0 9.5V13h10.5v-.75a.75.75 0 0 1-.75-.75H3.5a.75.75 0 0 1-.75.75Z"
					></path>
				</svg>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="sidebar-container">
			<div v-if="isLoadingRepo" class="p-4 text-center text-gray-400 text-sm">
				Loading repository...
			</div>
			<FileExplorer
				v-else-if="fileTreeData.length > 0"
				:treeData="fileTreeData"
				:selectedFile="selectedFile"
				@file-selected="handleFileSelected"
				@toggle-expand-item="handleToggleExpandInTree"
			/>
			<div
				v-if="errorMessage && !isLoadingRepo && fileTreeData.length === 0"
				class="p-4 text-red-400 text-sm"
			>
				{{ errorMessage }}
			</div>
		</div>

		<!-- Editor Group -->
		<div class="editor-group">
			<CodeEditor
				:file-path="selectedFile"
				:file-content="fileContent"
				:is-loading-file="isLoadingFile"
			/>
		</div>
	</div>
</template>

<style>
/* Global styles for VSCode-like appearance */
html, body, #app { /* Assuming your Vue app mounts to #app */
  height: 100%;
  margin: 0;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  background-color: #1e1e1e; /* Base background */
}

.vscode-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.activity-bar {
  width: 48px;
  background-color: #333333;
  flex-shrink: 0;
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.activity-icon {
  padding: 12px 0; /* Vertical padding */
  cursor: pointer;
  color: #858585; /* Inactive icon color */
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
}
.activity-icon.active {
  color: #ffffff;
}
.activity-icon.active::before { /* Active indicator line */
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 24px; /* Adjust height as needed */
  background-color: #ffffff;
}
.activity-icon:hover {
  color: #ffffff;
}


.sidebar-container {
  width: 280px;
  min-width: 200px;
  background-color: #252526;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Important for internal scrolling */
  border-right: 1px solid #181818; /* Slightly darker separator */
}

.editor-group {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
