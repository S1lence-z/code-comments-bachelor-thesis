<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { getFileName } from "../../utils/fileUtils";
import type { DraggedTabData } from "../../types/Panels";

const props = defineProps<{
	activeTab: string | null;
	panelId?: number;
	openTabs?: string[];
	draggedTab?: DraggedTabData | null;
}>();

const emit = defineEmits<{
	(event: "update:activeTab", value: string | null): void;
	(event: "tab-closed", filePath: string): void;
	(event: "tab-drag-start", filePath: string, panelId: number): void;
	(event: "tab-drag-end"): void;
	(event: "tab-drop", panelId: number, insertIndex: number): void;
}>();

// Use external tabs if provided, otherwise manage internal tabs
const openFileTabs = ref<string[]>([]);

const setActiveFileTab = (filePath: string) => {
	const currentTabs = props.openTabs || openFileTabs.value;
	if (currentTabs.includes(filePath)) {
		emit("update:activeTab", filePath);
	}
};

const removeFileTab = (filePath: string) => {
	if (props.openTabs) {
		// In split panel mode, emit to parent
		emit("tab-closed", filePath);
	} else {
		// In classic mode, manage internal tabs
		const index = openFileTabs.value.indexOf(filePath);
		if (index !== -1) {
			openFileTabs.value.splice(index, 1);
			if (props.activeTab === filePath) {
				emit("update:activeTab", openFileTabs.value[0] || null);
			}
		}
	}
};

// Only manage internal tabs in classic mode
watch(
	() => props.activeTab,
	(newFilePath: string | null) => {
		if (!props.openTabs && newFilePath && !openFileTabs.value.includes(newFilePath)) {
			openFileTabs.value.push(newFilePath);
		}
	}
);

// Drag and drop functionality
const handleDragStart = (event: DragEvent, filePath: string) => {
	if (!props.panelId) return;

	event.dataTransfer!.effectAllowed = "move";
	event.dataTransfer!.setData("text/plain", filePath);

	// Add a slight delay to ensure the drag image is set
	setTimeout(() => {
		emit("tab-drag-start", filePath, props.panelId!);
	}, 0);
};

const handleDragEnd = () => {
	emit("tab-drag-end");
};

const handleDragOver = (event: DragEvent) => {
	event.preventDefault();
	event.dataTransfer!.dropEffect = "move";
};

const handleDrop = (event: DragEvent, insertIndex: number) => {
	event.preventDefault();
	if (!props.panelId) return;
	emit("tab-drop", props.panelId, insertIndex);
};

// Check if a tab is being dragged
const isDragging = computed(() => {
	return props.draggedTab?.fromPanelId === props.panelId;
});

const draggedFilePath = computed(() => {
	return props.draggedTab?.filePath;
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
							active: file === activeTab,
							'opacity-50 scale-95': isDragging && file === draggedFilePath,
						}"
						@dragover="handleDragOver"
						@drop="handleDrop($event, index)"
					>
						<button
							:draggable="props.panelId ? true : false"
							@dragstart="handleDragStart($event, file)"
							@dragend="handleDragEnd"
							@click="setActiveFileTab(file)"
							:title="file"
							class="flex items-center gap-2 px-3 py-2 duration-200 cursor-pointer"
							:class="{
								'text-white': file === activeTab,
								'text-slate-300 hover:text-white': file !== activeTab,
								'opacity-50': isDragging && file === draggedFilePath,
								'select-none cursor-grab active:cursor-grabbing': props.panelId,
							}"
						>
							<span class="truncate max-w-32">{{ getFileName(file) }}</span>
						</button>

						<button
							@click="removeFileTab(file)"
							class="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-white hover:bg-white/10 rounded-md duration-200 mr-1 cursor-pointer"
							title="Close file"
						>
							X
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
