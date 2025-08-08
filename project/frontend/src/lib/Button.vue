<script setup lang="ts">
const props = defineProps<{
	label: string;
	type: string | "button";
	buttonStyle: string | "primary" | "secondary";
	onClick?: () => void;
	disabled?: boolean | false;
}>();
</script>

<template>
	<button
		class="btn"
		:class="`btn-${props.buttonStyle}`"
		:disabled="props.disabled"
		@click="props.onClick ? props.onClick() : null"
	>
		{{ props.label }}
	</button>
</template>
