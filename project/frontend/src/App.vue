<script setup lang="ts">
import { onMounted } from "vue";
import NavigationBar from "./components/app/AppNavigationBar.vue";
import Modal from "./lib/Modal.vue";
import { useRouter, useRoute } from "vue-router";
import { useProjectStore } from "./stores/projectStore.ts";
import SlideoutPanel from "./lib/SlideoutPanel.vue";
import Settings from "./components/app/Settings.vue";
import { useSettingsStore } from "./stores/settingsStore.ts";
import { useKeyboardShortcutsStore } from "./stores/keyboardShortcutsStore.ts";
import KeyboardShortcutsEditor from "./components/app/KeyboardShortcutsEditor.vue";

// Router
const router = useRouter();
const route = useRoute();

// Stores
const projectStore = useProjectStore();
const settingsStore = useSettingsStore();
const keyboardShortcutsStore = useKeyboardShortcutsStore();

onMounted(async () => {
	// Load settings
	settingsStore.loadSettings();
	keyboardShortcutsStore.loadShortcuts();

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
	</div>

	<!-- Settings Slideout Panel -->
	<SlideoutPanel
		title="Settings"
		:isVisible="settingsStore.isSettingsOpen"
		@update:isVisible="settingsStore.toggleSettingsOpen"
	>
		<Settings />
	</SlideoutPanel>

	<!-- Settings Keyboard Shortcuts Modal -->
	<Modal v-if="settingsStore.isEditingKeyboardShortcuts" @close="settingsStore.toggleKeyboardShortcutsEditor">
		<KeyboardShortcutsEditor />
	</Modal>
</template>
