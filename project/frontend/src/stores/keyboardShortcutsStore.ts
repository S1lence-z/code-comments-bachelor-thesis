import { defineStore } from "pinia";
import type { AppKeyboardShortcuts, KeyboardShortcut } from "../types/KeyboardShortcuts";
import { appKeyboardShortcutsKey } from "../core/keys";

const defaultKeyBoardShortcuts: AppKeyboardShortcuts = {
	addComment: { binding: "Ctrl-c", actionName: "Add Comment" },
};

export const useKeyboardShortcutsStore = defineStore("keyboardShortcuts", {
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
			const savedData = localStorage.getItem(appKeyboardShortcutsKey.description!);
			if (savedData) {
				try {
					const parsedShortcuts: AppKeyboardShortcuts = JSON.parse(savedData);
					this.applyShortcuts(parsedShortcuts);
				} catch (error) {
					console.error("Failed to parse saved keyboard shortcuts:", error);
					this.applyShortcuts(defaultKeyBoardShortcuts);
				}
			} else {
				this.applyShortcuts(defaultKeyBoardShortcuts);
			}
		},
	},
});
