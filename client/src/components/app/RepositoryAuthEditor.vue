<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRepositoryAuthStore } from "../../stores/repositoryAuthStore";
import { RepositoryType } from "../../types/shared/repository-type";
import Button from "../lib/Button.vue";
import Card from "../lib/Card.vue";
import InputField from "../lib/InputField.vue";

const { t } = useI18n();
const repositoryAuthStore = useRepositoryAuthStore();

const emit = defineEmits<{
	(event: "close"): void;
}>();

// Dynamic tokens state
const tokens = ref<Record<string, string>>({});

// Get all repository types from the enum
const repositoryTypes = Object.values(RepositoryType);

onMounted(() => {
	// Initialize tokens for all types
	repositoryTypes.forEach((type) => {
		const auth = repositoryAuthStore.getAuthByType(type);
		tokens.value[type] = auth?.authToken || "";
	});
});

const saveTokens = () => {
	Object.entries(tokens.value).forEach(([type, token]) => {
		repositoryAuthStore.upsertAuthToken(type, token);
	});
	emit("close");
};
</script>

<template>
	<Card :title="t('settings.repositoryAuth.title')" class="w-[600px] max-w-full mx-auto">
		<div class="space-y-4">
			<p class="text-base text-slate-200">
				{{ t("settings.repositoryAuth.description") }}
			</p>

			<!-- Dynamic Token Inputs -->
			<div v-for="type in repositoryTypes" :key="type" class="space-y-2">
				<InputField
					:label="t(`settings.repositoryAuth.${type}Token`)"
					:modelValue="tokens[type]"
					@update:modelValue="(val) => (tokens[type] = val)"
					type="text"
					:secret="true"
					:placeholder="t(`settings.repositoryAuth.${type}TokenPlaceholder`)"
				/>
			</div>

			<div class="flex justify-end space-x-3 mt-6">
				<Button
					:label="t('common.cancel')"
					buttonStyle="secondary"
					buttonSize="medium"
					@click="emit('close')"
				/>
				<Button :label="t('common.save')" buttonStyle="primary" buttonSize="medium" @click="saveTokens" />
			</div>
		</div>
	</Card>
</template>
