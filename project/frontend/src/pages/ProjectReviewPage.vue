<script setup lang="ts">
import { ref, reactive } from "vue";

// Mock data structure for the template
const projectStructure = ref([
  {
    name: "src",
    type: "folder",
    path: "src",
    children: [
      { name: "components", type: "folder", path: "src/components" },
      { name: "pages", type: "folder", path: "src/pages" },
      { name: "utils", type: "folder", path: "src/utils" },
      { name: "App.vue", type: "file", path: "src/App.vue" },
      { name: "main.ts", type: "file", path: "src/main.ts" }
    ]
  },
  {
    name: "public",
    type: "folder",
    path: "public",
    children: [
      { name: "index.html", type: "file", path: "public/index.html" }
    ]
  },
  { name: "package.json", type: "file", path: "package.json" },
  { name: "README.md", type: "file", path: "README.md" }
]);

const comments = reactive({
  project: "",
  files: {} as Record<string, string>
});

const selectedItem = ref<string | null>(null);
const expandedFolders = ref<Set<string>>(new Set());

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

const saveComment = (path: string, comment: string) => {
  comments.files[path] = comment;
};

const getCommentForPath = (path: string) => {
  return comments.files[path] || "";
};
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
			<!-- Project Overview Section -->
			<div class="review-section">
				<div class="section-header">
					<h2>Project Overview</h2>
				</div>
				<div class="project-comment-card">
					<label for="projectComment" class="comment-label">
						Overall Project Comments
					</label>
					<textarea
						id="projectComment"
						v-model="comments.project"
						placeholder="Add your overall thoughts about the project structure, architecture, or general feedback..."
						class="comment-textarea"
						rows="4"
					></textarea>
				</div>
			</div>

			<!-- File Structure Section -->
			<div class="review-section">
				<div class="section-header">
					<h2>File Structure Review</h2>
				</div>

				<div class="structure-review-container">
					<!-- File Explorer Side -->
					<div class="file-explorer-panel">
						<h3>Project Structure</h3>
						<div class="file-tree">
							<template v-for="item in projectStructure" :key="item.path">
								<div class="tree-item">
									<div
										class="tree-item-header"
										:class="{ 
                      'selected': selectedItem === item.path,
                      'has-comment': getCommentForPath(item.path)
                    }"
										@click="selectItem(item.path)"
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
											@click="selectItem(child.path)"
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
									@input="saveComment(selectedItem, ($event.target as HTMLTextAreaElement).value)"
									placeholder="Enter your comments, suggestions, or feedback for this item..."
									class="comment-textarea"
									rows="6"
								></textarea>
							</div>

							<div class="comment-tips">
								<h4>Comment Guidelines:</h4>
								<ul>
									<li>
										For <strong>files</strong>: Comment on naming, purpose, or
										organization
									</li>
									<li>
										For <strong>folders</strong>: Comment on structure,
										grouping, or hierarchy
									</li>
									<li>Be specific and constructive in your feedback</li>
								</ul>
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

			<!-- Summary Section -->
			<div class="review-section">
				<div class="section-header">
					<h2>Review Summary</h2>
				</div>
				<div class="summary-cards">
					<div class="summary-card">
						<div class="summary-number">{{ Object.keys(comments.files).length }}</div>
						<div class="summary-label">Files/Folders with Comments</div>
					</div>
					<div class="summary-card">
						<div class="summary-number">{{ comments.project ? '1' : '0' }}</div>
						<div class="summary-label">Project Overview Comment</div>
					</div>
					<div class="summary-card">
						<div class="summary-number">{{ projectStructure.length }}</div>
						<div class="summary-label">Total Items in Structure</div>
					</div>
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
  grid-template-columns: 1fr 2fr 1fr;
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
  outline: none;
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
  gap: 1.5rem;
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
</style>
