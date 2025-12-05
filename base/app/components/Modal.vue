<script setup lang="ts">
const emit = defineEmits(["close"]);

const onBackgroundClick = (e: MouseEvent) => {
	if ((e.target as HTMLElement).classList.contains("modal")) {
		emit("close");
	}
};

const onKeydown = (e: KeyboardEvent) => {
	if (e.key === "Escape") {
		emit("close");
	}
};

onMounted(() => {
	window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
	window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
	<div class="modal" @click="onBackgroundClick">
		<slot></slot>
	</div>
</template>
