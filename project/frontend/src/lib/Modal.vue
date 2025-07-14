<script setup lang="ts">
import { defineEmits } from "vue";

const emit = defineEmits(["close"]);

function onBackgroundClick(e: MouseEvent) {
	if ((e.target as HTMLElement).classList.contains("modal")) {
		emit("close");
	}
}
</script>

<template>
	<div class="modal" @click="onBackgroundClick">
		<div class="modal-content">
			<slot></slot>
		</div>
	</div>
</template>
