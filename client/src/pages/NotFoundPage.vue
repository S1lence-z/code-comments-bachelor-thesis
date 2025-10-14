<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Button from "../lib/Button.vue";

const { t } = useI18n();
</script>

<template>
	<div class="flex flex-col items-center justify-center page">
		<div class="text-center">
			<h1 class="mb-4 text-6xl font-bold text-white">{{ t("notFoundPage.title") }}</h1>
			<h2 class="mb-4 text-2xl font-semibold text-white">{{ t("notFoundPage.subtitle") }}</h2>
			<p class="max-w-md mb-8 text-white/60">{{ t("notFoundPage.content") }}</p>
			<div class="space-x-4">
				<Button
					:label="t('notFoundPage.goBack')"
					@click="$router.back()"
					buttonStyle="secondary"
					buttonSize="large"
				/>
				<router-link to="/">
					<Button :label="t('notFoundPage.goToSetup')" buttonStyle="primary" buttonSize="large" />
				</router-link>
			</div>
		</div>
	</div>
</template>
