<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { navigationRoutes } from "../../core/routes";
import { useProjectDataStore } from "../../stores/projectDataStore";
import { useProjectStore } from "../../stores/projectStore";
import { downloadJSON } from "../../utils/jsonUtils";
import { useServerStatusStore } from "../../stores/serverStore";
import Button from "../../lib/Button.vue";
import { useSettingsStore } from "../../stores/settingsStore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// Stores
const projectDataStore = useProjectDataStore();
const projectStore = useProjectStore();
const serverStore = useServerStatusStore();
const settingsStore = useSettingsStore();

// Get the current route to determine which tab should be active
const route = useRoute();
const activeTab = ref(route.path);
const serverStatus = computed(() => serverStore.getStatus);

// Computed property to preserve query parameters when navigating
const preserveQueryParams = computed(() => {
	//! file and line are not preserved in the navigation
	const { file, line, ...rest } = route.query;
	return rest;
});

// Exporting functionality
const exportLocalComments = () => {
	const localComments = projectDataStore.allComments;
	if (localComments.length === 0) {
		alert(t("status.noCommentsToExport"));
		return;
	}
	// Get the repository name from the project store and confirm export
	const repositoryName = projectStore.getRepositoryName;
	const commentWord = localComments.length === 1 ? t("commentBrowser.comment") : t("commentBrowser.comments");

	if (confirm(`${t("status.confirmExport", { count: localComments.length, commentWord, repositoryName })}`)) {
		downloadJSON(localComments, `${repositoryName}-comments.json`);
	}
};

// Watch for route changes to update active tab
watch(
	() => route.path,
	(newPath) => {
		activeTab.value = newPath;
	}
);
</script>
+
<template>
	<nav class="bg-modern-black backdrop-blur-sm border-b border-white/10 shadow-lg">
		<div class="flex items-center justify-between h-full max-w-full px-6 py-4">
			<!-- Logo and Navigation -->
			<div class="flex items-center gap-3">
				<Icon icon="mdi:code-json" class="w-7 h-7 text-blue-400" />
				<router-link
					:to="{ path: '/setup', query: preserveQueryParams }"
					class="text-white text-xl font-bold transition-colors duration-200 hover:text-blue-300 whitespace-nowrap"
				>
					{{ t("app.title") }}
				</router-link>

				<!-- Navigation Links -->
				<div class="nav-tabs">
					<div
						v-for="route in navigationRoutes"
						:key="route.path"
						class="nav-tab"
						:class="{
							active: activeTab === route.path,
							inactive: activeTab !== route.path,
						}"
					>
						<router-link :to="{ path: route.path, query: preserveQueryParams }" class="block">
							{{ route.name?.description }}
						</router-link>
					</div>
				</div>
			</div>

			<!-- Synced Status, Export, Options -->
			<div class="flex items-center gap-8">
				<!-- Synced Status -->
				<div
					v-if="!activeTab.includes('/setup') && !settingsStore.isOfflineMode"
					class="flex items-center space-x-8"
				>
					<!-- Synced Status -->
					<div v-if="serverStatus === 'synced'" class="flex items-center gap-2">
						<div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
						<span class="text-emerald-400 font-medium text-md">{{ t("status.commentsSynced") }}</span>
					</div>
					<div v-else-if="serverStatus === 'syncing'" class="flex items-center gap-2">
						<div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
						<span class="text-yellow-400 font-medium text-md">{{ t("status.syncingComments") }}</span>
					</div>
					<div v-else-if="serverStatus === 'error'" class="flex items-center gap-2">
						<div class="w-2 h-2 bg-red-400 rounded-full"></div>
						<span class="text-red-400 font-medium text-md">{{ serverStore.getErrorMessage }}</span>
					</div>
				</div>
				<div v-else-if="settingsStore.isOfflineMode" class="flex items-center gap-2">
					<div class="w-2 h-2 bg-gray-400 rounded-full"></div>
					<span class="text-gray-400 font-medium text-md">{{ t("status.offlineMode") }}</span>
				</div>

				<div class="flex flex-row gap-4">
					<!-- Dropdown for Export Options -->
					<Button
						:label="t('status.exportComments')"
						buttonStyle="secondary"
						buttonSize="medium"
						@click="exportLocalComments"
					/>
					<!-- Button for Settings slideout panel -->
					<Button
						:label="t('settings.title')"
						buttonStyle="secondary"
						buttonSize="medium"
						@click="settingsStore.toggleSettingsOpen"
					/>
				</div>
			</div>
		</div>
	</nav>
</template>
