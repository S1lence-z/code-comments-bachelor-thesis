<script setup lang="ts">
import { computed } from "vue";
import { formatBasePath } from "../utils/basePathUtils";

const basePathname = formatBasePath(import.meta.env.VITE_CLIENT_BASE_PATHNAME) || "";

const props = defineProps({
	srcName: {
		type: String,
		required: false,
	},
	size: {
		type: String,
		default: "18px",
	},
	textIcon: {
		type: String,
		default: "",
	},
});

const iconSrc = computed(() => `${basePathname}/assets/${props.srcName}.svg`);
const iconSize = computed(() => `w-[${props.size}] h-[${props.size}]`);
</script>

<template>
	<img v-if="props.srcName" :src="iconSrc" :class="iconSize" :alt="`${props.srcName} icon`" />
	<span v-else-if="props.textIcon">{{ props.textIcon }}</span>
</template>
