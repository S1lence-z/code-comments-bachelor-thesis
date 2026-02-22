<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { Icon } from "@iconify/vue";
import { RepositoryType } from "../../../base/app/types/repository-type";
import repositoryTypeOptions from "../../../base/app/types/repository-type-options";

const { t } = useI18n();

interface ProjectFormProps {
	formRepositoryUrl: string;
	formRepositoryType: RepositoryType;
	formBranchName: string;
	formProjectName: string;
	isCreatingProject: boolean;
	isProjectCreated: boolean;
	errorMessage: string | null;
	isOfflineMode: boolean;
}

interface ProjectFormEmits {
	(event: "update:formRepositoryUrl", value: string): void;
	(event: "update:formRepositoryType", value: RepositoryType): void;
	(event: "update:formBranchName", value: string): void;
	(event: "update:formProjectName", value: string): void;
	(event: "createProject"): void;
	(event: "navigateToNewProject"): void;
	(event: "cycleThroughRepositoryTypes"): void;
	(event: "cancelOfflineModeSetup"): void;
	(event: "setupNewSession"): void;
}

const props = defineProps<ProjectFormProps>();
const emit = defineEmits<ProjectFormEmits>();
</script>

<template>
	<Card
		:title="t('projectForm.title')"
		:subtitle="t('projectForm.subtitle')"
		iconName="plus"
		iconGradient="emerald"
	>
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
			<div v-if="props.isProjectCreated" class="status-message success">
				<div class="flex items-center gap-3">
					<div class="card-icon-sm">
						<Icon icon="mdi:check-circle" class="w-5 h-5 text-emerald-400" />
					</div>
					<p class="text-emerald-400 font-semibold">
						{{ t("projectForm.successMessage") }}
					</p>
				</div>
			</div>
		</div>

		<!-- Setup Form -->
		<form @submit.prevent="() => emit('createProject')">
			<!-- Repository Type and URL -->
			<div class="mb-4">
				<label class="block text-sm font-medium text-slate-300 mb-2">
					{{ t('projectForm.repositoryLabel') }}
				</label>
				<div class="flex gap-2 items-center">
					<!-- Repository Type Selector -->
					<button
						type="button"
						class="bg-slate-300 border-2 rounded-lg p-2 flex items-center cursor-pointer"
						@click="emit('cycleThroughRepositoryTypes')"
					>
						<Icon
							:icon="repositoryTypeOptions.find(o => o.value === props.formRepositoryType)?.icon || 'mdi:github'"
							class="w-8 h-8"
						/>
					</button>
					<!-- Repository URL -->
					<InputField
						v-bind:modelValue="formRepositoryUrl"
						@update:modelValue="(value: string) => emit('update:formRepositoryUrl', value)"
						type="url"
						:placeholder="props.formRepositoryType === RepositoryType.github ? t('projectForm.githubRepoUrlPlaceholder') : t('projectForm.singleFileUrlPlaceholder')"
						:required="true"
						class="flex-1"
					/>
				</div>
			</div>
			<span class="flex flex-row mb-4 space-x-6">
				<!-- Branch Name -->
				<InputField
					v-if="props.formRepositoryType === RepositoryType.github"
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
			<div class="flex flex-col space-y-2">
				<template v-if="props.isProjectCreated">
					<!-- Open Review Session Button -->
					<Button
						:label="t('projectForm.openReviewSession')"
						buttonStyle="primary"
						buttonSize="medium"
						type="button"
						@click="emit('navigateToNewProject')"
					/>
					<!-- Set Up New Session Button -->
					<Button
						:label="t('projectForm.setupNewSession')"
						buttonStyle="secondary"
						buttonSize="medium"
						type="button"
						@click="emit('setupNewSession')"
					/>
				</template>
				<template v-else>
					<!-- Submit Button -->
					<Button
						:label="t('projectForm.createReviewSession')"
						buttonStyle="primary"
						buttonSize="medium"
						type="submit"
						:disabled="props.isCreatingProject"
					/>
					<!-- Cancel Offline Mode Setup Button -->
					<Button
						v-if="props.isOfflineMode"
						:label="t('projectForm.cancelOfflineModeSetup')"
						buttonStyle="secondary"
						buttonSize="medium"
						@click="emit('cancelOfflineModeSetup')"
					/>
				</template>
			</div>
		</form>
	</Card>
</template>
