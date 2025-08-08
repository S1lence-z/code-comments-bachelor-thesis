import type { Ref } from "@vue/runtime-dom";

export interface PanelData {
	id: string;
	openTabs: string[];
	activeTab: string | null;
	size?: number;
}

export interface PanelPosition {}

export function generatePanelId(panelIdCounter: Ref<number>): string {
	return `panel-${++panelIdCounter.value}`;
}

export function generateNewPanel(panelIdCounter: Ref<number>, initialFilePath?: string): PanelData {
	const newPanelId = generatePanelId(panelIdCounter);
	return {
		id: newPanelId,
		openTabs: initialFilePath ? [initialFilePath] : [],
		activeTab: initialFilePath || null,
		size: 50,
	};
}

export function determineDropPosition(
	relativeXPos: number,
	containerWidth: number,
	dropZoneWidth: number,
	panelCount: number
): number | null {
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
}
