<script setup lang="ts">
import { onMounted } from "vue";
import { useCodeReviewPage } from "../composables/pages/useCodeReviewPage.ts";
import FileExplorer from "../components/codeReview/FileExplorer.vue";
import SplitPanelManager from "../components/codeReview/SplitPanelManager.vue";
import ResizeHandle from "../lib/ResizeHandle.vue";
import CommentForm from "../components/codeReview/CommentForm.vue";
import SlideoutPanel from "../lib/SlideoutPanel.vue";

// Initialize the composable
const {
	// Store refs
	fileTree,
	isLoadingRepository,
	isLoadingComments,

	// Stores
	settingsStore,

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
	deleteCommentAction,

	// Computed
	getSubtitle,
	projectCommentButtonLabel,
} = useCodeReviewPage();

onMounted(() => {
	handleFileQueryParam();
});
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
							:selectedPath="selectedFilePath"
							@update:selected-path="handleFileSelected"
							:treeData="fileTree"
							:projectCommentButtonLabel="projectCommentButtonLabel"
							@project-comment-requested="handleProjectCommentSelected"
							@file-comment-requested="handleFileCommentSelected"
						/>
						<div v-else class="p-6 text-sm text-center text-slate-300">
							No files found in the repository.
						</div>
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
						<!-- SplitPanelManager -->
						<SplitPanelManager
							v-else
							:selected-file-path="selectedFilePath"
							@update:selected-file-path="handleFileSelected"
							@line-double-clicked="handleSinglelineCommentSelected"
							@multiline-selected="handleMultilineCommentSelected"
							@delete-comment="deleteCommentAction"
							@edit-comment="handleCommentEdit"
						/>
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
					@delete-comment="deleteCommentAction"
				/>
			</SlideoutPanel>
		</div>
	</div>
</template>
