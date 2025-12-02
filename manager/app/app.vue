<script setup lang="ts">
import { useAuthStore } from "../../base/app/stores/authStore";

const authStore = useAuthStore();
const isAppReady = ref(false);
const { t } = useI18n();

onMounted(() => {
	authStore.loadAuthToken();
	isAppReady.value = true;
});
</script>

<template>
	<div v-if="isAppReady" class="flex flex-col min-h-screen overflow-hidden">
		<!-- Navigation Bar -->
		<AppNavigationBar class="z-10" />

		<!-- Main Content -->
		<main
			class="flex-1 overflow-y-auto bg-linear-to-br from-slate-900 via-slate-800 to-slate-900"
		>
			<NuxtPage />
		</main>

		<!-- Footer -->
		<AppFooter
			:repo-url="t('appFooter.githubRepoUrl')"
			:contact-email="t('appFooter.contactEmail')"
		/>

		<ToastContainer />
	</div>
</template>
