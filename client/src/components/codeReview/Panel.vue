<script setup lang="ts">
import FileTabManager from "./FileTabManager.vue";
import { useI18n } from "vue-i18n";
import type { PanelProps, PanelEmits } from "../../composables/codeReview/usePanel";
import { usePanel } from "../../composables/codeReview/usePanel";

const { t } = useI18n();

const props = defineProps<PanelProps>();
const emit = defineEmits<PanelEmits>();

const {
	// State
	currentActiveTab,
	currentTabs,
	isDragOver,
	showDropZone,

	// Drag and Drop Handlers
	handleDragOver,
	handleDragLeave,
	handleDrop,
	handleTabUpdate,
	handleCloseFileTab,
	handleTabDragStart,
	handleTabDragEnd,
	handleTabDropWithIndex,
} = usePanel(props, emit);
</script>

<template>
	<div class="relative" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
		<!-- FileTabManager -->
		<FileTabManager
			:active-tab="currentActiveTab"
			:open-tabs="currentTabs"
			:panel-id="panelId"
			:dragged-tab="draggedTab"
			@update:active-tab="handleTabUpdate"
			@tab-closed="handleCloseFileTab"
			@tab-drag-start="handleTabDragStart"
			@tab-drag-end="handleTabDragEnd"
			@tab-drop="handleTabDropWithIndex"
		>
			<slot></slot>
		</FileTabManager>

		<!-- Drop Zone Overlay -->
		<div
			v-if="showDropZone"
			class="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 border-dashed flex items-center justify-center pointer-events-none"
			:class="{ 'bg-blue-500/30': isDragOver }"
		>
			<div class="text-blue-300 text-sm font-medium">{{ t("panel.dropTabHere") }}</div>
		</div>
	</div>
</template>
