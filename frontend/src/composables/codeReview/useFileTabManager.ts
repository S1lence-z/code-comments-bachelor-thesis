import { computed, ref, watch } from "vue";
import type { DraggedTabData } from "../../types/others/Panels";

export interface FileTabManagerProps {
	activeTab: string | null;
	panelId?: number;
	openTabs?: string[];
	draggedTab?: DraggedTabData | null;
}

export interface FileTabManagerEmits {
	(event: "update:activeTab", value: string | null): void;
	(event: "tab-closed", filePath: string): void;
	(event: "tab-drag-start", filePath: string, panelId: number): void;
	(event: "tab-drag-end"): void;
	(event: "tab-drop", panelId: number, insertIndex: number): void;
}

export const useFileTabManager = (props: FileTabManagerProps, emit: FileTabManagerEmits) => {
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

	return {
		currentTabs,
		setActiveFileTab,
		removeFileTab,
		handleDragStart,
		handleDragEnd,
		handleDragOver,
		handleDrop,
		isDragging,
		draggedFilePath,
		fileTabsContainer,
		handleHorizontalTabScroll,
	};
};
