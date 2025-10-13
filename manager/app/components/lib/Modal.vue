<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const emit = defineEmits(["close"]);

function onBackgroundClick(e: MouseEvent) {
	if ((e.target as HTMLElement).classList.contains("modal")) {
		emit("close");
	}
}

function onKeydown(e: KeyboardEvent) {
	if (e.key === "Escape") {
		emit("close");
	}
}

onMounted(() => {
	window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
	window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
	<div class="modal" @click="onBackgroundClick">
		<div class="modal-content">
			<slot></slot>
		</div>
	</div>
</template>
