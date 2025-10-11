<script lang="ts" setup>
import InputField from "../../lib/InputField.vue";
import Button from "../../lib/Button.vue";
import Card from "../../lib/Card.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface ProjectFormProps {
	formGithubRepositoryUrl: string;
	formBranchName: string;
	formProjectName: string;
	isCreatingProject: boolean;
	isProjectCreated: boolean;
	errorMessage: string | null;
}

interface ProjectFormEmits {
	(event: "update:formGithubRepositoryUrl", value: string): void;
	(event: "update:formBranchName", value: string): void;
	(event: "update:formProjectName", value: string): void;
	(event: "createProject"): void;
	(event: "navigateToNewProject"): void;
}

const props = defineProps<ProjectFormProps>();
const emit = defineEmits<ProjectFormEmits>();
</script>

<template>
	<Card :title="t('projectForm.title')" :subtitle="t('projectForm.subtitle')" iconName="plus" iconGradient="emerald">
		<!-- Messages -->
		<div v-if="props.errorMessage || props.isProjectCreated" class="space-y-6 mb-6">
			<!-- Error Message -->
			<div v-if="props.errorMessage" class="status-message error">
				<div class="flex items-center gap-3">
					<div class="card-icon-sm">
						<Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-400" />
					</div>
					<p class="text-red-400">{{ props.errorMessage }}</p>
				</div>
			</div>
			<!-- Success Message -->
			<div v-if="props.isProjectCreated" class="status-message success flex flex-col gap-4">
				<div class="flex items-center gap-3">
					<div class="card-icon-sm">
						<Icon icon="mdi:check-circle" class="w-5 h-5 text-emerald-400" />
					</div>
					<p class="text-emerald-400 font-semibold">{{ t("projectForm.successMessage") }}</p>
				</div>
				<Button
					class="w-full"
					type="button"
					:label="t('projectForm.openReviewSession')"
					buttonStyle="secondary"
					:onClick="() => emit('navigateToNewProject')"
				/>
			</div>
		</div>

		<!-- Setup Form -->
		<form @submit.prevent="() => emit('createProject')">
			<!-- GitHub Repository URL -->
			<InputField
				:label="t('projectForm.githubRepoUrlLabel')"
				v-bind:modelValue="formGithubRepositoryUrl"
				@update:modelValue="(value: string) => emit('update:formGithubRepositoryUrl', value)"
				type="url"
				:placeholder="t('projectForm.githubRepoUrlPlaceholder')"
				:required="true"
			/>
			<span class="flex flex-row mb-4 space-x-6">
				<!-- Branch Name -->
				<InputField
					:label="t('projectForm.branchLabel')"
					v-bind:modelValue="formBranchName"
					@update:modelValue="(value: string) => emit('update:formBranchName', value)"
					type="text"
					:placeholder="t('projectForm.branchPlaceholder')"
					:required="true"
					class="flex-1"
				/>
				<!-- Project Name -->
				<InputField
					:label="t('projectForm.projectNameLabel')"
					v-bind:modelValue="formProjectName"
					@update:modelValue="(value: string) => emit('update:formProjectName', value)"
					type="text"
					:placeholder="t('projectForm.projectNamePlaceholder')"
					:required="true"
					class="flex-1"
				/>
			</span>
			<!-- Submit Button -->
			<Button
				class="w-full"
				:label="t('projectForm.createReviewSession')"
				type="submit"
				buttonStyle="primary"
				:disabled="props.isCreatingProject"
			/>
		</form>
	</Card>
</template>
