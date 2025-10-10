<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useCodeReviewPage } from "../composables/pages/useCodeReviewPage.ts";
import { useWorkspaceController } from "../composables/controllers/useWorkspaceController.ts";
import { useDragDropController } from "../composables/controllers/useDragDropController.ts";
import FileExplorer from "../components/codeReview/FileExplorer.vue";
import SplitPanelManager from "../components/codeReview/SplitPanelManager.vue";
import ResizeHandle from "../lib/ResizeHandle.vue";
import SlideoutPanel from "../lib/SlideoutPanel.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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

	// Methods
	handleFileSelected,
	handleSidebarResize,
	handleFileQueryParam,
	isAnyFileSelected,
	expandAllFiles,

	// Inline form handlers
	deleteInlineComment,
	submitInlineComment,

	// Computed
	projectCommentButtonLabel,
	expandAllButtonLabel,
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
								<span>{{ t("codeReviewPage.loadingRepository") }}</span>
							</div>
						</div>
						<FileExplorer
							v-else-if="fileTree.length > 0"
							:selectedPath="selectedFilePath"
							@update:selected-path="handleFileSelected"
							:treeData="fileTree"
							:projectCommentButtonLabel="projectCommentButtonLabel"
							:expandAllButtonLabel="expandAllButtonLabel"
							@toggle-expand-all-items="expandAllFiles"
							@project-comment-requested="() => console.log('Project comment requested')"
							@file-comment-requested="() => console.log('File comment requested')"
						/>
						<div v-else class="text-center">
							<div class="empty-state">
								<h3 class="text-lg font-semibold text-white mb-2">
									{{ t("codeReviewPage.noFilesFound") }}
								</h3>
								<p class="text-sm text-slate-400 mb-4">{{ t("codeReviewPage.noFilesFoundSubtext") }}</p>
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
								<span>{{ t("codeReviewPage.loadingComments") }}</span>
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
							:side-bar-width="sidebarWidth"
							@tab-selected="workspaceController.handleTabSelected"
							@tab-closed="workspaceController.handleTabClosed"
							@tab-drop="dragDropController.handleTabDrop"
							@tab-drag-start="dragDropController.handleTabDragStart"
							@tab-drag-end="dragDropController.handleTabDragEnd"
							@panel-resize="workspaceController.handlePanelResize"
							@drop-zone-drag-over="dragDropController.handleDropZoneDragOver"
							@drop-zone-leave="dragDropController.handleDropZoneLeave"
							@drop-zone-drop="dragDropController.handleDropZoneDrop"
							@inline-form-submit="submitInlineComment"
							@inline-form-delete="deleteInlineComment"
						/>
						<!-- Empty State -->
						<div v-else class="text-center">
							<div class="empty-state">
								<div class="empty-state-icon">
									<Icon icon="mdi:inbox" class="w-8 h-8 text-slate-400" />
								</div>
								<h3 class="text-xl font-semibold text-white mb-2">
									{{ t("codeReviewPage.noFileSelected") }}
								</h3>
								<p class="text-slate-400 mb-4">{{ t("codeReviewPage.noFileSelectedSubtext") }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Comment Add/Edit Form Component -->
			<!-- <SlideoutPanel
				:title="commentId ? t('codeReviewPage.editComment') : t('codeReviewPage.addComment')"
				:subtitle="getSubtitle"
				v-model:isVisible="isAddingComment"
				class="w-110"
			>
			</SlideoutPanel> -->
		</div>
	</div>
</template>
