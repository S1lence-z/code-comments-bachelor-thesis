<script setup lang="ts">
import { ref, inject, computed } from "vue";
import FileTabManager from "./FileTabManager.vue";

const props = defineProps<{
	panelId: string;
	openTabs: string[];
	activeTab: string | null;
	size?: number;
	splitDirection?: "horizontal" | "vertical";
	isSinglePanel: boolean;
}>();

const emits = defineEmits<{
	(event: "tab-selected", filePath: string, panelId: string): void;
	(event: "tab-closed", filePath: string, panelId: string): void;
}>();

// Inject context from SplitPanelManager
const splitPanelContext = inject("splitPanelContext") as any;

const isDragOver = ref(false);
const showDropZone = ref(false);

// Panel styling based on split direction and size
const panelStyle = computed(() => {
	const baseStyle: any = {
		display: "flex",
		flexDirection: "column",
		overflow: "hidden",
	};

	if (props.size) {
		if (props.splitDirection === "horizontal") {
			baseStyle.height = `${props.size}%`;
			baseStyle.width = "100%";
		} else {
			baseStyle.width = `${props.size}%`;
			baseStyle.height = "100%";
		}
	} else {
		baseStyle.flex = "1";
	}

	return baseStyle;
});

// Handle tab selection
const handleTabSelected = (filePath: string) => {
	emits("tab-selected", filePath, props.panelId);
};

// Handle tab closing
const handleTabClosed = (filePath: string) => {
	emits("tab-closed", filePath, props.panelId);
};

// Split panel actions
const splitHorizontally = () => {
	splitPanelContext?.splitPanelHorizontally(props.panelId);
};

const splitVertically = () => {
	splitPanelContext?.splitPanelVertically(props.panelId);
};

const closePanel = () => {
	splitPanelContext?.closePanel(props.panelId);
};

// Drag and drop handling
const handleDragOver = (event: DragEvent) => {
	event.preventDefault();
	event.dataTransfer!.dropEffect = "move";

	// Only show drop zone if dragging from another panel
	const draggedTab = splitPanelContext?.draggedTab?.();
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
	splitPanelContext?.handleTabDrop(props.panelId);
};

// Enhanced FileTabManager that supports the panel's tabs
const currentTabs = computed(() => props.openTabs);
const currentActiveTab = computed(() => props.activeTab);

const handleTabUpdate = (filePath: string | null) => {
	if (filePath) {
		handleTabSelected(filePath);
	}
};
</script>

<template>
	<div
		class="panel-container relative"
		:style="panelStyle"
		@dragover="handleDragOver"
		@dragleave="handleDragLeave"
		@drop="handleDrop"
	>
		<!-- Panel Header with Controls -->
		<div class="panel-header flex items-center justify-between px-2 py-1 bg-white/5 border-b border-white/10">
			<div class="flex items-center space-x-2">
				<span class="text-xs text-slate-400">Panel {{ panelId }}</span>
			</div>

			<div class="flex items-center space-x-1">
				<!-- Split Controls -->
				<button
					@click="splitHorizontally"
					class="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
					title="Split Horizontally"
				>
					<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
						<rect x="0" y="0" width="12" height="5" rx="1" />
						<rect x="0" y="7" width="12" height="5" rx="1" />
					</svg>
				</button>

				<button
					@click="splitVertically"
					class="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
					title="Split Vertically"
				>
					<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
						<rect x="0" y="0" width="5" height="12" rx="1" />
						<rect x="7" y="0" width="5" height="12" rx="1" />
					</svg>
				</button>

				<!-- Close Panel Button -->
				<button
					v-if="!isSinglePanel"
					@click="closePanel"
					class="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
					title="Close Panel"
				>
					<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
						<path d="M9.5 3.5L8.5 2.5 6 5 3.5 2.5 2.5 3.5 5 6 2.5 8.5 3.5 9.5 6 7 8.5 9.5 9.5 8.5 7 6z" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Enhanced FileTabManager -->
		<FileTabManager
			:model-value="currentActiveTab"
			:open-tabs="currentTabs"
			:panel-id="panelId"
			@update:model-value="handleTabUpdate"
			@tab-closed="handleTabClosed"
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

<style scoped>
.panel-container {
	border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-container:last-child {
	border-right: none;
}
</style>
