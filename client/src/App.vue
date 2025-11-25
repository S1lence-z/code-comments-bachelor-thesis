<script setup lang="ts">
import { onMounted, watch, ref, onBeforeUnmount } from "vue";
import NavigationBar from "./components/app/AppNavigationBar.vue";
import Modal from "./components/lib/Modal.vue";
import { useRouter, useRoute } from "vue-router";
import { useProjectStore } from "./stores/projectStore.ts";
import SlideoutPanel from "./components/lib/SlideoutPanel.vue";
import Settings from "./components/app/Settings.vue";
import { useSettingsStore } from "./stores/settingsStore.ts";
import { useKeyboardShortcutsStore } from "./stores/keyboardShortcutsStore.ts";
import KeyboardShortcutsEditor from "./components/app/KeyboardShortcutsEditor.vue";
import { useWorkspaceStore } from "./stores/workspaceStore.ts";
import { useProjectDataStore } from "./stores/projectDataStore.ts";
import { codeReviewPageKey } from "./core/keys";
import { QUERY_PARAMS } from "./types/shared/query-params.ts";
import { useProjectServerConfigsStore, type ServerConfig } from "./stores/projectServerConfigsStore.ts";
import ServerConfigsList from "./components/app/ServerConfigsList.vue";
import ToastContainer from "./components/app/ToastContainer.vue";
import { useErrorHandler } from "./composables/useErrorHandler.ts";
import Card from "./components/lib/Card.vue";
import Button from "./components/lib/Button.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// Router
const router = useRouter();
const route = useRoute();
const isRouterReady = ref(false);

// State
const isProjectServerConfigsModalVisible = ref(false);
const isEmptyProjectModalVisible = ref(false);
const hasInitialLoadCompleted = ref(false);
const errorHandler = useErrorHandler();

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
		errorHandler.showError("Selected server configuration is incomplete. Please select a valid configuration.");
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

const navigateToManager = () => {
	window.location.href = import.meta.env.VITE_MANAGER_URL;
};

onMounted(async () => {
	window.addEventListener("beforeunload", handleBeforeUnload);

	// Load settings
	settingsStore.loadSettings();
	projectServerConfigsStore.loadConfigs();
	keyboardShortcutsStore.loadShortcuts();
	workspaceStore.loadWorkspacesFromStorage();

	await router
		.isReady()
		.then(async () => {
			isRouterReady.value = true;
			projectStore.syncStateWithRoute(route.query);

			// Check if the project is completely empty
			if (projectStore.isProjectCompletelyEmpty) {
				isEmptyProjectModalVisible.value = true;
				return;
			}

			// Turn on offline mode
			if (!projectStore.getServerBaseUrl || !projectStore.rwServerUrl) {
				settingsStore.toggleOfflineMode(true);
			}

			// Load the synced project data
			await projectDataStore.loadProjectDataAsync(
				projectStore.getRepositoryUrl,
				projectStore.getRwServerUrl,
				projectStore.getRepositoryBranch,
				projectStore.getRepoAuthToken(),
				projectStore.getServerBaseUrl
			);

			// Mark initial load as complete
			hasInitialLoadCompleted.value = true;
		})
		.catch((error) => {
			errorHandler.handleError(error, {
				customMessage: "Router is not ready",
			});
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
				projectStore.getRepositoryUrl,
				projectStore.getRwServerUrl,
				projectStore.getRepositoryBranch,
				projectStore.getRepoAuthToken(),
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
				repositoryType: projectStore.repositoryType,
				branch: projectStore.repositoryBranch,
			}"
			:projectConfigs="
				projectServerConfigsStore.getConfigsForProject({
					repositoryUrl: projectStore.getRepositoryUrl,
					repositoryType: projectStore.repositoryType,
					branch: projectStore.repositoryBranch,
				})
			"
			@close="isProjectServerConfigsModalVisible = false"
			@select="handleSelectServerConfig"
			@navigateToManager="navigateToManager"
		/>
	</Modal>

	<!-- Empty Project Modal -->
	<Modal v-if="isEmptyProjectModalVisible">
		<Card
			class="w-[600px] max-w-full mx-auto"
			icon-name="archive"
			icon-gradient="blue"
			:title="t('app.noProjectConfigured')"
		>
			<Button
				:label="t('serverConfigList.goToSetup')"
				button-style="primary"
				button-size="large"
				class="mt-4"
				@click="navigateToManager"
			/>
		</Card>
	</Modal>

	<!-- Toast Notifications Container -->
	<ToastContainer />
</template>
