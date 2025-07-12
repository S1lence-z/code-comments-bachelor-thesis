<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import ToggleButton from "../../lib/ToggleButton.vue";
import AppIcon from "../icons/AppLogo.vue";
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

<template>
	<nav class="border-b border-black shadow-2xl bg-custom-gray min-h-14">
		<div class="flex items-center justify-between h-full max-w-full px-4">
			<!-- Logo and Synced Status -->
			<div class="flex items-center">
				<!-- Logo -->
				<div class="flex items-center gap-2">
					<AppIcon :size="24" />
					<router-link
						:to="{ path: '/setup', query: preserveQueryParams }"
						class="text-white transition-colors duration-200 font-lg semibold whitespace-nowrap"
						>Code Comments
					</router-link>
				</div>
				<!-- Synced Status -->
				<div v-if="isServerSynced" class="ml-4 text-green-500 font-semibold">Comments Synced</div>
				<div v-else class="ml-4 text-red-500 font-semibold">Comments Not Synced</div>
			</div>

			<!-- Navigation Links -->
			<ul class="nav-tabs">
				<li
					v-for="route in navigationRoutes"
					:key="route.path"
					class="nav-tab"
					:class="{
						active: activeTab === route.path,
					}"
				>
					<router-link :to="{ path: route.path, query: preserveQueryParams }">
						{{ route.name }}
					</router-link>
				</li>
			</ul>

			<!-- Toggle Button for Keyboard Mode -->
			<div v-if="activeTab.includes('/code-review')">
				<ToggleButton
					label="Keyboard Mode"
					:isActive="isKeyboardMode"
					@update:isActive="isKeyboardMode = $event"
				/>
			</div>
			<div v-else class="w-[173px]"></div>
		</div>
	</nav>
</template>
