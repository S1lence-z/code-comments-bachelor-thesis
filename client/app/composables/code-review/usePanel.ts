import type { DraggedTabData, TabData } from "../../types/domain/workspace-panels";

export interface PanelProps {
	panelId: number;
	openTabs: TabData[];
	activeTab: TabData | null;
	draggedTab: DraggedTabData | null;
}

export interface PanelEmits {
	(event: "tab-selected", filePath: string, panelId: number): void;
	(event: "tab-closed", filePath: string, panelId: number): void;
	(event: "tab-drop", panelId: number): void;
	(event: "tab-drag-start", filePath: string, panelId: number): void;
	(event: "tab-drag-end"): void;
	(event: "tab-drop-with-index", panelId: number, insertIndex: number): void;
}

export const usePanel = (props: PanelProps, emit: PanelEmits) => {
	// Drag and drop state
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

	// Tab state and handlers
	const currentTabs = computed(() => props.openTabs.map((tab) => tab.filePath));
	const currentActiveTab = computed(() => props.activeTab?.filePath || null);

	const handleTabUpdate = (filePath: string | null) => {
		if (filePath) {
			emit("tab-selected", filePath, props.panelId);
		}
	};

	const handleCloseFileTab = (filePath: string) => {
		emit("tab-closed", filePath, props.panelId);
	};

	const handleTabDragStart = (filePath: string, panelId: number) => {
		emit("tab-drag-start", filePath, panelId);
	};

	const handleTabDragEnd = () => {
		emit("tab-drag-end");
	};

	const handleTabDropWithIndex = (panelId: number, insertIndex: number) => {
		emit("tab-drop-with-index", panelId, insertIndex);
	};

	return {
		currentActiveTab,
		currentTabs,
		isDragOver,
		showDropZone,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleTabUpdate,
		handleCloseFileTab,
		handleTabDragStart,
		handleTabDragEnd,
		handleTabDropWithIndex,
	};
};
