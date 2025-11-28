<script setup lang="ts">
import { computed } from "vue";
import ToastNotification from "./ToastNotification.vue";
import { useToastStore } from "../stores/toastStore";

const toastStore = useToastStore();

const toasts = computed(() => toastStore.toasts);

const handleClose = (id: string) => {
	toastStore.removeToast(id);
};
</script>

<template>
	<div class="toast-container fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
		<TransitionGroup
			enter-active-class="transition-all duration-300 ease-out"
			leave-active-class="transition-all duration-300 ease-in"
			enter-from-class="translate-x-full opacity-0"
			leave-to-class="translate-x-full opacity-0"
			move-class="transition-transform duration-300"
		>
			<div v-for="toast in toasts" :key="toast.id" class="pointer-events-auto">
				<ToastNotification
					:id="toast.id"
					:message="toast.message"
					:type="toast.type"
					:duration="toast.duration"
					@close="handleClose"
				/>
			</div>
		</TransitionGroup>
	</div>
</template>
