<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import ToggleButton from "../../lib/ToggleButton.vue";
import Icon from "../../lib/Icon.vue";
import { navigationRoutes } from "../../core/routes";

const props = defineProps<{
	isKeyboardMode: boolean;
	isServerSynced: boolean;
}>();

const emit = defineEmits<{
	(e: "update:isKeyboardMode", value: boolean): void;
	(e: "update:isServerSynced", value: boolean): void;
}>();

// Get the current route to determine which tab should be active
const route = useRoute();
const activeTab = ref(route.path);
const isKeyboardMode = ref(props.isKeyboardMode);
const isServerSynced = ref(props.isServerSynced);

// Computed property to preserve query parameters when navigating
const preserveQueryParams = computed(() => {
	return route.query;
});

// Watch for route changes to update active tab
watch(
	() => route.path,
	(newPath) => {
		activeTab.value = newPath;
	}
);

// Watch for prop changes to update local state
watch(
	() => props.isKeyboardMode,
	(newValue) => {
		isKeyboardMode.value = newValue;
	}
);

// Watch for changes in keyboard mode and emit the event
watch(isKeyboardMode, (newValue) => {
	emit("update:isKeyboardMode", newValue);
});
</script>
+
<template>
	<nav class="bg-modern-black backdrop-blur-sm border-b border-white/10 shadow-lg">
		<div class="flex items-center justify-between h-full max-w-full px-6 py-4">
			<!-- Logo and Synced Status -->
			<div class="flex items-center">
				<!-- Logo -->
				<div class="flex items-center gap-3">
					<Icon srcName="appLogo" size="24px" />
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

			<!-- Toggle Button for Keyboard Mode -->
			<div v-if="activeTab.includes('/review/code')" class="flex items-center">
				<div class="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-1">
					<ToggleButton
						label="Keyboard Mode"
						:isActive="isKeyboardMode"
						@update:isActive="isKeyboardMode = $event"
					/>
				</div>
			</div>
			<div v-else class="w-[183px]"></div>
		</div>
	</nav>
</template>
