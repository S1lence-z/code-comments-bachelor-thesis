<script setup lang="ts">
import { ref, computed, defineProps, watch } from "vue";
import { type TreeNode } from "../types/githubApi";

const props = defineProps<{
	localComments: {
		projectOverviewComment: string;
		fileComments: Record<string, string>;
	};
	projectStructure: TreeNode[];
}>();

const emit = defineEmits<{
	(e: "updateContainsChangedComments", status: boolean): void;
	(e: "saveFileComment", path: string, comment: string): void;
	(e: "shownProjectStructure", structure: TreeNode[]): void;
}>();

// For navigation
const selectedItem = ref<string | null>(null);
const expandedFolders = ref<Set<string>>(new Set());
const searchQuery = ref("");
const currentFolderPath = ref<string>("");
const currentFolderContents = ref<TreeNode[]>([]);

// Computed for filtered structure based on search
const filteredProjectStructure = computed(() => {
	if (!searchQuery.value.trim()) {
		emit("shownProjectStructure", currentFolderContents.value);
		return currentFolderContents.value;
	}

	const query = searchQuery.value.toLowerCase();
	const filteredItems = filterItems(currentFolderContents.value, query);
	emit("shownProjectStructure", filteredItems);
	return filteredItems;
});

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
		currentFolderContents.value = props.projectStructure;
	} else {
		const folder = findFolder(props.projectStructure, folderPath);
		currentFolderContents.value = folder?.children || [];
	}

	// Clear selection when navigating
	selectedItem.value = null;
};

const navigateToParent = () => {
	if (currentFolderPath.value === "") return; // Already at root

	const pathParts = currentFolderPath.value.split("/");
	pathParts.pop(); // Remove last part
	const parentPath = pathParts.join("/");

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

const getCommentForPath = (path: string) => {
	return props.localComments.fileComments[path] || "";
};

// Filter project structure based on search query
const filterItems = (items: any[], query: string): any[] => {
	return items
		.filter((item) => {
			const nameMatches = item.name.toLowerCase().includes(query);
			const pathMatches = item.path.toLowerCase().includes(query);

			if (item.children) {
				const filteredChildren = filterItems(item.children, query);
				return nameMatches || pathMatches || filteredChildren.length > 0;
			}

			return nameMatches || pathMatches;
		})
		.map((item) => {
			if (item.children) {
				return {
					...item,
					children: filterItems(item.children, query),
				};
			}
			return item;
		});
};

// Watchers
watch(
	() => props.projectStructure,
	(newStructure) => {
		currentFolderPath.value = "";
		currentFolderContents.value = newStructure;
	},
	{ immediate: true }
);
</script>

<template>
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
					<button v-if="currentFolderPath" @click="navigateToParent" class="parent-button">..</button>
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
					<div v-for="item in filteredProjectStructure" :key="item.path">
						<div class="tree-item">
							<div
								class="tree-item-header"
								:class="{
									selected: selectedItem === item.path,
									'has-comment': getCommentForPath(item.path),
								}"
								@click="handleItemClick(item)"
								@dblclick="handleItemDoubleClick(item)"
							>
								<button
									v-if="item.type === 'folder'"
									@click.stop="toggleFolder(item.path)"
									class="folder-toggle"
								>
									{{ expandedFolders.has(item.path) ? "📂" : "📁" }}
								</button>
								<span v-else class="file-icon">📄</span>
								<span class="item-name">{{ item.name }}</span>
								<span v-if="getCommentForPath(item.path)" class="comment-indicator">💬</span>
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
										selected: selectedItem === child.path,
										'has-comment': getCommentForPath(child.path),
									}"
									@click="handleItemClick(child)"
									@dblclick="handleItemDoubleClick(child)"
								>
									<span class="file-icon">
										{{ child.type === "folder" ? "📁" : "📄" }}
									</span>
									<span class="item-name">{{ child.name }}</span>
									<span v-if="getCommentForPath(child.path)" class="comment-indicator">💬</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Comment Panel Side -->
			<div class="comment-panel">
				<div v-if="selectedItem" class="comment-section">
					<h3>Comment for: {{ selectedItem }}</h3>
					<div class="comment-input-container">
						<label :for="`comment-${selectedItem}`" class="comment-label">
							Add your feedback for this
							{{ selectedItem.includes(".") ? "file" : "folder" }}
						</label>
						<textarea
							:id="`comment-${selectedItem}`"
							:value="getCommentForPath(selectedItem)"
							@input="emit('saveFileComment', selectedItem, ($event.target as HTMLTextAreaElement).value)"
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
						<p>Choose an item from the project structure to add comments and feedback</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
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
	font-family: "Courier New", monospace;
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
</style>
