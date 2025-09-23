import { ref } from "vue";
import type { SplitPanelManagerProps, SplitPanelManagerEmits } from "../../components/codeReview/SplitPanelManager.vue";
import { useFileContentStore } from "../../stores/fileContentStore";
import { useProjectDataStore } from "../../stores/projectDataStore";
import { FileDisplayType } from "../../types/github/githubFile";

export function useSplitPanelManager(props: SplitPanelManagerProps, emit: SplitPanelManagerEmits) {
	// Constants
	const MIN_PANEL_WIDTH_PX = 100;
	const FULL_WIDTH_PERCENTAGE = 100;

	// Stores
	const fileContentStore = useFileContentStore();
	const projectDataStore = useProjectDataStore();

	// Component refs
	const containerElement = ref<HTMLElement>();

	// Tab management methods
	const handleTabSelected = (filePath: string, panelId: number): void => {
		emit("tab-selected", filePath, panelId);
	};

	const handleTabClosed = (filePath: string, panelId: number): void => {
		emit("tab-closed", filePath, panelId);
	};

	const handleTabDrop = (targetPanelId: number, insertIndex?: number): void => {
		emit("tab-drop", targetPanelId, insertIndex);
	};

	// Drag and drop methods
	const handleTabDragStart = (filePath: string, panelId: number): void => {
		emit("tab-drag-start", filePath, panelId);
	};

	const handleTabDragEnd = (): void => {
		emit("tab-drag-end");
	};

	// Drop zone methods
	const handleDropZoneDragOver = (event: DragEvent): void => {
		emit("drop-zone-drag-over", event);
	};

	const handleDropZoneLeave = (event: DragEvent): void => {
		emit("drop-zone-leave", event);
	};

	const handleDropZoneDrop = (event: DragEvent): void => {
		emit("drop-zone-drop", event);
	};

	// Helper functions for content rendering
	const isTextFile = (filePath: string) => {
		return fileContentStore.getFileDisplayType(filePath) === FileDisplayType.Text;
	};

	const getFileContent = (filePath: string) => {
		return fileContentStore.getFileContent(filePath);
	};

	const getCommentsForFile = (filePath: string) => {
		return projectDataStore.getCommentsForFile(filePath);
	};

	const isFileCached = (filePath: string) => {
		return fileContentStore.isFileCached(filePath);
	};

	const getFileDisplayType = (filePath: string) => {
		return fileContentStore.getFileDisplayType(filePath);
	};

	const getFileDownloadUrl = (filePath: string) => {
		return fileContentStore.getFileDownloadUrl(filePath);
	};

	// Panel resizing functionality
	const handlePanelResize = (panelIndex: number, newWidth: number): void => {
		const container = containerElement.value;
		if (!container || panelIndex >= props.panels.length - 1) return;

		const containerWidth = container.getBoundingClientRect().width;
		const currentPanel = props.panels[panelIndex];
		const nextPanel = props.panels[panelIndex + 1];

		if (!currentPanel || !nextPanel) return;

		// Calculate current positions
		let cumulativeWidth = 0;
		for (let i = 0; i <= panelIndex; i++) {
			const panel = props.panels[i];
			cumulativeWidth += (panel.size / FULL_WIDTH_PERCENTAGE) * containerWidth;
		}

		// Calculate total width of current + next panel
		const currentWidthPx = (currentPanel.size / FULL_WIDTH_PERCENTAGE) * containerWidth;
		const nextWidthPx = (nextPanel.size / FULL_WIDTH_PERCENTAGE) * containerWidth;
		const totalWidthPx = currentWidthPx + nextWidthPx;

		// Desired width for current panel
		const desiredCurrentWidthPx = newWidth - (cumulativeWidth - currentWidthPx);

		// Clamp to ensure both panels have minimum width
		const clampedCurrentWidthPx = Math.max(
			MIN_PANEL_WIDTH_PX,
			Math.min(totalWidthPx - MIN_PANEL_WIDTH_PX, desiredCurrentWidthPx)
		);

		// Calculate new width percentage
		const newWidthPercentage = (clampedCurrentWidthPx / containerWidth) * FULL_WIDTH_PERCENTAGE;

		emit("panel-resize", currentPanel, nextPanel, newWidthPercentage);
	};

	return {
		// State
		containerElement,

		// Methods
		handleTabSelected,
		handleTabClosed,
		handleTabDrop,
		handleTabDragStart,
		handleTabDragEnd,
		handleDropZoneDragOver,
		handleDropZoneLeave,
		handleDropZoneDrop,
		handlePanelResize,

		// Helper functions
		isTextFile,
		getFileContent,
		getCommentsForFile,
		isFileCached,
		getFileDisplayType,
		getFileDownloadUrl,
	};
}
