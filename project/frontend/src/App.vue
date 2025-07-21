<script setup lang="ts">
import { ref, provide, onMounted } from "vue";
import NavigationBar from "./components/app/AppNavigationBar.vue";
import AppFooter from "./components/app/AppFooter.vue";
import Modal from "./lib/Modal.vue";
import { useRouter, useRoute } from "vue-router";
import { useProjectStore } from "./stores/projectStore.ts";

// State to manage syncedState
const isServerSynced = ref(true);
provide("isServerSynced", isServerSynced);

// Router
const router = useRouter();
const route = useRoute();

// Project Store
const projectStore = useProjectStore();

onMounted(async () => {
	await router
		.isReady()
		.then(() => {
			projectStore.initializeStore(route.query);
		})
		.catch((error) => {
			console.error("Router is not ready:", error);
		});
});
</script>

<template>
	<div class="flex flex-col h-screen overflow-hidden">
		<!-- Navigation Bar -->
		<NavigationBar :isServerSynced="isServerSynced" class="z-10" />
		<!-- Main Content -->
		<main v-if="projectStore.isProjectSetup" class="flex-1 overflow-hidden">
			<router-view />
		</main>
		<!-- Fallback for when project is not set up -->
		<div v-else class="flex flex-1 items-center justify-center">
			<span class="spinner" />
		</div>
		<!-- Footer -->
		<AppFooter />
	</div>

	<!-- Global Testing Modal -->
	<Modal v-if="false">
		<p>Welcome to the Code Review App! Please set up your project to start reviewing code.</p>
		<button class="btn btn-primary" @click="$router.push('/setup')">Get Started</button>
	</Modal>
</template>
