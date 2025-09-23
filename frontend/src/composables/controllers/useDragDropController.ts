import { ref, computed, type ComputedRef } from "vue";
import type { DraggedTabData } from "../../types/others/Panels";
import { determineDropPosition } from "../../utils/panelUtils";

export interface DragDropControllerProps {
	panelCount: ComputedRef<number>;
}

export interface DragDropControllerEmits {
	(event: "tab-drop", targetPanelId: number, draggedTab: DraggedTabData, insertIndex?: number): void;
	(event: "drop-zone-drop", draggedTab: DraggedTabData, insertPosition: number): void;
}

export function useDragDropController(props: DragDropControllerProps, emit: DragDropControllerEmits) {
	// Constants
	const DROPZONE_WIDTH = 200;

	// Drag and drop state
	const draggedTab = ref<DraggedTabData | null>(null);
	const leftDropZoneActive = ref(false);
	const rightDropZoneActive = ref(false);
	const containerElement = ref<HTMLElement>();

	// Computed properties
	const isDragging = computed(() => draggedTab.value !== null);

	// Drag and drop methods
	const handleTabDragStart = (filePath: string, panelId: number): void => {
		draggedTab.value = {
			filePath,
			panelId,
			fromPanelId: panelId,
		};
	};

	const handleTabDragEnd = (): void => {
		draggedTab.value = null;
		leftDropZoneActive.value = false;
		rightDropZoneActive.value = false;
	};

	const handleTabDrop = (targetPanelId: number, insertIndex?: number): void => {
		if (!draggedTab.value) return;

		// Don't allow dropping on the same panel
		if (draggedTab.value.fromPanelId === targetPanelId) {
			draggedTab.value = null;
			return;
		}

		emit("tab-drop", targetPanelId, draggedTab.value, insertIndex);
		draggedTab.value = null;
	};

	// Drop zone methods
	const handleDropZoneDragOver = (event: DragEvent): void => {
		event.preventDefault();

		if (draggedTab.value) {
			const container = event.currentTarget as HTMLElement;
			const containerRect = container.getBoundingClientRect();
			const relativeX = event.clientX - containerRect.left;

			// Show appropriate drop zones
			leftDropZoneActive.value = relativeX <= DROPZONE_WIDTH;
			rightDropZoneActive.value = relativeX >= containerRect.width - DROPZONE_WIDTH;
		}
	};

	const handleDropZoneLeave = (event: DragEvent): void => {
		const currentTarget = event.currentTarget as HTMLElement;
		const relatedTarget = event.relatedTarget as HTMLElement;
		if (!currentTarget?.contains(relatedTarget)) {
			leftDropZoneActive.value = false;
			rightDropZoneActive.value = false;
		}
	};

	const handleDropZoneDrop = (event: DragEvent): void => {
		event.preventDefault();
		leftDropZoneActive.value = false;
		rightDropZoneActive.value = false;

		if (!draggedTab.value) return;

		const container = event.currentTarget as HTMLElement;
		const containerRect = container.getBoundingClientRect();
		const relativeX = event.clientX - containerRect.left;

		// Determine drop position
		const insertPosition = determineDropPosition(
			relativeX,
			containerRect.width,
			DROPZONE_WIDTH,
			props.panelCount.value
		);

		if (insertPosition === null) return;

		emit("drop-zone-drop", draggedTab.value, insertPosition);
		draggedTab.value = null;
	};

	return {
		// State
		draggedTab: computed(() => draggedTab.value),
		leftDropZoneActive: computed(() => leftDropZoneActive.value),
		rightDropZoneActive: computed(() => rightDropZoneActive.value),
		containerElement,
		isDragging,

		// Constants
		DROPZONE_WIDTH,

		// Methods
		handleTabDragStart,
		handleTabDragEnd,
		handleTabDrop,
		handleDropZoneDragOver,
		handleDropZoneLeave,
		handleDropZoneDrop,
	};
}
