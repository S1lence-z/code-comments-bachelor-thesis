import { defineStore } from "pinia";
import type { Workspace } from "../types/domain/Panels";
import { appSavedWorkspaceKey } from "../core/keys";
import { useErrorHandler } from "../composables/useErrorHandler";

export const useWorkspaceStore = defineStore("workspaceStore", {
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
	},
});
