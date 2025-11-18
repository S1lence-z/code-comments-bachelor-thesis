<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { Icon } from "@iconify/vue";
import { RepositoryType } from "../../shared/types/RepositoryType";

const { t } = useI18n();

interface ProjectFormProps {
	formRepositoryUrl: string;
	formRepositoryType: RepositoryType;
	formBranchName: string;
	formProjectName: string;
	isCreatingProject: boolean;
	isProjectCreated: boolean;
	errorMessage: string | null;
}

interface ProjectFormEmits {
	(event: "update:formRepositoryUrl", value: string): void;
	(event: "update:formRepositoryType", value: RepositoryType): void;
	(event: "update:formBranchName", value: string): void;
	(event: "update:formProjectName", value: string): void;
	(event: "createProject"): void;
	(event: "navigateToNewProject"): void;
}

const props = defineProps<ProjectFormProps>();
const emit = defineEmits<ProjectFormEmits>();

// TODO: should be improved to be dynamic by only reading from RepositoryType enum and providing the icons/labels in the locales
const repositoryTypeOptions = [
	{ value: RepositoryType.github, label: "GitHub", icon: "mdi:github" },
	{ value: RepositoryType.singleFile, label: "Static File", icon: "mdi:file-code" },
];

const cycleThroughRepositoryTypes = () => {
	const currentIndex = repositoryTypeOptions.findIndex(
		(option) => option.value === props.formRepositoryType
	);
	const nextIndex = (currentIndex + 1) % repositoryTypeOptions.length;
	emit("update:formRepositoryType", repositoryTypeOptions[nextIndex]?.value ?? RepositoryType.github);
};
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
			<div v-if="props.isProjectCreated" class="status-message success flex flex-col gap-4">
				<div class="flex items-center gap-3">
					<div class="card-icon-sm">
						<Icon icon="mdi:check-circle" class="w-5 h-5 text-emerald-400" />
					</div>
					<p class="text-emerald-400 font-semibold">
						{{ t("projectForm.successMessage") }}
					</p>
				</div>
				<Button
					class="w-full"
					:label="t('projectForm.openReviewSession')"
					buttonStyle="secondary"
					buttonSize="medium"
					@click="emit('navigateToNewProject')"
				/>
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
						@click="cycleThroughRepositoryTypes"
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
			<!-- Submit Button -->
			<Button
				class="w-full"
				:label="t('projectForm.createReviewSession')"
				buttonStyle="primary"
				buttonSize="medium"
				type="submit"
				:disabled="props.isCreatingProject"
			/>
		</form>
		<!-- Notification -->
		<div class="mt-4 flex gap-2 text-base text-slate-300">
			<span> Fields marked with </span>
			<Icon icon="mdi:asterisk" class="text-red-400 w-4 h-4 my-auto" />
			<span>are required.</span>
		</div>
	</Card>
</template>
