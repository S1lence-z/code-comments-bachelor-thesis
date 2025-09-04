<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useCodeReviewPage } from "../composables/pages/useCodeReviewPage.ts";
import FileExplorer from "../components/codeReview/FileExplorer.vue";
import CodeEditor from "../components/codeReview/CodeEditor.vue";
import OtherContentViewer from "../components/codeReview/ContentViewer.vue";
import SplitPanelManager from "../components/codeReview/SplitPanelManager.vue";
import ResizeHandle from "../lib/ResizeHandle.vue";
import CommentForm from "../components/codeReview/CommentForm.vue";
import SlideoutPanel from "../lib/SlideoutPanel.vue";
import { getFileName } from "../utils/fileUtils.ts";
import { FileDisplayType } from "../types/github/githubFile.ts";

// Initialize the composable
const {
	// Store refs
	fileTree,
	isLoadingRepository,
	isLoadingComments,

	// Stores
	repositoryStore,
	fileContentStore,
	settingsStore,

	// Route
	route,

	// Local state
	selectedFilePath,
	isLoadingFile,

	// Sidebar state
	sidebarWidth,
	minSidebarWidth,
	maxSidebarWidth,
	sidebar,

	// Comment form state
	startLineNumber,
	endLineNumber,
	commentId,
	isAddingComment,
	addedCommentType,

	// Methods
	handleFileSelected,
	handleSinglelineCommentSelected,
	handleMultilineCommentSelected,
	handleFileCommentSelected,
	handleProjectCommentSelected,
	handleCommentEdit,
	handleSidebarResize,
	handleFileQueryParam,
	initRepositoryStore,
	deleteCommentAction,

	// Computed
	getSubtitle,
	projectCommentButtonLabel,
} = useCodeReviewPage();

// Lifecycle
onMounted(async () => {
	await initRepositoryStore();
});

// Watchers
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
				<!-- Code Editor -->
				<div class="flex h-full w-full overflow-hidden">
					<!-- Sidebar -->
					<div
						ref="sidebar"
						v-if="settingsStore.isSidebarOpen"
						class="flex-shrink-0"
						:style="{ width: sidebarWidth + 'px' }"
					>
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
							:projectCommentButtonLabel="projectCommentButtonLabel"
							@project-comment-requested="handleProjectCommentSelected"
							@file-comment-requested="handleFileCommentSelected"
						/>
					</div>

					<!-- Resize Handle -->
					<ResizeHandle
						v-if="settingsStore.isSidebarOpen"
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
						<!-- TODO: refactor -->
						<SplitPanelManager v-else v-model:selected-file-path="selectedFilePath">
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
											v-if="
												fileContentStore.getFileDisplayType(filePath) === FileDisplayType.Text
											"
											:file-path="filePath"
											:file-content="fileContentStore.getFileContent(filePath)"
											:is-loading-file="false"
											:comment-for-file="repositoryStore.getCommentsForFile(filePath)"
											:delete-comment-action="deleteCommentAction"
											:edit-comment-action="handleCommentEdit"
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
			<SlideoutPanel
				:title="(commentId ? 'Edit' : 'Add') + ' Comment'"
				:subtitle="getSubtitle"
				v-model:isVisible="isAddingComment"
				class="w-110"
			>
				<CommentForm
					v-model:isVisible="isAddingComment"
					:comment-file-path="selectedFilePath"
					:start-line-number="startLineNumber"
					:end-line-number="endLineNumber"
					:comment-id="commentId"
					:comment-type="addedCommentType"
				/>
			</SlideoutPanel>
		</div>
	</div>
</template>
