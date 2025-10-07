<script setup lang="ts">
import Panel from "./Panel.vue";
import ResizeHandle from "../../lib/ResizeHandle.vue";
import CodeEditor from "./CodeEditor.vue";
import ContentViewer from "./ContentViewer.vue";
import { useSplitPanelManager } from "../../composables/components/useSplitPanelManager";
import { getFileName } from "../../utils/fileUtils";
import type { DraggedTabData, PanelData } from "../../types/others/Panels";

export interface SplitPanelManagerProps {
	panels: PanelData[];
	draggedTab: DraggedTabData | null;
	leftDropZoneActive: boolean;
	rightDropZoneActive: boolean;
	dropZoneWidth: number;
	sideBarWidth: number;
}

export interface SplitPanelManagerEmits {
	(event: "tab-selected", filePath: string, panelId: number): void;
	(event: "tab-closed", filePath: string, panelId: number): void;
	(event: "tab-drop", panelId: number, insertIndex?: number): void;
	(event: "tab-drag-start", filePath: string, panelId: number): void;
	(event: "tab-drag-end"): void;
	(event: "panel-resize", currentPanel: PanelData, nextPanel: PanelData, newWidthPercentage: number): void;
	(event: "drop-zone-drag-over", dragEvent: DragEvent): void;
	(event: "drop-zone-leave", dragEvent: DragEvent): void;
	(event: "drop-zone-drop", dragEvent: DragEvent): void;
	(event: "line-double-clicked", data: { lineNumber: number; filePath: string }): void;
	(
		event: "multiline-selected",
		data: { selectedStartLineNumber: number; selectedEndLineNumber: number; filePath: string }
	): void;
	(event: "delete-comment", commentId: string): void;
	(event: "edit-comment", commentId: string): void;
}

const props = defineProps<SplitPanelManagerProps>();
const emit = defineEmits<SplitPanelManagerEmits>();

// Use the split panel manager composable
const {
	containerElement,
	handleTabSelected,
	handleTabClosed,
	handleTabDrop,
	handleTabDragStart,
	handleTabDragEnd,
	handleDropZoneDragOver,
	handleDropZoneLeave,
	handleDropZoneDrop,
	handlePanelResize,

	// Helper functions
	isTextFile,
	getFileContent,
	getCommentsForFile,
	isFileCached,
	getFileDisplayType,
	getFileDownloadUrl,
	getFilePreviewUrl,
} = useSplitPanelManager(props, emit);

// Event handlers for content
const handleLineDoubleClicked = (data: { lineNumber: number; filePath: string }) => {
	emit("line-double-clicked", data);
};

const handleMultilineSelected = (data: {
	selectedStartLineNumber: number;
	selectedEndLineNumber: number;
	filePath: string;
}) => {
	emit("multiline-selected", data);
};

const handleDeleteComment = async (commentId: string) => {
	emit("delete-comment", commentId);
};

const handleEditComment = async (commentId: string) => {
	emit("edit-comment", commentId);
};
</script>

<template>
	<div
		ref="containerElement"
		id="split-panel-container"
		class="flex h-full w-full relative"
		@dragover="handleDropZoneDragOver"
		@dragleave="handleDropZoneLeave"
		@drop="handleDropZoneDrop"
	>
		<template v-for="(panel, index) in panels" :key="panel.id">
			<Panel
				:style="{ width: `${panel.size}%` }"
				:panel-id="panel.id"
				:open-tabs="panel.openTabs"
				:active-tab="panel.activeTab"
				:is-single-panel="panels.length === 1"
				:dragged-tab="draggedTab"
				@tab-selected="handleTabSelected"
				@tab-closed="handleTabClosed"
				@tab-drop="handleTabDrop"
				@tab-drag-start="handleTabDragStart"
				@tab-drag-end="handleTabDragEnd"
				@tab-drop-with-index="handleTabDrop"
			>
				<!-- Content for the active tab -->
				<div v-if="panel.activeTab" class="h-full w-full">
					<!-- Loading state -->
					<div v-if="!isFileCached(panel.activeTab.filePath)" class="flex items-center justify-center h-full">
						<div class="text-slate-400">Loading file content...</div>
					</div>

					<!-- Text files (code) -->
					<CodeEditor
						v-else-if="isTextFile(panel.activeTab.filePath)"
						:file-path="panel.activeTab.filePath"
						:file-content="getFileContent(panel.activeTab.filePath)"
						:is-loading-file="false"
						:comment-for-file="getCommentsForFile(panel.activeTab.filePath)"
						:delete-comment-action="handleDeleteComment"
						:edit-comment-action="handleEditComment"
						@line-double-clicked="handleLineDoubleClicked"
						@multiline-selected="handleMultilineSelected"
					/>

					<!-- Non-text files (images, documents, ...) -->
					<ContentViewer
						v-else
						:selected-file-path="panel.activeTab.filePath"
						:file-name="getFileName(panel.activeTab.filePath)"
						:display-type="getFileDisplayType(panel.activeTab.filePath)"
						:download-url="getFileDownloadUrl(panel.activeTab.filePath)"
						:preview-url="getFilePreviewUrl(panel.activeTab.filePath)"
					/>
				</div>

				<!-- Empty state when no tab is active -->
				<div v-else class="flex items-center justify-center h-full text-slate-400">No file selected</div>
			</Panel>
			<!-- Resize Handle -->
			<ResizeHandle
				v-if="index < panels.length - 1"
				:resizable-element="containerElement || null"
				@resize-event="(event: MouseEvent) => handlePanelResize(index, event.clientX - props.sideBarWidth)"
			/>
		</template>

		<!-- Left Drop Zone -->
		<div
			v-if="leftDropZoneActive"
			class="absolute left-0 top-0 h-full bg-blue-500/30 border-r-2 border-blue-500 flex items-center justify-center z-10"
			:style="{ width: dropZoneWidth + 'px' }"
		>
			<div class="text-blue-200 text-xs font-medium transform -rotate-90 whitespace-nowrap">New Panel</div>
		</div>

		<!-- Right Drop Zone -->
		<div
			v-if="rightDropZoneActive"
			class="absolute right-0 top-0 h-full bg-blue-500/30 border-l-2 border-blue-500 flex items-center justify-center z-10"
			:style="{ width: dropZoneWidth + 'px' }"
		>
			<div class="text-blue-200 text-xs font-medium transform -rotate-90 whitespace-nowrap">New Panel</div>
		</div>
	</div>
</template>
