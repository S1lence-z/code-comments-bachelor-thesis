<script setup lang="ts">
interface ButtonProps {
	label: string;
	buttonStyle: "primary" | "secondary";
	buttonSize: "small" | "medium" | "large";
	disabled?: boolean;
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
		:disabled="props.disabled"
		@click="emit('click')"
	>
		{{ props.label }}
	</button>
</template>
