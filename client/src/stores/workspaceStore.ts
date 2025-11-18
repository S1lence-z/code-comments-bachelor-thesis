import { defineStore } from "pinia";
import type { Workspace, PanelData, TabData, DraggedTabData } from "../types/domain/Panels";
import { appSavedWorkspaceKey } from "../core/keys";
import { useErrorHandler } from "../composables/useErrorHandler";
import { useProjectStore } from "./projectStore";
import { useFileContentStore } from "./fileContentStore";
import { useSettingsStore } from "./settingsStore";

export const useWorkspaceStore = defineStore("workspaceStore", {
	state: () => ({
		savedWorkspaces: [] as Workspace[],
		currentWorkspace: null as Workspace | null,
		panelIdCounter: 0,
		fullWidthPercentage: 100,
		minPanelSizePercentage: 10,
	}),
	getters: {
		getCurrentWorkspace: (state): Workspace | null => state.currentWorkspace,
		getAllSavedWorkspaces: (state): Workspace[] => state.savedWorkspaces,
		panels: (state): PanelData[] => state.currentWorkspace?.panels || [],
		getWorkspaceByRepository:
			(state) =>
			(repositoryUrl: string, repositoryBranch: string): Workspace | undefined => {
				return state.savedWorkspaces.find(
					(ws) => ws.repositoryUrl === repositoryUrl && ws.repositoryBranch === repositoryBranch
				);
			},
	},
	actions: {
		// Workspace Initialization
		async initializeWorkspace(repositoryUrl: string, repositoryBranch: string): Promise<string | null> {
			const { handleError } = useErrorHandler();
			const fileContentStore = useFileContentStore();

			// Ensure project info is available
			if (!repositoryUrl || !repositoryBranch) {
				handleError("Project information not available for workspace initialization");
				return null;
			}

			// Load existing workspace or create new one
			const existingWorkspace = this.getWorkspaceByRepository(repositoryUrl, repositoryBranch);

			if (existingWorkspace && existingWorkspace.panels.length > 0) {
				// Load existing workspace
				this.currentWorkspace = { ...existingWorkspace };

				// Update panel ID counter based on existing panels
				this.currentWorkspace.panels.forEach((panel) => {
					if (panel.id >= this.panelIdCounter) {
						this.panelIdCounter = panel.id + 1;
					}
				});
				this.redistributePanelSizes();

				// Get GitHub PAT from project store
				const projectStore = useProjectStore();

				// Restore active tab selection - cache all files
				for (const panel of this.currentWorkspace.panels) {
					for (const tab of panel.openTabs) {
						await fileContentStore.cacheFileAsync(
							tab.filePath,
							repositoryUrl,
							repositoryBranch,
							projectStore.getRepoAuthToken()
						);
					}
				}

				// Set active tabs for each panel
				this.currentWorkspace.panels.forEach((panel) => {
					panel.activeTab = panel.openTabs[0];
				});

				// Return the first active tab's file path
				return this.currentWorkspace.panels[0].activeTab?.filePath || null;
			} else {
				// Create new workspace
				this.currentWorkspace = {
					repositoryUrl,
					repositoryBranch,
					panels: [],
				};
				this.saveCurrentWorkspace();
				return null;
			}
		},

		// Persistence Actions
		hasWorkspace(workspace: Workspace): boolean {
			return this.savedWorkspaces.some(
				(ws) =>
					ws.repositoryUrl === workspace.repositoryUrl && ws.repositoryBranch === workspace.repositoryBranch
			);
		},
		applyWorkspaces(workspaces: Workspace[]) {
			this.savedWorkspaces = workspaces;
		},
		saveCurrentWorkspace() {
			if (!this.currentWorkspace) return;

			const settingsStore = useSettingsStore();
			if (!settingsStore.isSaveWorkspace) return;

			if (this.hasWorkspace(this.currentWorkspace)) {
				// Update existing workspace
				this.savedWorkspaces = this.savedWorkspaces.map((ws) =>
					ws.repositoryUrl === this.currentWorkspace!.repositoryUrl &&
					ws.repositoryBranch === this.currentWorkspace!.repositoryBranch
						? { ...this.currentWorkspace! }
						: ws
				);
			} else {
				// Add new workspace
				this.savedWorkspaces.push({ ...this.currentWorkspace });
			}
			localStorage.setItem(appSavedWorkspaceKey.description!, JSON.stringify(this.savedWorkspaces));
		},
		loadWorkspacesFromStorage(): Workspace[] {
			const errorHandler = useErrorHandler();
			const savedData = localStorage.getItem(appSavedWorkspaceKey.description!);
			if (savedData) {
				try {
					const parsedWorkspace: Workspace[] = JSON.parse(savedData);
					this.applyWorkspaces(parsedWorkspace);
					return parsedWorkspace;
				} catch (error) {
					errorHandler.handleError(error, {
						customMessage: "Failed to parse workspace data.",
					});
					return [];
				}
			} else {
				return [];
			}
		},

		// Panel Management Actions
		generatePanelId(): number {
			return ++this.panelIdCounter;
		},

		createPanel(initialFilePath?: string): PanelData {
			if (!this.currentWorkspace) {
				throw new Error("Cannot create panel: no current workspace");
			}

			// Get new panel id and create panel data
			const newPanelId = this.generatePanelId();
			const newTabData: TabData = {
				filePath: initialFilePath || "",
				panelId: newPanelId,
			};

			// Create new panel
			const newPanel: PanelData = {
				id: newPanelId,
				openTabs: initialFilePath ? [newTabData] : [],
				activeTab: initialFilePath ? newTabData : null,
				size: 50,
			};

			// Add panel to current workspace and redistribute sizes
			this.currentWorkspace.panels.push(newPanel);
			this.redistributePanelSizes();
			this.saveCurrentWorkspace();
			return newPanel;
		},

		closePanel(panelId: number): { shouldClearSelection: boolean; newSelectedFilePath: string | null } {
			if (!this.currentWorkspace) {
				return { shouldClearSelection: false, newSelectedFilePath: null };
			}

			// Find the panel index
			const panelIndex = this.currentWorkspace.panels.findIndex((p: PanelData) => p.id === panelId);
			if (panelIndex === -1) {
				return { shouldClearSelection: false, newSelectedFilePath: null };
			}

			// Get the panel to close
			const panelToClose = this.currentWorkspace.panels[panelIndex];
			let newSelectedFilePath: string | null = null;

			// If this panel has an active tab, we might need to switch to another panel
			if (panelToClose.activeTab) {
				const remainingPanels = this.currentWorkspace.panels.filter((p: PanelData) => p.id !== panelId);
				const nextActivePanel = remainingPanels[0];
				if (nextActivePanel?.activeTab) {
					newSelectedFilePath = nextActivePanel.activeTab.filePath;
				}
			}

			// Remove panel and redistribute sizes
			this.currentWorkspace.panels.splice(panelIndex, 1);
			this.redistributePanelSizes();
			this.saveCurrentWorkspace();

			return {
				shouldClearSelection: this.currentWorkspace.panels.length === 0,
				newSelectedFilePath,
			};
		},

		redistributePanelSizes(): void {
			if (!this.currentWorkspace) return;

			if (this.currentWorkspace.panels.length > 0) {
				const equalSize = this.fullWidthPercentage / this.currentWorkspace.panels.length;
				this.currentWorkspace.panels.forEach((panel: PanelData) => {
					panel.size = equalSize;
				});
			}
		},

		resizePanel(currentPanel: PanelData, nextPanel: PanelData, newWidthPercentage: number): void {
			// Calculate total width of current + next panel
			const totalWidthPercentage = currentPanel.size + nextPanel.size;

			// Clamp the new width to ensure both panels have minimum size
			const clampedCurrentWidthPercentage = Math.max(
				this.minPanelSizePercentage,
				Math.min(totalWidthPercentage - this.minPanelSizePercentage, newWidthPercentage)
			);
			const clampedNextWidthPercentage = totalWidthPercentage - clampedCurrentWidthPercentage;

			// Update panel sizes
			currentPanel.size = clampedCurrentWidthPercentage;
			nextPanel.size = clampedNextWidthPercentage;
			this.saveCurrentWorkspace();
		},

		// Tab Management Actions
		findPanelById(panelId: number): PanelData | undefined {
			if (!this.currentWorkspace) return undefined;
			return this.currentWorkspace.panels.find((p: PanelData) => p.id === panelId);
		},

		findTabInPanel(panel: PanelData, filePath: string): TabData | undefined {
			return panel.openTabs.find((tab) => tab.filePath === filePath);
		},

		getTabIndexInPanel(panel: PanelData, filePath: string): number {
			return panel.openTabs.findIndex((tab) => tab.filePath === filePath);
		},

		addTabToPanel(filePath: string, targetPanelId?: number): string {
			if (!this.currentWorkspace) {
				throw new Error("Cannot add tab: no current workspace");
			}

			let targetPanel: PanelData;

			if (targetPanelId) {
				const panel = this.findPanelById(targetPanelId);
				if (!panel) return filePath;
				targetPanel = panel;
			} else {
				// Use first panel or create one if none exists
				if (this.currentWorkspace.panels.length === 0) {
					targetPanel = this.createPanel();
				} else {
					targetPanel = this.currentWorkspace.panels[0];
				}
			}

			// Check if tab already exists
			const existingTab = this.findTabInPanel(targetPanel, filePath);
			if (existingTab) {
				targetPanel.activeTab = existingTab;
			} else {
				// Create new tab
				const newTab: TabData = {
					filePath,
					panelId: targetPanel.id,
				};
				targetPanel.openTabs.push(newTab);
				targetPanel.activeTab = newTab;
			}

			this.saveCurrentWorkspace();
			return filePath;
		},

		selectTab(filePath: string, panelId: number): string {
			const panel = this.findPanelById(panelId);
			if (!panel) return filePath;

			const tab = this.findTabInPanel(panel, filePath);
			if (tab) {
				panel.activeTab = tab;
				this.saveCurrentWorkspace();
				return filePath;
			}
			return filePath;
		},

		closeTab(
			filePath: string,
			panelId: number
		): { shouldClearSelection: boolean; newSelectedFilePath: string | null } {
			if (!this.currentWorkspace) {
				return { shouldClearSelection: false, newSelectedFilePath: null };
			}

			// Find the panel
			const panel = this.findPanelById(panelId);
			if (!panel) {
				return { shouldClearSelection: false, newSelectedFilePath: null };
			}

			// Find the tab index
			const tabIndex = this.getTabIndexInPanel(panel, filePath);
			if (tabIndex === -1) {
				return { shouldClearSelection: false, newSelectedFilePath: null };
			}

			// Remove the tab
			panel.openTabs.splice(tabIndex, 1);

			let newSelectedFilePath: string | null = null;

			// Current panel still has some tabs
			if (panel.openTabs.length > 0) {
				// If the closed tab was active, set a new active tab
				if (panel.activeTab?.filePath === filePath) {
					panel.activeTab = panel.openTabs[0];
					newSelectedFilePath = panel.activeTab.filePath;
				}
			} else {
				// Panel has no tabs left
				panel.activeTab = null;
				const closeResult = this.closePanel(panelId);
				newSelectedFilePath = closeResult.newSelectedFilePath;
			}

			this.saveCurrentWorkspace();

			// If no panels left, clear selected file path
			return {
				shouldClearSelection: this.currentWorkspace.panels.length === 0,
				newSelectedFilePath,
			};
		},

		// Drag & Drop Actions
		moveTabBetweenPanels(targetPanelId: number, draggedTab: DraggedTabData, insertIndex?: number): string {
			if (!this.currentWorkspace) {
				throw new Error("Cannot move tab: no current workspace");
			}

			const { filePath, fromPanelId } = draggedTab;

			// Don't allow dropping on the same panel
			if (fromPanelId === targetPanelId) {
				return filePath;
			}

			const sourcePanel = this.findPanelById(fromPanelId);
			const targetPanel = this.findPanelById(targetPanelId);

			if (!sourcePanel || !targetPanel) return filePath;

			// Remove tab from source panel
			const sourceTabIndex = this.getTabIndexInPanel(sourcePanel, filePath);
			if (sourceTabIndex !== -1) {
				sourcePanel.openTabs.splice(sourceTabIndex, 1);

				// Update active tab in source panel
				if (sourcePanel.activeTab?.filePath === filePath) {
					sourcePanel.activeTab = sourcePanel.openTabs[0] || null;
				}
			}

			// Add tab to target panel
			const newTab: TabData = {
				filePath,
				panelId: targetPanelId,
			};
			if (insertIndex !== undefined && insertIndex >= 0) {
				targetPanel.openTabs.splice(insertIndex, 0, newTab);
			} else {
				targetPanel.openTabs.push(newTab);
			}

			// Make it active in target panel
			targetPanel.activeTab = newTab;

			// Close source panel if it has no tabs left
			if (sourcePanel.openTabs.length === 0) {
				this.closePanel(fromPanelId);
			}

			this.saveCurrentWorkspace();
			return filePath;
		},

		moveTabToNewPanel(draggedTab: DraggedTabData, insertPosition: number): string {
			if (!this.currentWorkspace) {
				throw new Error("Cannot move tab: no current workspace");
			}

			const { filePath, fromPanelId } = draggedTab;

			// Remove tab from source panel
			const sourcePanel = this.findPanelById(fromPanelId);
			if (sourcePanel) {
				const sourceTabIndex = this.getTabIndexInPanel(sourcePanel, filePath);
				if (sourceTabIndex !== -1) {
					sourcePanel.openTabs.splice(sourceTabIndex, 1);
					if (sourcePanel.activeTab?.filePath === filePath) {
						sourcePanel.activeTab = sourcePanel.openTabs[0] || null;
					}
				}
			}

			// Create new panel
			const newPanelId = this.generatePanelId();
			const newTabData: TabData = {
				filePath: filePath,
				panelId: newPanelId,
			};

			const newPanel: PanelData = {
				id: newPanelId,
				openTabs: [newTabData],
				activeTab: newTabData,
				size: 50,
			};

			this.currentWorkspace.panels.splice(insertPosition, 0, newPanel);
			this.redistributePanelSizes();

			// Close source panel if empty
			if (sourcePanel && sourcePanel.openTabs.length === 0) {
				this.closePanel(fromPanelId);
			}

			this.saveCurrentWorkspace();
			return filePath;
		},

		// Utility Actions
		isFileOpenInAnyPanel(filePath: string): boolean {
			if (!this.currentWorkspace) return false;
			return this.currentWorkspace.panels.some((panel: PanelData) =>
				panel.openTabs.some((tab) => tab.filePath === filePath)
			);
		},

		findPanelWithFile(filePath: string): PanelData | undefined {
			if (!this.currentWorkspace) return undefined;
			return this.currentWorkspace.panels.find((panel: PanelData) =>
				panel.openTabs.some((tab) => tab.filePath === filePath)
			);
		},

		setActiveTabByFilePath(filePath: string): void {
			const panel = this.findPanelWithFile(filePath);
			if (panel) {
				const tab = this.findTabInPanel(panel, filePath);
				if (tab) {
					panel.activeTab = tab;
					this.saveCurrentWorkspace();
				}
			}
		},
	},
});
