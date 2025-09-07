<script setup lang="ts">
import { onMounted, watch, ref } from "vue";
import NavigationBar from "./components/app/AppNavigationBar.vue";
import Modal from "./lib/Modal.vue";
import { useRouter, useRoute } from "vue-router";
import { useProjectStore } from "./stores/projectStore.ts";
import SlideoutPanel from "./lib/SlideoutPanel.vue";
import Settings from "./components/app/Settings.vue";
import { useSettingsStore } from "./stores/settingsStore.ts";
import { useKeyboardShortcutsStore } from "./stores/keyboardShortcutsStore.ts";
import KeyboardShortcutsEditor from "./components/app/KeyboardShortcutsEditor.vue";
import { useWorkspaceStore } from "./stores/workspaceStore.ts";
import { useProjectDataStore } from "./stores/projectDataStore.ts";
import { useFileContentStore } from "./stores/fileContentStore.ts";

// Router
const router = useRouter();
const route = useRoute();
const isRouterReady = ref(false);

// Stores
const projectStore = useProjectStore();
const projectDataStore = useProjectDataStore();
const settingsStore = useSettingsStore();
const keyboardShortcutsStore = useKeyboardShortcutsStore();
const workspaceStore = useWorkspaceStore();
const fileContentStore = useFileContentStore();

onMounted(async () => {
	// Load settings
	settingsStore.loadSettings();
	keyboardShortcutsStore.loadShortcuts();
	workspaceStore.loadWorkspace();

	await router
		.isReady()
		.then(async () => {
			isRouterReady.value = true;
			projectStore.syncStateWithRoute(route.query);
			// TODO: consider moving this to a route guard if only some routes need project data
			// Load the synced project data
			await projectDataStore.loadProjectDataAsync(
				projectStore.repositoryUrl,
				projectStore.writeApiUrl,
				projectStore.repositoryBranch,
				projectStore.githubPat,
				projectStore.getBackendBaseUrl
			);
			// Load commented files content
			await fileContentStore.loadCommentedFilesContent(
				projectDataStore.allComments,
				projectStore.repositoryUrl,
				projectStore.repositoryBranch,
				projectStore.githubPat
			);
		})
		.catch((error) => {
			console.error("Router is not ready:", error);
		});
});

watch(
	() => route.query,
	async (newQuery, oldQuery) => {
		const relevantParams = ["backendBaseUrl", "repoUrl", "commentsApiUrl", "branch"];
		const hasRelevantChanges = relevantParams.some((param) => newQuery[param] !== oldQuery[param]);

		if (hasRelevantChanges) {
			// Sync the project store state
			projectStore.syncStateWithRoute(route.query);

			// Load the synced project data
			await projectDataStore.loadProjectDataAsync(
				projectStore.repositoryUrl,
				projectStore.writeApiUrl,
				projectStore.repositoryBranch,
				projectStore.githubPat,
				projectStore.getBackendBaseUrl
			);
		}
	},
	{ deep: true }
);
</script>

<template>
	<div class="flex flex-col h-screen overflow-hidden">
		<!-- Navigation Bar -->
		<NavigationBar class="z-10" />
		<!-- Main Content -->
		<main v-if="isRouterReady" class="flex-1 overflow-hidden">
			<router-view />
		</main>
		<!-- Fallback for when router is not ready -->
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
