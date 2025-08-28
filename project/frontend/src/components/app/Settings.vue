<script setup lang="ts">
import ToggleButton from "../../lib/ToggleButton.vue";
import { useSettingsStore } from "../../stores/settingsStore";

const settingsStore = useSettingsStore();
</script>

<template>
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
	</div>
</template>
