import type { DraggedTabData } from "../types/domain/workspace-panels";

/**
 * Singleton state for drag-and-drop. Refs live at module scope so every caller
 * shares the same instance.
 */
const DROPZONE_WIDTH = 200;

const draggedTab = ref<DraggedTabData | null>(null);
const leftDropZoneActive = ref(false);
const rightDropZoneActive = ref(false);

const isDragging = computed(() => draggedTab.value !== null);
const isTreeDrag = computed(() => draggedTab.value?.source === "tree");

const startDrag = (filePath: string, panelId: number): void => {
	draggedTab.value = { filePath, panelId, fromPanelId: panelId, source: "tab" };
};

const startDragFromTree = (filePath: string): void => {
	// fromPanelId is unused for tree drags; set to 0 since the field is required.
	draggedTab.value = { filePath, panelId: 0, fromPanelId: 0, source: "tree" };
};

const endDrag = (): void => {
	draggedTab.value = null;
	leftDropZoneActive.value = false;
	rightDropZoneActive.value = false;
};

const updateDropZones = (left: boolean, right: boolean): void => {
	leftDropZoneActive.value = left;
	rightDropZoneActive.value = right;
};

const clearDropZones = (): void => {
	leftDropZoneActive.value = false;
	rightDropZoneActive.value = false;
};

export const useDragDropState = () => ({
	DROPZONE_WIDTH,
	draggedTab: readonly(draggedTab),
	leftDropZoneActive: readonly(leftDropZoneActive),
	rightDropZoneActive: readonly(rightDropZoneActive),
	isDragging,
	isTreeDrag,
	startDrag,
	startDragFromTree,
	endDrag,
	updateDropZones,
	clearDropZones,
});
