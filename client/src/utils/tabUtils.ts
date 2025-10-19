import type { TabData, PanelData } from "../types/domain/Panels";

/**
 * Creates a new TabData object with the given file path and panel ID
 */
export const createTab = (filePath: string, panelId: number): TabData => {
	return {
		filePath,
		panelId,
	};
};

/**
 * Finds a tab with the specified file path in the given panel
 */
export const findTabInPanel = (panel: PanelData, filePath: string): TabData | undefined => {
	return panel.openTabs.find((tab) => tab.filePath === filePath);
};

/**
 * Gets the index of a tab with the specified file path in the given panel
 */
export const getTabIndexInPanel = (panel: PanelData, filePath: string): number => {
	return panel.openTabs.findIndex((tab) => tab.filePath === filePath);
};
