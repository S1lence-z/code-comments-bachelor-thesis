<script setup lang="ts">
import { inject, ref } from "vue";
import ToggleButton from "../lib/ToggleButton.vue";

const keyboardModeContext = inject("keyboardModeContext", {
	isKeyboardMode: ref(false),
	updateKeyboardModeState: (_: boolean) => console.warn("updateKeyboardModeState not provided"),
});
</script>

<template>
	<div class="flex items-center justify-center space-x-6 p-2">
		<!-- Toggle Button for Keyboard Mode -->
		<div class="flex items-center">
			<ToggleButton
				label="Keyboard Mode"
				:isActive="keyboardModeContext.isKeyboardMode.value"
				@update:isActive="keyboardModeContext.updateKeyboardModeState($event)"
			/>
		</div>
	</div>
</template>
