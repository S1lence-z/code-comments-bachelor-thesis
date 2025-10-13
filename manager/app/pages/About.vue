<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t, tm, rt } = useI18n();

useHead({
	title: t('aboutPage.title') + ' - Code Review Manager',
	meta: [
		{ name: 'description', content: t('aboutPage.subtitle') }
	]
});
</script>

<template>
	<div class="page">
		<!-- Header -->
		<div class="bg-white/5 backdrop-blur-sm border-b border-white/10">
			<div class="mx-auto px-6 py-8">
				<div class="text-center">
					<h1 class="text-4xl font-bold text-white mb-2">{{ t('aboutPage.title') }}</h1>
					<p class="text-slate-300 text-lg">{{ t('aboutPage.subtitle') }}</p>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mx-auto px-6 mt-8 max-w-7xl pb-12"
		>
			<!-- What is this? -->
			<Card :title="t('aboutPage.whatIsThis.title')" icon-name="code" icon-gradient="emerald">
				<div class="space-y-4 text-slate-300 text-lg">
					<p>{{ t('aboutPage.whatIsThis.description1') }}</p>
					<p>{{ t('aboutPage.whatIsThis.description2') }}</p>
					<ul class="list-disc list-inside space-y-2 ml-4">
						<li
							v-for="(feature, index) in tm('aboutPage.whatIsThis.features') as string[]"
							:key="index"
						>
							{{ rt(feature) }}
						</li>
					</ul>
				</div>
			</Card>

			<!-- Features -->
			<Card :title="t('aboutPage.features.title')" icon-name="plus" icon-gradient="green">
				<div class="space-y-6">
					<div class="flex flex-col items-start sm:flex-row sm:items-center sm:gap-4">
						<div class="card-icon-sm gradient-icon-blue">
							<Icon name="mdi:server" class="w-5 h-5 text-white" />
						</div>
						<div>
							<h3 class="text-white font-semibold text-lg">
								{{ t('aboutPage.features.serverConfiguration.title') }}
							</h3>
							<p class="text-slate-300">
								{{ t('aboutPage.features.serverConfiguration.description') }}
							</p>
						</div>
					</div>
					<div class="flex flex-col items-start sm:flex-row sm:items-center sm:gap-4">
						<div class="card-icon-sm gradient-icon-blue">
							<Icon name="mdi:github" class="w-5 h-5 text-white" />
						</div>
						<div>
							<h3 class="text-white font-semibold text-lg">
								{{ t('aboutPage.features.githubIntegration.title') }}
							</h3>
							<p class="text-slate-300">
								{{ t('aboutPage.features.githubIntegration.description') }}
							</p>
						</div>
					</div>
					<div class="flex flex-col items-start sm:flex-row sm:items-center sm:gap-4">
						<div class="card-icon-sm gradient-icon-blue">
							<Icon name="mdi:cloud-off" class="w-5 h-5 text-white" />
						</div>
						<div>
							<h3 class="text-white font-semibold text-lg">
								{{ t('aboutPage.features.offlineMode.title') }}
							</h3>
							<p class="text-slate-300">
								{{ t('aboutPage.features.offlineMode.description') }}
							</p>
						</div>
					</div>
				</div>
			</Card>

			<!-- Getting Started -->
			<Card
				:title="t('aboutPage.gettingStarted.title')"
				icon-name="success"
				icon-gradient="emerald"
			>
				<div class="space-y-4 text-slate-300 text-lg">
					<p>
						{{ t('aboutPage.gettingStarted.description') }}
						<NuxtLink
							to="/setup"
							class="text-blue-400 hover:text-blue-300 underline font-semibold"
						>
							{{ t('aboutPage.gettingStarted.setupLink') }}
						</NuxtLink>
						{{ t('aboutPage.gettingStarted.descriptionEnd') }}
					</p>
				</div>
			</Card>
		</div>
	</div>
</template>
