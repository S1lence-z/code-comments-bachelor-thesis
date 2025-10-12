<script setup lang="ts">
import { useRoute } from 'vue-router';
import { navigationLinks } from '../core/routes';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();
</script>

<template>
	<nav class="bg-modern-black backdrop-blur-sm border-b border-white/10 shadow-lg">
		<div class="flex items-center justify-between h-full max-w-full px-6 py-4">
			<!-- Logo and Navigation -->
			<div class="flex items-center gap-3">
				<Icon name="mdi:code-json" class="w-6 h-6 text-blue-400" />
				<NuxtLink
					to="/setup"
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
						<NuxtLink :to="link.path" class="block">
							{{ link.label }}
						</NuxtLink>
					</div>
				</div>
			</div>
		</div>
	</nav>
</template>
