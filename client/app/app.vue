<script setup lang="ts">
import { QUERY_PARAMS } from "../../base/app/types/query-params";
import type { ServerConfig } from "./types/domain/server-config";
import { useRepositoryAuthStore } from "./stores/repositoryAuthStore";
import { Icon } from "@iconify/vue";

const { t } = useI18n();

// Router
const route = useRoute();
const isRouterReady = ref(false);
const { removeTokenFromQuery } = useQueryParams();

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
const repositoryAuthStore = useRepositoryAuthStore();

// Methods
const handleSwitchOfflineMode = async () => {
	// State before switching
	const wasOfflineMode = settingsStore.isOfflineMode;

	// Switching to offline mode
	if (!wasOfflineMode) {
		if (confirm("Switching to offline mode will reload the application. Continue?")) {
			settingsStore.toggleOfflineMode();
			await navigateTo({
				path: "/review",
				query: {
					...route.query,
					[QUERY_PARAMS.SERVER_BASE_URL]: undefined,
					[QUERY_PARAMS.PROJECT_ID]: undefined,
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

const handleSelectServerConfig = async (serverConfig: ServerConfig) => {
	if (!serverConfig.serverBaseUrl || !serverConfig.projectId) {
		errorHandler.showError("Selected server configuration is incomplete. Please select a valid configuration.");
		return;
	}
	// Switch to online mode
	settingsStore.toggleOfflineMode();
	await navigateTo({
		path: "/review",
		query: {
			...route.query,
			[QUERY_PARAMS.SERVER_BASE_URL]: serverConfig.serverBaseUrl,
			[QUERY_PARAMS.PROJECT_ID]: serverConfig.projectId,
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
	const runtimeConfig = useRuntimeConfig();
	const managerUrl = runtimeConfig.public.managerUrl || "";
	window.location.href = managerUrl;
};

onMounted(async () => {
	window.addEventListener("beforeunload", handleBeforeUnload);

	// Load settings
	settingsStore.loadSettings();
	projectServerConfigsStore.loadConfigs();
	keyboardShortcutsStore.loadShortcuts();
	workspaceStore.loadWorkspacesFromStorage();
	repositoryAuthStore.initializeFromLocalStorage();

	isRouterReady.value = true;
	projectStore.syncStateWithRoute(route.query);
	await removeTokenFromQuery();

	// Check if the project is completely empty
	if (projectStore.isProjectCompletelyEmpty) {
		isEmptyProjectModalVisible.value = true;
		return;
	}

	// Turn on offline mode
	if (!projectStore.getServerBaseUrl || !projectStore.getProjectId) {
		settingsStore.toggleOfflineMode(true);
	}

	// Load the synced project data
	await projectDataStore.loadProjectDataAsync(
		projectStore.getRepositoryUrl,
		projectStore.getProjectId,
		projectStore.getRepositoryBranch,
		projectStore.getServerBaseUrl,
		projectStore.getRepoAuthToken(),
		projectStore.getServerAuthToken
	);

	// Mark initial load as complete
	hasInitialLoadCompleted.value = true;
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
				projectStore.getProjectId,
				projectStore.getRepositoryBranch,
				projectStore.getServerBaseUrl,
				projectStore.getRepoAuthToken(),
				projectStore.getServerAuthToken
			);
		}
	},
	{ immediate: false }
);
</script>

<template>
	<div class="flex flex-col h-screen overflow-hidden">
		<!-- Navigation Bar -->
		<AppNavigationBar class="z-10" />
		<!-- Main Content -->
		<main v-if="isRouterReady" class="flex-1 overflow-hidden">
			<NuxtPage />
		</main>
		<!-- Fallback for when router is not ready -->
		<div v-else class="flex flex-1 items-center justify-center">
			<Icon icon="mdi:loading" class="w-10 h-10 animate-spin" />
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
	<Modal
		v-if="settingsStore.isEditingKeyboardShortcuts"
		@close="settingsStore.toggleKeyboardShortcutsEditor"
	>
		<KeyboardShortcutsEditor @close="settingsStore.toggleKeyboardShortcutsEditor" />
	</Modal>

	<!-- Settings Repository Auth Modal -->
	<Modal
		v-if="settingsStore.isEditingRepositoryAuth"
		@close="settingsStore.toggleRepositoryAuthEditor"
	>
		<RepositoryAuthEditor @close="settingsStore.toggleRepositoryAuthEditor" />
	</Modal>

	<!-- Project Server Configurations Modal -->
	<Modal
		v-if="isProjectServerConfigsModalVisible"
		@close="isProjectServerConfigsModalVisible = false"
	>
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
				:label="t('serverConfigList.goToManager')"
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
