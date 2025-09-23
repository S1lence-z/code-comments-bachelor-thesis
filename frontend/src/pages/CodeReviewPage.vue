<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useCodeReviewPage } from "../composables/pages/useCodeReviewPage.ts";
import { useWorkspaceController } from "../composables/controllers/useWorkspaceController.ts";
import { useDragDropController } from "../composables/controllers/useDragDropController.ts";
import FileExplorer from "../components/codeReview/FileExplorer.vue";
import SplitPanelManager from "../components/codeReview/SplitPanelManager.vue";
import ResizeHandle from "../lib/ResizeHandle.vue";
import CommentForm from "../components/codeReview/CommentForm.vue";
import SlideoutPanel from "../lib/SlideoutPanel.vue";
import Icon from "../lib/Icon.vue";

// Initialize the composable (without workspace/drag-drop functionality)
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
	commentFilePath,
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
	isAnyFileSelected,

	// Computed
	getSubtitle,
	projectCommentButtonLabel,
} = useCodeReviewPage();

// Initialize workspace controller
const workspaceController = useWorkspaceController(
	{ selectedFilePath },
	(event: "update:selectedFilePath", filePath: string | null) => {
		if (event === "update:selectedFilePath") {
			selectedFilePath.value = filePath;
		}
	}
);

// Initialize drag drop controller
const dragDropController = useDragDropController(
	{
		panelCount: computed(() => workspaceController.panels.value.length),
	},
	(event: "tab-drop" | "drop-zone-drop", ...args: any[]) => {
		if (event === "tab-drop") {
			const [targetPanelId, draggedTab, insertIndex] = args;
			workspaceController.handleTabDrop(targetPanelId, draggedTab, insertIndex);
		} else if (event === "drop-zone-drop") {
			const [draggedTab, insertPosition] = args;
			workspaceController.handleDropZoneDrop(draggedTab, insertPosition);
		}
	}
);

onMounted(() => {
	handleFileQueryParam();
	workspaceController.initializeWorkspace();
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
						<div v-else class="text-center">
							<div class="empty-state">
								<h3 class="text-lg font-semibold text-white mb-2">No Files Found</h3>
								<p class="text-sm text-slate-400 mb-4">Set up a project on the Home page</p>
							</div>
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
							v-else-if="isAnyFileSelected()"
							:panels="workspaceController.panels.value"
							:dragged-tab="dragDropController.draggedTab.value"
							:left-drop-zone-active="dragDropController.leftDropZoneActive.value"
							:right-drop-zone-active="dragDropController.rightDropZoneActive.value"
							:drop-zone-width="dragDropController.DROPZONE_WIDTH"
							@tab-selected="workspaceController.handleTabSelected"
							@tab-closed="workspaceController.handleTabClosed"
							@tab-drop="dragDropController.handleTabDrop"
							@tab-drag-start="dragDropController.handleTabDragStart"
							@tab-drag-end="dragDropController.handleTabDragEnd"
							@panel-resize="workspaceController.handlePanelResize"
							@drop-zone-drag-over="dragDropController.handleDropZoneDragOver"
							@drop-zone-leave="dragDropController.handleDropZoneLeave"
							@drop-zone-drop="dragDropController.handleDropZoneDrop"
							@line-double-clicked="handleSinglelineCommentSelected"
							@multiline-selected="handleMultilineCommentSelected"
							@delete-comment="deleteCommentAction"
							@edit-comment="handleCommentEdit"
						/>
						<!-- Empty State -->
						<div v-else class="text-center">
							<div class="empty-state">
								<div class="empty-state-icon">
									<Icon srcName="empty" />
								</div>
								<h3 class="text-xl font-semibold text-white mb-2">No File Selected</h3>
								<p class="text-slate-400 mb-4">Please select a file to view its comments</p>
							</div>
						</div>
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
					:comment-file-path="commentFilePath"
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
