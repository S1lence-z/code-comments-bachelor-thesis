import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settingsStore", {
	state: () => ({
		settingsOpenState: false,
		keyboardModeOnState: false,
		sidebarOpenState: true,
		saveWorkspaceState: false,
	}),
	getters: {
		isSettingsOpen: (state) => state.settingsOpenState,
		isKeyboardMode: (state) => state.keyboardModeOnState,
		isSidebarOpen: (state) => state.sidebarOpenState,
		isSaveWorkspace: (state) => state.saveWorkspaceState,
	},
	actions: {
		toggleSettingsOpen() {
			this.settingsOpenState = !this.settingsOpenState;
		},
		toggleKeyboardMode() {
			this.keyboardModeOnState = !this.keyboardModeOnState;
		},
		toggleSidebarOpen() {
			this.sidebarOpenState = !this.sidebarOpenState;
		},
		toggleSaveWorkspace() {
			this.saveWorkspaceState = !this.saveWorkspaceState;
		},
	},
});
