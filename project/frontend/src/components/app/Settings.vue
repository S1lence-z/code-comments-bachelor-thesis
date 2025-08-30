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
		<div class="flex items-center">
			<ToggleButton
				label="Show Sidebar"
				:isActive="settingsStore.sidebarOpenState"
				@update:isActive="settingsStore.toggleSidebarOpen"
			/>
		</div>
		<!-- Toggle Button for Keyboard Mode -->
		<div class="flex items-center">
			<ToggleButton
				label="Keyboard Mode"
				:isActive="settingsStore.keyboardModeOnState"
				@update:isActive="settingsStore.toggleKeyboardMode"
			/>
		</div>
		<!-- Save workspace to session storage -->
		<div class="flex items-center">
			<ToggleButton
				label="Save Workspace"
				:isActive="settingsStore.saveWorkspaceState"
				@update:isActive="settingsStore.toggleSaveWorkspace"
			/>
		</div>
		<!-- Toggle Button for Compact Comment Mode -->
		<div class="flex items-center">
			<ToggleButton
				label="Compact Comment Widget"
				:isActive="settingsStore.compactCommentWidgetState"
				@update:isActive="settingsStore.toggleCompactCommentWidget"
			/>
		</div>
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
