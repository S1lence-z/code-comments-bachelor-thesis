<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { getFileName } from "../../utils/fileUtils";
import type { DraggedTabData } from "../../types/others/Panels";

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
	emit("tab-closed", filePath);
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

const fileTabsContainer = ref<HTMLElement | null>(null);

const handleHorizontalTabScroll = (event: WheelEvent) => {
	if (!fileTabsContainer.value) return;

	const { deltaX, deltaY } = event;
	event.preventDefault();

	if (Math.abs(deltaY) >= Math.abs(deltaX)) {
		fileTabsContainer.value.scrollLeft += deltaY;
		return;
	}

	if (deltaX !== 0) {
		fileTabsContainer.value.scrollLeft += deltaX;
	}
};

// Get the current tabs to display
const currentTabs = computed(() => props.openTabs || openFileTabs.value);
</script>

<template>
	<div v-if="currentTabs.length > 0" class="flex flex-col h-full">
		<!-- File Tabs -->
		<div class="w-full bg-white/5 backdrop-blur-sm border-b border-white/10 py-2">
			<!-- File tabs container -->
			<div class="flex items-center py-1">
				<!-- Mutliple File Tabs -->
				<div
					v-if="currentTabs.length > 1"
					ref="fileTabsContainer"
					class="file-tabs scrollbar-hidden"
					@wheel="handleHorizontalTabScroll"
				>
					<div
						v-for="(file, index) in currentTabs"
						:key="file"
						class="file-tab"
						:class="{
							active: file === activeTab,
							'opacity-50 scale-95': isDragging && file === draggedFilePath,
							'ml-4': index === 0,
							'mr-4': index === currentTabs.length - 1,
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
							class="flex items-center gap-2 px-3 py-1 duration-200 cursor-pointer"
							:class="{
								'text-white': file === activeTab,
								'text-slate-300 hover:text-white': file !== activeTab,
								'opacity-50': isDragging && file === draggedFilePath,
								'select-none cursor-grab active:cursor-grabbing': props.panelId,
							}"
						>
							<span class="truncate max-w-32">{{ getFileName(file) }}</span>
						</button>

						<!-- Close tab button -->
						<button
							@click="removeFileTab(file)"
							class="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-white hover:bg-white/10 rounded-md duration-200 mr-1 cursor-pointer text-sm"
							title="Close file"
						>
							<Icon icon="mdi:close" class="w-6 h-6" />
						</button>
					</div>
				</div>

				<!-- Single Open File Label -->
				<div v-else class="flex items-center gap-2 px-2 py-1 text-slate-300">
					<span class="text-slate-300 font-semibold ml-4">{{ getFileName(currentTabs[0]) }}</span>

					<!-- Close tab button -->
					<button
						@click="removeFileTab(currentTabs[0])"
						class="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-white hover:bg-white/10 rounded-md duration-200 cursor-pointer"
						title="Close file"
					>
						<Icon icon="mdi:close" class="w-6 h-6" />
					</button>
				</div>
			</div>
		</div>

		<!-- Slot for file content -->
		<div class="flex-1 overflow-hidden">
			<slot></slot>
		</div>
	</div>
</template>
