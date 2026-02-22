<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface ButtonProps {
	label: string;
	buttonStyle: "primary" | "secondary" | "danger";
	buttonSize: "small" | "medium" | "large";
	disabled?: boolean;
	isLoading?: boolean;
}

interface ButtonEmits {
	(event: "click"): void;
}

const props = defineProps<ButtonProps>();
const emit = defineEmits<ButtonEmits>();
</script>

<template>
	<button
		class="btn"
		:class="`btn-${props.buttonStyle} btn-${props.buttonSize}`"
		:disabled="props.disabled || props.isLoading"
		@click="emit('click')"
	>
		<Icon v-if="props.isLoading" icon="mdi:loading" class="animate-spin w-5 h-5" />
		<template v-else>{{ props.label }}</template>
	</button>
</template>
