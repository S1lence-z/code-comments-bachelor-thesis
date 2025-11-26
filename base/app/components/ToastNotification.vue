<script setup lang="ts">
import { computed } from "vue";
import type { ToastType } from "../../../shared/types/toast";
import { Icon } from "@iconify/vue";

interface ToastProps {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}

interface ToastEmits {
	(event: "close", id: string): void;
}

const props = defineProps<ToastProps>();
const emit = defineEmits<ToastEmits>();

const icon = computed(() => {
	switch (props.type) {
		case "success":
			return "mdi:check";
		case "error":
			return "mdi:close";
		case "warning":
			return "mdi:alert";
		case "info":
			return "mdi:information";
		default:
			return "mdi:information";
	}
});

const handleClose = () => {
	emit("close", props.id);
};
</script>

<template>
	<div
		class="flex items-start gap-3 p-4 mb-3 rounded-lg shadow-lg backdrop-blur-sm bg-slate-800/95 border border-slate-700 min-w-80 max-w-md animate-in slide-in-from-right duration-300 my-auto"
		:class="`toast-boarder-${props.type}`"
	>
		<!-- Icon -->
		<Icon
			:icon="icon"
			class="flex-shrink-0 w-5 h-5 text-white"
			:class="`toast-bg-${props.type}`"
		/>

		<!-- Message -->
		<div class="flex-1 text-sm text-slate-100">
			{{ message }}
		</div>

		<!-- Close Button -->
		<button
			@click="handleClose"
			class="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
			aria-label="Close notification"
		>
			<Icon icon="mdi:close" class="w-4 h-4" />
		</button>
	</div>
</template>
