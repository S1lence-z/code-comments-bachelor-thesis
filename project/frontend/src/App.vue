<script setup lang="ts">
import { onMounted } from "vue";
import NavigationBar from "./components/app/AppNavigationBar.vue";
import AppFooter from "./components/app/AppFooter.vue";
import Modal from "./lib/Modal.vue";
import { useRouter, useRoute } from "vue-router";
import { useProjectStore } from "./stores/projectStore.ts";
import SlideoutPanel from "./lib/SlideoutPanel.vue";
import Settings from "./components/app/Settings.vue";
import { useSettingsStore } from "./stores/settingsStore.ts";

// Router
const router = useRouter();
const route = useRoute();

// Stores
const projectStore = useProjectStore();
const settingsStore = useSettingsStore();

onMounted(async () => {
	// Load settings
	settingsStore.loadSettings();

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
		<NavigationBar class="z-10" />
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

	<!-- Settings Slideout Panel -->
	<SlideoutPanel
		title="Settings"
		:isVisible="settingsStore.isSettingsOpen"
		@update:isVisible="settingsStore.toggleSettingsOpen"
	>
		<Settings />
	</SlideoutPanel>

	<!-- Global Testing Modal -->
	<Modal v-if="false">
		<p>Welcome to the Code Review App! Please set up your project to start reviewing code.</p>
		<button class="btn btn-primary" @click="$router.push('/setup')">Get Started</button>
	</Modal>
</template>
