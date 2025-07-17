<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import Icon from "../../lib/Icon.vue";
import { navigationRoutes } from "../../core/routes";

const props = defineProps<{
	isServerSynced: boolean;
}>();

defineEmits<{
	(e: "update:isServerSynced", value: boolean): void;
}>();

// Get the current route to determine which tab should be active
const route = useRoute();
const activeTab = ref(route.path);
const isServerSynced = ref(props.isServerSynced);

// Computed property to preserve query parameters when navigating
const preserveQueryParams = computed(() => {
	//! file and line are not preserved in the navigation
	const { file, line, ...rest } = route.query;
	return rest;
});

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
			<!-- Logo and Synced Status -->
			<div class="flex items-center">
				<!-- Logo -->
				<div class="flex items-center gap-3">
					<Icon srcName="appLogo" />
					<router-link
						:to="{ path: '/setup', query: preserveQueryParams }"
						class="text-white text-xl font-bold transition-colors duration-200 hover:text-blue-300 whitespace-nowrap"
					>
						Code Comments
					</router-link>
				</div>
				<!-- Synced Status -->
				<div v-if="isServerSynced" class="ml-6 flex items-center gap-2">
					<div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
					<span class="text-emerald-400 font-medium text-sm">Comments Synced</span>
				</div>
				<div v-else class="ml-6 flex items-center gap-2">
					<div class="w-2 h-2 bg-red-400 rounded-full"></div>
					<span class="text-red-400 font-medium text-sm">Comments Not Synced</span>
				</div>
			</div>

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
	</nav>
</template>
