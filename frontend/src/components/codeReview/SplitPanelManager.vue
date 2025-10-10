<script setup lang="ts">
import Panel from "./Panel.vue";
import ResizeHandle from "../../lib/ResizeHandle.vue";
import CodeEditor from "./CodeEditor.vue";
import ContentViewer from "./ContentViewer.vue";
import {
	useSplitPanelManager,
	type SplitPanelManagerProps,
	type SplitPanelManagerEmits,
} from "../../composables/components/useSplitPanelManager";
import { getFileName } from "../../utils/fileUtils";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<SplitPanelManagerProps>();
const emit = defineEmits<SplitPanelManagerEmits>();

// Use the split panel manager composable
const {
	containerElement,
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
</script>

<template>
	<div
		ref="containerElement"
		id="split-panel-container"
		class="flex h-full w-full relative"
		@dragover="(event) => emit('drop-zone-drag-over', event)"
		@dragleave="(event) => emit('drop-zone-leave', event)"
		@drop="(event) => emit('drop-zone-drop', event)"
	>
		<template v-for="(panel, index) in panels" :key="panel.id">
			<Panel
				:style="{ width: `${panel.size}%` }"
				:panel-id="panel.id"
				:open-tabs="panel.openTabs"
				:active-tab="panel.activeTab"
				:is-single-panel="panels.length === 1"
				:dragged-tab="draggedTab"
				@tab-selected="(filePath, panelId) => emit('tab-selected', filePath, panelId)"
				@tab-closed="(filePath, panelId) => emit('tab-closed', filePath, panelId)"
				@tab-drop="(panelId) => emit('tab-drop', panelId, undefined)"
				@tab-drag-start="(filePath, panelId) => emit('tab-drag-start', filePath, panelId)"
				@tab-drag-end="() => emit('tab-drag-end')"
				@tab-drop-with-index="(panelId, insertIndex) => emit('tab-drop', panelId, insertIndex)"
			>
				<!-- Content for the active tab -->
				<div v-if="panel.activeTab" class="h-full w-full">
					<!-- Loading state -->
					<div v-if="!isFileCached(panel.activeTab.filePath)" class="flex items-center justify-center h-full">
						<div class="text-slate-400">Loading {{ getFileName(panel.activeTab.filePath) }}...</div>
					</div>

					<!-- Text files (code) -->
					<CodeEditor
						v-else-if="isTextFile(panel.activeTab.filePath)"
						:file-path="panel.activeTab.filePath"
						:file-content="getFileContent(panel.activeTab.filePath)"
						:comment-for-file="getCommentsForFile(panel.activeTab.filePath)"
						@inline-form-submit="(payload) => emit('inline-form-submit', payload)"
						@inline-form-delete="(commentId) => emit('inline-form-delete', commentId)"
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
				<div v-else class="flex items-center justify-center h-full text-slate-400">
					{{ t("panel.noFileSelected") }}
				</div>
			</Panel>
			<!-- Resize Handle -->
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
			:style="{ width: dropZoneWidth + 'px' }"
		>
			<div class="text-blue-200 text-xs font-medium transform -rotate-90 whitespace-nowrap">
				{{ t("panel.newPanel") }}
			</div>
		</div>

		<!-- Right Drop Zone -->
		<div
			v-if="rightDropZoneActive"
			class="absolute right-0 top-0 h-full bg-blue-500/30 border-l-2 border-blue-500 flex items-center justify-center z-10"
			:style="{ width: dropZoneWidth + 'px' }"
		>
			<div class="text-blue-200 text-xs font-medium transform -rotate-90 whitespace-nowrap">
				{{ t("panel.newPanel") }}
			</div>
		</div>
	</div>
</template>
