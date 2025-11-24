import { defineStore } from "pinia";
import type { AppKeyboardShortcuts, KeyboardShortcut } from "../types/domain/keyboard-shortcuts";
import { appKeyboardShortcutsKey } from "../core/keys";
import { useErrorHandler } from "../composables/useErrorHandler";

const defaultKeyBoardShortcuts: AppKeyboardShortcuts = {
	addComment: { binding: "Ctrl-c", actionName: "Add Comment" },
};

export const useKeyboardShortcutsStore = defineStore("keyboardShortcutsStore", {
	state: () => ({
		shortcuts: defaultKeyBoardShortcuts,
	}),
	getters: {
		getShortcuts: (state): AppKeyboardShortcuts => state.shortcuts,
		getDefaultShortcuts: (): AppKeyboardShortcuts => defaultKeyBoardShortcuts,
	},
	actions: {
		updateShortcut(shortcut: KeyboardShortcut) {
			Object.values(this.shortcuts).forEach((kbs) => {
				if (kbs.actionName === shortcut.actionName) {
					kbs.binding = shortcut.binding;
					this.saveShortcuts();
				}
			});
		},
		getPersistentShortcuts() {
			return this.shortcuts;
		},
		applyShortcuts(shortcuts: AppKeyboardShortcuts) {
			this.shortcuts = shortcuts;
		},
		saveShortcuts() {
			localStorage.setItem(appKeyboardShortcutsKey.description!, JSON.stringify(this.getPersistentShortcuts()));
		},
		loadShortcuts() {
			const errorHandler = useErrorHandler();
			const savedData = localStorage.getItem(appKeyboardShortcutsKey.description!);
			if (savedData) {
				try {
					const parsedShortcuts: AppKeyboardShortcuts = JSON.parse(savedData);
					this.applyShortcuts(parsedShortcuts);
				} catch (error) {
					errorHandler.handleError(error, {
						customMessage: "Failed to parse saved keyboard shortcuts.",
					});
					this.applyShortcuts(defaultKeyBoardShortcuts);
				}
			} else {
				this.applyShortcuts(defaultKeyBoardShortcuts);
			}
		},
	},
});
