<script setup lang="ts">
import { onMounted } from "vue";
import Panel from "./Panel.vue";
import ResizeHandle from "../../lib/ResizeHandle.vue";
import CodeEditor from "./CodeEditor.vue";
import ContentViewer from "./ContentViewer.vue";
import {
	useSplitPanelManager,
	type SplitPanelManagerProps,
	type SplitPanelManagerEmits,
} from "../../composables/components/useSplitPanelManager";
import { useFileContentStore } from "../../stores/fileContentStore";
import { useRepositoryStore } from "../../stores/repositoryStore";
import { FileDisplayType } from "../../types/github/githubFile";
import { getFileName } from "../../utils/fileUtils";

const props = defineProps<SplitPanelManagerProps>();
const emit = defineEmits<SplitPanelManagerEmits>();

// Stores
const fileContentStore = useFileContentStore();
const repositoryStore = useRepositoryStore();

// Use the split panel manager composable
const {
	panels,
	containerElement,
	draggedTab,
	leftDropZoneActive,
	rightDropZoneActive,
	DROPZONE_WIDTH,
	initializeWorkspace,
	handleTabSelected,
	handleTabClosed,
	handleTabDrop,
	handleTabDragStart,
	handleTabDragEnd,
	handleDropZoneDragOver,
	handleDropZoneLeave,
	handleDropZoneDrop,
	handlePanelResize,
} = useSplitPanelManager(props, emit);

// Helper functions for content rendering
const isTextFile = (filePath: string) => {
	return fileContentStore.getFileDisplayType(filePath) === FileDisplayType.Text;
};

const getFileContent = (filePath: string) => {
	return fileContentStore.getFileContent(filePath);
};

const getCommentsForFile = (filePath: string) => {
	return repositoryStore.getCommentsForFile(filePath);
};

const isFileCached = (filePath: string) => {
	return fileContentStore.isFileCached(filePath);
};

const getFileDisplayType = (filePath: string) => {
	return fileContentStore.getFileDisplayType(filePath);
};

const getFileDownloadUrl = (filePath: string) => {
	return fileContentStore.getFileDownloadUrl(filePath);
};

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

// Initialize workspace on component mount
onMounted(() => {
	initializeWorkspace();
});
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
					/>
				</div>

				<!-- Empty state when no tab is active -->
				<div v-else class="flex items-center justify-center h-full text-slate-400">No file selected</div>
			</Panel>
			<!-- Resize Handle -->
			<!-- TODO: fix the resize event, the event.clientX value is not accurate -->
			<ResizeHandle
				v-if="index < panels.length - 1"
				:resizable-element="containerElement || null"
				@resize-event="(event: MouseEvent) => handlePanelResize(index, event.clientX)"
			/>
		</template>

		<!-- Left Drop Zone -->
		<div
			v-if="leftDropZoneActive"
			class="absolute left-0 top-0 h-full bg-blue-500/30 border-r-2 border-blue-500 flex items-center justify-center z-10"
			:style="{ width: DROPZONE_WIDTH + 'px' }"
		>
			<div class="text-blue-200 text-xs font-medium transform -rotate-90 whitespace-nowrap">New Panel</div>
		</div>

		<!-- Right Drop Zone -->
		<div
			v-if="rightDropZoneActive"
			class="absolute right-0 top-0 h-full bg-blue-500/30 border-l-2 border-blue-500 flex items-center justify-center z-10"
			:style="{ width: DROPZONE_WIDTH + 'px' }"
		>
			<div class="text-blue-200 text-xs font-medium transform -rotate-90 whitespace-nowrap">New Panel</div>
		</div>
	</div>
</template>
