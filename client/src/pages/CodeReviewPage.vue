<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useCodeReviewPage } from "./useCodeReviewPage.ts";
import { useCommentOperations } from "../composables/useCommentOperations.ts";
import { useWorkspaceStore } from "../stores/workspaceStore.ts";
import { useProjectStore } from "../stores/projectStore.ts";
import { useDragDropState } from "../composables/useDragDropState.ts";
import { determineDropPosition } from "../utils/dragDropUtils.ts";
import FileExplorer from "../components/codeReview/FileExplorer.vue";
import SplitPanelManager from "../components/codeReview/SplitPanelManager.vue";
import ResizeHandle from "../lib/ResizeHandle.vue";
import { useI18n } from "vue-i18n";
import AddEditCommentForm from "../components/codeReview/AddEditCommentForm.vue";

const { t } = useI18n();

// Stores
const workspaceStore = useWorkspaceStore();
const projectStore = useProjectStore();

// Comment operations
const { submitComment, deleteComment } = useCommentOperations();

const {
	// Store refs
	fileTree,
	isLoadingRepository,

	// Local state
	selectedFilePath,

	// Sidebar state
	sidebarWidth,
	minSidebarWidth,
	maxSidebarWidth,
	sidebar,

	// Project/File comment form state
	isAddingProjectOrFileComment,
	projectOrFileCommentPath,
	handleFileCommentRequest,
	handleProjectCommentRequest,

	// Methods
	handleFileSelected,
	handleSidebarResize,
	handleFileQueryParam,
	isAnyFileSelected,

	// Computed
	isSidebarVisible,
} = useCodeReviewPage();

// Drag and Drop State
const dragDropState = useDragDropState();

// Drag and drop event handlers
const handleTabDrop = (targetPanelId: number, insertIndex?: number): void => {
	if (!dragDropState.draggedTab.value) return;

	// Do not allow dropping on the same panel
	if (dragDropState.draggedTab.value.fromPanelId === targetPanelId) {
		dragDropState.endDrag();
		return;
	}

	// Adjust insert index if moving within the same panel and the tab is before the insert index
	const newSelectedPath = workspaceStore.moveTabBetweenPanels(
		targetPanelId,
		dragDropState.draggedTab.value,
		insertIndex
	);
	handleFileSelected(newSelectedPath);
	dragDropState.endDrag();
};

const handleDropZoneDragOver = (event: DragEvent): void => {
	event.preventDefault();

	if (dragDropState.draggedTab.value) {
		const container = event.currentTarget as HTMLElement;
		const containerRect = container.getBoundingClientRect();
		const relativeX = event.clientX - containerRect.left;

		// Update drop zones based on mouse position
		const isLeftActive = relativeX <= dragDropState.DROPZONE_WIDTH;
		const isRightActive = relativeX >= containerRect.width - dragDropState.DROPZONE_WIDTH;
		dragDropState.updateDropZones(isLeftActive, isRightActive);
	}
};

const handleDropZoneLeave = (event: DragEvent): void => {
	const currentTarget = event.currentTarget as HTMLElement;
	const relatedTarget = event.relatedTarget as HTMLElement;
	if (!currentTarget?.contains(relatedTarget)) {
		dragDropState.clearDropZones();
	}
};

const handleDropZoneDrop = (event: DragEvent): void => {
	event.preventDefault();
	dragDropState.clearDropZones();

	if (!dragDropState.draggedTab.value) return;

	const container = event.currentTarget as HTMLElement;
	const containerRect = container.getBoundingClientRect();
	const relativeX = event.clientX - containerRect.left;

	// Determine drop position
	const insertPosition = determineDropPosition(
		relativeX,
		containerRect.width,
		dragDropState.DROPZONE_WIDTH,
		workspaceStore.panels.length
	);

	if (insertPosition === null) return;

	const newSelectedPath = workspaceStore.moveTabToNewPanel(dragDropState.draggedTab.value, insertPosition);
	handleFileSelected(newSelectedPath);
	dragDropState.endDrag();
};

// Workspace methods using store
const handleTabSelected = (filePath: string, panelId: number): void => {
	const newSelectedPath = workspaceStore.selectTab(filePath, panelId);
	handleFileSelected(newSelectedPath);
};

const handleTabClosed = (filePath: string, panelId: number): void => {
	const result = workspaceStore.closeTab(filePath, panelId);
	if (result.shouldClearSelection) {
		handleFileSelected(null);
	} else if (result.newSelectedFilePath) {
		handleFileSelected(result.newSelectedFilePath);
	}
};

// Watch for selectedFilePath changes to add files to panels
watch(
	() => selectedFilePath.value,
	(newFilePath: string | null) => {
		if (!newFilePath) return;

		// Check if file is already open in any panel
		if (workspaceStore.isFileOpenInAnyPanel(newFilePath)) {
			// File is already open, just make it active
			workspaceStore.setActiveTabByFilePath(newFilePath);
		} else {
			// File is not open, add it to a panel
			workspaceStore.addTabToPanel(newFilePath);
		}
	}
);

onMounted(async () => {
	handleFileQueryParam();

	// Initialize workspace from store
	const initialFilePath = await workspaceStore.initializeWorkspace(
		projectStore.repositoryUrl,
		projectStore.repositoryBranch
	);

	if (initialFilePath) {
		handleFileSelected(initialFilePath);
	}
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
						v-if="isSidebarVisible"
						class="flex-shrink-0"
						:style="{ width: sidebarWidth + 'px' }"
					>
						<!-- Loading Indicator -->
						<div v-if="isLoadingRepository" class="p-6 text-sm text-center text-slate-300">
							<div class="inline-flex items-center space-x-2">
								<div
									class="animate-spin rounded-full h-4 w-4 border-2 border-modern-blue border-t-transparent"
								></div>
								<span>{{ t("codeReviewPage.loadingRepository") }}</span>
							</div>
						</div>

						<!-- File Explorer -->
						<FileExplorer
							v-else-if="fileTree.length > 0"
							:selectedPath="selectedFilePath"
							@update:selected-path="handleFileSelected"
							:treeData="fileTree"
							@project-comment-requested="handleProjectCommentRequest"
							@file-comment-requested="handleFileCommentRequest"
						/>

						<!-- Empty State -->
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
						v-if="isSidebarVisible"
						:resizable-element="sidebar"
						:min-width="minSidebarWidth"
						:max-width="maxSidebarWidth"
						@resize-number="(newWidth: number) => handleSidebarResize(newWidth)"
					/>

					<!-- Code Editor and Comments -->
					<div class="flex flex-col flex-grow overflow-hidden backdrop-blur-sm bg-white/5 w-full">
						<!-- SplitPanelManager -->
						<SplitPanelManager
							v-if="isAnyFileSelected()"
							:panels="workspaceStore.panels"
							:dragged-tab="dragDropState.draggedTab.value"
							:left-drop-zone-active="dragDropState.leftDropZoneActive.value"
							:right-drop-zone-active="dragDropState.rightDropZoneActive.value"
							:drop-zone-width="dragDropState.DROPZONE_WIDTH"
							:side-bar-width="sidebarWidth"
							@tab-selected="handleTabSelected"
							@tab-closed="handleTabClosed"
							@tab-drop="handleTabDrop"
							@tab-drag-start="dragDropState.startDrag"
							@tab-drag-end="dragDropState.endDrag"
							@panel-resize="workspaceStore.resizePanel"
							@drop-zone-drag-over="handleDropZoneDragOver"
							@drop-zone-leave="handleDropZoneLeave"
							@drop-zone-drop="handleDropZoneDrop"
							@inline-form-submit="submitComment"
							@inline-form-delete="deleteComment"
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

			<!-- Project/File Comment Form -->
			<AddEditCommentForm
				v-model:isVisible="isAddingProjectOrFileComment"
				:filePath="projectOrFileCommentPath"
				@submit="submitComment"
				@delete="deleteComment"
				@close="isAddingProjectOrFileComment = false"
			/>
		</div>
	</div>
</template>
