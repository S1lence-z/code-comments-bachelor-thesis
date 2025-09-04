import { defineStore } from "pinia";
import type { PanelData } from "../types/Panels";
import { appSavedWorkspaceKey } from "../core/keys";

export const useWorkspaceStore = defineStore("workspace", {
	state: () => ({
		savedWorkspace: [] as PanelData[],
	}),
	getters: {
		getSavedWorkspace: (state): PanelData[] => state.savedWorkspace,
	},
	actions: {
		applyWorkspace(workspace: PanelData[]) {
			this.savedWorkspace = workspace;
		},
		saveWorkspace(newWorkspace: PanelData[]) {
			localStorage.setItem(appSavedWorkspaceKey.description!, JSON.stringify(newWorkspace));
		},
		loadWorkspace(): PanelData[] {
			const savedData = localStorage.getItem(appSavedWorkspaceKey.description!);

			if (savedData) {
				try {
					const parsedWorkspace: PanelData[] = JSON.parse(savedData);
					this.applyWorkspace(parsedWorkspace);
					return parsedWorkspace;
				} catch (error) {
					console.error("Failed to parse workspace data:", error);
					return [];
				}
			} else {
				console.warn("No saved workspace found.");
				return [];
			}
		},
	},
});
