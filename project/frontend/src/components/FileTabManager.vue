<script setup lang="ts">
import { ref, watch, computed, inject } from "vue";

const props = defineProps<{
	modelValue: string | null;
	panelId?: string;
	openTabs?: string[];
}>();

const emits = defineEmits<{
	(event: "update:modelValue", value: string | null): void;
	(event: "tab-closed", filePath: string): void; // For split panel mode
}>();

// Inject context from SplitPanelManager (if available)
const splitPanelContext = inject("splitPanelContext", null) as any;

// Use external tabs if provided, otherwise manage internal tabs
const openFileTabs = ref<string[]>([]);

// Function to extract filename from full path
const getFileName = (filePath: string): string => {
	return filePath.split("/").pop() || filePath;
};

const setActiveFileTab = (filePath: string) => {
	const currentTabs = props.openTabs || openFileTabs.value;
	if (currentTabs.includes(filePath)) {
		emits("update:modelValue", filePath);
	}
};

const removeFileTab = (filePath: string) => {
	if (props.openTabs) {
		// In split panel mode, emit to parent
		emits("tab-closed", filePath);
	} else {
		// In classic mode, manage internal tabs
		const index = openFileTabs.value.indexOf(filePath);
		if (index !== -1) {
			openFileTabs.value.splice(index, 1);
			if (props.modelValue === filePath) {
				emits("update:modelValue", openFileTabs.value[0] || null);
			}
		}
	}
};

// Only manage internal tabs in classic mode
watch(
	() => props.modelValue,
	(newFilePath: string | null) => {
		if (!props.openTabs && newFilePath && !openFileTabs.value.includes(newFilePath)) {
			openFileTabs.value.push(newFilePath);
		}
	}
);

// Drag and drop functionality
const handleDragStart = (event: DragEvent, filePath: string) => {
	if (!splitPanelContext || !props.panelId) return;

	event.dataTransfer!.effectAllowed = "move";
	event.dataTransfer!.setData("text/plain", filePath);

	// Add a slight delay to ensure the drag image is set
	setTimeout(() => {
		splitPanelContext?.handleTabDragStart(filePath, props.panelId);
	}, 0);
};

const handleDragEnd = () => {
	if (!splitPanelContext) return;
	splitPanelContext?.handleTabDragEnd();
};

const handleDragOver = (event: DragEvent) => {
	event.preventDefault();
	if (!splitPanelContext) return;
	event.dataTransfer!.dropEffect = "move";
};

const handleDrop = (event: DragEvent, insertIndex: number) => {
	event.preventDefault();
	if (!splitPanelContext || !props.panelId) return;
	splitPanelContext?.handleTabDrop(props.panelId, insertIndex);
};

// Check if a tab is being dragged
const isDragging = computed(() => {
	if (!splitPanelContext) return false;
	const draggedTab = splitPanelContext?.draggedTab?.();
	return draggedTab?.fromPanelId === props.panelId;
});

const draggedFilePath = computed(() => {
	if (!splitPanelContext) return null;
	const draggedTab = splitPanelContext?.draggedTab?.();
	return draggedTab?.filePath;
});

// Get the current tabs to display
const currentTabs = computed(() => props.openTabs || openFileTabs.value);
</script>

<template>
	<div v-if="currentTabs.length > 0" class="flex flex-col h-full overflow-hidden">
		<!-- File Tabs -->
		<div class="w-full bg-white/5 backdrop-blur-sm border-b border-white/10 py-2">
			<div class="flex items-center px-4">
				<!-- Open Files Label -->
				<span class="text-slate-300 font-semibold mr-6">Open Files</span>
				<!-- File Tabs -->
				<div class="file-tabs scrollbar-hidden">
					<div
						v-for="(file, index) in currentTabs"
						:key="file"
						class="file-tab"
						:class="{
							active: file === modelValue,
							dragging: isDragging && file === draggedFilePath,
						}"
						@dragover="handleDragOver"
						@drop="handleDrop($event, index)"
					>
						<button
							:draggable="splitPanelContext ? true : false"
							@dragstart="handleDragStart($event, file)"
							@dragend="handleDragEnd"
							@click="setActiveFileTab(file)"
							:title="file"
							class="flex items-center gap-2 px-3 py-2 duration-200 cursor-pointer"
							:class="{
								'text-white': file === modelValue,
								'text-slate-300 hover:text-white': file !== modelValue,
								'opacity-50': isDragging && file === draggedFilePath,
								'select-none': splitPanelContext,
							}"
						>
							<span class="truncate max-w-32">{{ getFileName(file) }}</span>
						</button>

						<button
							@click="removeFileTab(file)"
							class="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-white hover:bg-white/10 rounded-md duration-200 mr-1 cursor-pointer"
							title="Close file"
						>
							x
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Slot for file content -->
		<div class="flex-1 overflow-hidden">
			<slot></slot>
		</div>
	</div>
</template>

<style scoped>
.file-tab.dragging {
	opacity: 0.5;
	transform: scale(0.95);
}

.file-tab button[draggable="true"] {
	cursor: grab;
}

.file-tab button[draggable="true"]:active {
	cursor: grabbing;
}
</style>
