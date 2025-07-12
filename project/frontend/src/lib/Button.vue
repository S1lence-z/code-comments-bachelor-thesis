<script setup lang="ts">
const props = defineProps<{
	label: string;
	type: string | "button";
	buttonStyle: string | "primary" | "secondary";
	onclick?: () => void;
	disabled: boolean | false;
}>();
</script>

<template>
	<button class="btn" :class="`btn-${props.buttonStyle}`" :disabled="props.disabled" @click="props.onclick">
		{{ props.label }}
	</button>
</template>
