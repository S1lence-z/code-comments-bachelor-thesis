import type { Ref } from "@vue/runtime-dom";
import type { PanelData, TabData } from "../types/domain/Panels";

/**
 * Generates a new unique panel ID by incrementing the counter
 * @param panelIdCounter - Ref to the current panel ID counter
 * @returns The new panel ID
 */
export const generatePanelId = (panelIdCounter: Ref<number>): number => {
	return ++panelIdCounter.value;
};

/**
 * Creates a new panel with the specified initial file path
 * @param panelIdCounter - Ref to the current panel ID counter
 * @param initialFilePath - Optional initial file path to open in the panel
 * @returns A new PanelData object
 */
export const generateNewPanel = (panelIdCounter: Ref<number>, initialFilePath?: string): PanelData => {
	const newPanelId = generatePanelId(panelIdCounter);
	if (!newPanelId) {
		throw new Error("Failed to generate new panel ID");
	}

	const newTabData: TabData = {
		filePath: initialFilePath || "",
		panelId: newPanelId,
	};

	return {
		id: newPanelId,
		openTabs: initialFilePath ? [newTabData] : [],
		activeTab: newTabData || null,
		size: 50,
	};
};

/**
 * Determines the drop position for a dragged panel based on mouse position
 * @param relativeXPos - X position relative to the container
 * @param containerWidth - Total width of the container
 * @param dropZoneWidth - Width of the drop zones on each side
 * @param panelCount - Current number of panels
 * @returns The index where the panel should be inserted, or null if not in a drop zone
 */
export const determineDropPosition = (
	relativeXPos: number,
	containerWidth: number,
	dropZoneWidth: number,
	panelCount: number
): number | null => {
	if (relativeXPos >= containerWidth - dropZoneWidth) {
		// Right drop zone - insert at end
		return panelCount;
	} else if (relativeXPos <= dropZoneWidth) {
		// Left drop zone - insert at beginning
		return 0;
	} else {
		// Not in a drop zone, ignore
		return null;
	}
};

/**
 * Finds a panel with the specified ID in the given panels array
 * @param panels - Array of panels to search through
 * @param panelId - ID of the panel to find
 * @returns The panel with the matching ID, or undefined if not found
 */
export const findPanelById = (panels: PanelData[], panelId: number): PanelData | undefined => {
	return panels.find((p: PanelData) => p.id === panelId);
};

/**
 * Redistributes panel sizes equally across all panels
 * @param panels - Array of panels to redistribute sizes for
 * @param fullWidthPercentage - Total width percentage to distribute across panels
 */
export const redistributePanelSizes = (panels: PanelData[], fullWidthPercentage: number): void => {
	if (panels.length > 0) {
		const equalSize = fullWidthPercentage / panels.length;
		panels.forEach((panel: PanelData) => {
			panel.size = equalSize;
		});
	}
};
