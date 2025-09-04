import { ref, watch } from "vue";
import type { PanelData } from "../../utils/panelUtils";
import { determineDropPosition, generateNewPanel } from "../../utils/panelUtils";
import { useSettingsStore } from "../../stores/settingsStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

export interface SplitPanelManagerProps {
	selectedFilePath: string | null;
}

export interface SplitPanelManagerEmits {
	(event: "update:selectedFilePath", value: string | null): void;
	(event: "line-double-clicked", data: { lineNumber: number; filePath: string }): void;
	(
		event: "multiline-selected",
		data: { selectedStartLineNumber: number; selectedEndLineNumber: number; filePath: string }
	): void;
	(event: "delete-comment", commentId: string): void;
	(event: "edit-comment", commentId: string): void;
}

export function useSplitPanelManager(props: SplitPanelManagerProps, emit: SplitPanelManagerEmits) {
	// Stores
	const settingsStore = useSettingsStore();
	const workspaceStore = useWorkspaceStore();

	// Panel management
	const panels = ref<PanelData[]>([]);
	const panelIdCounter = ref(0);

	// Constants
	const DROPZONE_WIDTH = 200;
	const MIN_PANEL_WIDTH_PX = 100;
	const FULL_WIDTH_PERCENTAGE = 100;
	const DEFAULT_PANEL_SIZE_PERCENTAGE = 50;

	// Drag and drop state
	const draggedTab = ref<{ filePath: string; fromPanelId: string } | null>(null);
	const leftDropZoneActive = ref(false);
	const rightDropZoneActive = ref(false);
	const containerElement = ref<HTMLElement>();

	// Save workspace watcher
	watch(
		[() => settingsStore.isSaveWorkspace, panels],
		([shouldSaveWorkspace]) => {
			if (shouldSaveWorkspace) {
				workspaceStore.saveWorkspace(panels.value);
			}
		},
		{ deep: true }
	);

	// Utility functions for panels
	const restorePanels = (savedPanels: PanelData[]): void => {
		console.log("Restoring panels:", savedPanels);
		savedPanels.forEach((panel) => {
			const newPanel = generateNewPanel(panelIdCounter);
			newPanel.openTabs = panel.openTabs;
			newPanel.activeTab = panel.activeTab || panel.openTabs[0] || null;
			panels.value.push(newPanel);
		});
	};

	const restoreTabSelections = (): void => {
		panels.value.forEach((panel) => {
			if (panel.openTabs.length > 0) {
				setTimeout(() => {
					emit("update:selectedFilePath", panel.activeTab);
				}, 1000);
			}
		});
	};

	const redistributePanelSizes = (): void => {
		if (panels.value.length > 0) {
			const equalSize = FULL_WIDTH_PERCENTAGE / panels.value.length;
			panels.value.forEach((panel) => {
				panel.size = equalSize;
			});
		}
	};

	// Load saved workspace on component mount
	const initializeWorkspace = (): void => {
		const savedPanels = workspaceStore.getSavedWorkspace;
		if (savedPanels) {
			restorePanels(savedPanels);
			restoreTabSelections();
			redistributePanelSizes();
		}
	};

	// Panel management methods
	const closePanel = (panelId: string): void => {
		if (panels.value.length === 1) return;

		const panelIndex = panels.value.findIndex((p) => p.id === panelId);
		if (panelIndex === -1) return;

		const panelToClose = panels.value[panelIndex];

		// If this panel has the active tab, switch to another panel
		if (panelToClose.activeTab === props.selectedFilePath) {
			const remainingPanels = panels.value.filter((p) => p.id !== panelId);
			const nextActivePanel = remainingPanels[0];
			if (nextActivePanel && nextActivePanel.activeTab) {
				emit("update:selectedFilePath", nextActivePanel.activeTab);
			} else {
				emit("update:selectedFilePath", null);
			}
		}

		// Remove panel
		panels.value.splice(panelIndex, 1);

		// Redistribute sizes
		if (panels.value.length > 0) {
			const remainingSize = FULL_WIDTH_PERCENTAGE / panels.value.length;
			panels.value.forEach((panel) => {
				panel.size = remainingSize;
			});
		}

		// If a panel does not have any tabs, close it
		panels.value = panels.value.filter((panel) => panel.openTabs.length > 0);
		if (panels.value.length === 0) {
			panels.value.push(generateNewPanel(panelIdCounter));
			panels.value[0].size = FULL_WIDTH_PERCENTAGE;
			emit("update:selectedFilePath", null);
		}
	};

	const addFileToPanel = (newFilePath: string): void => {
		const activePanel = panels.value[0];
		if (!activePanel) return;

		if (!activePanel.openTabs.includes(newFilePath)) {
			activePanel.openTabs.push(newFilePath);
		}
		activePanel.activeTab = newFilePath;
	};

	// Tab management methods
	const handleTabSelected = (filePath: string, panelId: string): void => {
		const panel = panels.value.find((p) => p.id === panelId);
		if (!panel) return;

		panel.activeTab = filePath;
		emit("update:selectedFilePath", filePath);
	};

	const handleTabClosed = (filePath: string, panelId: string): void => {
		const panel = panels.value.find((p) => p.id === panelId);
		if (!panel) {
			console.error("Panel not found for closed tab:", panelId);
			return;
		}

		const tabIndex = panel.openTabs.indexOf(filePath);
		if (tabIndex === -1) {
			console.error("Tab not found in panel:", filePath, panelId);
			return;
		}

		// Remove the tab from the panel
		panel.openTabs.splice(tabIndex, 1);
		if (panel.openTabs.length === 0) {
			closePanel(panelId);
			return;
		}
		// If the closed tab was the active tab, switch to the first tab
		if (panel.activeTab === filePath) {
			panel.activeTab = panel.openTabs[0];
			emit("update:selectedFilePath", panel.activeTab);
		}
	};

	// Drag and drop methods
	const handleTabDragStart = (filePath: string, panelId: string): void => {
		draggedTab.value = { filePath, fromPanelId: panelId };
	};

	const handleTabDragEnd = (): void => {
		draggedTab.value = null;
		leftDropZoneActive.value = false;
		rightDropZoneActive.value = false;
	};

	const handleTabDrop = (targetPanelId: string, insertIndex?: number): void => {
		if (!draggedTab.value) return;

		const { filePath, fromPanelId } = draggedTab.value;

		// Don't allow dropping on the same panel
		if (fromPanelId === targetPanelId) {
			draggedTab.value = null;
			return;
		}

		const sourcePanel = panels.value.find((p) => p.id === fromPanelId);
		const targetPanel = panels.value.find((p) => p.id === targetPanelId);

		if (!sourcePanel || !targetPanel) return;

		// Remove from source panel
		const sourceIndex = sourcePanel.openTabs.indexOf(filePath);
		if (sourceIndex !== -1) {
			sourcePanel.openTabs.splice(sourceIndex, 1);

			// If this was the active tab in source panel, switch to another tab
			if (sourcePanel.activeTab === filePath) {
				sourcePanel.activeTab = sourcePanel.openTabs[0] || null;
			}
		}

		// Add to target panel
		if (insertIndex !== undefined) {
			targetPanel.openTabs.splice(insertIndex, 0, filePath);
		} else {
			targetPanel.openTabs.push(filePath);
		}

		// Make it active in target panel
		targetPanel.activeTab = filePath;
		emit("update:selectedFilePath", filePath);

		draggedTab.value = null;
	};

	// Drop zone methods
	const handleDropZoneDragOver = (event: DragEvent): void => {
		event.preventDefault();

		if (draggedTab.value) {
			const container = event.currentTarget as HTMLElement;
			const containerRect = container.getBoundingClientRect();
			const relativeX = event.clientX - containerRect.left;
			// Show left drop zone
			leftDropZoneActive.value = relativeX <= DROPZONE_WIDTH;
			// Show right drop zone
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

		// Only handle internal tab drops
		if (draggedTab.value) {
			const { filePath, fromPanelId } = draggedTab.value;
			const container = event.currentTarget as HTMLElement;
			const containerRect = container.getBoundingClientRect();
			const relativeX = event.clientX - containerRect.left;

			const sourcePanel = panels.value.find((p) => p.id === fromPanelId);
			if (!sourcePanel) return;

			// Determine drop position
			let insertPosition = determineDropPosition(
				relativeX,
				containerRect.width,
				DROPZONE_WIDTH,
				panels.value.length
			);
			if (insertPosition === null) return;

			// Remove from source panel
			const sourceIndex = sourcePanel.openTabs.indexOf(filePath);
			if (sourceIndex !== -1) {
				sourcePanel.openTabs.splice(sourceIndex, 1);
				if (sourcePanel.activeTab === filePath) {
					sourcePanel.activeTab = sourcePanel.openTabs[0] || null;
				}
			}

			// Create new panel
			const newPanel: PanelData = generateNewPanel(panelIdCounter, filePath);

			// Insert new panel at the determined position
			panels.value.splice(insertPosition, 0, newPanel);

			// Redistribute sizes
			const equalSize = FULL_WIDTH_PERCENTAGE / panels.value.length;
			panels.value.forEach((panel) => {
				panel.size = equalSize;
			});

			// Make the moved file active
			emit("update:selectedFilePath", filePath);
			draggedTab.value = null;
		}
	};

	// Panel resizing functionality
	const handlePanelResize = (panelIndex: number, newWidth: number): void => {
		const container = containerElement.value;
		if (!container || panelIndex >= panels.value.length - 1) return;

		const containerWidth = container.getBoundingClientRect().width;
		const currentPanel = panels.value[panelIndex];
		const nextPanel = panels.value[panelIndex + 1];

		if (!currentPanel || !nextPanel) return;

		// Calculate cumulative width up to current panel
		let cumulativeWidth = 0;
		for (let i = 0; i <= panelIndex; i++) {
			cumulativeWidth +=
				((panels.value[i].size || DEFAULT_PANEL_SIZE_PERCENTAGE) / FULL_WIDTH_PERCENTAGE) * containerWidth;
		}

		// Calculate total width of current + next panel
		const currentWidthPx =
			((currentPanel.size || DEFAULT_PANEL_SIZE_PERCENTAGE) / FULL_WIDTH_PERCENTAGE) * containerWidth;
		const nextWidthPx =
			((nextPanel.size || DEFAULT_PANEL_SIZE_PERCENTAGE) / FULL_WIDTH_PERCENTAGE) * containerWidth;
		const totalWidthPx = currentWidthPx + nextWidthPx;

		// Desired width for current panel
		const desiredCurrentWidthPx = newWidth - (cumulativeWidth - currentWidthPx);

		// Clamp to ensure both panels have minimum width
		const clampedCurrentWidthPx = Math.max(
			MIN_PANEL_WIDTH_PX,
			Math.min(totalWidthPx - MIN_PANEL_WIDTH_PX, desiredCurrentWidthPx)
		);
		const clampedNextWidthPx = totalWidthPx - clampedCurrentWidthPx;

		// Update panel sizes
		currentPanel.size = (clampedCurrentWidthPx / containerWidth) * FULL_WIDTH_PERCENTAGE;
		nextPanel.size = (clampedNextWidthPx / containerWidth) * FULL_WIDTH_PERCENTAGE;
	};

	// Selected file path handling
	const handleSelectedFilePathChange = (newFilePath: string | null): void => {
		if (!newFilePath) return;
		if (panels.value.length === 0) {
			// If no panels exist, create a new one
			panels.value.push(generateNewPanel(panelIdCounter));
			// Set the first panel to take full width
			panels.value[0].size = FULL_WIDTH_PERCENTAGE;
		}

		// Check if file is already open in any panel
		const existingPanel = panels.value.find((panel) => panel.openTabs.includes(newFilePath));

		if (existingPanel) {
			// File is already open, just make it active
			existingPanel.activeTab = newFilePath;
		} else {
			// File is not open, add it to active panel
			addFileToPanel(newFilePath);
		}
	};

	// Watch for selectedFilePath changes
	watch(() => props.selectedFilePath, handleSelectedFilePathChange);

	// Watch for selectedFilePath changes
	watch(
		() => props.selectedFilePath,
		(newFilePath: string | null) => {
			if (!newFilePath) return;

			if (panels.value.length === 0) {
				// If no panels exist, create a new one
				const newPanel = generateNewPanel(panelIdCounter);
				newPanel.size = FULL_WIDTH_PERCENTAGE;
				panels.value.push(newPanel);
			}

			// Check if file is already open in any panel
			const existingPanel = panels.value.find((panel) => panel.openTabs.includes(newFilePath));

			if (existingPanel) {
				// File is already open, just make it active
				existingPanel.activeTab = newFilePath;
			} else {
				// File is not open, add it to the first panel
				const activePanel = panels.value[0];
				if (activePanel) {
					if (!activePanel.openTabs.includes(newFilePath)) {
						activePanel.openTabs.push(newFilePath);
					}
					activePanel.activeTab = newFilePath;
				}
			}
		}
	);

	return {
		// State
		panels,
		containerElement,
		draggedTab,
		leftDropZoneActive,
		rightDropZoneActive,

		// Constants
		DROPZONE_WIDTH,

		// Methods
		initializeWorkspace,
		closePanel,
		handleTabSelected,
		handleTabClosed,
		handleTabDragStart,
		handleTabDragEnd,
		handleTabDrop,
		handleDropZoneDragOver,
		handleDropZoneLeave,
		handleDropZoneDrop,
		handlePanelResize,
	};
}
