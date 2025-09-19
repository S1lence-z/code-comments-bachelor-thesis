import { defineStore } from "pinia";
import type { Workspace } from "../types/others/Panels";
import { appSavedWorkspaceKey } from "../core/keys";

export const useWorkspaceStore = defineStore("workspace", {
	state: () => ({
		savedWorkspaces: [] as Workspace[],
	}),
	getters: {
		getAllSavedWorkspaces: (state): Workspace[] => state.savedWorkspaces,
		getWorkspaceByRepository:
			(state) =>
			(repositoryUrl: string, repositoryBranch: string): Workspace | undefined => {
				return state.savedWorkspaces.find(
					(ws) => ws.repositoryUrl === repositoryUrl && ws.repositoryBranch === repositoryBranch
				);
			},
	},
	actions: {
		hasWorkspace(workspace: Workspace): boolean {
			return this.savedWorkspaces.some(
				(ws) =>
					ws.repositoryUrl === workspace.repositoryUrl && ws.repositoryBranch === workspace.repositoryBranch
			);
		},
		existsNonEmptyWorkspace(repositoryUrl: string, repositoryBranch: string): boolean {
			const foundWorkspace = this.savedWorkspaces.find((ws) => {
				ws.repositoryUrl === repositoryUrl && ws.repositoryBranch === repositoryBranch;
			});
			if (!foundWorkspace) return false;
			return foundWorkspace.panels.length === 0 ? false : true;
		},
		applyWorkspaces(workspaces: Workspace[]) {
			this.savedWorkspaces = workspaces;
		},
		saveWorkspace(newWorkspace: Workspace) {
			if (this.hasWorkspace(newWorkspace)) {
				// Update existing workspace
				this.savedWorkspaces = this.savedWorkspaces.map((ws) =>
					ws.repositoryUrl === newWorkspace.repositoryUrl &&
					ws.repositoryBranch === newWorkspace.repositoryBranch
						? newWorkspace
						: ws
				);
			} else {
				// Add new workspace
				this.savedWorkspaces.push(newWorkspace);
			}
			localStorage.setItem(appSavedWorkspaceKey.description!, JSON.stringify(this.savedWorkspaces));
		},
		loadWorkspace(): Workspace[] {
			const savedData = localStorage.getItem(appSavedWorkspaceKey.description!);

			if (savedData) {
				try {
					const parsedWorkspace: Workspace[] = JSON.parse(savedData);
					this.applyWorkspaces(parsedWorkspace);
					return parsedWorkspace;
				} catch (error) {
					console.error("Failed to parse workspace data:", error);
					return [];
				}
			} else {
				console.warn("No saved workspaces found.");
				return [];
			}
		},
	},
});
