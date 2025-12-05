<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Icon } from "@iconify/vue";
import { off } from "process";

const { t } = useI18n();
const offlineModeStore = useOfflineModeStore();

// Start offline mode and navigate to setup page
const startOfflineMode = () => {
	offlineModeStore.startOfflineMode();
	navigateTo("/setup");
};
</script>

<template>
	<div>
		<!-- Hero Section -->
		<section
			class="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-white/10"
		>
			<div class="relative mx-auto max-w-7xl px-6 py-24">
				<div class="text-center space-y-6">
					<div
						class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/30 mb-6"
					>
						<Icon icon="mdi:code-tags" class="w-16 h-16 text-white" />
					</div>
					<h1 class="text-5xl md:text-6xl font-bold text-white tracking-tight">
						{{ t('aboutPage.hero.title') }}
					</h1>
					<p class="text-xl md:text-2xl text-purple-300 font-semibold">
						{{ t('aboutPage.hero.subtitle') }}
					</p>
					<p class="text-lg md:text-xl text-slate-300">
						{{ t('aboutPage.hero.description') }}
					</p>
				</div>
			</div>
		</section>

		<!-- Getting Started Section -->
		<section class="bg-slate-800 border-b border-white/10 py-20">
			<div class="mx-auto max-w-7xl px-6">
				<div class="text-center space-y-4 mb-12">
					<h2 class="text-4xl font-bold text-white">
						{{ t('aboutPage.gettingStarted.title') }}
					</h2>
					<p class="text-lg text-slate-400">
						{{ t('aboutPage.gettingStarted.description') }}
					</p>
				</div>
				<div class="space-y-6">
					<div class="flex items-start gap-4">
						<div
							class="shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"
						>
							<span class="text-purple-400 font-bold">1</span>
						</div>
						<p class="text-slate-300 pt-1 text-lg">
							{{ t('aboutPage.gettingStarted.step1') }}
						</p>
					</div>
					<div class="flex items-start gap-4">
						<div
							class="shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"
						>
							<span class="text-purple-400 font-bold">2</span>
						</div>
						<p class="text-slate-300 pt-1 text-lg">
							{{ t('aboutPage.gettingStarted.step2') }}
						</p>
					</div>
					<div class="flex items-start gap-4">
						<div
							class="shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"
						>
							<span class="text-purple-400 font-bold">3</span>
						</div>
						<p class="text-slate-300 pt-1 text-lg">
							{{ t('aboutPage.gettingStarted.step3') }}
						</p>
					</div>
				</div>
				<div class="text-center pt-8">
					<NuxtLink
						to="/setup"
						class="btn btn-primary btn-large inline-flex items-center gap-2"
					>
						<Icon icon="mdi:rocket-launch" class="w-5 h-5" />
						{{ t('aboutPage.gettingStarted.ctaLink') }}
					</NuxtLink>
				</div>
			</div>
		</section>

		<!-- Features Section -->
		<section class="bg-slate-900 border-b border-white/10 py-20">
			<div class="mx-auto max-w-7xl px-6">
				<div class="text-center space-y-4 mb-12">
					<h2 class="text-4xl font-bold text-white">
						{{ t('aboutPage.features.title') }}
					</h2>
					<p class="text-lg text-slate-400">
						{{ t('aboutPage.features.subtitle') }}
					</p>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Server Configuration -->
					<div class="space-y-3">
						<div class="flex items-center gap-3">
							<div
								class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center"
							>
								<Icon icon="mdi:server" class="w-6 h-6 text-purple-400" />
							</div>
							<h3 class="text-xl font-semibold text-white">
								{{ t('aboutPage.features.serverConfiguration.title') }}
							</h3>
						</div>
						<p class="text-slate-300">
							{{ t('aboutPage.features.serverConfiguration.description') }}
						</p>
					</div>

					<!-- GitHub Integration -->
					<div class="space-y-3">
						<div class="flex items-center gap-3">
							<div
								class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"
							>
								<Icon icon="mdi:github" class="w-6 h-6 text-blue-400" />
							</div>
							<h3 class="text-xl font-semibold text-white">
								{{ t('aboutPage.features.githubIntegration.title') }}
							</h3>
						</div>
						<p class="text-slate-300">
							{{ t('aboutPage.features.githubIntegration.description') }}
						</p>
					</div>

					<!-- No Login Required -->
					<div class="space-y-3">
						<div class="flex items-center gap-3">
							<div
								class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center"
							>
								<Icon icon="mdi:account-off" class="w-6 h-6 text-green-400" />
							</div>
							<h3 class="text-xl font-semibold text-white">
								{{ t('aboutPage.features.noLoginRequired.title') }}
							</h3>
						</div>
						<p class="text-slate-300">
							{{ t('aboutPage.features.noLoginRequired.description') }}
						</p>
					</div>

					<!-- Custom Repository Support -->
					<div class="space-y-3">
						<div class="flex items-center gap-3">
							<div
								class="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center"
							>
								<Icon
									icon="mdi:source-repository"
									class="w-6 h-6 text-yellow-400"
								/>
							</div>
							<h3 class="text-xl font-semibold text-white">
								{{ t('aboutPage.features.customRepositorySupport.title') }}
							</h3>
						</div>
						<p class="text-slate-300">
							{{ t('aboutPage.features.customRepositorySupport.description') }}
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Try It Out Section -->
		<section class="bg-slate-800 border-b border-white/10 py-20">
			<div class="mx-auto max-w-7xl px-6">
				<div class="text-center space-y-6">
					<div
						class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 mb-4"
					>
						<Icon icon="mdi:play-circle" class="w-8 h-8 text-white" />
					</div>
					<h2 class="text-4xl font-bold text-white">
						{{ t('aboutPage.tryItOut.title') }}
					</h2>
					<p class="text-lg text-slate-300 max-w-3xl mx-auto">
						{{ t('aboutPage.tryItOut.description') }}
					</p>
					<div class="pt-4">
						<button
							class="btn btn-primary btn-large inline-flex items-center gap-2"
							@click="startOfflineMode"
						>
							<Icon icon="mdi:offline" class="w-6 h-6" />
							{{ t('aboutPage.tryItOut.ctaLink') }}
						</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Open Source & Contribution Section -->
		<section
			class="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 py-20"
		>
			<div class="mx-auto max-w-7xl px-6">
				<div class="text-center space-y-6">
					<div
						class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 mb-4"
					>
						<Icon icon="mdi:github" class="w-8 h-8 text-white" />
					</div>
					<h2 class="text-4xl font-bold text-white">
						{{ t('aboutPage.contribute.title') }}
					</h2>
					<p class="text-lg text-slate-300 max-w-3xl mx-auto">
						{{ t('aboutPage.contribute.description') }}
					</p>
					<div class="pt-4">
						<a
							:href="t('appFooter.githubRepoUrl')"
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-primary btn-large inline-flex items-center gap-2"
						>
							<Icon icon="mdi:github" class="w-6 h-6" />
							{{ t('aboutPage.contribute.repository') }}
						</a>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
