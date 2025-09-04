<script setup lang="ts">
import { ref, computed } from "vue";
import FileTabManager from "./FileTabManager.vue";

const props = defineProps<{
	panelId: string;
	openTabs: string[];
	activeTab: string | null;
	isSinglePanel: boolean;
	draggedTab: { fromPanelId: string; filePath: string } | null;
}>();

const emit = defineEmits<{
	(event: "tab-selected", filePath: string, panelId: string): void;
	(event: "tab-closed", filePath: string, panelId: string): void;
	(event: "tab-drop", panelId: string): void;
	(event: "tab-drag-start", filePath: string, panelId: string): void;
	(event: "tab-drag-end"): void;
	(event: "tab-drop-with-index", panelId: string, insertIndex: number): void;
}>();

const isDragOver = ref(false);
const showDropZone = ref(false);

// Drag and drop handling
const handleDragOver = (event: DragEvent) => {
	event.preventDefault();
	event.dataTransfer!.dropEffect = "move";

	// Only show drop zone if dragging from another panel
	if (props.draggedTab && props.draggedTab.fromPanelId !== props.panelId) {
		isDragOver.value = true;
		showDropZone.value = true;
	}
};

const handleDragLeave = (event: DragEvent) => {
	// Only hide drop zone if we're leaving the panel entirely
	const currentTarget = event.currentTarget as HTMLElement;
	const relatedTarget = event.relatedTarget as HTMLElement;
	if (!currentTarget?.contains(relatedTarget)) {
		isDragOver.value = false;
		showDropZone.value = false;
	}
};

const handleDrop = (event: DragEvent) => {
	event.preventDefault();
	isDragOver.value = false;
	showDropZone.value = false;

	// Drop at the end of the panel's tabs
	emit("tab-drop", props.panelId);
};

// Enhanced FileTabManager that supports the panel's tabs
const currentTabs = computed(() => props.openTabs);
const currentActiveTab = computed(() => props.activeTab);

const handleTabUpdate = (filePath: string | null) => {
	if (filePath) {
		emit("tab-selected", filePath, props.panelId);
	}
};

const handleCloseFileTab = (filePath: string) => {
	emit("tab-closed", filePath, props.panelId);
};

const handleTabDragStart = (filePath: string, panelId: string) => {
	emit("tab-drag-start", filePath, panelId);
};

const handleTabDragEnd = () => {
	emit("tab-drag-end");
};

const handleTabDropWithIndex = (panelId: string, insertIndex: number) => {
	emit("tab-drop-with-index", panelId, insertIndex);
};
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
			<div class="text-blue-300 text-sm font-medium">Drop tab here</div>
		</div>
	</div>
</template>
