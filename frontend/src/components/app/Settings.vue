<script setup lang="ts">
import Button from "../../lib/Button.vue";
import ToggleButton from "../../lib/ToggleButton.vue";
import { useSettingsStore } from "../../stores/settingsStore";

const settingsStore = useSettingsStore();
</script>

<template>
	<!-- Toggle Buttons -->
	<div class="flex flex-col justify-start space-y-6">
		<!-- Toggle Button for Sidebar -->
		<ToggleButton
			label="Show Sidebar"
			:isActive="settingsStore.sidebarOpenState"
			@update:isActive="settingsStore.toggleSidebarOpen"
		/>
		<!-- Toggle Button for Keyboard Mode -->
		<ToggleButton
			label="Keyboard Mode"
			:isActive="settingsStore.keyboardModeOnState"
			@update:isActive="settingsStore.toggleKeyboardMode"
		/>
		<!-- Save workspace to session storage -->
		<ToggleButton
			label="Save Workspace"
			:isActive="settingsStore.saveWorkspaceState"
			@update:isActive="settingsStore.toggleSaveWorkspace"
		/>
		<!-- Toggle Button for Compact Comment Mode -->
		<ToggleButton
			label="Compact Comment Widget"
			:isActive="settingsStore.compactCommentWidgetState"
			@update:isActive="settingsStore.toggleCompactCommentWidget"
		/>
		<!-- Button for Toggling Offline Mode -->
		<ToggleButton
			label="Offline Mode"
			:isActive="settingsStore.offlineModeState"
			@update:isActive="settingsStore.toggleOfflineMode"
		/>
		<!-- Divider -->
		<div class="border-t border-gray-200 w-full"></div>
		<!-- Button for Editing Keyboard Shortcuts -->
		<Button
			label="Edit Keyboard Shortcuts"
			type="button"
			buttonStyle="primary"
			:onClick="settingsStore.toggleKeyboardShortcutsEditor"
		/>
	</div>
</template>
