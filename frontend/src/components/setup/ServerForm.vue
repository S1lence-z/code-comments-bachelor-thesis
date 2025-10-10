<script setup lang="ts">
import Card from "../../lib/Card.vue";
import InputField from "../../lib/InputField.vue";
import Button from "../../lib/Button.vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface ServerFormProps {
	serverBaseUrl: string;
}
defineProps<ServerFormProps>();

const emit = defineEmits<{
	(event: "update:serverBaseUrl", value: string): void;
	(event: "useDefaultServerUrl"): void;
	(event: "submitServerBaseUrl"): void;
	(event: "runInOfflineMode"): void;
}>();
</script>

<template>
	<Card
		class="flex-1"
		:title="t('serverForm.title')"
		:subtitle="t('serverForm.subtitle')"
		iconName="plus"
		iconGradient="emerald"
	>
		<!-- Server URL Input Form -->
		<div class="flex flex-col space-y-3 mb-4">
			<p class="text-slate-400 text-lg">
				{{ t("serverForm.setupGuideText") }}
				<a
					href="https://github.com/S1lence-z/code-comments-bachelor-thesis"
					class="text-blue-500 underline"
					target="_blank"
					rel="noopener noreferrer"
					>{{ t("serverForm.setupGuideLink") }}</a
				>
				{{ t("serverForm.setupGuideTextContinued") }}
				<span class="text-blue-500 underline cursor-pointer" @click="() => emit('useDefaultServerUrl')">{{
					t("serverForm.useDefaultUrl")
				}}</span
				>.
			</p>
			<div
				class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-300/30 rounded-lg p-2 flex gap-4 items-center"
			>
				<Icon icon="mdi:info" class="text-purple-300 w-6 h-6" />
				<p class="text-purple-300 text-lg font-medium">
					{{ t("serverForm.offlineModeInfo") }}
				</p>
			</div>
		</div>
		<form @submit.prevent="() => emit('submitServerBaseUrl')" class="flex flex-col space-y-4">
			<InputField
				:label="t('serverForm.serverUrlLabel')"
				v-bind:modelValue="serverBaseUrl"
				@update:modelValue="(value: string) => emit('update:serverBaseUrl', value)"
				type="url"
				:placeholder="t('serverForm.serverUrlPlaceholder')"
				:required="true"
				labelIcon="mdi:server"
			/>
			<div class="flex flex-col space-y-2">
				<Button
					:label="t('serverForm.saveAndContinue')"
					type="submit"
					buttonStyle="primary"
					:disabled="!serverBaseUrl || serverBaseUrl.trim() === ''"
				/>
				<Button
					:label="t('serverForm.runInOfflineMode')"
					type="button"
					buttonStyle="secondary"
					:onClick="() => emit('runInOfflineMode')"
				/>
			</div>
		</form>
	</Card>
</template>
