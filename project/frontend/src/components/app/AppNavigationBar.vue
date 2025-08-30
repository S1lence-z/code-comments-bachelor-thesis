<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import Icon from "../../lib/Icon.vue";
import { navigationRoutes } from "../../core/routes";
import { useRepositoryStore } from "../../stores/repositoryStore";
import { useProjectStore } from "../../stores/projectStore";
import { downloadJSON } from "../../utils/jsonUtils";
import Dropdown from "../../lib/Dropdown.vue";
import { useServerStore } from "../../stores/serverStore";
import Button from "../../lib/Button.vue";
import { useSettingsStore } from "../../stores/settingsStore";

// Stores
const repositoryStore = useRepositoryStore();
const projectStore = useProjectStore();
const serverStore = useServerStore();
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
	const localComments = repositoryStore.allComments;
	if (localComments.length === 0) {
		alert("No comments to export.");
		return;
	}
	// Get the repository name from the project store and confirm export
	const repositoryName = projectStore.getRepositoryName;
	if (confirm(`Are you sure you want to export ${localComments.length} comments for ${repositoryName}?`)) {
		downloadJSON(localComments, `${repositoryName}-comments.json`);
	}
};

const exportOptions: Array<{ label: string; value: string; actionCallback: () => void }> = [
	{ label: "JSON", value: "json", actionCallback: exportLocalComments },
];

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
				<Icon srcName="appLogo" />
				<router-link
					:to="{ path: '/setup', query: preserveQueryParams }"
					class="text-white text-xl font-bold transition-colors duration-200 hover:text-blue-300 whitespace-nowrap"
				>
					Code Comments
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
							{{ route.name }}
						</router-link>
					</div>
				</div>
			</div>

			<!-- Synced Status, Export, Options -->
			<div class="flex items-center gap-8">
				<!-- Synced Status -->
				<div class="flex items-center space-x-8">
					<!-- Synced Status -->
					<div v-if="serverStatus === 'synced'" class="flex items-center gap-2">
						<div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
						<span class="text-emerald-400 font-medium text-md">Comments Synced</span>
					</div>
					<div v-else-if="serverStatus === 'syncing'" class="flex items-center gap-2">
						<div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
						<span class="text-yellow-400 font-medium text-md">Syncing Comments...</span>
					</div>
					<div v-else-if="serverStatus === 'error'" class="flex items-center gap-2">
						<div class="w-2 h-2 bg-red-400 rounded-full"></div>
						<span class="text-red-400 font-medium text-md">Status: {{ serverStore.getErrorMessage }}</span>
					</div>
				</div>

				<div class="flex flex-row gap-4">
					<!-- Dropdown for Export Options -->
					<Dropdown label="Export" :options="exportOptions" />
					<!-- Button for Settings slideout panel -->
					<Button
						label="Settings"
						type="button"
						buttonStyle="secondary"
						:onClick="settingsStore.toggleSettingsOpen"
					/>
				</div>
			</div>
		</div>
	</nav>
</template>
