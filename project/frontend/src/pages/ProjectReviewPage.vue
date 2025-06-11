<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { fetchRepoTreeAPI } from "../api/githubApi";
import { fetchComments, addComment } from "../api/commentsApi";
import { type TreeNode } from "../types/githubApi";
import type ICommentDto from "../../../shared/dtos/ICommentDto";
import type IGetCommentsResponse from "../../../shared/api/IGetCommentsResponse";
import { CommentType } from "../../../shared/enums/CommentType";

const projectStructure = ref<TreeNode[]>([]);
const GITHUB_PAT = import.meta.env.VITE_GITHUB_PAT || "";
const repoUrl = ref<string>("");
const branchName = ref<string>("");
const apiUrl = ref<string>("");
const allComments = ref<ICommentDto[]>([]);
const containsChangedComments = ref<boolean>(false);

// Local comments state to hold comments for the current session
// TODO: use pinia to persist comments across sessions
const localComments = reactive({
  fileComments: {} as Record<string, string>,
  projectOverviewComment: ""
});

onMounted(async () => {
  // Get the params from the url
  const urlParams = new URLSearchParams(window.location.search);

  // Extract repoUrl and branchName from the query parameters
  repoUrl.value = urlParams.get("repoUrl") || "";
  if (!repoUrl.value) {
    console.error("No repoUrl provided in the query parameters.");
    return;
  }

  // Default to 'main' if branchName is not provided
  branchName.value = urlParams.get("branch") || "";
  if (!branchName.value) {
    console.error("No branchName provided in the query parameters, defaulting to 'main'.")
    return;
  }

  // Extract commentsApiUrl from the query parameters
  apiUrl.value = urlParams.get("commentsApiUrl") || "";
  if (!apiUrl.value) {
    console.error("No commentsApiUrl provided in the query parameters.");
    return;
  }

  // Fetch all necessary data
  await loadRepoTree();
  await loadComments();
});

async function loadRepoTree() {
  if (!repoUrl.value || !branchName.value) {
    console.error("repoUrl or branchName is not set.");
    return;
  }

  try {
    const tree = await fetchRepoTreeAPI(decodeURIComponent(repoUrl.value), decodeURIComponent(branchName.value), GITHUB_PAT);
    projectStructure.value = tree;
  } catch (error) {
    console.error("Failed to fetch project structure:", error);
  }
}

async function loadComments() {
  if (!repoUrl.value || !branchName.value) {
    console.error("repoUrl or branchName is not set.");
    return;
  }

  try {
    const commentsResponse: IGetCommentsResponse = await fetchComments(apiUrl.value);
    allComments.value = commentsResponse.comments || [];

    // Initialize local comments from fetched data
    localComments.fileComments = {};
    allComments.value.forEach(comment => {
      if (comment.type === CommentType.File) {
        // Only add file comments to local state
        localComments.fileComments[comment.filePath] = comment.content;
      } else if (comment.type === CommentType.Project) {
        localComments.projectOverviewComment = comment.content;
      }
    });
    console.log("Comments loaded successfully:", allComments.value);
  } catch (error) {
    allComments.value = [];
    console.error("Failed to fetch comments:", error);
  }
}

async function saveCommentsUsingApi() {
  try {
    if (!apiUrl.value || !repoUrl.value || !branchName.value) {
      console.error("API URL, repoUrl, or branchName is not set.");
      return;
    }

    // Prepare the comments from the local state
    const commentsToSave: ICommentDto[] = Object.entries(localComments.fileComments).map(([localFilePath, content]) => ({
      id: 0,
      filePath: localFilePath,
      content: content,
      type: CommentType.File
    }));
    // Add the project overview comment if it exists
    commentsToSave.push({
      id: 0,
      filePath: repoUrl.value,
      content: localComments.projectOverviewComment,
      type: CommentType.Project
    });

    // Send comments to the API
    for (const comment of commentsToSave) {
      if (!comment.filePath || !comment.content) {
        console.warn("Skipping comment with missing filePath or content:", comment);
        continue;
      }
      const response = await addComment(apiUrl.value, comment);
      if (!response.success) {
        throw new Error(`Failed to save comment for ${comment.filePath}`);
      }
    }

    console.log("Comments saved successfully");
  } catch (error) {
    console.error("Error saving comments:", error);
  } finally {
    containsChangedComments.value = false;
  }
}

const selectedItem = ref<string | null>(null);
const expandedFolders = ref<Set<string>>(new Set());
const searchQuery = ref("");
const currentFolderPath = ref<string>("");
const currentFolderContents = ref<TreeNode[]>([]);

const toggleFolder = (path: string) => {
  if (expandedFolders.value.has(path)) {
    expandedFolders.value.delete(path);
  } else {
    expandedFolders.value.add(path);
  }
};

const selectItem = (path: string) => {
  selectedItem.value = path;
};

const findFolder = (items: TreeNode[], targetPath: string): TreeNode | null => {
  for (const item of items) {
    if (item.path === targetPath && item.type === "folder") {
      return item;
    }
    if (item.children) {
      const found = findFolder(item.children, targetPath);
      if (found) return found;
    }
  }
  return null;
};

const navigateToFolder = (folderPath: string) => {
  currentFolderPath.value = folderPath;

  if (folderPath === "") {
    // Root level
    currentFolderContents.value = projectStructure.value;
  } else {
    const folder = findFolder(projectStructure.value, folderPath);
    currentFolderContents.value = folder?.children || [];
  }

  // Clear selection when navigating
  selectedItem.value = null;
};

const navigateToParent = () => {
  if (currentFolderPath.value === "") return; // Already at root

  const pathParts = currentFolderPath.value.split('/');
  pathParts.pop(); // Remove last part
  const parentPath = pathParts.join('/');

  navigateToFolder(parentPath);
};

const handleItemClick = (item: TreeNode) => {
  selectItem(item.path);
};

const handleItemDoubleClick = (item: TreeNode) => {
  if (item.type === "folder") {
    navigateToFolder(item.path);
  }
};

// Watch for changes in project structure to initialize navigation
watch(projectStructure, () => {
  currentFolderPath.value = "";
  currentFolderContents.value = projectStructure.value;
}, { immediate: true });

const saveFileComment = (path: string, comment: string) => {
  containsChangedComments.value = true;
  if (comment.trim() === "") {
    containsChangedComments.value = false;
    delete localComments.fileComments[path];
  } else {
    localComments.fileComments[path] = comment;
  }
};

const saveProjectOverviewComment = (comment: string) => {
  containsChangedComments.value = true;
  if (comment.trim() === "") {
    containsChangedComments.value = false;
    localComments.projectOverviewComment = "";
  } else {
    localComments.projectOverviewComment = comment;
  }
};

const getCommentForPath = (path: string) => {
  return localComments.fileComments[path] || "";
};

// Filter project structure based on search query
const filterItems = (items: any[], query: string): any[] => {
  return items.filter(item => {
    const nameMatches = item.name.toLowerCase().includes(query);
    const pathMatches = item.path.toLowerCase().includes(query);

    if (item.children) {
      const filteredChildren = filterItems(item.children, query);
      return nameMatches || pathMatches || filteredChildren.length > 0;
    }

    return nameMatches || pathMatches;
  }).map(item => {
    if (item.children) {
      return {
        ...item,
        children: filterItems(item.children, query)
      };
    }
    return item;
  });
};

const filteredProjectStructure = computed(() => {
  if (!searchQuery.value.trim()) {
    return currentFolderContents.value;
  }

  const query = searchQuery.value.toLowerCase();

  return filterItems(currentFolderContents.value, query);
});
</script>

<template>
	<div class="project-review-page">
		<div class="page-header">
			<h1>Project Review</h1>
			<p class="page-description">
				Add comments and feedback for the project structure, folders, and individual files
			</p>
		</div>
		<div class="review-content">
			<!-- File Structure Section -->
			<div class="review-section file-structure-section">
				<div class="section-header">
					<h2>File Structure Review</h2>
				</div>

				<div class="structure-review-container">
					<!-- File Explorer Side -->
					<div class="file-explorer-panel">
						<h3>Project Structure</h3>

						<!-- Navigation Header -->
						<div class="navigation-header">
							<div class="current-path">
								{{ currentFolderPath || "/" }}
							</div>
							<button
								v-if="currentFolderPath"
								@click="navigateToParent"
								class="parent-button"
							>
								..
							</button>
						</div>

						<div class="search-container">
							<input
								v-model="searchQuery"
								type="text"
								placeholder="Search files and folders..."
								class="search-input"
							/>
						</div>
						<div class="file-tree">
							<template v-for="item in filteredProjectStructure" :key="item.path">
								<div class="tree-item">
									<div
										class="tree-item-header"
										:class="{ 
                      'selected': selectedItem === item.path,
                      'has-comment': getCommentForPath(item.path)
                    }"
										@click="handleItemClick(item)"
										@dblclick="handleItemDoubleClick(item)"
									>
										<button
											v-if="item.type === 'folder'"
											@click.stop="toggleFolder(item.path)"
											class="folder-toggle"
										>
											{{ expandedFolders.has(item.path) ? '📂' : '📁' }}
										</button>
										<span v-else class="file-icon">📄</span>
										<span class="item-name">{{ item.name }}</span>
										<span
											v-if="getCommentForPath(item.path)"
											class="comment-indicator"
											>💬</span
										>
									</div>

									<div
										v-if="item.type === 'folder' && expandedFolders.has(item.path) && item.children"
										class="tree-children"
									>
										<div
											v-for="child in item.children"
											:key="child.path"
											class="tree-item-header child-item"
											:class="{ 
                        'selected': selectedItem === child.path,
                        'has-comment': getCommentForPath(child.path)
                      }"
											@click="handleItemClick(child)"
											@dblclick="handleItemDoubleClick(child)"
										>
											<span class="file-icon">
												{{ child.type === 'folder' ? '📁' : '📄' }}
											</span>
											<span class="item-name">{{ child.name }}</span>
											<span
												v-if="getCommentForPath(child.path)"
												class="comment-indicator"
												>💬</span
											>
										</div>
									</div>
								</div>
							</template>
						</div>
					</div>

					<!-- Comment Panel Side -->
					<div class="comment-panel">
						<div v-if="selectedItem" class="comment-section">
							<h3>Comment for: {{ selectedItem }}</h3>
							<div class="comment-input-container">
								<label :for="`comment-${selectedItem}`" class="comment-label">
									Add your feedback for this
									{{ selectedItem.includes('.') ? 'file' : 'folder' }}
								</label>
								<textarea
									:id="`comment-${selectedItem}`"
									:value="getCommentForPath(selectedItem)"
									@input="saveFileComment(selectedItem, ($event.target as HTMLTextAreaElement).value)"
									placeholder="Enter your comments, suggestions, or feedback for this item..."
									class="comment-textarea"
									rows="20"
								></textarea>
							</div>
						</div>

						<div v-else class="no-selection">
							<div class="no-selection-content">
								<span class="no-selection-icon">👈</span>
								<h3>Select a file or folder</h3>
								<p>
									Choose an item from the project structure to add comments and
									feedback
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Summary Section with Project Overview -->
			<div class="review-section summary-section">
				<!-- Project Overview -->
				<div class="project-overview-section">
					<div class="section-header">
						<h2>Project Overview</h2>
					</div>
					<div class="project-comment-card">
						<label for="projectComment" class="comment-label">
							Overall Project Comments
						</label>
						<textarea
							id="projectComment"
							:value="localComments.projectOverviewComment"
							@input="saveProjectOverviewComment(($event.target as HTMLTextAreaElement).value)"
							placeholder="Add your overall thoughts about the project structure, architecture, or general feedback..."
							class="comment-textarea compact"
							rows="3"
						></textarea>
					</div>
				</div>

				<!-- Review Summary -->
				<div class="summary-stats-section">
					<div class="section-header">
						<h2>Review Summary</h2>
					</div>
					<div class="summary-cards">
						<div class="summary-card">
							<div class="summary-number">
								{{ Object.keys(localComments.fileComments).length }}
							</div>
							<div class="summary-label">Files/Folders with Comments</div>
						</div>
						<div class="summary-card">
							<div class="summary-number">
								{{ localComments.projectOverviewComment ? '1' : '0' }}
							</div>
							<div class="summary-label">Project Overview Comment</div>
						</div>
						<div class="summary-card">
							<div class="summary-number">{{ filteredProjectStructure.length }}</div>
							<div class="summary-label">Total Items in Structure</div>
						</div>
					</div>
					<button
						id="save-comments-button"
						@click="saveCommentsUsingApi"
						class="parent-button"
						style="width: 100%;"
						:disabled="!containsChangedComments"
					>
						Save Comments
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.project-review-page {
  height: 100vh;
  width: 100vw;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #1a202c;
}

.page-header {
  text-align: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 0.25rem;
}

.page-description {
  font-size: 1rem;
  color: #a0aec0;
  margin: 0;
}

.review-content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 1rem;
  flex: 1;
  min-height: 0;
}

.review-section {
  background: #2d3748;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid #4a5568;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0 0 1rem 0;
}

.project-comment-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.search-container {
  margin-bottom: 1rem;
}

.navigation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #1a202c;
  border: 1px solid #4a5568;
  border-radius: 6px;
}

.current-path {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #63b3ed;
  flex: 1;
}

.parent-button {
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.parent-button:hover {
  background: #2b6cb0;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #4a5568;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  background-color: #1a202c;
  color: #e2e8f0;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.3);
}

.search-input::placeholder {
  color: #718096;
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.project-overview_section {
  flex-shrink: 0;
}

.summary-stats-section {
  flex: 1;
}

.comment-textarea.compact {
  height: 80px;
  resize: none;
}

.comment-label {
  display: block;
  font-weight: 500;
  color: #a0aec0;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.comment-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #4a5568;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  background-color: #1a202c;
  color: #e2e8f0;
}

.comment-textarea:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.3);
}

.structure-review-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  min-height: 500px;
  flex: 1;
  overflow: hidden;
}

.file-explorer-panel {
  border: 1px solid #4a5568;
  border-radius: 8px;
  padding: 1.5rem;
  background: #2d3748;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-explorer-panel h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #e2e8f0;
  flex-shrink: 0;
}

.file-tree {
  font-size: 0.9rem;
  flex: 1;
  overflow-y: auto;
}

.tree-item {
  margin-bottom: 0.25rem;
}

.tree-item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tree-item-header:hover {
  background-color: #4a5568;
}

.tree-item-header.selected {
  background-color: #3182ce;
  border: 1px solid #63b3ed;
  color: #e2e8f0;
}

.tree-item-header.has-comment {
  background-color: #744210;
}

.tree-item-header.has-comment.selected {
  background-color: #d69e2e;
  color: #1a202c;
}

.folder-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
}

.file-icon {
  font-size: 1rem;
}

.item-name {
  flex: 1;
  font-weight: 500;
  color: #e2e8f0;
}

.comment-indicator {
  font-size: 0.8rem;
}

.tree-children {
  margin-left: 1.5rem;
  border-left: 2px solid #4a5568;
  padding-left: 0.5rem;
}

.child-item {
  margin-bottom: 0.125rem;
}

.comment-panel {
  border: 1px solid #4a5568;
  border-radius: 8px;
  padding: 1.5rem;
  background: #2d3748;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.comment-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #e2e8f0;
  word-break: break-word;
}

.comment-input-container {
  margin-bottom: 1.5rem;
}

.comment-tips {
  background: #1a202c;
  border: 1px solid #4a5568;
  border-radius: 6px;
  padding: 1rem;
}

.comment-tips h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #63b3ed;
}

.comment-tips ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.8rem;
  color: #a0aec0;
}

.comment-tips li {
  margin-bottom: 0.25rem;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.no-selection-content {
  text-align: center;
  color: #a0aec0;
}

.no-selection-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.no-selection h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.no-selection p {
  margin: 0;
  font-size: 0.9rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.summary-card {
  background: #1a202c;
  border: 1px solid #4a5568;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.summary-number {
  font-size: 2rem;
  font-weight: 700;
  color: #63b3ed;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #a0aec0;
}

@media (max-width: 768px) {
  .project-review-page {
    padding: 1rem;
  }

  .review-content {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }
}

#save-comments-button {
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1.5rem 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
  width: 100%;
  min-height: 60px;
}

#save-comments-button:hover {
  background: #2b6cb0;
}

#save-comments-button:disabled {
  background: #4a5568;
  cursor: not-allowed;
}
</style>
