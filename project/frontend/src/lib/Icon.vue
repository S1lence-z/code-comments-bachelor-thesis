<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
	name: {
		type: String,
		required: true,
	},
	size: {
		type: String,
		default: "18px",
	},
});

const iconSrc = computed(() => `/${props.name}.svg`);
const iconSize = computed(() => `w-[${props.size}] h-[${props.size}]`);
</script>

<template>
	<img :src="iconSrc" :class="iconSize" :alt="`${name} icon`" />
</template>
