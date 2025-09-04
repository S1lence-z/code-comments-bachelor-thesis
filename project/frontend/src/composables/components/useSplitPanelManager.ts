import { ref, watch, computed } from "vue";
import type { PanelData, Workspace, DraggedTabData } from "../../types/Panels";
import { determineDropPosition, generateNewPanel, findPanelById, redistributePanelSizes } from "../../utils/panelUtils";
import { createTab, findTabInPanel, getTabIndexInPanel } from "../../utils/tabUtils";
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

	// Workspace state
	const currentWorkspace = ref<Workspace>({
		repositoryUrl: "",
		repositoryBranch: "",
		panels: [],
	});
	const panelIdCounter = ref(0);

	// Constants
	const DROPZONE_WIDTH = 200;
	const MIN_PANEL_WIDTH_PX = 100;
	const FULL_WIDTH_PERCENTAGE = 100;

	// Drag and drop state
	const draggedTab = ref<DraggedTabData | null>(null);
	const leftDropZoneActive = ref(false);
	const rightDropZoneActive = ref(false);
	const containerElement = ref<HTMLElement>();

	// Computed properties
	const panels = computed(() => currentWorkspace.value.panels);

	// Save workspace watcher
	watch(
		[() => settingsStore.isSaveWorkspace, () => currentWorkspace.value.panels],
		([shouldSaveWorkspace]) => {
			if (shouldSaveWorkspace) {
				workspaceStore.saveWorkspace(currentWorkspace.value.panels);
			}
		},
		{ deep: true }
	);

	// Utility functions
	const createNewPanel = (initialFilePath?: string): PanelData => {
		const newPanel = generateNewPanel(panelIdCounter, initialFilePath);
		currentWorkspace.value.panels.push(newPanel);
		redistributePanelSizes(panels.value, FULL_WIDTH_PERCENTAGE);
		return newPanel;
	};

	const closePanel = (panelId: number): void => {
		if (panels.value.length <= 1) return;

		const panelIndex = panels.value.findIndex((p: PanelData) => p.id === panelId);
		if (panelIndex === -1) return;

		const panelToClose = panels.value[panelIndex];

		// If this panel has the active tab, switch to another panel
		if (panelToClose.activeTab?.filePath === props.selectedFilePath) {
			const remainingPanels = panels.value.filter((p: PanelData) => p.id !== panelId);
			const nextActivePanel = remainingPanels[0];
			if (nextActivePanel?.activeTab) {
				emit("update:selectedFilePath", nextActivePanel.activeTab.filePath);
			} else {
				emit("update:selectedFilePath", null);
			}
		}

		// Remove panel and redistribute sizes
		currentWorkspace.value.panels.splice(panelIndex, 1);
		redistributePanelSizes(panels.value, FULL_WIDTH_PERCENTAGE);
	};

	const addFileToPanel = (filePath: string, targetPanelId?: number): void => {
		let targetPanel: PanelData;

		if (targetPanelId) {
			const panel = findPanelById(panels.value, targetPanelId);
			if (!panel) return;
			targetPanel = panel;
		} else {
			// Use first panel or create one if none exists
			if (panels.value.length === 0) {
				targetPanel = createNewPanel();
			} else {
				targetPanel = panels.value[0];
			}
		}

		// Check if tab already exists
		const existingTab = findTabInPanel(targetPanel, filePath);
		if (existingTab) {
			targetPanel.activeTab = existingTab;
		} else {
			// Create new tab
			const newTab = createTab(filePath, targetPanel.id);
			targetPanel.openTabs.push(newTab);
			targetPanel.activeTab = newTab;
		}

		emit("update:selectedFilePath", filePath);
	};

	// Tab management methods
	const handleTabSelected = (filePath: string, panelId: number): void => {
		const panel = findPanelById(panels.value, panelId);
		if (!panel) return;

		const tab = findTabInPanel(panel, filePath);
		if (tab) {
			panel.activeTab = tab;
			emit("update:selectedFilePath", filePath);
		}
	};

	const handleTabClosed = (filePath: string, panelId: number): void => {
		const panel = findPanelById(panels.value, panelId);
		if (!panel) return;

		const tabIndex = getTabIndexInPanel(panel, filePath);
		if (tabIndex === -1) return;

		// Remove the tab
		panel.openTabs.splice(tabIndex, 1);

		// If panel has no tabs left, close it
		if (panel.openTabs.length === 0) {
			closePanel(panelId);
			return;
		}

		// If the closed tab was active, switch to another tab
		if (panel.activeTab?.filePath === filePath) {
			panel.activeTab = panel.openTabs[0] || null;
			emit("update:selectedFilePath", panel.activeTab?.filePath || null);
		}
	};

	// Drag and drop methods
	const handleTabDragStart = (filePath: string, panelId: number): void => {
		const panel = findPanelById(panels.value, panelId);
		const tab = panel ? findTabInPanel(panel, filePath) : null;

		if (tab) {
			draggedTab.value = {
				...tab,
				fromPanelId: panelId,
			};
		}
	};

	const handleTabDragEnd = (): void => {
		draggedTab.value = null;
		leftDropZoneActive.value = false;
		rightDropZoneActive.value = false;
	};

	const handleTabDrop = (targetPanelId: number, insertIndex?: number): void => {
		if (!draggedTab.value) return;

		const { filePath, fromPanelId } = draggedTab.value;

		// Don't allow dropping on the same panel
		if (fromPanelId === targetPanelId) {
			draggedTab.value = null;
			return;
		}

		const sourcePanel = findPanelById(panels.value, fromPanelId);
		const targetPanel = findPanelById(panels.value, targetPanelId);

		if (!sourcePanel || !targetPanel) return;

		// Remove tab from source panel
		const sourceTabIndex = getTabIndexInPanel(sourcePanel, filePath);
		if (sourceTabIndex !== -1) {
			sourcePanel.openTabs.splice(sourceTabIndex, 1);

			// Update active tab in source panel
			if (sourcePanel.activeTab?.filePath === filePath) {
				sourcePanel.activeTab = sourcePanel.openTabs[0] || null;
			}
		}

		// Add tab to target panel
		const newTab = createTab(filePath, targetPanelId);
		if (insertIndex !== undefined && insertIndex >= 0) {
			targetPanel.openTabs.splice(insertIndex, 0, newTab);
		} else {
			targetPanel.openTabs.push(newTab);
		}

		// Make it active in target panel
		targetPanel.activeTab = newTab;
		emit("update:selectedFilePath", filePath);

		// Close source panel if it has no tabs left
		if (sourcePanel.openTabs.length === 0) {
			closePanel(fromPanelId);
		}

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

		const { filePath, fromPanelId } = draggedTab.value;
		const container = event.currentTarget as HTMLElement;
		const containerRect = container.getBoundingClientRect();
		const relativeX = event.clientX - containerRect.left;

		// Determine drop position
		const insertPosition = determineDropPosition(
			relativeX,
			containerRect.width,
			DROPZONE_WIDTH,
			panels.value.length
		);

		if (insertPosition === null) return;

		// Remove tab from source panel
		const sourcePanel = findPanelById(panels.value, fromPanelId);
		if (sourcePanel) {
			const sourceTabIndex = getTabIndexInPanel(sourcePanel, filePath);
			if (sourceTabIndex !== -1) {
				sourcePanel.openTabs.splice(sourceTabIndex, 1);
				if (sourcePanel.activeTab?.filePath === filePath) {
					sourcePanel.activeTab = sourcePanel.openTabs[0] || null;
				}
			}
		}

		// Create new panel
		const newPanel = generateNewPanel(panelIdCounter, filePath);
		currentWorkspace.value.panels.splice(insertPosition, 0, newPanel);
		redistributePanelSizes(panels.value, FULL_WIDTH_PERCENTAGE);

		// Make the moved file active
		emit("update:selectedFilePath", filePath);

		// Close source panel if empty
		if (sourcePanel && sourcePanel.openTabs.length === 0) {
			closePanel(fromPanelId);
		}

		draggedTab.value = null;
	};

	// Panel resizing functionality
	const handlePanelResize = (panelIndex: number, newWidth: number): void => {
		const container = containerElement.value;
		if (!container || panelIndex >= panels.value.length - 1) return;

		const containerWidth = container.getBoundingClientRect().width;
		const currentPanel = panels.value[panelIndex];
		const nextPanel = panels.value[panelIndex + 1];

		if (!currentPanel || !nextPanel) return;

		// Calculate current positions
		let cumulativeWidth = 0;
		for (let i = 0; i <= panelIndex; i++) {
			const panel = panels.value[i];
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
		const clampedNextWidthPx = totalWidthPx - clampedCurrentWidthPx;

		// Update panel sizes
		currentPanel.size = (clampedCurrentWidthPx / containerWidth) * FULL_WIDTH_PERCENTAGE;
		nextPanel.size = (clampedNextWidthPx / containerWidth) * FULL_WIDTH_PERCENTAGE;
	};

	// Workspace initialization
	const initializeWorkspace = (): void => {
		const savedPanels = workspaceStore.getSavedWorkspace;

		// Apply the loaded panels form the store
		if (savedPanels && savedPanels.length > 0) {
			// Restore panels with proper IDs
			currentWorkspace.value.panels = savedPanels.map((panel) => ({
				...panel,
			}));
			redistributePanelSizes(panels.value, FULL_WIDTH_PERCENTAGE);

			// Restore active tab selection
			panels.value.forEach((panel) => {
				panel.openTabs.forEach((tab) => {
					setTimeout(() => {
						emit("update:selectedFilePath", tab.filePath);
					}, 100);
				});
			});
		}
	};

	// Watch for selectedFilePath changes to add files to panels
	watch(
		() => props.selectedFilePath,
		(newFilePath: string | null) => {
			if (!newFilePath) return;

			// Check if file is already open in any panel
			const existingPanel = panels.value.find((panel: PanelData) =>
				panel.openTabs.some((tab) => tab.filePath === newFilePath)
			);

			if (existingPanel) {
				// File is already open, just make it active
				const existingTab = findTabInPanel(existingPanel, newFilePath);
				if (existingTab) {
					existingPanel.activeTab = existingTab;
				}
			} else {
				// File is not open, add it to a panel
				addFileToPanel(newFilePath);
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
