import { defineStore } from "pinia";
import type AppSettings from "../types/others/AppSettings";
import { appSettingsKey } from "../core/keys";
import router from "../core/router";

export const useSettingsStore = defineStore("settingsStore", {
	state: () => ({
		settingsOpenState: false,
		keyboardModeOnState: false,
		sidebarOpenState: true,
		saveWorkspaceState: false,
		compactCommentWidgetState: true,
		keyboardShortcutsEditorState: false,
		offlineModeState: false,
	}),
	getters: {
		isSettingsOpen: (state) => state.settingsOpenState,
		isKeyboardMode: (state) => state.keyboardModeOnState,
		isSidebarOpen: (state) => state.sidebarOpenState,
		isSaveWorkspace: (state) => state.saveWorkspaceState,
		isCompactCommentWidget: (state) => state.compactCommentWidgetState,
		isEditingKeyboardShortcuts: (state) => state.keyboardShortcutsEditorState,
		isOfflineMode: (state) => state.offlineModeState,
	},
	actions: {
		toggleSettingsOpen() {
			this.settingsOpenState = !this.settingsOpenState;
		},
		toggleKeyboardMode() {
			this.keyboardModeOnState = !this.keyboardModeOnState;
			this.saveSettings();
		},
		toggleSidebarOpen() {
			this.sidebarOpenState = !this.sidebarOpenState;
			this.saveSettings();
		},
		toggleSaveWorkspace() {
			this.saveWorkspaceState = !this.saveWorkspaceState;
			this.saveSettings();
		},
		toggleCompactCommentWidget() {
			this.compactCommentWidgetState = !this.compactCommentWidgetState;
			this.saveSettings();
		},
		toggleKeyboardShortcutsEditor() {
			this.keyboardShortcutsEditorState = !this.keyboardShortcutsEditorState;
			this.saveSettings();
		},
		toggleOfflineMode(newState?: boolean) {
			this.offlineModeState = newState !== undefined ? newState : !this.offlineModeState;
			this.saveSettings();
			if (!this.offlineModeState && confirm("Switching to offline mode will reload the application. Continue?")) {
				router.push({ name: "Home" });
			}
		},
		getPersistentSettings(): AppSettings {
			return {
				keyboardModeOnState: this.keyboardModeOnState,
				sidebarOpenState: this.sidebarOpenState,
				saveWorkspaceState: this.saveWorkspaceState,
				compactCommentWidgetState: this.compactCommentWidgetState,
			};
		},
		applySettings(newSettings: AppSettings) {
			const { keyboardModeOnState, sidebarOpenState, saveWorkspaceState, compactCommentWidgetState } =
				newSettings;

			this.keyboardModeOnState = keyboardModeOnState;
			this.sidebarOpenState = sidebarOpenState;
			this.saveWorkspaceState = saveWorkspaceState;
			this.compactCommentWidgetState = compactCommentWidgetState;
		},
		saveSettings() {
			const persistentSettings = this.getPersistentSettings();
			const settings = JSON.stringify(persistentSettings);
			localStorage.setItem(appSettingsKey.description!, settings);
		},
		loadSettings() {
			const savedSettingsString = localStorage.getItem(appSettingsKey.description!);
			if (savedSettingsString) {
				try {
					const parsedSettings: AppSettings = JSON.parse(savedSettingsString);
					this.applySettings(parsedSettings);
				} catch (error) {
					console.error("Failed to parse saved settings:", error);
				}
			}
		},
	},
});
