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
