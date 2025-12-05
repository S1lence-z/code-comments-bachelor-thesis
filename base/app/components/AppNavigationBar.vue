<script setup lang="ts">
import type { NavigationRoute } from "../types/navigation-routes";
import { Icon } from "@iconify/vue";

interface NavigationBarProps {
	title: string;
	navigationRoutes: NavigationRoute[];
}
const props = defineProps<NavigationBarProps>();

// Composables
const route = useRoute();
</script>

<template>
	<nav class="border-b border-white/10 bg-modern-black">
		<div class="mx-auto max-w-7xl px-6 py-4">
			<div class="flex items-center justify-between h-full">
				<!-- Logo and Navigation -->
				<div class="flex items-center gap-3">
					<Icon icon="mdi:code" class="text-blue-400 w-8 h-8" />
					<NuxtLink
						to="/"
						class="text-white text-xl font-bold transition-colors duration-200 hover:text-blue-300 whitespace-nowrap"
					>
						{{ props.title }}
					</NuxtLink>

					<!-- Navigation Links -->
					<div class="nav-tabs">
						<div
							v-for="link in props.navigationRoutes"
							:key="link.path"
							class="nav-tab"
							:class="{
								active: route.path === link.path,
								inactive: route.path !== link.path,
							}"
						>
							<NuxtLink :to="{ path: link.path, query: { ...route.query } }" class="block">
								{{ link.label }}
							</NuxtLink>
						</div>
					</div>
				</div>
			</div>
		</div>
	</nav>
</template>
