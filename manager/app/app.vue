<script setup lang="ts">
import { useAuthStore } from "../../base/app/stores/authStore";

const authStore = useAuthStore();
const isAppReady = ref(false);

onMounted(() => {
	authStore.loadAuthToken();
	isAppReady.value = true;
});
</script>

<template>
	<div v-if="isAppReady" class="flex flex-col h-screen overflow-hidden">
		<!-- Navigation Bar -->
		<AppNavigationBar class="z-10" />

		<!-- Main Content -->
		<main class="flex-1 overflow-hidden">
			<NuxtPage />
		</main>

		<ToastContainer />
	</div>
</template>
