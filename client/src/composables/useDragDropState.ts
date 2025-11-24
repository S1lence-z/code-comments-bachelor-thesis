import { ref, computed, readonly } from "vue";
import type { DraggedTabData } from "../types/domain/workspace-panels";

/**
 * Pure state manager for drag and drop operations.
 * Only manages UI state - no business logic or side effects.
 */
export function useDragDropState() {
	// Constants
	const DROPZONE_WIDTH = 200;

	// State
	const draggedTab = ref<DraggedTabData | null>(null);
	const leftDropZoneActive = ref(false);
	const rightDropZoneActive = ref(false);

	// Computed
	const isDragging = computed(() => draggedTab.value !== null);

	// State management methods
	const startDrag = (filePath: string, panelId: number): void => {
		draggedTab.value = {
			filePath,
			panelId,
			fromPanelId: panelId,
		};
	};

	const endDrag = (): void => {
		draggedTab.value = null;
		leftDropZoneActive.value = false;
		rightDropZoneActive.value = false;
	};

	const updateDropZones = (isLeftActive: boolean, isRightActive: boolean): void => {
		leftDropZoneActive.value = isLeftActive;
		rightDropZoneActive.value = isRightActive;
	};

	const clearDropZones = (): void => {
		leftDropZoneActive.value = false;
		rightDropZoneActive.value = false;
	};

	return {
		// Constants
		DROPZONE_WIDTH,

		// State (readonly to prevent external mutations)
		draggedTab: readonly(draggedTab),
		leftDropZoneActive: readonly(leftDropZoneActive),
		rightDropZoneActive: readonly(rightDropZoneActive),
		isDragging,

		// Methods
		startDrag,
		endDrag,
		updateDropZones,
		clearDropZones,
	};
}
