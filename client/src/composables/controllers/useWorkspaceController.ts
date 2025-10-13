import { ref, watch, computed, nextTick, type Ref } from "vue";
import type { PanelData, Workspace, DraggedTabData } from "../../types/others/Panels";
import { generateNewPanel, findPanelById, redistributePanelSizes } from "../../utils/panelUtils";
import { createTab, findTabInPanel, getTabIndexInPanel } from "../../utils/tabUtils";
import { useSettingsStore } from "../../stores/settingsStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useProjectStore } from "../../stores/projectStore";
import { useFileContentStore } from "../../stores/fileContentStore";
import { useErrorHandler } from "../useErrorHandler";

export interface WorkspaceControllerProps {
	selectedFilePath: Ref<string | null>;
}

export interface WorkspaceControllerEmits {
	(event: "update:selectedFilePath", value: string | null): void;
}

export function useWorkspaceController(props: WorkspaceControllerProps, emit: WorkspaceControllerEmits) {
	// Stores
	const settingsStore = useSettingsStore();
	const workspaceStore = useWorkspaceStore();
	const projectStore = useProjectStore();
	const fileContentStore = useFileContentStore();
	const { handleError } = useErrorHandler();

	// Workspace state
	const currentWorkspace = ref<Workspace>({
		repositoryUrl: "",
		repositoryBranch: "",
		panels: [],
	});
	const panelIdCounter = ref(0);

	// Constants
	const FULL_WIDTH_PERCENTAGE = 100;

	// Computed properties
	const panels = computed(() => currentWorkspace.value.panels);

	// Save workspace watcher
	watch(
		[() => settingsStore.isSaveWorkspace, () => currentWorkspace.value.panels],
		([shouldSaveWorkspace]) => {
			if (shouldSaveWorkspace) {
				workspaceStore.saveWorkspace(currentWorkspace.value);
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
		const panelIndex = panels.value.findIndex((p: PanelData) => p.id === panelId);
		if (panelIndex === -1) return;

		const panelToClose = panels.value[panelIndex];

		// If this panel has the active tab, switch to another panel
		if (panelToClose.activeTab?.filePath === props.selectedFilePath.value) {
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
		// Find the panel
		const panel = findPanelById(panels.value, panelId);
		if (!panel) return;

		// Find the tab index
		const tabIndex = getTabIndexInPanel(panel, filePath);
		if (tabIndex === -1) return;

		// Remove the tab
		panel.openTabs.splice(tabIndex, 1);

		// Current panel still has some tabs
		if (panel.openTabs.length > 0) {
			// If the closed tab was active, set a new active tab
			if (panel.activeTab?.filePath === filePath) {
				panel.activeTab = panel.openTabs[0];
				emit("update:selectedFilePath", panel.activeTab.filePath);
			}
		} else {
			// Panel has no tabs left
			panel.activeTab = null;
			closePanel(panelId);
		}

		// If no panels left, clear selected file path
		if (panels.value.length === 0) {
			emit("update:selectedFilePath", null);
		}
	};

	// Drag and drop methods for tabs
	const handleTabDrop = (targetPanelId: number, draggedTab: DraggedTabData, insertIndex?: number): void => {
		const { filePath, fromPanelId } = draggedTab;

		// Don't allow dropping on the same panel
		if (fromPanelId === targetPanelId) {
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
	};

	// Drop zone methods for creating new panels
	const handleDropZoneDrop = (draggedTab: DraggedTabData, insertPosition: number): void => {
		const { filePath, fromPanelId } = draggedTab;

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
	};

	// Panel resizing functionality
	const handlePanelResize = (currentPanel: PanelData, nextPanel: PanelData, newWidthPercentage: number): void => {
		// Calculate total width of current + next panel
		const totalWidthPercentage = currentPanel.size + nextPanel.size;

		// Clamp the new width to ensure both panels have minimum size
		const minPanelSizePercentage = 10; // 10% minimum
		const clampedCurrentWidthPercentage = Math.max(
			minPanelSizePercentage,
			Math.min(totalWidthPercentage - minPanelSizePercentage, newWidthPercentage)
		);
		const clampedNextWidthPercentage = totalWidthPercentage - clampedCurrentWidthPercentage;

		// Update panel sizes
		currentPanel.size = clampedCurrentWidthPercentage;
		nextPanel.size = clampedNextWidthPercentage;
	};

	// Workspace initialization
	const initializeWorkspace = (): void => {
		// Ensure project info is available
		if (!projectStore.repositoryUrl || !projectStore.repositoryBranch) {
			handleError("Project information not available for workspace initialization");
			return;
		}

		// Load existing workspace or create new one
		const existingWorkspace = workspaceStore.getWorkspaceByRepository(
			projectStore.repositoryUrl,
			projectStore.repositoryBranch
		);

		if (existingWorkspace && existingWorkspace.panels.length > 0) {
			// Load existing workspace
			currentWorkspace.value = { ...existingWorkspace };

			// Update panel ID counter based on existing panels
			panels.value.forEach((panel) => {
				if (panel.id >= panelIdCounter.value) {
					panelIdCounter.value = panel.id + 1;
				}
			});
			redistributePanelSizes(panels.value, FULL_WIDTH_PERCENTAGE);

			// Restore active tab selection
			panels.value.forEach((panel) => {
				panel.openTabs.forEach(async (tab) => {
					await fileContentStore.cacheFileAsync(
						tab.filePath,
						projectStore.repositoryUrl,
						projectStore.repositoryBranch,
						projectStore.githubPat
					);
				});
			});

			// For each panel, add the first panel as the active tab
			panels.value.forEach((panel) => {
				panel.activeTab = panel.openTabs[0];
			});

			nextTick(() => {
				emit("update:selectedFilePath", panels.value[0].activeTab?.filePath || null);
			});
		}

		// Assign project info
		currentWorkspace.value.repositoryUrl = projectStore.repositoryUrl;
		currentWorkspace.value.repositoryBranch = projectStore.repositoryBranch;
	};

	// Watch for selectedFilePath changes to add files to panels
	watch(
		() => props.selectedFilePath.value,
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

		// Methods
		initializeWorkspace,
		closePanel,
		handleTabSelected,
		handleTabClosed,
		handleTabDrop,
		handleDropZoneDrop,
		handlePanelResize,
		addFileToPanel,
	};
}
