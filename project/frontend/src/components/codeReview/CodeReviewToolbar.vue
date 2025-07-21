<script setup lang="ts">
import { inject, ref } from "vue";
import ToggleButton from "../../lib/ToggleButton.vue";
import { keyboardModeContextKey } from "../../core/keys";

interface ToolbarProps {
	showSideBar: boolean;
}

withDefaults(defineProps<ToolbarProps>(), {
	showSideBar: true,
});

const emit = defineEmits<{
	(event: "update:showSideBar", value: boolean): void;
}>();

const keyboardModeContext = inject(keyboardModeContextKey, {
	isKeyboardMode: ref(false),
	updateKeyboardModeState: (_: boolean) => console.warn("updateKeyboardModeState not provided"),
});
</script>

<template>
	<div class="flex items-center justify-center space-x-6 p-2">
		<!-- Toggle Button for Sidebar -->
		<div class="flex items-center">
			<ToggleButton
				label="Show Sidebar"
				:isActive="showSideBar"
				@update:isActive="emit('update:showSideBar', $event)"
			/>
		</div>
		<!-- Toggle Button for Keyboard Mode -->
		<div class="flex items-center">
			<ToggleButton
				label="Keyboard Mode"
				:isActive="keyboardModeContext.isKeyboardMode.value"
				@update:isActive="keyboardModeContext.updateKeyboardModeState($event)"
			/>
		</div>
		<!-- Save workspace to session storage -->
		<div class="flex items-center">
			<ToggleButton
				label="Save Workspace"
				:isActive="false"
				@update:isActive="() => console.warn('Save Workspace functionality not implemented')"
			/>
		</div>
	</div>
</template>
