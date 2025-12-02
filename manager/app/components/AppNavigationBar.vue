<script setup lang="ts">
import { useRoute } from 'vue-router';
import { navigationLinks } from '../core/routes';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';

const { t } = useI18n();

const route = useRoute();
</script>

<template>
	<nav class="border-b border-white/10 bg-modern-black">
		<div class="mx-auto max-w-7xl px-6 py-4">
			<div class="flex items-center justify-between h-full">
				<!-- Logo and Navigation -->
				<div class="flex items-center gap-3">
					<Icon icon="mdi:code" class=" text-blue-400 w-8 h-8" />
					<NuxtLink
						to="/"
						class="text-white text-xl font-bold transition-colors duration-200 hover:text-blue-300 whitespace-nowrap"
					>
						{{ t('appNavigationBar.title') }}
					</NuxtLink>

					<!-- Navigation Links -->
					<div class="nav-tabs">
						<div
							v-for="link in navigationLinks"
							:key="link.path"
							class="nav-tab"
							:class="{
								active: route.path === link.path,
								inactive: route.path !== link.path,
							}"
						>
							<NuxtLink
								:to="{ path: link.path, query: { ...route.query } }"
								class="block"
							>
								{{ link.label }}
							</NuxtLink>
						</div>
					</div>
				</div>
			</div>
		</div>
	</nav>
</template>
