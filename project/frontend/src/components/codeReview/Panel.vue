<script setup lang="ts">
import { ref, inject, computed } from "vue";
import FileTabManager from "./FileTabManager.vue";
import { splitPanelContextKey } from "../../core/keys.ts";

const props = defineProps<{
	panelId: string;
	openTabs: string[];
	activeTab: string | null;
	isSinglePanel: boolean;
}>();

const emits = defineEmits<{
	(event: "tab-selected", filePath: string, panelId: string): void;
	(event: "tab-closed", filePath: string, panelId: string): void;
}>();

// Inject context from SplitPanelManager
const splitPanelFunctionality = inject<{
	handleTabDrop: (panelId: string) => void;
	closePanel: (panelId: string) => void;
	draggedTab: () => { fromPanelId: string; filePath: string } | null;
}>(splitPanelContextKey)!;

const isDragOver = ref(false);
const showDropZone = ref(false);

// Drag and drop handling
const handleDragOver = (event: DragEvent) => {
	event.preventDefault();
	event.dataTransfer!.dropEffect = "move";

	// Only show drop zone if dragging from another panel
	const draggedTab = splitPanelFunctionality.draggedTab?.();
	if (draggedTab && draggedTab.fromPanelId !== props.panelId) {
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
	splitPanelFunctionality?.handleTabDrop(props.panelId);
};

// Enhanced FileTabManager that supports the panel's tabs
const currentTabs = computed(() => props.openTabs);
const currentActiveTab = computed(() => props.activeTab);

const handleTabUpdate = (filePath: string | null) => {
	if (filePath) {
		emits("tab-selected", filePath, props.panelId);
	}
};

const handleCloseFileTab = (filePath: string) => {
	emits("tab-closed", filePath, props.panelId);
};
</script>

<template>
	<div class="relative" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
		<!-- FileTabManager -->
		<FileTabManager
			:model-value="currentActiveTab"
			:open-tabs="currentTabs"
			:panel-id="panelId"
			@update:model-value="handleTabUpdate"
			@tab-closed="handleCloseFileTab"
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
