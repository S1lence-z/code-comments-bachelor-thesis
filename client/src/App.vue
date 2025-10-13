<script setup lang="ts">
import { onMounted, watch, ref, onBeforeUnmount } from "vue";
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
import { codeReviewPageKey } from "./core/keys";
import { QUERY_PARAMS } from "./types/others/QueryParams";
import { useProjectServerConfigsStore, type ServerConfig } from "./stores/projectServerConfigsStore.ts";
import ServerConfigsList from "./components/app/ServerConfigsList.vue";

// Router
const router = useRouter();
const route = useRoute();
const isRouterReady = ref(false);

// State
const isProjectServerConfigsModalVisible = ref(false);
const hasInitialLoadCompleted = ref(false);

// Stores
const projectStore = useProjectStore();
const projectDataStore = useProjectDataStore();
const settingsStore = useSettingsStore();
const keyboardShortcutsStore = useKeyboardShortcutsStore();
const workspaceStore = useWorkspaceStore();
const projectServerConfigsStore = useProjectServerConfigsStore();

// Methods
const handleSwitchOfflineMode = () => {
	// State before switching
	const wasOfflineMode = settingsStore.isOfflineMode;

	// Switching to offline mode
	if (!wasOfflineMode) {
		if (confirm("Switching to offline mode will reload the application. Continue?")) {
			settingsStore.toggleOfflineMode();
			router.push({
				name: codeReviewPageKey,
				query: {
					...route.query,
					[QUERY_PARAMS.SERVER_BASE_URL]: undefined,
					[QUERY_PARAMS.RW_SERVER_URL]: undefined,
				},
			});
			return;
		}
	}
	// Switching to online mode
	if (wasOfflineMode) {
		isProjectServerConfigsModalVisible.value = true;
	}
	// Close the settings panel
	settingsStore.toggleSettingsOpen(false);
};

const handleSelectServerConfig = (serverConfig: ServerConfig) => {
	if (!serverConfig.serverBaseUrl || !serverConfig.rwServerUrl) {
		alert("Selected server configuration is incomplete. Please select a valid configuration.");
		return;
	}
	// Switch to online mode
	settingsStore.toggleOfflineMode();
	router.push({
		name: codeReviewPageKey,
		query: {
			...route.query,
			[QUERY_PARAMS.SERVER_BASE_URL]: serverConfig.serverBaseUrl,
			[QUERY_PARAMS.RW_SERVER_URL]: serverConfig.rwServerUrl,
		},
	});
};

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
	if (projectDataStore.hasUnsavedChanges || settingsStore.isOfflineMode) {
		event.preventDefault();
		return "";
	}
};

onMounted(async () => {
	window.addEventListener("beforeunload", handleBeforeUnload);

	// Load settings
	settingsStore.loadSettings();
	projectServerConfigsStore.loadConfigs();
	keyboardShortcutsStore.loadShortcuts();
	workspaceStore.loadWorkspace();

	await router
		.isReady()
		.then(async () => {
			isRouterReady.value = true;
			projectStore.syncStateWithRoute(route.query);

			// Turn on offline mode
			if (!projectStore.getServerBaseUrl || !projectStore.rwServerUrl) {
				settingsStore.toggleOfflineMode(true);
			}

			// TODO: consider moving this to a route guard if only some routes need project data
			// Load the synced project data if not in offline mode
			await projectDataStore.loadProjectDataAsync(
				projectStore.repositoryUrl,
				projectStore.rwServerUrl,
				projectStore.repositoryBranch,
				projectStore.githubPat,
				projectStore.getServerBaseUrl
			);

			// Mark initial load as complete
			hasInitialLoadCompleted.value = true;
		})
		.catch((error) => {
			console.error("Router is not ready:", error);
		});
});

onBeforeUnmount(() => {
	settingsStore.saveSettings();
	keyboardShortcutsStore.saveShortcuts();
	window.removeEventListener("beforeunload", handleBeforeUnload);
});

// Watch for changes in route query parameters
watch(
	() => route.query,
	async (newQuery, oldQuery) => {
		// Skip if initial load hasn't completed yet (prevents double-loading on mount)
		if (!hasInitialLoadCompleted.value) {
			return;
		}

		const relevantParams = Object.values(QUERY_PARAMS);
		const hasRelevantChanges = relevantParams.some((param) => newQuery[param] !== oldQuery[param]);

		if (hasRelevantChanges) {
			// Sync the project store state
			projectStore.syncStateWithRoute(route.query);

			// Load the synced project data
			await projectDataStore.loadProjectDataAsync(
				projectStore.repositoryUrl,
				projectStore.rwServerUrl,
				projectStore.repositoryBranch,
				projectStore.githubPat,
				projectStore.getServerBaseUrl
			);
		}
	},
	{ immediate: false }
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
		<Settings @handleSwitchOfflineMode="handleSwitchOfflineMode" />
	</SlideoutPanel>

	<!-- Settings Keyboard Shortcuts Modal -->
	<Modal v-if="settingsStore.isEditingKeyboardShortcuts" @close="settingsStore.toggleKeyboardShortcutsEditor">
		<KeyboardShortcutsEditor @close="settingsStore.toggleKeyboardShortcutsEditor" />
	</Modal>

	<!-- Project Server Configurations Modal -->
	<Modal v-if="isProjectServerConfigsModalVisible" @close="isProjectServerConfigsModalVisible = false">
		<ServerConfigsList
			:currentProject="{
				repositoryUrl: projectStore.getRepositoryUrl,
				branch: projectStore.repositoryBranch,
			}"
			:projectConfigs="
				projectServerConfigsStore.getConfigsForProject({
					repositoryUrl: projectStore.getRepositoryUrl,
					branch: projectStore.repositoryBranch,
				})
			"
			@close="isProjectServerConfigsModalVisible = false"
			@select="handleSelectServerConfig"
		/>
	</Modal>
</template>
