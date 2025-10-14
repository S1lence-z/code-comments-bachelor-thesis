import { defineStore } from "pinia";
import { commentBrowserStateKey } from "../core/keys";
import { useErrorHandler } from "../composables/useErrorHandler";

export const useCommentBrowserStore = defineStore("commentBrowserStore", {
	state: () => ({
		openedFiles: new Set<string>(),
	}),
	getters: {
		isFileOpened: (state) => (filePath: string) => state.openedFiles.has(filePath),
	},
	actions: {
		toggleFile(filePath: string) {
			if (this.openedFiles.has(filePath)) {
				this.openedFiles.delete(filePath);
			} else {
				this.openedFiles.add(filePath);
			}
			this.saveState();
		},
		saveState() {
			const stateToSave = {
				openedFiles: Array.from(this.openedFiles),
			};
			sessionStorage.setItem(commentBrowserStateKey.description!, JSON.stringify(stateToSave));
		},
		loadState() {
			const errorHandler = useErrorHandler();
			const savedState = sessionStorage.getItem(commentBrowserStateKey.description!);
			if (savedState) {
				try {
					const parsedState: { openedFiles: string[] } = JSON.parse(savedState);
					this.openedFiles = new Set(parsedState.openedFiles || []);
				} catch (error) {
					errorHandler.handleError(error, {
						customMessage: "Failed to load comment browser state.",
					});
				}
			}
		},
	},
});
