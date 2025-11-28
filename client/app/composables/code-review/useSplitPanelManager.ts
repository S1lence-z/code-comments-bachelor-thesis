import type { DraggedTabData, PanelData } from "../../types/domain/workspace-panels";
import { FileDisplayType } from "../../types/domain/file-content";
import type RawCommentData from "../../types/domain/raw-comment-data";

export interface SplitPanelManagerProps {
	panels: PanelData[];
	draggedTab: DraggedTabData | null;
	leftDropZoneActive: boolean;
	rightDropZoneActive: boolean;
	dropZoneWidth: number;
	sideBarWidth: number;
}

export interface SplitPanelManagerEmits {
	(event: "tab-selected", filePath: string, panelId: number): void;
	(event: "tab-closed", filePath: string, panelId: number): void;
	(event: "tab-drop", panelId: number, insertIndex?: number): void;
	(event: "tab-drag-start", filePath: string, panelId: number): void;
	(event: "tab-drag-end"): void;
	(
		event: "panel-resize",
		currentPanel: PanelData,
		nextPanel: PanelData,
		newWidthPercentage: number
	): void;
	(event: "drop-zone-drag-over", dragEvent: DragEvent): void;
	(event: "drop-zone-leave", dragEvent: DragEvent): void;
	(event: "drop-zone-drop", dragEvent: DragEvent): void;
	(event: "inline-form-submit", payload: RawCommentData): void;
	(event: "inline-form-delete", commentId: string): void;
	(event: "inline-form-reply", parentCommentId: string, reply: RawCommentData): void;
}

export function useSplitPanelManager(props: SplitPanelManagerProps, emit: SplitPanelManagerEmits) {
	// Constants
	const MIN_PANEL_WIDTH_PX = 100;
	const FULL_WIDTH_PERCENTAGE = 100;

	// Stores
	const fileContentStore = useFileContentStore();
	const projectDataStore = useProjectDataStore();
	const settingsStore = useSettingsStore();

	// Component refs
	const containerElement = ref<HTMLElement>();

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

	const getFilePreviewUrl = (filePath: string) => {
		return fileContentStore.getFilePreviewUrl(filePath);
	};

	// Panel resizing functionality
	const adjustForSidebarWidth = (x: number) => {
		return x - (settingsStore.isSidebarOpen ? props.sideBarWidth : 0);
	};

	const handlePanelResize = (panelIndex: number, newWidth: number): void => {
		newWidth = adjustForSidebarWidth(newWidth);
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
			cumulativeWidth += ((panel?.size || 0) / FULL_WIDTH_PERCENTAGE) * containerWidth;
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
		// State and methods
		containerElement,
		handlePanelResize,

		// Helper functions
		isTextFile,
		getFileContent,
		getCommentsForFile,
		isFileCached,
		getFileDisplayType,
		getFileDownloadUrl,
		getFilePreviewUrl,
	};
}
